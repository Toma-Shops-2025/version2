import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Prevent backspace navigation and form leave warnings
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

  // Completely disable beforeunload warnings globally
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // Always prevent the warning dialog
    e.preventDefault();
    delete e.returnValue;
    return;
  };

  // Override any existing beforeunload handlers
  const originalBeforeUnload = window.onbeforeunload;
  window.onbeforeunload = null;

  // Add the event listeners
  document.addEventListener('keydown', handleKeyDown);
  window.addEventListener('beforeunload', handleBeforeUnload, true); // Use capture phase
  
  // Also prevent the default browser behavior for navigation
  const handlePopState = (e: PopStateEvent) => {
    // Don't prevent actual navigation, just the warning
  };
  
  window.addEventListener('popstate', handlePopState);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('beforeunload', handleBeforeUnload, true);
    window.removeEventListener('popstate', handlePopState);
    // Restore original beforeunload handler if it existed
    if (originalBeforeUnload) {
      window.onbeforeunload = originalBeforeUnload;
    }
  };
};
