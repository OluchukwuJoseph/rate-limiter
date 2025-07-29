export function buildRedisKey(prefix: string, id: string) {
  return `${prefix}:${id}`;
}
