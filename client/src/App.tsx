import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminPage from "./pages/Admin";
import VideoDemoPage from "./pages/VideoDemoPage";
import PlansPage from "./pages/PlansPage";
import { AppHome, PublicProfile, PublicQuote } from "./pages/Workspace";

function AuthenticatedRoute() {
  return <AppHome />;
}

function QuoteRoute({ params }: { params: { token: string } }) {
  return <PublicQuote token={params.token} />;
}

function ProfileRoute({ params }: { params: { slug: string } }) {
  return <PublicProfile slug={params.slug} />;
}

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/admin" component={AdminPage} />
    <Route path="/demo" component={VideoDemoPage} />
    <Route path="/video" component={VideoDemoPage} />
    <Route path="/planos" component={PlansPage} />
    <Route path="/app" component={AuthenticatedRoute} />
    <Route path="/meu-dia" component={AuthenticatedRoute} />
    <Route path="/agenda" component={AuthenticatedRoute} />
    <Route path="/clientes" component={AuthenticatedRoute} />
    <Route path="/servicos" component={AuthenticatedRoute} />
    <Route path="/equipe" component={AuthenticatedRoute} />
    <Route path="/solicitacoes" component={AuthenticatedRoute} />
    <Route path="/orcamentos" component={AuthenticatedRoute} />
    <Route path="/financeiro" component={AuthenticatedRoute} />
    <Route path="/relatorios" component={AuthenticatedRoute} />
    <Route path="/cartao" component={AuthenticatedRoute} />
    <Route path="/tutorial" component={AuthenticatedRoute} />
    <Route path="/guia" component={AuthenticatedRoute} />
    <Route path="/configuracoes" component={AuthenticatedRoute} />
    <Route path="/orcamento/:token" component={QuoteRoute} />
    <Route path="/p/:slug" component={ProfileRoute} />
    <Route path="/:slug" component={ProfileRoute} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="light" switchable>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}
