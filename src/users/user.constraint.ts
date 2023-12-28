export const Cons = {
  username: { min: 1, max: 64 },
  password: { min: 8, max: 64 },
  filename: 48,
  bio: 500,
} as const;
