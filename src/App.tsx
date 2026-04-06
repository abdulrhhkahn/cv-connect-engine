import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import AppLayout from "./components/AppLayout";
import CompanyChat from "./pages/CompanyChat";
import CompanyJobs from "./pages/CompanyJobs";
import CompanyApplicants from "./pages/CompanyApplicants";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import CompanyPublicProfile from "./pages/CompanyPublicProfile";
import CandidateJobs from "./pages/CandidateJobs";
import CandidateProfilePage from "./pages/CandidateProfile";
import CandidateApplications from "./pages/CandidateApplications";
import CandidateChat from "./pages/CandidateChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedRoutes = () => {
  const { user } = useAuth();
  if (!user) return <Landing />;

  const isCompany = user.role === "company";

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={isCompany ? <CompanyChat /> : <CandidateJobs />} />
        <Route path="/jobs" element={isCompany ? <CompanyJobs /> : <Navigate to="/dashboard" />} />
        <Route path="/applicants" element={isCompany ? <CompanyApplicants /> : <Navigate to="/dashboard" />} />
        <Route path="/company-profile" element={isCompany ? <CompanyProfilePage /> : <Navigate to="/dashboard" />} />
        <Route path="/company/:companyId" element={<CompanyPublicProfile />} />
        <Route path="/profile" element={!isCompany ? <CandidateProfilePage /> : <Navigate to="/dashboard" />} />
        <Route path="/my-applications" element={!isCompany ? <CandidateApplications /> : <Navigate to="/dashboard" />} />
        <Route path="/chat" element={!isCompany ? <CandidateChat /> : <Navigate to="/dashboard" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<AuthenticatedRoutes />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
