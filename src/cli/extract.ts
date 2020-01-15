import {
  Node,
  ObjectExpression,
  ImportDeclaration,
  ImportSpecifier,
  CallExpression,
  Identifier,
  Literal,
} from 'estree'
import { walk } from 'estree-walker'
import { Ast } from 'svelte/types/compiler/interfaces'
import { parse } from 'svelte/compiler'

import { getIn } from './includes/getIn'
import { deepSet } from './includes/deepSet'
import { getObjFromExpression } from './includes/getObjFromExpression'
import { Message } from './types'

const LIB_NAME = 'svelte-i18n'
const DEFINE_MESSAGES_METHOD_NAME = 'defineMessages'
const FORMAT_METHOD_NAMES = new Set(['format', '_', 't'])
const IGNORED_UTILITIES = new Set(['number', 'date', 'time'])

function isFormatCall(node: Node, imports: Set<string>) {
  if (node.type !== 'CallExpression') return false

  let identifier: Identifier
  if (
    node.callee.type === 'MemberExpression' &&
    node.callee.property.type === 'Identifier' &&
    !IGNORED_UTILITIES.has(node.callee.property.name)
  ) {
    identifier = node.callee.object as Identifier
  } else if (node.callee.type === 'Identifier') {
    identifier = node.callee
  }
  if (!identifier || identifier.type !== 'Identifier') {
    return false
  }

  const methodName = identifier.name.slice(1)
  return imports.has(methodName)
}

function isMessagesDefinitionCall(node: Node, methodName: string) {
  if (node.type !== 'CallExpression') return false

  return (
    node.callee &&
    node.callee.type === 'Identifier' &&
    node.callee.name === methodName
  )
}

function getLibImportDeclarations(ast: Ast) {
  return (ast.instance
    ? ast.instance.content.body.filter(
        node =>
          node.type === 'ImportDeclaration' && node.source.value === LIB_NAME
      )
    : []) as ImportDeclaration[]
}

function getDefineMessagesSpecifier(decl: ImportDeclaration) {
  return decl.specifiers.find(
    spec =>
      'imported' in spec && spec.imported.name === DEFINE_MESSAGES_METHOD_NAME
  ) as ImportSpecifier
}

function getFormatSpecifiers(decl: ImportDeclaration) {
  return decl.specifiers.filter(
    spec => 'imported' in spec && FORMAT_METHOD_NAMES.has(spec.imported.name)
  ) as ImportSpecifier[]
}

export function collectFormatCalls(ast: Ast) {
  const importDecls = getLibImportDeclarations(ast)

  if (importDecls.length === 0) return []

  const imports = new Set(
    importDecls.flatMap(decl =>
      getFormatSpecifiers(decl).map(n => n.local.name)
    )
  )

  if (imports.size === 0) return []

  const calls: CallExpression[] = []
  function enter(node: Node) {
    if (isFormatCall(node, imports)) {
      calls.push(node as CallExpression)
      this.skip()
    }
  }
  walk(ast.instance as any, { enter })
  walk(ast.html as any, { enter })

  return calls
}

export function collectMessageDefinitions(ast: Ast) {
  const definitions: ObjectExpression[] = []
  const defineImportDecl = getLibImportDeclarations(ast).find(
    getDefineMessagesSpecifier
  )

  if (defineImportDecl == null) return []

  const defineMethodName = getDefineMessagesSpecifier(defineImportDecl).local
    .name

  walk(ast.instance as any, {
    enter(node: Node) {
      if (isMessagesDefinitionCall(node, defineMethodName) === false) return
      const [arg] = (node as CallExpression).arguments
      if (arg.type === 'ObjectExpression') {
        definitions.push(arg)
        this.skip()
      }
    },
  })

  return definitions.flatMap(definitionDict =>
    definitionDict.properties.map(
      propNode => propNode.value as ObjectExpression
    )
  )
}

export function collectMessages(markup: string): Message[] {
  const ast = parse(markup)
  const calls = collectFormatCalls(ast)
  const definitions = collectMessageDefinitions(ast)
  return [
    ...definitions.map(definition => getObjFromExpression(definition)),
    ...calls.map(call => {
      const [pathNode, options] = call.arguments
      if (pathNode.type === 'ObjectExpression') {
        return getObjFromExpression(pathNode)
      }

      const node = pathNode as Literal
      const id = node.value as string

      if (options && options.type === 'ObjectExpression') {
        const messageObj = getObjFromExpression(options)
        messageObj.meta.id = id
        return messageObj
      }

      return { node, meta: { id } }
    }),
  ].filter(Boolean)
}

export function extractMessages(
  markup: string,
  { accumulator = {}, shallow = false, overwrite = false } = {} as any
) {
  collectMessages(markup).forEach(message => {
    let defaultValue = message.meta.default
    if (typeof defaultValue === 'undefined') {
      defaultValue = ''
    }

    if (shallow) {
      if (overwrite === false && message.meta.id in accumulator) {
        return
      }
      accumulator[message.meta.id] = defaultValue
    } else {
      if (
        overwrite === false &&
        typeof getIn(accumulator, message.meta.id) !== 'undefined'
      ) {
        return
      }
      deepSet(accumulator, message.meta.id, defaultValue)
    }
  })
  return accumulator
}
