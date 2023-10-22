/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { walk } from 'estree-walker';
import { parse } from 'svelte/compiler';

import { deepSet } from './includes/deepSet';
import { getObjFromExpression } from './includes/getObjFromExpression';
import { delve } from '../shared/delve';

import type { Message, WalkerOperationThis } from './types';
import type { Ast } from 'svelte/types/compiler/interfaces';
import type {
  Node,
  ObjectExpression,
  ImportDeclaration,
  ImportSpecifier,
  CallExpression,
  Identifier,
  Literal,
} from 'estree';

const LIB_NAME = 'svelte-i18n';
const DEFINE_MESSAGES_METHOD_NAME = 'defineMessages';
const FORMAT_METHOD_NAMES = new Set(['format', '_', 't']);

function isFormatCall(node: Node, imports: Set<string>) {
  if (node.type !== 'CallExpression') return false;

  let identifier: Identifier | undefined;

  if (node.callee.type === 'Identifier') {
    identifier = node.callee;
  }

  if (!identifier || identifier.type !== 'Identifier') {
    return false;
  }

  const methodName = identifier.name.slice(1);

  return imports.has(methodName);
}

function isMessagesDefinitionCall(node: Node, methodName: string) {
  if (node.type !== 'CallExpression') return false;

  return (
    node.callee &&
    node.callee.type === 'Identifier' &&
    node.callee.name === methodName
  );
}

function getLibImportDeclarations(
  ast: Ast,
  ignoreImport: boolean,
): ImportDeclaration[] {
  const bodyElements = [
    ...(ast.instance?.content.body ?? []),
    ...(ast.module?.content.body ?? []),
  ];

  return bodyElements.filter(
    (node) =>
      node.type === 'ImportDeclaration' &&
      (node.source.value === LIB_NAME || ignoreImport),
  ) as ImportDeclaration[];
}

function getDefineMessagesSpecifier(decl: ImportDeclaration) {
  return decl.specifiers.find(
    (spec) =>
      'imported' in spec && spec.imported.name === DEFINE_MESSAGES_METHOD_NAME,
  ) as ImportSpecifier;
}

function getFormatSpecifiers(decl: ImportDeclaration) {
  return decl.specifiers.filter(
    (spec) => 'imported' in spec && FORMAT_METHOD_NAMES.has(spec.imported.name),
  ) as ImportSpecifier[];
}

export function collectFormatCalls(ast: Ast, ignoreLib = false) {
  const importDecls = getLibImportDeclarations(ast, ignoreLib);

  if (importDecls.length === 0) return [];

  const imports = new Set(
    importDecls.flatMap((decl) =>
      getFormatSpecifiers(decl).map((n) => n.local.name),
    ),
  );

  if (imports.size === 0) return [];

  const calls: CallExpression[] = [];

  function enter(this: WalkerOperationThis, node: Node) {
    if (isFormatCall(node, imports)) {
      calls.push(node as CallExpression);
      this.skip();
    }
  }

  // @ts-expect-error - https://github.com/Rich-Harris/estree-walker/issues/28
  walk(ast.instance as any, { enter });
  // @ts-expect-error - https://github.com/Rich-Harris/estree-walker/issues/28
  walk(ast.html as any, { enter });

  return calls;
}

// walk(ast: import("estree").BaseNode, { enter, leave }: {
//   enter?: (this: {
//       skip: () => void;
//       remove: () => void;
//       replace: (node: import("estree").BaseNode) => void;
//   }, node: import("estree").BaseNode, parent: import("estree").BaseNode, key: string, index: number) => void;

export function collectMessageDefinitions(ast: Ast, ignoreImport = false) {
  const definitions: ObjectExpression[] = [];
  const defineImportDecl = getLibImportDeclarations(ast, ignoreImport).find(
    getDefineMessagesSpecifier,
  );

  if (defineImportDecl == null) return [];

  const defineMethodName =
    getDefineMessagesSpecifier(defineImportDecl).local.name;

  const nodeStepInstructions = {
    enter(this: WalkerOperationThis, node: Node) {
      if (isMessagesDefinitionCall(node, defineMethodName) === false) return;
      const [arg] = (node as CallExpression).arguments;

      if (arg.type === 'ObjectExpression') {
        definitions.push(arg);
        this.skip();
      }
    },
  };

  // @ts-expect-error - https://github.com/Rich-Harris/estree-walker/issues/28
  walk(ast.instance as any, nodeStepInstructions);
  // @ts-expect-error - https://github.com/Rich-Harris/estree-walker/issues/28
  walk(ast.module as any, nodeStepInstructions);

  return definitions.flatMap((definitionDict) =>
    definitionDict.properties.map((propNode) => {
      if (propNode.type !== 'Property') {
        throw new Error(
          `Found invalid '${propNode.type}' at L${propNode.loc!.start.line}:${
            propNode.loc!.start.column
          }`,
        );
      }

      return propNode.value as ObjectExpression;
    }),
  );
}

export function collectMessages(
  markup: string,
  ignoreImport = false,
): Message[] {
  const ast = parse(markup);
  const calls = collectFormatCalls(ast, ignoreImport);
  const definitions = collectMessageDefinitions(ast, ignoreImport);

  return [
    ...definitions.map((definition) => getObjFromExpression(definition)),
    ...calls.map((call) => {
      const [pathNode, options] = call.arguments;
      let messageObj: Message;

      if (pathNode.type === 'ObjectExpression') {
        // _({ ...opts })
        messageObj = getObjFromExpression(pathNode);
      } else {
        const node = pathNode as Literal;
        const id = node.value as string;

        if (options && options.type === 'ObjectExpression') {
          // _(id, { ...opts })
          messageObj = getObjFromExpression(options);
          messageObj.id = id;
        } else {
          // _(id)
          messageObj = { id };
        }
      }

      if (messageObj?.id == null) return null;

      return messageObj;
    }),
  ].filter(Boolean) as Message[];
}

export function extractMessages(
  markup: string,
  {
    accumulator = {},
    ignoreImport = false,
    shallow = false,
  }: {
    accumulator?: Record<string, any>;
    ignoreImport?: boolean;
    shallow?: boolean;
  } = {},
) {
  collectMessages(markup, ignoreImport).forEach((messageObj) => {
    let defaultValue = messageObj.default;

    if (typeof defaultValue === 'undefined') {
      defaultValue = '';
    }

    if (shallow) {
      if (messageObj.id in accumulator) return;

      accumulator[messageObj.id] = defaultValue;
    } else {
      if (typeof delve(accumulator, messageObj.id) !== 'undefined') return;

      deepSet(accumulator, messageObj.id, defaultValue);
    }
  });

  return accumulator;
}
