import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/shared/store/authStore";
import { useCartStore } from "@/shared/store/cartStore";
import { lazy, Suspense, useEffect, useRef, type ReactNode } from "react";
import { configureServerErrorHandler } from "@/shared/api/http";
import { usePageTracking } from '@/lib/analytics'

// Layouts
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProfileLayout from "@/components/layout/ProfileLayout";

// Storefront pages
import Index from "./pages/Index";
import CategoryPage from "./pages/storefront/CategoryPage";
import ProductPage from "./pages/storefront/ProductPage";
import SearchPage from "./pages/storefront/SearchPage";
import CartPage from "./pages/storefront/CartPage";
import CheckoutPage from "./pages/storefront/CheckoutPage";
import CheckoutSuccessPage from "./pages/storefront/CheckoutSuccessPage";
import PaymentSuccessPage from "./pages/storefront/PaymentSuccessPage";
import PaymentFailedPage from "./pages/storefront/PaymentFailedPage";
import LoginPage from "./pages/storefront/LoginPage";
import RegisterPage from "./pages/storefront/RegisterPage";
import VerifyOtpPage from "./pages/storefront/VerifyOtpPage";
import ForgotPasswordPage from "./pages/storefront/ForgotPasswordPage";
import ProfileInfoPage from "./pages/storefront/ProfileInfoPage";
import ProfileOrdersPage from "./pages/storefront/ProfileOrdersPage";
import ProfileOrderDetailPage from "./pages/storefront/ProfileOrderDetailPage";
import ProfileAddressesPage from "./pages/storefront/ProfileAddressesPage";
import ProfileWishlistPage from "./pages/storefront/ProfileWishlistPage";
import { ProfileHubPage } from "./pages/storefront/ProfileHubPage";
import NotFound from "./pages/NotFound";
import { ServerErrorPage } from "./pages/ServerErrorPage";

// Admin pages
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsPage from "./pages/admin/ProductsPage";
import ProductDetailPage from "./pages/admin/ProductDetailPage";
import { ProductFormPage } from "./pages/admin/ProductFormPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import CategoryPricesPage from "./pages/admin/CategoryPricesPage";
import CompanyInfoPage from "./pages/admin/CompanyInfoPage";
import OrdersPage from "./pages/admin/OrdersPage";
import OrderDetailPage from "./pages/admin/OrderDetailPage";
import CustomersPage from "./pages/admin/CustomersPage";
import CustomerDetailPage from "./pages/admin/CustomerDetailPage";
import ReviewsPage from "./pages/admin/ReviewsPage";
import DiscountsPage from "./pages/admin/DiscountsPage";
import SyncLogsPage from "./pages/admin/SyncLogsPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { ReturnReasonsPage } from "./pages/admin/ReturnReasonsPage";
import { FaqsPage } from "./pages/admin/FaqsPage";

const queryClient = new QueryClient();

// Route guards
const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const NavigationWatcher = () => {
  const navigate = useNavigate();
  useEffect(() => {
    configureServerErrorHandler((path) => {
      navigate(`/500?from=${encodeURIComponent(path)}`, { replace: true });
    });
  }, [navigate]);
  return null;
};

const AnalyticsTracker = () => {
  usePageTracking()
  return null
}

const CartHydrator = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) {
      hydrated.current = false;
      return;
    }
    if (hydrated.current) return;
    hydrated.current = true;
    void useCartStore.getState().hydrateFromServer();
  }, [isAuthenticated]);
  return null;
};

const AdminOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavigationWatcher />
        <AnalyticsTracker />
        <CartHydrator />
        <Routes>
          {/* Storefront - public */}
          <Route path="/" element={<Index />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Storefront - auth required */}
          <Route path="/checkout" element={<AuthRoute><CheckoutPage /></AuthRoute>} />
          <Route path="/checkout/success" element={<AuthRoute><CheckoutSuccessPage /></AuthRoute>} />
          <Route path="/payment/success" element={<AuthRoute><PaymentSuccessPage /></AuthRoute>} />
          <Route path="/payment/status" element={<AuthRoute><PaymentSuccessPage /></AuthRoute>} />
          <Route path="/payment/fail" element={<AuthRoute><PaymentFailedPage /></AuthRoute>} />

          {/* Profile hub — mobile landing */}
          <Route path="/profile" element={<AuthRoute><StorefrontLayout><ProfileHubPage /></StorefrontLayout></AuthRoute>} />

          {/* Wishlist - public, guests see localStorage items */}
          <Route element={<ProfileLayout />}>
            <Route path="/profile/wishlist" element={<ProfileWishlistPage />} />
          </Route>

          {/* Profile sub-pages - auth required */}
          <Route element={<AuthRoute><ProfileLayout /></AuthRoute>}>
            <Route path="/profile/info" element={<ProfileInfoPage />} />
            <Route path="/profile/orders" element={<ProfileOrdersPage />} />
            <Route path="/profile/orders/:id" element={<ProfileOrderDetailPage />} />
            <Route path="/profile/addresses" element={<ProfileAddressesPage />} />
          </Route>

          {/* Admin - admin/manager required */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/products/:id" element={<ProductDetailPage />} />
            <Route path="/admin/products/new" element={<ProductFormPage />} />
            <Route path="/admin/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/category-prices" element={<CategoryPricesPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
            <Route path="/admin/customers" element={<CustomersPage />} />
            <Route path="/admin/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/admin/reviews" element={<ReviewsPage />} />
            <Route path="/admin/discounts" element={<DiscountsPage />} />
            <Route path="/admin/company-info" element={<CompanyInfoPage />} />
            <Route path="/admin/ref/return-reasons" element={<ReturnReasonsPage />} />
            <Route path="/admin/ref/faqs" element={<FaqsPage />} />
            {/* Admin only */}
            <Route path="/admin/sync-logs" element={<AdminOnlyRoute><SyncLogsPage /></AdminOnlyRoute>} />
            <Route path="/admin/users" element={<AdminOnlyRoute><UsersPage /></AdminOnlyRoute>} />
          </Route>

          {/* Error pages */}
          <Route path="/500" element={<ServerErrorPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
