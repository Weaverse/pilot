import { clsx, type ClassValue } from 'clsx'
import { twMerge as merge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs))
}
