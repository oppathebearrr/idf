import { useAppLocation } from "./lib/router";
import Landing from "./pages/Landing";
import CustomerPortal from "./pages/CustomerPortal";
import Confirmation from "./pages/Confirmation";
import { AuthorizationSessionProvider } from "./lib/authorization-session";
import { AppRouterProvider } from "./lib/router";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ErrorBoundary } from "./components/error-boundary";
import { SharedLayout } from "./components/Layout";

function AppRouter() {
  const [location] = useAppLocation();
  const cardSecurityUrl = `${import.meta.env.BASE_URL}card-security`;

  if (location === "/") return <Landing />;
  if (location === "/authorize") return <CustomerPortal />;
  if (location === "/confirmation") return <Confirmation />;

  return (
    <SharedLayout>
      <div className="flex-1 w-full flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-[#17364a]/25 bg-[#f8f7f2] p-8 shadow-[8px_8px_0_rgba(23,54,74,0.05)] text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-[#b84635] mb-4" />
          <h1 className="display-font text-2xl font-bold text-[#102f43] mb-2">Card Security page not found</h1>
          <p className="text-sm text-[#4e6666] mb-6">
            The requested document page does not exist.
          </p>
          <Button onClick={() => { window.location.href = cardSecurityUrl; }} className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 px-6 rounded-md shadow-[5px_5px_0_#c39b4a] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]">
            Return to Card Security
          </Button>
        </div>
      </div>
    </SharedLayout>
  );
}

export default function CardSecurityApp() {
  return (
    <ErrorBoundary>
      <AppRouterProvider>
        <AuthorizationSessionProvider>
          <AppRouter />
        </AuthorizationSessionProvider>
      </AppRouterProvider>
    </ErrorBoundary>
  );
}
