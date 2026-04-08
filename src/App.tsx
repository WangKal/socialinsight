import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AnalysesList from "./pages/AnalysesList";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Messaging from "./pages/Messaging";
import Notifications from "./pages/Notifications";
import ResetPassword from "./pages/ResetPassword";
import GeneralAnalysis from "./pages/GeneralAnalysis";
import Terms from "./pages/Terms";
import Guide from "./pages/Guide";
import NotFound from "./pages/NotFound";

import AdminPromos from "./pages/AdminPromos";
import PublicPromoView from "./pages/PublicPromoView";
import PromoCreate from "./pages/PromoCreate";
import PromoList from "./pages/PromoList";
import PromoDetails from "./pages/PromoDetails";

import { useState } from "react";

import { AuthProvider } from "./hooks/use-auth";

const queryClient = new QueryClient();

/**
 * MAIN ROUTES COMPONENT
 * Keeps logic + routing cleanly separated
 */
function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/general-analysis" element={<GeneralAnalysis />} />
     
      <Route path="/terms" element={<Terms />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* MAIN APP */}
       <Route path="/analytics-list/:scope" element={<Layout><AnalysesList /></Layout>} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
      <Route path="/payments" element={<Layout><Payments /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/messages" element={<Layout><Messaging /></Layout>} />
      <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
      <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />

      {/* PROMOS */}
      <Route
  path="/admin-promos"
  element={
    <Layout>
      <AdminPromos />
    </Layout>
  }
/>
<Route
  path="/promo-create"
  element={
    <Layout>
      <PromoCreate />
    </Layout>
  }
/>


<Route
  path="/promos"
  element={
    <Layout>
      <PublicPromoView />
    </Layout>
  }
/>
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/**
 * ROOT APP
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;