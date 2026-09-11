import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import UserService from "../../services/UserService";
import RevenueRadarLogo from "../svg/RevenueRadarLogo";
import { requireLogin } from "../HelperFunction/helperFunction";

const { REACT_APP_REDIRECT_URI } = process.env;

const BRAND_MANAGER_ROLES = ["BBMNGR", "OODMNGR", "CBMNGR", "MUMNGR", "SALES"];

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "fas fa-chart-pie", roles: [] },
  {
    to: "/dashboard/refreshmodel",
    label: "Refresh Model",
    icon: "fas fa-sync-alt",
    roles: ["adminrole"],
  },
  {
    to: "/cockpit",
    label: "Brand Cockpit",
    icon: "fas fa-chart-pie",
    roles: BRAND_MANAGER_ROLES,
  },
  {
    to: "/dashboard/modelperformance",
    label: "Model Performance",
    icon: "fas fa-chart-line",
    roles: [],
  },
  {
    to: "/dashboard/marketanalysis",
    label: "Market Analysis",
    icon: "fas fa-store",
    roles: [],
  },
  {
    to: "/dashboard/brandanalysis",
    label: "Brand Analysis",
    icon: "fas fa-industry",
    roles: [],
  },
  {
    to: "/dashboard/simulator",
    label: "Scenario Planner",
    icon: "fas fa-flask",
    roles: [],
  },
  {
    to: "/dashboard/optimizer",
    label: "Optimized Spends",
    icon: "fas fa-bullseye",
    roles: [],
  },
  {
    to: "/dashboard/savedscenarios",
    label: "Saved Scenarios",
    icon: "fas fa-layer-group",
    roles: [],
  },
  {
    to: "/dashboard/savedreports",
    label: "Saved Reports",
    icon: "fas fa-bookmark",
    roles: [],
  },
];

function Navbar3({ theme = "light", toggleTheme, collapsed, setCollapsed }) {
  const location = useLocation();
  const isLoggedIn = UserService.isLoggedIn();
  const username = UserService.getUsername()?.toUpperCase();
  const isBrandManager = UserService.hasRole(BRAND_MANAGER_ROLES);
  const isAdmin = UserService.hasRole(["adminrole"]);

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991.98);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 991.98);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (location.pathname === "/") return null;

  const effectiveCollapsed = !isMobile && collapsed;
  const isDashboardHome = location.pathname === "/dashboard";

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles.length) return true;
    return item.roles.some((role) => UserService.hasRole([role]));
  });

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = () => {
    UserService.doLogout({
      redirectUri: `${REACT_APP_REDIRECT_URI}`,
    });
  };

  return (
    <>
      <aside
        className={`rr-sidebar ${isNavOpen ? "open" : ""} ${
          effectiveCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="rr-sidebar-top">
          <Link className="rr-brand" to="/" title="Revenue Radar">
            {!effectiveCollapsed ? (
              <RevenueRadarLogo
                theme="dark"
                width={220}
                height={76}
                showTagline={true}
                animated={true}
              />
            ) : (
              <div className="rr-brand-mini">RR</div>
            )}
          </Link>

          <div className="rr-sidebar-top-actions">
            <button
              className="rr-btn rr-btn-secondary rr-btn-icon"
              onClick={toggleTheme}
              type="button"
              title={
                theme === "light" ? "Switch to dark mode" : "Switch to light mode"
              }
            >
              <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`}></i>
              {!effectiveCollapsed && (
                <span>{theme === "light" ? "Dark" : "Light"} Mode</span>
              )}
            </button>

            <button
              className="rr-collapse-btn d-none d-lg-inline-flex"
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              title={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i
                className={`fas ${
                  effectiveCollapsed ? "fa-angle-right" : "fa-angle-left"
                }`}
              ></i>
            </button>

            <button
              className="rr-mobile-close"
              type="button"
              onClick={() => setIsNavOpen(false)}
              aria-label="Close sidebar"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="rr-sidebar-user-block">
          {!isLoggedIn ? (
            <button
              className="rr-login-btn w-100"
              type="button"
              onClick={() => requireLogin("/dashboard")}
              title="Login"
            >
              <i className="fas fa-sign-in-alt"></i>
              {!effectiveCollapsed && <span>Login</span>}
            </button>
          ) : (
            <>
              <div
                className="rr-user-panel"
                title={effectiveCollapsed ? username || "User" : ""}
              >
                <div className="rr-user-avatar">
                  <i className="fas fa-user"></i>
                </div>

                {!effectiveCollapsed && (
                  <div className="rr-user-meta">
                    <div className="rr-user-welcome">Welcome to Revenue Radar</div>
                    <div className="rr-user-name">{username || "User"}</div>
                  </div>
                )}
              </div>

              <button
                className="rr-sidebar-logout"
                onClick={handleLogout}
                type="button"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt"></i>
                {!effectiveCollapsed && <span>Logout</span>}
              </button>
            </>
          )}
        </div>

        {!isDashboardHome && isLoggedIn && (
          <div className="rr-sidebar-nav-wrap">
            {!effectiveCollapsed && (
              <div className="rr-sidebar-section-title">Navigation</div>
            )}

            <ul className="rr-sidebar-nav-list">
              {filteredNavItems.map(({ to, label, icon }) => {
                if (isBrandManager && to === "/dashboard") return null;
                if (isAdmin && to === "/cockpit") return null;

                return (
                  <li className="rr-sidebar-nav-item" key={to}>
                    <NavLink
                      to={to}
                      className={`rr-sidebar-link ${
                        isActive(to) ? "active-sidebar-link" : ""
                      }`}
                      onClick={() => setIsNavOpen(false)}
                      title={effectiveCollapsed ? label : ""}
                    >
                      <span className="rr-sidebar-link-icon">
                        <i className={icon}></i>
                      </span>

                      {!effectiveCollapsed && (
                        <span className="rr-sidebar-link-text">{label}</span>
                      )}

                      {effectiveCollapsed && (
                        <span className="rr-collapsed-tooltip">{label}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </aside>

      <button
        className={`rr-sidebar-toggle ${isNavOpen ? "open" : ""}`}
        type="button"
        onClick={() => setIsNavOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isNavOpen && (
        <div
          className="rr-sidebar-backdrop"
          onClick={() => setIsNavOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Navbar3;
