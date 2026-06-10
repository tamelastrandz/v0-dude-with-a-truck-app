/**
 * App.tsx — Root component with routing and context providers.
 *
 * Routes:
 *  /           → Landing page (public)
 *  /dashboard  → Driver/Customer dashboard (protected)
 *  /admin      → Admin dashboard (admin role required)
 *  /404        → Not found
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ReferralPartner from "./pages/ReferralPartner";
import AffiliateDashboard from "./pages/AffiliateDashboard";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* /join?ref=CODE — same as home but captures the referral code */}
      <Route path="/join" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/referral-partner" component={ReferralPartner} />
      <Route path="/affiliate-dashboard" component={AffiliateDashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      {/* Dark theme matches the original v0 design */}
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
