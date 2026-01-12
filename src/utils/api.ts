export const IS_DEMO = import.meta.env.VITE_BACKEND === 'mock';

export const API_URL = IS_DEMO ? '' : import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
