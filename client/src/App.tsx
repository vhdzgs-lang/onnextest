import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Done from "./pages/Done";
import { createTrpcClient, trpc } from "./lib/trpc";

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/registro" component={Register} />
      <Route path="/test" component={Quiz} />
      <Route path="/listo" component={Done} />
      <Route component={Home} />
    </Switch>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { mutations: { retry: false } } }));
  const [trpcClient] = useState(createTrpcClient);
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
