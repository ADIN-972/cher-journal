import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chapters from "./pages/Chapters";
import ChapterDetail from "./pages/ChapterDetail";
import VolumeForm from "./pages/VolumeForm";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetailImproved";
import Orders from "./pages/Orders";
import SettingsPage from "./pages/Settings";
import { PromotionsPage } from "./pages/PromotionsPage";
import { PromotionForm } from "./pages/PromotionForm";
import { PricesPage } from "./pages/PricesPage";
import PriceSchemasPage from "./pages/PriceSchemasPage";
import ChapterPricesPage from "./pages/ChapterPricesPage";
import PriceHistoryPage from "./pages/PriceHistoryPage";
import PricingLayout from "./components/PricingLayout";
import Layout from "./components/Layout";

function App() {
  const { user, checkAuth, loading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <span className="text-white text-2xl font-bold">CJ</span>
          </div>
          <div className="text-lg text-gray-700 font-medium">Chargement...</div>
        </div>
      </div>
    );
  }

  // Routes publiques (Login/Register)
  if (!user) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
        </Routes>
      </>
    );
  }

  // Routes protégées (admin)
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />
          <Route
            path="/chapters"
            element={<Chapters />}
          />
          <Route
            path="/chapters/:id"
            element={<ChapterDetail />}
          />
          <Route
            path="/chapters/:chapterId/volumes/new"
            element={<VolumeForm />}
          />
          <Route
            path="/volumes/:volumeId"
            element={<VolumeForm />}
          />
          <Route
            path="/settings"
            element={<SettingsPage />}
          />
          <Route
            path="/users"
            element={<Users />}
          />
          <Route
            path="/users/:id"
            element={<UserDetail />}
          />
          <Route
            path="/orders"
            element={<Orders />}
          />
          <Route
            path="/promotions"
            element={<PromotionsPage />}
          />
          <Route
            path="/promotions/new"
            element={<PromotionForm />}
          />
          <Route
            path="/promotions/:id"
            element={<PromotionForm />}
          />
          <Route
            path="/prices"
            element={<PricesPage />}
          />
          <Route
            path="/pricing"
            element={<PricingLayout />}>
            <Route
              path="schemas"
              element={<PriceSchemasPage />}
            />
            <Route
              path="chapters"
              element={<ChapterPricesPage />}
            />
            <Route
              path="history"
              element={<PriceHistoryPage />}
            />
            <Route
              index
              element={
                <Navigate
                  to="schemas"
                  replace
                />
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
