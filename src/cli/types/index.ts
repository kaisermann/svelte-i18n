import type { walk } from 'estree-walker';

type InferThis<T extends (this: any, ...args: any) => any> = T extends (
  this: infer P,
  ...args: any
) => any
  ? P
  : never;

export type Message = {
  id: string;
  default?: string;
  [key: string]: any;
};

export type WalkerOperationThis = InferThis<
  Exclude<Parameters<typeof walk>[1]['enter'], undefined>
>;
