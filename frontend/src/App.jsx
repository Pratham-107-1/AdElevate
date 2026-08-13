import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CategoriesPage from "./pages/CategoriesPage";
import AboutPage from "./pages/AboutPage";
import BrowsePage from "./pages/BrowsePage";
import AdDetailPage from "./pages/AdDetailPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlansPage from "./pages/PlansPage";
import PaymentPage from "./pages/PaymentPage";
import SuccessPage from "./pages/SuccessPage";
import ComingSoon from "./pages/ComingSoon";
import ProtectedRoute from "./components/routing/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/ads/:id" element={<AdDetailPage />} />

      <Route path="/provider" element={
        <ProtectedRoute allowedRoles={["VENDOR"]}><ProviderDashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute allowedRoles={["VENDOR"]}><PaymentPage /></ProtectedRoute>
      } />

      <Route path="/plans" element={<PlansPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="*" element={<ComingSoon title="Page not found" note="That page doesn't exist." />} />
    </Routes>
  );
}

export default App;
