type CacheData = any[];

let cache: CacheData | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
// Cache version: Force reload for Localty field

export function getCache(): CacheData | null {
    const now = Date.now();
    if (cache && now - lastFetchTime < CACHE_TTL) {
        return cache;
    }
    return null;
}

export function setCache(data: CacheData) {
    cache = data;
    lastFetchTime = Date.now();
}

export function clearCache() {
    cache = null;
    lastFetchTime = 0;
}

// User Cache (Simple in-memory for demo purposes, or extended to use a better store)
let userCache: Record<string, any> = {};

export function setUserCache(username: string, details: any) {
    userCache[username] = details;
}

export function getUserCache(username: string) {
    return userCache[username];
}

export function clearUserCache(username: string) {
    delete userCache[username];
}
