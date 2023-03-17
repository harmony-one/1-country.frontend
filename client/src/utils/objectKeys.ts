export function objectKeys<T>(obj: T) {
  return Object.keys(obj) as [keyof T]
}
