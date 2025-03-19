const tokenBlacklist: Set<string> = new Set();

export const addToBlacklist = (token: string) => {
  tokenBlacklist.add(token);
};

export const isBlacklisted = (token: string) => {
  return tokenBlacklist.has(token);
};
