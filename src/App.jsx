import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import { useSelector } from "react-redux";
import WebAnalytics from "./pages/WebAnalytics";
import ExtensionAnalytics from "./pages/ExtensionAnalytics";
import FirebaseAnalytics from "./pages/FirebaseAnalytics";
import YTAnalytics from "./pages/YTAnalytics";
import ProductDashboard from "./pages/ProductDashboard";
import YoutubeAnalytics from "./pages/YoutubeAnalytics";
import LoginWithGoogle from "./pages/LoginWithGoogle";
import UserComponent from "./pages/UsersComp";
import GoogleAnalytics from "./pages/GoogleAnalytics";
import Extensions from "./pages/extensions";



const App = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Root path: redirect based on auth */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected routes inside layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          
<Route path="extensions-data" element={<Extensions />} />
          <Route path="product-analytics" element={<ProductDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="analytics/web" element={<WebAnalytics />} />
          <Route path="analytics/extension" element={<ExtensionAnalytics />} />
          <Route path="analytics/firebase" element={<FirebaseAnalytics />} />
          <Route path="analytics/yt" element={<YTAnalytics />} />
          <Route path="explified/users" element={<UserComponent/>} />
          <Route
            path="explified-analytics/login"
            element={<LoginWithGoogle />}
          />
        </Route>
    <Route path="dashboard/explified-analytics" element={<YoutubeAnalytics />} />
    <Route path="/google/explified/analytics" element={<GoogleAnalytics />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
