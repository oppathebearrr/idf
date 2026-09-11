import { useLocation } from "wouter";
import type { ReactNode } from "react";

export function AppRouterProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAppLocation(): [string, (path: string) => void] {
  // Wouter returns the path *after* the base, which is perfect.
  const [loc, setLoc] = useLocation();

  // If the internal paths are expecting "/", "/authorize", etc, we map them directly.
  // Wait, if the app mounts at "/card-security", then inside the card-security pages,
  // do they route to "/authorize" or "/card-security/authorize"?
  // To keep the card-security components decoupled, we can just use the global path.
  // Actually, wouter `<Router base="/card-security">` can scope it! 
  // Let's just return what wouter gives, and let the caller set up the base router.
  return [loc, setLoc];
}