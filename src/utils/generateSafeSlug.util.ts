import { slugify as baseSlugify } from 'transliteration';
import slugify from 'slugify';
import { customAlphabet } from 'nanoid';

const generateRandomSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

export function generateSafeSlug(input: string): string {
  if (!input || input.trim() === '') {
    return generateRandomSlug();
  }

  const transliterated = baseSlugify(input.replace(/_/g, ' '));

  const slug = slugify(transliterated, {
    lower: true,
    strict: true,
    trim: true,
    replacement: '-'
  });

  return slug.length > 0 ? slug : generateRandomSlug();
}
