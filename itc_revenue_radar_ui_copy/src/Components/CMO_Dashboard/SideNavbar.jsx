import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaUserCircle,
  FaChartLine,
  FaMoneyBillWave,
  FaChartBar,
  FaSignOutAlt,
  FaAngleLeft,
  FaAngleRight,
  FaTimes,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import UserService from "../../services/UserService";

const { REACT_APP_REDIRECT_URI } = process.env;

const CMOSidebar = ({
  collapsed,
  setCollapsed,
  theme = "light",
  mobileOpen = false,
  setMobileOpen,
}) => {
  const userName = UserService.getUsername()?.toUpperCase() || "USER";

  const { loading = false, salesData = {} } = useSelector(
    (state) => state?.cmoDashboard || {}
  );

  const brandName = salesData?.portfolio_name || "CMO Cockpit";

  const navItems = [
    {
      to: "/cmo/sales-performance",
      label: "Sales Performance",
      icon: <FaChartLine />,
    },
    {
      to: "/cmo/media-sales-spends",
      label: "Media Spends vs Contribution",
      icon: <FaMoneyBillWave />,
    },
    {
      to: "/cmo/media-roi",
      label: "Media ROI",
      icon: <FaChartBar />,
    },
  ];

  const handleNavClick = () => {
    if (window.innerWidth <= 991 && typeof setMobileOpen === "function") {
      setMobileOpen(false);
    }
  };

  return (
    <>
      <aside
        className={`cmo-sidebar ${theme} ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-scroll-area">
          <div className="sidebar-top">
            <div className="brand-block">
              <div className="brand-logo">RR</div>

              {!collapsed && (
                <div className="brand-text">
                  <h5 className="brand-title mb-0">CMO Cockpit</h5>
                  <small className="brand-subtitle">{brandName}</small>
                </div>
              )}
            </div>

            <div className="sidebar-actions">
              <button
                className="mobile-close-btn d-lg-none"
                type="button"
                aria-label="Close sidebar"
                onClick={() => setMobileOpen?.(false)}
              >
                <FaTimes />
              </button>

              <button
                className="collapse-btn d-none d-lg-flex"
                onClick={() => setCollapsed(!collapsed)}
                type="button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <FaAngleRight /> : <FaAngleLeft />}
              </button>
            </div>
          </div>

          <div
            className={`sidebar-user-card ${
              collapsed ? "justify-content-center" : ""
            }`}
            title={collapsed ? userName : ""}
          >
            <div className="sidebar-user-avatar">
              <FaUserCircle />
            </div>

            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{userName}</div>
                <div className="sidebar-user-role">Chief Marketing Office</div>
              </div>
            )}
          </div>

          <div className="sidebar-menu-wrap">
            {!collapsed && <div className="menu-section-title">Navigation</div>}

            <ul className="sidebar-menu-list">
              {navItems.map((item) => (
                <li key={item.to} title={collapsed ? item.label : ""}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/cmo/sales-performance"}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? "active" : ""} ${
                        loading ? "nav-disabled" : ""
                      }`
                    }
                    onClick={(e) => {
                      if (loading) {
                        e.preventDefault();
                        return;
                      }
                      handleNavClick();
                    }}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    {!collapsed && (
                      <span className="sidebar-nav-label">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            title={collapsed ? "Logout" : ""}
            onClick={() =>
              UserService.doLogout({
                redirectUri: `${REACT_APP_REDIRECT_URI}`,
              })
            }
            type="button"
          >
            <span className="sidebar-nav-icon">
              <FaSignOutAlt />
            </span>
            {!collapsed && <span className="sidebar-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      <style>{`
        .cmo-sidebar {
          width: 300px;
          min-width: 300px;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.28s ease;
          overflow: hidden;
        }

        .cmo-sidebar.light {
          background: linear-gradient(180deg, #18293a 0%, #203246 45%, #182737 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          color: #f8fafc;
          box-shadow: 10px 0 30px rgba(15, 23, 42, 0.14);
        }

        .cmo-sidebar.dark {
          background: linear-gradient(180deg, #0f1724 0%, #172334 50%, #101927 100%);
          border-right: 1px solid rgba(148, 163, 184, 0.08);
          color: #f8fafc;
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.28);
        }

        .cmo-sidebar.collapsed {
          width: 92px;
          min-width: 92px;
        }

        .sidebar-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 18px 14px 14px;
        }

        .sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
        }

        .brand-block {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .brand-logo {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #19a38c 0%, #0d7c66 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          font-weight: 800;
          box-shadow: 0 8px 18px rgba(25, 163, 140, 0.28);
        }

        .brand-text {
          min-width: 0;
        }

        .brand-title {
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }

        .brand-subtitle {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #aab6c5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        .sidebar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .collapse-btn,
        .mobile-close-btn {
          width: 34px;
          height: 34px;
          min-width: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          align-items: center;
          justify-content: center;
          transition: all 0.22s ease;
        }

        .collapse-btn:hover,
        .mobile-close-btn:hover {
          background: rgba(25, 163, 140, 0.2);
          border-color: rgba(25, 163, 140, 0.45);
        }

        .sidebar-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 12px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .sidebar-user-avatar {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, #19a38c 0%, #0d7c66 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.55rem;
          box-shadow: 0 4px 12px rgba(25, 163, 140, 0.24);
        }

        .sidebar-user-name {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          word-break: break-word;
        }

        .sidebar-user-role {
          font-size: 11px;
          color: #aab6c5;
          margin-top: 2px;
        }

        .sidebar-menu-wrap {
          min-height: 0;
        }

        .menu-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #aab6c5;
          margin: 0 8px 12px;
        }

        .sidebar-menu-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .sidebar-menu-list li {
          margin-bottom: 8px;
        }

        .sidebar-nav-link,
        .sidebar-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          border-radius: 14px;
          text-decoration: none;
          color: #dbe4ee;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid transparent;
          background: transparent;
          transition: all 0.22s ease;
        }

        .sidebar-nav-link:hover {
          background: rgba(25, 163, 140, 0.14);
          border-color: rgba(25, 163, 140, 0.24);
          color: #ffffff;
          transform: translateX(2px);
        }

        .sidebar-nav-link.active {
          background: linear-gradient(
            135deg,
            rgba(25, 163, 140, 0.24) 0%,
            rgba(13, 124, 102, 0.18) 100%
          );
          border-color: rgba(25, 163, 140, 0.34);
          color: #ffffff;
          box-shadow: inset 3px 0 0 #19a38c;
        }

        .sidebar-nav-icon {
          width: 20px;
          min-width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .sidebar-nav-label {
          flex: 1;
          min-width: 0;
        }

        .nav-disabled {
          pointer-events: none;
          opacity: 0.55;
          cursor: not-allowed;
        }

        .sidebar-footer {
          padding: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sidebar-logout-btn {
          border: 1px solid rgba(239, 68, 68, 0.28);
          background: rgba(239, 68, 68, 0.14);
          color: #ffffff;
        }

        .sidebar-logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.38);
        }

        .cmo-sidebar.collapsed .sidebar-nav-link,
        .cmo-sidebar.collapsed .sidebar-logout-btn {
          justify-content: center;
          padding: 13px 10px;
        }

        .cmo-sidebar.collapsed .brand-subtitle,
        .cmo-sidebar.collapsed .brand-title,
        .cmo-sidebar.collapsed .sidebar-user-info,
        .cmo-sidebar.collapsed .menu-section-title,
        .cmo-sidebar.collapsed .sidebar-nav-label {
          display: none;
        }

        .cmo-sidebar.collapsed .sidebar-user-card {
          justify-content: center;
        }

        @media (max-width: 991px) {
          .cmo-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            width: 290px;
            min-width: 290px;
            height: 100vh;
          }

          .cmo-sidebar.mobile-open {
            transform: translateX(0);
          }

          .cmo-sidebar.collapsed {
            width: 290px;
            min-width: 290px;
          }

          .cmo-sidebar.collapsed .brand-subtitle,
          .cmo-sidebar.collapsed .brand-title,
          .cmo-sidebar.collapsed .sidebar-user-info,
          .cmo-sidebar.collapsed .menu-section-title,
          .cmo-sidebar.collapsed .sidebar-nav-label {
            display: block;
          }

          .cmo-sidebar.collapsed .sidebar-nav-link,
          .cmo-sidebar.collapsed .sidebar-logout-btn {
            justify-content: flex-start;
            padding: 13px 14px;
          }

          .cmo-sidebar.collapsed .sidebar-user-card {
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  );
};

export default CMOSidebar;