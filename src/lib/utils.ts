import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// sort a list of objects by the specified string property
export function sortBy<T>(arr: T[], prop: keyof T) {
  return arr.sort((a, b) => {
    const aProp = a[prop];
    const bProp = b[prop];
    if (aProp < bProp) return -1;
    if (aProp > bProp) return 1;
    return 0;
  });
}
