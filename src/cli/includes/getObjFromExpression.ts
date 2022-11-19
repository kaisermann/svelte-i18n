import type { ObjectExpression, Identifier } from 'estree';
import type { Message } from '../types';

export function getObjFromExpression(exprNode: ObjectExpression): Message {
  return exprNode.properties.reduce((acc, prop) => {
    if (prop.type === 'SpreadElement') return acc;

    // we only want primitives
    if (
      prop.value.type === 'Literal' &&
      prop.value.value !== Object(prop.value.value)
    ) {
      const key = (prop.key as Identifier).name as string;

      acc[key] = prop.value.value;
    }

    return acc;
  }, {} as Message);
}
