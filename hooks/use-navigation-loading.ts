import { useState, useEffect, useRef } from "react";
import { usePathname } from "expo-router";

/**
 * Hook to detect when navigation is in progress
 * Shows loading state during route transitions
 */
export function useNavigationLoading() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const previousPathRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If pathname changed, we're navigating
    if (previousPathRef.current !== null && previousPathRef.current !== pathname) {
      setIsLoading(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Simulate a brief loading period for skeleton display
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        timeoutRef.current = null;
      }, 400); // Short delay to show skeleton during transition

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
    previousPathRef.current = pathname;
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return isLoading;
}

