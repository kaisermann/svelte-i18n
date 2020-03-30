import {
  parse,
  TYPE as ICUType,
  MessageFormatElement,
} from 'intl-messageformat-parser'

import { flatObj } from '../../src/runtime/includes/flatObj'

const test = {
  plain: 'Some text without interpolations',
  quotes: 'Some text with `quotes` and "quotes" and \'quotes\'',
  interpolated: 'A text where I interpolate {count} times',
  time: 'Now is {now, time}',
  'time-custom-format': 'The hour is {now, time, hour}',
  date: 'Today is {today, date}. Yesterday was {yesterday, date}',
  'date-custom-format': 'Today is {today, date, abbr-full}',
  number: 'My favorite number is {n, number}',
  percent: 'My favorite number is {n, number, percent}',
  pluralized:
    'I have {count, plural,=0 {no cats} =1 {one cat} other {{count} cats}}',
  'pluralized-with-hash':
    'I have {count, plural, zero {no cats} one {just # cat} other {# cats}}',
  selected:
    '{gender, select, male {He is a good boy} female {She is a good girl} other {They are good fellas}}',
  'nested-offsets':
    '{trainers, plural, offset:1 =0 {The gym is empty} =1 {You are alone here} one {You and # trainer} other {You and # other trainers {friends, plural, offset: 4 =0 {and you need 4 more to form a basket team} =1 {and you need 3 more to play a basket game} =2 {and you need 2 more to play a basket game} =3 {and you need 1 more to play a basket game} =4 {and you have enough mates to play a basket game} one {and you can play a basket game and have # player in the bench} other {and you can play a basket game and have # players in the bench}}}}',
}

const HELPERS: Record<number, string> = {
  1: '_interpolate',
  2: '_number',
  3: '_date',
  4: '_time',
  5: '_select',
  6: '_plural',
}

const s = (o: any) => JSON.stringify(o)

const usedHelpers = new Set()

function buildExpression(
  node: MessageFormatElement,
  { paramName }: { paramName: string }
) {
  const helperFn = HELPERS[node.type]
  if (node.type === ICUType.literal) {
    return node.value
  }

  usedHelpers.add(helperFn)

  const argsList = [paramName]

  if (
    node.type === ICUType.time ||
    node.type === ICUType.date ||
    node.type === ICUType.number
  ) {
    if (node.style) {
      argsList.push(s(node.style) as string)
    }
  } else if (node.type === ICUType.select) {
    console.log(node)
    argsList.push(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(node.options).map(([key, n]) => {
            return [key, n.value]
          })
        )
      )
    )
  }

  return `${helperFn}(${argsList.join(', ')})`
}

function buildTemplateLiteral(ast: MessageFormatElement[]) {
  // console.log(ast)
  const parts: any[] = []
  const params: any[] = []

  for (const node of ast) {
    if (node.type === ICUType.literal) {
      parts.push(node.value)
      continue
    }

    if (
      node.type === ICUType.argument ||
      node.type === ICUType.time ||
      node.type === ICUType.date ||
      node.type === ICUType.number ||
      node.type === ICUType.select
    ) {
      const paramName = `t${params.length}`
      params.push([node.value, paramName])
      parts.push(`\${${buildExpression(node, { paramName })}}`)
      continue
    }
  }

  const mappedParams = params.map(
    ([name, internalName]) => `${name}: ${internalName}`
  )
  const stringifiedParts = parts.join('').replace(/`/g, '\\`')
  const functionParam =
    mappedParams.length > 0 ? `{ ${mappedParams.join(', ')} }` : ''

  return `(${functionParam}) => \`${stringifiedParts}\``
}

function buildFunction(ast: MessageFormatElement[]) {
  return buildTemplateLiteral(ast)
}

it('foo', () => {
  const obj = flatObj(test)
  const result: Record<string, any> = {}

  for (const [id, msg] of Object.entries(obj)) {
    const parsed = parse(msg)
    result[id] = buildFunction(parsed)
  }

  const imports = [...usedHelpers].join(', ')
  const mod = `
import { ${imports} } from 'svelte-i18n/icu-helpers';

export default {
  ${Object.entries(result)
    .map(([id, fn]) => `${s(id)}: ${fn.toString()}`)
    .join(',\n  ')}
}
`.trim()

  console.log(mod)
  // console.log(Object.entries(result).map(r => [r[0], eval(r[1]).toString()]))
})
