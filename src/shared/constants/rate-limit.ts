export const RATE_LIMIT_LUA_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  
  local current = redis.call('GET', key)
  
  if current == false then
    redis.call('SETEX', key, window, 1)
    return 1
  end
  
  current = tonumber(current)
  if current >= limit then
    return 0
  end
  
  redis.call('INCR', key)
  return 1
`;

export const DEFAULT_RATE_LIMITS = {
  IP: {
    REQUEST_LIMIT: '100',
    WINDOW_DURATION_SECONDS: '60', // 1 minute
  },
  USER: {
    REQUEST_LIMIT: '1000',
    WINDOW_DURATION_SECONDS: '3600', // 1 hour
  },
};

export const REDIS_KEY_PREFIXES = {
  IP_RATE_LIMIT: 'rate_limit:ip',
  USER_RATE_LIMIT: 'user_rate_limit',
  API_KEY_RATE_LIMIT: 'rate_limit:api_key',
} as const;
