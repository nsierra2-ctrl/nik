import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AgeGate from "@/components/AgeGate";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/CartDrawer";
import CartFab from "@/components/CartFab";
import Home from "@/pages/home";
import AdminLogin from "@/pages/admin-login";
import AdminPanel from "@/pages/admin";
import AdminProductEdit from "@/pages/admin-product-edit";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin/products/:id" component={AdminProductEdit} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AgeGate>
              <Router />
              <CartDrawer />
              <CartFab />
            </AgeGate>
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
