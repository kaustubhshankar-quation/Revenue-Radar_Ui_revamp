import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";

import store from "./Redux/Store/store";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RenderOnAuthenticated from "./KC-Auth/RenderOnAuthenticated";
import RenderOnAnonymous from "./KC-Auth/RenderOnAnonymous";

import UserService from "./services/UserService";

import Home from "./Components/Home/Home";
import Simulator from "./Components/Simulator/Simulator";
import Optimizer from "./Components/Optimizer/Optimizer";
import MarketAnalysis from "./Components/Market Analysis/MarketAnalysis";
import BrandAnalysis from "./Components/Brand Analysis/BrandAnalysis";
import ModelPerformance from "./Components/Model Performance/ModelPerformance";
import SavedReports from "./Components/Saved Reports/SavedReports";
import SavedScenarios from "./Components/Saved Scenarios/SavedScenarios";
import Support from "./Components/Profile/Support";
import MyProfile from "./Components/Profile/MyProfile";
import Updates from "./Components/Profile/Updates";
import RefreshModel from "./Components/Refresh Model/RefreshModel";
import PageNotFound from "./Components/PageNotFound";
import IndexPage from "./Components/Brand_Manager_Dashboard/indexPage";
import BrandSalesPerformance from "./Components/Brand_Manager_Dashboard/BrandSalesPerformance";
import MediaSalesVsSpends from "./Components/Brand_Manager_Dashboard/MediaSalesVsSpends";
import MediaWiseROI from "./Components/Brand_Manager_Dashboard/MediaWiseROI";
import RegionWiseDetail from "./Components/Brand_Manager_Dashboard/RegionWiseDetail";
import { ChatBotPage } from "./Components/Brand_Manager_Dashboard/ChatBot/ChatBot_API_v2";
import DashboardLayout from "./Components/New Dashboard/DashboardLayput";
import DashboardHome from "./Components/New Dashboard/DashboardHome";
import GlobalNotificationSocket from "./Components/WebSocket Components/GlobalSocketNotification";

const routeTitleMap = {
  "/": "Revenue Radar",
  "/dashboard": "RR - Dashboard",
  "/dashboard/modelperformance": "RR - Model Performance",
  "/dashboard/simulator": "RR - Simulation",
  "/dashboard/optimizer": "RR - Optimization",
  "/dashboard/brandanalysis": "RR - Brand Analysis",
  "/dashboard/marketanalysis": "RR - Market Analysis",
  "/dashboard/savedreports": "RR - Saved Reports",
  "/dashboard/savedscenarios": "RR - Saved Scenarios",
  "/dashboard/refreshmodel": "RR - Refresh Model",
  "/cockpit": "RR - Cockpit",
  "/cockpit/sales-performance": "RR - Cockpit",
  "/cockpit/media-sales-spends": "RR - Cockpit",
  "/cockpit/media-roi": "RR - Cockpit",
  "/cockpit/region-detail": "RR - Cockpit",
  "/chatbot": "RR - Revenue Chat",
  "/profile": "RR - My Profile",
  "/updates": "RR - Updates",
  "/support": "RR - Support",
};

function PageTitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const title = routeTitleMap[location.pathname] || "Revenue Radar";
    document.title = title;
  }, [location.pathname]);
  return null;
}

function App() {
  const isAdmin = UserService.hasRole(["adminrole"]);
  const isBrandManager =
    UserService.hasRole(["BBMNGR"]) ||
    UserService.hasRole(["OODMNGR"]) ||
    UserService.hasRole(["CBMNGR"]) ||
    UserService.hasRole(["MUMNGR"]);
  const isSalesTeam = UserService.hasRole(["SALES"]);
  const [theme, setTheme] = useState(localStorage.getItem("rr-dashboard-theme") || "light");
  useEffect(() => {
    localStorage.setItem("rr-dashboard-theme", theme);
    document.body.setAttribute("data-rr-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Provider store={store}>
      <BrowserRouter>
        <PageTitleUpdater />
        <ReactNotifications />
        <ToastContainer position="top-right" />
        <GlobalNotificationSocket />
        {/* AUTHENTICATED ROUTES */}
        <RenderOnAuthenticated>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<DashboardLayout theme={theme} toggleTheme={toggleTheme} />}
            >
              <Route
                index
                element={
                  isBrandManager || isSalesTeam ? (
                    <Navigate to="/cockpit" replace />
                  ) : (
                    <DashboardHome />
                  )
                }
              />

              <Route path="modelperformance" element={<ModelPerformance />} />
              <Route path="simulator" element={<Simulator />} />
              <Route path="optimizer" element={<Optimizer />} />
              <Route path="brandanalysis" element={<BrandAnalysis />} />
              <Route path="marketanalysis" element={<MarketAnalysis />} />
              <Route path="savedreports" element={<SavedReports />} />
              <Route path="savedscenarios" element={<SavedScenarios />} />
              {isAdmin && <Route path="refreshmodel" element={<RefreshModel />} />}
            </Route>

            {isBrandManager || isSalesTeam ? (
              <Route
                path="/cockpit"
                element={<IndexPage theme={theme} toggleTheme={toggleTheme} />}
              >
                <Route index element={<Navigate to="sales-performance" replace />} />
                <Route path="sales-performance" element={<BrandSalesPerformance />} />
                <Route path="media-sales-spends" element={<MediaSalesVsSpends />} />
                <Route path="media-roi" element={<MediaWiseROI />} />
                <Route path="region-detail" element={<RegionWiseDetail />} />
              </Route>
            ) : (
              <Route path="/cockpit/*" element={<PageNotFound />} />
            )}

            {/* Profile */}
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/support" element={<Support />} />

            {/* Chatbot — standalone full-page */}
            <Route path="/chatbot" element={<ChatBotPage theme={theme} />} />

            {/* Fallback */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </RenderOnAuthenticated>

        {/* ANONYMOUS ROUTES */}
        <RenderOnAnonymous>
          <Routes>
            <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </RenderOnAnonymous>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
