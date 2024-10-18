// cacheService.js

import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 3600 });

const setCache = (key, data, ttl) => {
  cache.set(key, data, ttl);
};

const getCache = (key) => {
  return cache.get(key);
};

const delCache = (key) => {
  cache.del(key);
};

const flushCache = () => {
  cache.flushAll();
};

export default { setCache, getCache, delCache, flushCache };
