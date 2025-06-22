import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/DashboardPage";
import SchoolsPage from "@/pages/schools-page";
import BookingsPage from "@/pages/bookings-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/dashboard" component={DashboardPage} />
            <Route path="/schools" component={SchoolsPage} />
            <ProtectedRoute path="/bookings" component={BookingsPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
