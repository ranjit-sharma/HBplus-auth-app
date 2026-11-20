export const ALLOWED_DOMAIN =
  process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || '@hbplus.fit';
export const DOMAIN_ERROR =
  'Access restricted. Please login using your official domain email.';

export function isAllowedDomain(email) {
  return typeof email === 'string' &&
    email.toLowerCase().trim().endsWith(ALLOWED_DOMAIN.toLowerCase().trim());
}
