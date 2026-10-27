export const emailValid = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export const validPassword = value => typeof value === 'string' && value.length >= 10 && value.length <= 128;
export const objectIdValid = value => /^[a-f\d]{24}$/i.test(String(value || ''));
export function cleanText(value, max) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
