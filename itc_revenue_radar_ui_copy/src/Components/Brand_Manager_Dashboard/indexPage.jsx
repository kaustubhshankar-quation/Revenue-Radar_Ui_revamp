import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import Sidebar from "./Sidebar";
import FooterPages from "../Footer/FooterPages";
import { useSelector } from "react-redux";
import ChatBot from "./ChatBot/ChatBot_API_v2";

const QUICK_LINKS = [
  {
    label: "Model Performance",
    to: "/dashboard/modelperformance",
    icon: "fas fa-chart-line",
  },
  {
    label: "Brand Analysis",
    to: "/dashboard/brandanalysis",
    icon: "fas fa-industry",
  },
  {
    label: "Market Analysis",
    to: "/dashboard/marketanalysis",
    icon: "fas fa-store",
  },
  {
    label: "Simulation",
    to: "/dashboard/simulator",
    icon: "fas fa-flask",
  },
  {
    label: "Optimization",
    to: "/dashboard/optimizer",
    icon: "fas fa-bullseye",
  },
];

const IndexPage = ({ theme = "light", toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);

  const { salesData, loading } = useSelector((state) => state.dashboard || {});
  const brandName = salesData?.brand || "Brand";
  const currentFY = salesData?.current_fy || "Current FY";
  const previousFY = salesData?.previous_fy || "Previous FY";
  const dataTillMonth = salesData?.data_present_till;

  return (
    <>
      <div
        className={`dashboard-layout d-flex dashboard-container ${theme}-theme`}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="main-container flex-grow-1 d-flex flex-column">
          <div
            className={`quick-links-strip ${loading ? "disabled-links" : ""}`}
          >
            <div className="quick-links-inner">
              <div
                className="d-flex px-2 gap-3"
                style={{ width: "80%", paddingLeft: "16px" }}
              >
                {QUICK_LINKS.map((item) => (
                  <NavLink
                    key={item.label}
                    to={loading ? "#" : item.to}
                    onClick={(e) => loading && e.preventDefault()}
                    className={({ isActive }) =>
                      `quick-link-chip ${isActive ? "active-quick-link" : ""} ${
                        loading ? "link-disabled" : ""
                      }`
                    }
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
              <button
                className="rr-btn rr-btn-secondary rr-btn-icon"
                onClick={toggleTheme}
                type="button"
              >
                <i
                  className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`}
                ></i>
                <span>{theme === "light" ? "Dark" : "Light"} Mode</span>
              </button>
            </div>
          </div>

          <div className="rr-app-topbar">
            <div className="rr-app-topbar-left">
              <h2 className="rr-app-title">
                {loading
                  ? "Preparing Dashboard..."
                  : `Brand Cockpit - ${brandName}`}
              </h2>

              <p className="rr-app-subtitle mb-0">
                {loading
                  ? "Fetching dashboard insights and preparing visualizations"
                  : "Track yearly performance, regional insights, media efficiency and contribution trends"}
              </p>
            </div>

            <div className="rr-app-topbar-right">
              {!loading && (
                <div className="rr-app-topbar-meta">
                  <span className="rr-chip rr-chip-warn">
                    <i className="fas fa-calendar-alt"></i>
                    Previous FY : {previousFY}
                  </span>

                  <span className="rr-chip rr-chip-good">
                    <i className="fas fa-chart-line"></i>
                    Current FY : {currentFY}
                  </span>

                  {dataTillMonth && (
                    <span className="rr-chip rr-chip-info">
                      <i className="fas fa-clock"></i>
                      Data Till : {dataTillMonth}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="content-area flex-grow-1">
            <Outlet context={{ theme }} />
          </div>

          <FooterPages />
        </div>
      </div>

      <ChatBot theme={theme} />
    </>
  );
};

export default IndexPage;
