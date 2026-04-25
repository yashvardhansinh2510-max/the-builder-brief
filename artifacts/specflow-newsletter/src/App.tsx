import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { Switch, Route, useLocation, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Archive from "@/pages/archive";
import IssuePage from "@/pages/issue";
import About from "@/pages/about";
import UserPortal from "@/pages/user-portal";
import CreatorDashboard from "@/pages/creator-dashboard";
import Marketplace from "@/pages/marketplace";
import DeveloperPortal from "@/pages/developer-portal";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
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
    logoBox: "flex justify-center py-2",
    logoImage: "h-12 w-auto",
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

function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={`${basePath}/user-portal`}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          fallbackRedirectUrl={`${basePath}/user-portal`}
        />
      </div>
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/user-portal" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function UserPortalPage() {
  return (
    <>
      <Show when="signed-in">
        <UserPortal />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

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
      proxyUrl={clerkProxyUrl}
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
            <Route path="/sign-in{/*rest}" component={SignInPage} />
            <Route path="/sign-up{/*rest}" component={SignUpPage} />
            <Route path="/user-portal" component={UserPortalPage} />
            <Route path="/creator-dashboard" component={CreatorDashboard} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/developer-portal" component={DeveloperPortal} />
            <Route path="/archive" component={Archive} />
            <Route path="/issue/:slug" component={IssuePage} />
            <Route path="/about" component={About} />
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
