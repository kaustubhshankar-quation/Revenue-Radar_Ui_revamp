import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import FooterPages from "../Footer/FooterPages";
import CMOSidebar from "./SideNavbar";

const CMOIndexPage = ({ theme = "light", toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { salesData = {}, loading = false } = useSelector(
    (state) => state?.cmoDashboard || {}
  );

  const currentFY = salesData?.current_fy || "2025-26";
  const previousFY = salesData?.previous_fy || "2024-25";
  const dataTillMonth = salesData?.data_present_till || "Latest Available";
  const totalBrands = salesData?.total_brands || salesData?.brands_count || "-";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 991) {
        setCollapsed(true);
      } else {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageMeta = useMemo(() => {
    return {
      title: "Revenue Radar – Portfolio Overview",
      subtitle:
        "Executive summary of portfolio sales, media performance, ROI movement, and brand-level direction across the current financial year.",
    };
  }, []);

  return (
    <>
      <div className={`cmo-dashboard-shell ${theme}`}>
        {mobileOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <CMOSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          theme={theme}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="cmo-main-panel">
          <header className="cmo-topbar">
            <div className="topbar-left-wrap">
              <button
                className="mobile-menu-btn d-lg-none"
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
              >
                <i className="fas fa-bars"></i>
              </button>

              <div className="header-copy-wrap">
                <div className="section-label">CMO Dashboard</div>
                <h1 className="premium-title">{pageMeta.title}</h1>
                <p className="premium-subtitle mb-0">{pageMeta.subtitle}</p>
              </div>
            </div>

            <div className="topbar-right-wrap">
              <div className="header-badges">
                <span className="meta-chip">
                  <i className="fas fa-calendar-alt"></i>
                  Current FY: {currentFY}
                </span>
                <span className="meta-chip">
                  <i className="fas fa-history"></i>
                  Previous FY: {previousFY}
                </span>
              </div>

              {typeof toggleTheme === "function" && (
                <button
                  className="rr-btn rr-btn-secondary rr-btn-icon"
                  type="button"
                  onClick={toggleTheme}
                >
                  <i
                    className={`fas ${
                      theme === "dark" ? "fa-sun" : "fa-moon"
                    }`}
                  ></i>
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              )}
            </div>
          </header>

          <main className="cmo-content-area mt-2">
            <div className="content-inner-card">
              <Outlet context={{ theme, collapsed, loading }} />
            </div>
          </main>

          <FooterPages />
        </div>
      </div>

      <style>{`
        .cmo-dashboard-shell {
          min-height: 100vh;
          display: flex;
          background: var(--rr-bg-main);
          color: var(--rr-text-main);
          position: relative;
          overflow: visible;
          transition: all 0.25s ease;
        }

        .cmo-dashboard-shell.light {
          --rr-bg-main: #f6f8fb;
          --rr-bg-soft: #ffffff;
          --rr-bg-panel: rgba(255, 255, 255, 0.72);
          --rr-text-main: #223142;
          --rr-text-muted: #667085;
          --rr-border: #e6ebf2;
          --rr-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          --rr-shadow-soft: 0 6px 18px rgba(15, 23, 42, 0.06);
          --rr-accent: #0d7c66;
          --rr-accent-soft: rgba(13, 124, 102, 0.12);
          --rr-chip-bg: rgba(255, 255, 255, 0.9);
          --rr-overlay: rgba(15, 23, 42, 0.35);
        }

        .cmo-dashboard-shell.dark {
          --rr-bg-main: #111927;
          --rr-bg-soft: #182334;
          --rr-bg-panel: rgba(24, 35, 52, 0.72);
          --rr-text-main: #f8fafc;
          --rr-text-muted: #98a2b3;
          --rr-border: rgba(148, 163, 184, 0.16);
          --rr-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
          --rr-shadow-soft: 0 8px 22px rgba(0, 0, 0, 0.22);
          --rr-accent: #19a38c;
          --rr-accent-soft: rgba(25, 163, 140, 0.14);
          --rr-chip-bg: rgba(32, 45, 66, 0.9);
          --rr-overlay: rgba(2, 6, 23, 0.6);
        }

        .cmo-main-panel {
          flex: 1;
          min-width: 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--rr-bg-main);
          overflow: visible;
          position: relative;
        }

        .cmo-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 22px 24px 26px;
          background: var(--rr-bg-panel);
          border-bottom: 1px solid var(--rr-border);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .topbar-left-wrap {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        .header-copy-wrap {
          min-width: 0;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 999px;
          background: var(--rr-accent-soft);
          color: var(--rr-accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .premium-title {
          font-size: 30px;
          line-height: 1.15;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: var(--rr-text-main);
          letter-spacing: -0.02em;
        }

        .premium-subtitle {
          font-size: 14px;
          line-height: 1.6;
          color: var(--rr-text-muted);
          max-width: 760px;
        }

        .topbar-right-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
        }

        .header-badges {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 10px;
        }

        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: var(--rr-chip-bg);
          color: var(--rr-text-main);
          border: 1px solid var(--rr-border);
          box-shadow: var(--rr-shadow-soft);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .mobile-menu-btn {
          border: 1px solid var(--rr-border);
          background: var(--rr-chip-bg);
          color: var(--rr-text-main);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.22s ease;
          box-shadow: var(--rr-shadow-soft);
        }

        .mobile-menu-btn:hover {
          transform: translateY(-1px);
          border-color: var(--rr-accent);
          box-shadow: 0 10px 22px rgba(13, 124, 102, 0.14);
        }

        .cmo-content-area {
          flex: 1;
          padding:10px;
          margin-top: -42px;
          min-width: 0;
          overflow: visible;
          position: relative;
          z-index: 1;
        }

        .content-inner-card {
          border: 1px solid var(--rr-border);
          background: var(--rr-bg-soft);
          border-radius: 24px;
          box-shadow: var(--rr-shadow);
          padding:20px 20px;
          overflow: visible;
          min-height: auto;
          position: relative;
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: var(--rr-overlay);
          z-index: 29;
        }

        @media (max-width: 1199px) {
          .cmo-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .topbar-right-wrap {
            align-items: flex-start;
          }

          .header-badges {
            justify-content: flex-start;
          }
        }

        @media (max-width: 991px) {
          .cmo-topbar {
            padding: 18px 16px 22px;
          }

          .cmo-content-area {
            margin-top: -30px;
          }

          .content-inner-card {
            padding: 52px 14px 14px;
            border-radius: 18px;
          }

          .premium-title {
            font-size: 24px;
          }

          .topbar-right-wrap,
          .header-badges {
            width: 100%;
          }
        }

        @media (max-width: 767px) {
          .cmo-topbar {
            padding: 16px 14px 20px;
          }

          .cmo-content-area {
            padding: 0 14px 14px;
            margin-top: -24px;
          }

          .content-inner-card {
            padding: 42px 12px 12px;
          }

          .premium-title {
            font-size: 22px;
          }

          .premium-subtitle {
            font-size: 13px;
          }

          .meta-chip {
            width: 100%;
            justify-content: flex-start;
          }

          .header-badges {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </>
  );
};

export default CMOIndexPage;