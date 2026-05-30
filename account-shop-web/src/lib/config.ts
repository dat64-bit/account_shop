const isServer = typeof window === 'undefined';

export const API_BASE_URL = isServer
  ? (process.env.SERVER_API_URL)
  : (process.env.NEXT_PUBLIC_API_URL);
