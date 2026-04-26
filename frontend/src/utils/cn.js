/**
 * Utility for conditional class merging.
 * In production apps, this is often powered by 'clsx' and 'tailwind-merge'.
 * For now, we provide a clean functional equivalent.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
