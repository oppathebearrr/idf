import { Route, Switch } from "wouter";
import { FraudSessionProvider } from "./lib/fraud-session";
import Landing from "./pages/Landing";
import Wizard from "./pages/Wizard";
import Confirmation from "./pages/Confirmation";

export default function ReportFraudApp() {
  return (
    <FraudSessionProvider>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/report" component={Wizard} />
        <Route path="/confirmation" component={Confirmation} />
        <Route component={Landing} />
      </Switch>
    </FraudSessionProvider>
  );
}