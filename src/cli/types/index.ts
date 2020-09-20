import { Node } from 'estree';

export interface Message {
  node: Node;
  meta: {
    id?: string;
    default?: string;
    [key: string]: any;
  };
}
