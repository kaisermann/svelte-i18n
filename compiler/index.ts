import { parse } from './deps/parser.ts'

const log_json = (o: object) => console.log(JSON.stringify(o, null, 2))
const ast = parse(`{taxableArea, select,
yes {An additional {taxRate, number, percent} tax will be collected.}
other {No taxes apply.}
}`)

log_json(ast)
