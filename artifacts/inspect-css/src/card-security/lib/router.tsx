import { useLocation } from "wouter";
import type { ReactNode } from "react";

export function AppRouterProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAppLocation(): [string, (path: string) => void] {
  const [loc, setLoc] = useLocation();
  return [loc, setLoc];
}