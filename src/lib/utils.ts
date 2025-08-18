import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Prevent backspace from navigating back when typing in form fields
export const preventBackspaceNavigation = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only prevent if backspace is pressed
    if (e.key === 'Backspace') {
      // Get the active element
      const activeElement = document.activeElement as HTMLElement;
      
      // Check if we're in an input field where backspace should work normally
      const isInInputField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true' ||
        activeElement.isContentEditable
      );
      
      // If NOT in an input field, prevent the backspace navigation
      if (!isInInputField) {
        e.preventDefault();
        return false;
      }
    }
  };

  // Add the event listener
  document.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};
