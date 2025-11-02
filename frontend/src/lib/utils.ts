/**
 * Utility Functions
 * 
 * Shared utility functions for common operations across the application.
 * Currently contains a utility for merging Tailwind CSS class names.
 * 
 * @fileoverview Utility functions for the application
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges and resolves Tailwind CSS class names
 * 
 * Combines multiple class values (strings, arrays, objects) and merges
 * conflicting Tailwind classes intelligently. Uses clsx for conditional
 * classes and twMerge for Tailwind-specific conflict resolution.
 * 
 * @param {...ClassValue} inputs - Variable number of class value arguments
 * @returns {string} Merged and resolved class name string
 * 
 * @example
 * cn('px-2 py-1', 'px-4', { 'bg-red-500': isActive })
 * // Returns: 'py-1 px-4 bg-red-500' (px-2 is overridden by px-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
