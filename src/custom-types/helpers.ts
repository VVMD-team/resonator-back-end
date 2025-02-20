export type AtLeastOne<T> = {
  [K in keyof T]: Pick<T, K>;
}[keyof T] &
  Partial<T>;

export type Base64String = string & { readonly __brand: unique symbol };
