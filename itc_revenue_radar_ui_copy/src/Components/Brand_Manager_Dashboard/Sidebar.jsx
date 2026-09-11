import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaUser,
  FaChartLine,
  FaMoneyBillWave,
  FaChartBar,
  FaGlobe,
  FaSignOutAlt,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import UserService from "../../services/UserService";
import { useSelector } from "react-redux";
import RSSNewsTicker from "./RSSNewsTicker";

const { REACT_APP_REDIRECT_URI } = process.env;

const NAV_ITEMS = [
  {
    to: "/cockpit/sales-performance",
    label: "Brand Sales Performance",
    icon: <FaChartLine />,
  },
  {
    to: "/cockpit/media-sales-spends",
    label: "Media Spends Vs Contribution",
    icon: <FaMoneyBillWave />,
  },
  {
    to: "/cockpit/media-roi",
    label: "Media Wise ROI",
    icon: <FaChartBar />,
  },
  {
    to: "/cockpit/region-detail",
    label: "Region Wise Detail",
    icon: <FaGlobe />,
  },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const userName = UserService.getUsername()?.toUpperCase() || "USER";
  const { loading, salesData } = useSelector((state) => state.dashboard || {});
  const brandName = salesData?.brand || "Brand Dashboard";

  return (
    <aside className={`rr-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="rr-sidebar-top">
        <div className="rr-sidebar-brand-row">
          <div className="rr-brand-mini" aria-hidden="true">
            RR
          </div>

          {!collapsed && (
            <div className="rr-sidebar-brand-text">
              <h5 className="rr-sidebar-brand-title mb-0">Cockpit</h5>
              <small className="rr-sidebar-brand-subtitle">{brandName}</small>
            </div>
          )}
        </div>

        <div className="rr-sidebar-top-actions">
          <button
            className="rr-collapse-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaAngleRight /> : <FaAngleLeft />}
          </button>
        </div>
      </div>

      <div className="rr-sidebar-user-block">
        <div
          className={`rr-user-panel ${collapsed ? "justify-content-center" : ""}`}
          title={collapsed ? userName : ""}
        >
          <div className="rr-user-avatar" aria-hidden="true">
            <FaUser size={20} />
          </div>

          {!collapsed && (
            <div className="rr-user-meta">
              <div className="rr-user-welcome">Dashboard User</div>
              <div className="rr-user-name">{userName}</div>
            </div>
          )}
        </div>
      </div>

      <div className="rr-sidebar-nav-wrap">
        {!collapsed && (
          <div className="rr-sidebar-section-title">Navigation</div>
        )}

        <ul className="rr-sidebar-nav-list">
          {NAV_ITEMS.map((item) => (
            <li className="rr-sidebar-nav-item" key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `rr-sidebar-link ${isActive ? "active-sidebar-link" : ""} ${
                    loading ? "nav-disabled" : ""
                  }`
                }
                title={collapsed ? item.label : ""}
                onClick={(e) => {
                  if (loading) e.preventDefault();
                }}
              >
                <span className="rr-sidebar-link-icon">{item.icon}</span>
                {!collapsed && (
                  <span className="rr-sidebar-link-text">{item.label}</span>
                )}
                {collapsed && (
                  <span className="rr-collapsed-tooltip">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="rr-sidebar-news">
        <RSSNewsTicker collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      <div className="rr-sidebar-footer">
        <button
          className="rr-sidebar-logout"
          title={collapsed ? "Logout" : ""}
          onClick={() =>
            UserService.doLogout({
              redirectUri: `${REACT_APP_REDIRECT_URI}`,
            })
          }
          type="button"
        >
          <FaSignOutAlt />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
