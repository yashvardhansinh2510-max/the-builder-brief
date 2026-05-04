import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from "@clerk/react";
import { Switch, Route, useLocation, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Blueprints from "@/pages/blueprints";
import Archive from "@/pages/archive";
import IssuePage from "@/pages/issue";
import About from "@/pages/about";
import UserPortal from "@/pages/user-portal";
import ProPortal from "@/pages/pro-portal";
import MaxPortal from "@/pages/max-portal";
import IdeaAgent from "@/pages/idea-agent";
import TemplatesPage from "@/pages/templates";
import AdminPortal from "@/pages/admin-portal";
import IncubatorDashboard from "@/pages/incubator-dashboard";
import InvestorPortal from "@/pages/investor-portal";
import BuildBrief from "@/pages/build-brief";
import DailyDrops from "@/pages/daily-drops";
import PaymentSuccess from "@/pages/payment-success";
import CreatorDashboard from "@/pages/creator-dashboard";
import Marketplace from "@/pages/marketplace";
import DeveloperPortal from "@/pages/developer-portal";
import VaultArchive from "@/pages/vault-archive";
import VaultDetail from "@/pages/vault-detail";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// Ensure basePath never has a trailing slash but also never produces double-slashes
const basePath = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

/** Strip the base prefix so wouter sees clean paths */
function stripBase(path: string): string {
  if (!basePath) return path;
  return path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

/** Join base + path without double-slashes */
function withBase(path: string): string {
  if (!basePath) return path;
  return `${basePath}${path}`;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#E9591C",
    colorBackground: "#F8F4EF",
    colorInputBackground: "#FFFFFF",
    colorText: "#0D0D0D",
    colorTextSecondary: "#6B6459",
    colorInputText: "#0D0D0D",
    colorNeutral: "#8C7B6E",
    borderRadius: "0.75rem",
    fontFamily: "'DM Sans', sans-serif",
    fontFamilyButtons: "'DM Sans', sans-serif",
    fontSize: "15px",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "shadow-2xl rounded-2xl w-full overflow-hidden border border-[rgba(0,0,0,0.08)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: { color: "#0D0D0D", fontFamily: "'Instrument Serif', serif", fontSize: "1.6rem" },
    headerSubtitle: { color: "#6B6459" },
    socialButtonsBlockButtonText: { color: "#0D0D0D" },
    formFieldLabel: { color: "#0D0D0D" },
    footerActionLink: { color: "#E9591C" },
    footerActionText: { color: "#6B6459" },
    dividerText: { color: "#6B6459" },
    identityPreviewEditButton: { color: "#E9591C" },
    formFieldSuccessText: { color: "#16a34a" },
    alertText: { color: "#b91c1c" },
    logoBox: "hidden",
    logoImage: "hidden",
    socialButtonsBlockButton: "border-[rgba(0,0,0,0.12)] hover:bg-[rgba(0,0,0,0.04)] transition-colors",
    formButtonPrimary: "bg-[#E9591C] hover:bg-[#d44d14] transition-colors rounded-full font-medium",
    formFieldInput: "rounded-lg border-[rgba(0,0,0,0.12)] focus:border-[#E9591C] focus:ring-[#E9591C]/20",
    footerAction: "bg-[rgba(0,0,0,0.03)]",
    dividerLine: "bg-[rgba(0,0,0,0.08)]",
    otpCodeFieldInput: { color: "#0D0D0D" },
    formFieldRow: "gap-3",
    main: "px-8 py-6",
  },
};

const CustomSignIn = () => <AuthPage mode="sign-in" />;
const CustomSignUp = () => <AuthPage mode="sign-up" />;

function HomeRedirect() {
  const { isLoaded, userId } = useAuth();
  if (!isLoaded) return null;
  if (userId) return <Redirect to="/dashboard" />;
  return <Home />;
}

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isLoaded, userId } = useAuth();
  if (!isLoaded) return null;
  if (!userId) return <Redirect to="/sign-in" />;
  return <Component {...rest} />;
}

const ProtectedUserPortal = (props: any) => <ProtectedRoute component={UserPortal} {...props} />;
const ProtectedProPortal = (props: any) => <ProtectedRoute component={ProPortal} {...props} />;
const ProtectedMaxPortal = (props: any) => <ProtectedRoute component={MaxPortal} {...props} />;
const ProtectedAdminPortal = (props: any) => <ProtectedRoute component={AdminPortal} {...props} />;
const ProtectedIncubatorDashboard = (props: any) => <ProtectedRoute component={IncubatorDashboard} {...props} />;
const ProtectedInvestorPortal = (props: any) => <ProtectedRoute component={InvestorPortal} {...props} />;
const ProtectedBuildBrief = (props: any) => <ProtectedRoute component={BuildBrief} {...props} />;
const ProtectedDailyDrops = (props: any) => <ProtectedRoute component={DailyDrops} {...props} />;
const ProtectedPaymentSuccess = (props: any) => <ProtectedRoute component={PaymentSuccess} {...props} />;
const ProtectedCreatorDashboard = (props: any) => <ProtectedRoute component={CreatorDashboard} {...props} />;
const ProtectedMarketplace = (props: any) => <ProtectedRoute component={Marketplace} {...props} />;
const ProtectedDeveloperPortal = (props: any) => <ProtectedRoute component={DeveloperPortal} {...props} />;
const ProtectedVaultArchive = (props: any) => <ProtectedRoute component={VaultArchive} {...props} />;
const ProtectedVaultDetail = (props: any) => <ProtectedRoute component={VaultDetail} {...props} />;
const ProtectedIdeaAgent = (props: any) => <ProtectedRoute component={IdeaAgent} {...props} />;
const ProtectedTemplates = (props: any) => <ProtectedRoute component={TemplatesPage} {...props} />;

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={clerkAppearance}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Access your startup blueprints",
          },
        },
        signUp: {
          start: {
            title: "Start building",
            subtitle: "Get your first blueprint this Friday",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in" component={CustomSignIn} />
            <Route path="/sign-in/*" component={CustomSignIn} />
            <Route path="/sign-up" component={CustomSignUp} />
            <Route path="/sign-up/*" component={CustomSignUp} />
            <Route path="/user-portal" component={ProtectedUserPortal} />
            <Route path="/dashboard" component={ProtectedUserPortal} />
            <Route path="/pro-portal" component={ProtectedProPortal} />
            <Route path="/max-portal" component={ProtectedMaxPortal} />
            <Route path="/admin-portal" component={ProtectedAdminPortal} />
            <Route path="/incubator-dashboard" component={ProtectedIncubatorDashboard} />
            <Route path="/investor-portal" component={ProtectedInvestorPortal} />
            <Route path="/build-brief" component={ProtectedBuildBrief} />
            <Route path="/daily-drops" component={ProtectedDailyDrops} />
            <Route path="/payment-success" component={ProtectedPaymentSuccess} />
            <Route path="/creator-dashboard" component={ProtectedCreatorDashboard} />
            <Route path="/marketplace" component={ProtectedMarketplace} />
            <Route path="/developer-portal" component={ProtectedDeveloperPortal} />
            <Route path="/blueprints" component={Blueprints} />
            <Route path="/archive" component={Archive} />
            <Route path="/vault-archive" component={ProtectedVaultArchive} />
            <Route path="/vault/:id" component={ProtectedVaultDetail} />
            <Route path="/issue/:slug" component={IssuePage} />
            <Route path="/about" component={About} />
            <Route path="/idea-agent" component={ProtectedIdeaAgent} />
            <Route path="/templates" component={ProtectedTemplates} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
