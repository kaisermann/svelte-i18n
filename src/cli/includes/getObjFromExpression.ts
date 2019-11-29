import { ObjectExpression, Property, Identifier } from 'estree'

import { Message } from '../types'

export function getObjFromExpression(exprNode: ObjectExpression) {
  return exprNode.properties.reduce<Message>(
    (acc, prop: Property) => {
      if (prop.value.type !== 'Literal') return acc
      // we only want primitives
      if (prop.value.value !== Object(prop.value.value)) {
        const key = (prop.key as Identifier).name as string
        acc.meta[key] = prop.value.value
      }
      return acc
    },
    { node: exprNode, meta: {} }
  )
}
