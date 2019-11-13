const { parse, walk } = require('svelte/compiler')
const { print } = require('code-red')
const MagicString = require('magic-string')

const markup = `
<script>
  import bla from 'svelte-i18n'
  import {foo, _ as format } from 'svelte-i18n'
  import {bar,baz as ewe, defineMessages} from 'svelte-i18n'
  import aaaa from 'bbbbb'
  console.log($foo)
  let isLarge = $foo > 10;

  defineMessages({
    statusDisabled: {id:'status.disabled'},
    statusEnabled: {id:'status.enabled'},
  })

  let placeholderText = $foo('placeholder', { format: 'Something'})
  let value = $foo.title({id:'HIHI',default:'default hihi'})
  ops.eita()
</script>

<input placeholder={$foo('messages.name', { default: 'Name' })}/>
<input placeholder={$foo('messages.age', { default: 'Age' })}/>
<input placeholder={$foo.title('messages.list[0]', { default: 'Haha' })}/>
<input placeholder={$foo('status.'+status)}/>
<h1>$foo.title('title.message')</h1>
{gif()}
`

function isNumberString(nStr) {
  return !Number.isNaN(parseInt(nStr))
}

function isFormatCall(node, importMap) {
  if (node.type !== 'CallExpression') return false

  let identifier
  if (node.callee.type === 'MemberExpression') {
    identifier = node.callee.object
  }

  if (node.callee.type === 'Identifier') {
    identifier = node.callee
  }

  return (
    identifier &&
    identifier.type === 'Identifier' &&
    !!importMap.get(identifier.name.slice(1))
  )
}

function isMessagesDefinitionCall(node, methodName) {
  if (node.type !== 'CallExpression') return false

  return (
    node.callee &&
    node.callee.type === 'Identifier' &&
    node.callee.name === methodName
  )
}

function getImportDeclarations(ast) {
  return ast.instance.content.body.filter(
    node =>
      node.type === 'ImportDeclaration' && node.source.value === 'svelte-i18n',
  )
}

export function collectFormatCalls(ast) {
  const calls = []

  const importDecls = getImportDeclarations(ast)

  if (importDecls.length === 0) return []

  const importMap = new Map(
    importDecls.flatMap(node => node.specifiers.map(n => [n.local.name, node])),
  )

  const formatCallsWalker = node => {
    if (isFormatCall(node, importMap)) calls.push(node)
  }
  walk(ast.instance, { enter: formatCallsWalker })
  walk(ast.html, { enter: formatCallsWalker })

  return calls
}

export function collectMessageDefinitions(ast) {
  const definitions = []

  const defineImportDecl = getImportDeclarations(ast).find(decl =>
    decl.specifiers.find(
      spec => spec.imported && spec.imported.name === 'defineMessages',
    ),
  )

  if (defineImportDecl == null) return []

  const defineMethodName = defineImportDecl.specifiers.find(
    spec => spec.imported.name === 'defineMessages',
  ).local.name

  walk(ast.instance, {
    enter: node => {
      if (isMessagesDefinitionCall(node, defineMethodName)) {
        definitions.push(node.arguments[0])
      }
    },
  })

  return definitions.flatMap(definitionDict => {
    return definitionDict.properties.map(propNode => propNode.value)
  })
}

const deepSet = (obj, path, value) => {
  const parts = path.replace(/\[(\w+)\]/gi, '.$1').split('.')
  return parts.reduce((ref, part, i) => {
    if (part in ref) return (ref = ref[part])

    if (i < parts.length - 1) {
      if (isNumberString(parts[i + 1])) {
        return (ref = ref[part] = [])
      }
      return (ref = ref[part] = {})
    }

    return (ref[part] = value)
  }, obj)
}

export function collectMessages(markup, holder = {}) {
  const ast = parse(markup)
  const calls = collectFormatCalls(ast)
  const definitions = collectMessageDefinitions(ast)

  // TODO make definitions work, dry this somehow
  return calls.reduce((acc, call) => {
    let [pathNode, options] = call.arguments

    // support the { id: '...' syntax}
    if (pathNode.type === 'ObjectExpression') {
      options = pathNode
      const idProperty = options.properties.find(
        prop => prop.key.type === 'Identifier' && prop.key.name === 'id',
      )
      if (idProperty) {
        pathNode = idProperty.value
      }
    }

    if (pathNode.type !== 'Literal') return acc
    if (typeof pathNode.value !== 'string') return acc

    let defaultValue = ''
    if (options && options.type === 'ObjectExpression') {
      const defaultProp = options.properties.find(
        prop => prop.key.type === 'Identifier' && prop.key.name === 'default',
      )

      if (defaultProp) {
        defaultValue = defaultProp.value.value
        if (typeof defaultValue === 'undefined') {
          defaultValue = null
        }
      }
    }
    deepSet(acc, pathNode.value, defaultValue)
    return acc
  }, holder)
}
