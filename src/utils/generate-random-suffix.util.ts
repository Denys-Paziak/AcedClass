import { customAlphabet } from 'nanoid';

export const generateRandomSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4);