import { ObjectExpression, Property, Identifier } from 'estree';

import { Message } from '../types';

export function getObjFromExpression(exprNode: ObjectExpression) {
  return exprNode.properties.reduce<Message>((acc, prop: Property) => {
    // we only want primitives
    if (
      prop.value.type === 'Literal' &&
      prop.value.value !== Object(prop.value.value)
    ) {
      const key = (prop.key as Identifier).name as string;

      acc[key] = prop.value.value;
    }

    return acc;
  }, {});
}
