import { useAppLocation } from "./lib/router";
import { Toaster } from "@/components/ui/toaster";

import Landing from "./pages/Landing";
import CustomerPortal from "./pages/CustomerPortal";
import Confirmation from "./pages/Confirmation";
import { AuthorizationSessionProvider } from "./lib/authorization-session";
import { AppRouterProvider } from "./lib/router";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ErrorBoundary } from "./components/error-boundary";

function AppRouter() {
  const [location, setLocation] = useAppLocation();

  if (location === "/") return <Landing />;
  if (location === "/authorize") return <CustomerPortal />;
  if (location === "/confirmation") return <Confirmation />;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full border-2 border-slate-300 bg-white p-8 rounded shadow-sm text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-amber-600 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-6">
          The requested document page does not exist.
        </p>
        <Button onClick={() => setLocation("/")} className="bg-[#005ea2] hover:bg-[#005ea2]/90 text-white font-bold">
          Return home
        </Button>
      </div>
    </div>
  );
}

export default function CardSecurityApp() {
  return (
    <ErrorBoundary>
      <AppRouterProvider>
        <AuthorizationSessionProvider>
          <AppRouter />
          {/* We already have a global Toaster in inspect-css, but they might rely on specific toast styling. We'll leave it out or put it here. Actually we can leave it out, global toaster works. */}
        </AuthorizationSessionProvider>
      </AppRouterProvider>
    </ErrorBoundary>
  );
}
