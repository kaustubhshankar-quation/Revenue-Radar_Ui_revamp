import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCMODashboardData } from "../Global_store/CMODashboard/cmoDashboardSlice";
import UserService from "../../services/UserService";
import { useOutletContext } from "react-router-dom";
import Chart from "react-apexcharts";
import LoaderCustom from "../LoaderCustom";

const CMOSalesPerformance = () => {
    const dispatch = useDispatch();
    const { theme } = useOutletContext();
    const [brandView, setBrandView] = useState("chart");

    const isDark = theme === "dark";

    const cmoDashboard = useSelector((state) => state?.cmoDashboard || {});
    const { salesData = {}, loading = false, loaded = false } = cmoDashboard;

    useEffect(() => {
        if (!loaded && UserService.hasRole(["CMOROLE"])) {
            dispatch(
                loadCMODashboardData({
                    fy: "2025-26",
                })
            );
        }
    }, [loaded, dispatch]);

    const formatCurrency = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return "₹ 0.00 Cr";

        const valueInCr = num / 10000000;

        return `₹ ${valueInCr.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} Cr`;
    };

    const formatCrShort = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return "0";
        return (num / 10000000).toFixed(2);
    };

    const formatPercent = (value) => {
        const num = Number(value || 0);
        return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
    };

    const dashboardMeta = useMemo(() => {
        const currentFy = salesData?.current_fy || "-";
        const previousFy = salesData?.previous_fy || "-";

        const totalSales = salesData?.total_sales || [];
        const brandWiseSales = salesData?.brand_wise_total_sales || [];
        const insightSummary = salesData?.insignt?.summary || [];
        const growthAnalysis = salesData?.insignt?.growth_analysis || {};

        const previousSales =
            totalSales.find((item) => item.fy === previousFy)?.sales || 0;
        const currentSales =
            totalSales.find((item) => item.fy === currentFy)?.sales || 0;

        const totalGrowth =
            previousSales > 0
                ? ((currentSales - previousSales) / previousSales) * 100
                : 0;

        const currentFyInsight =
            insightSummary.find((item) => item.fy === currentFy) ||
            insightSummary[insightSummary.length - 1] ||
            {};

        const previousFyInsight =
            insightSummary.find((item) => item.fy === previousFy) ||
            insightSummary[0] ||
            {};

        const brandRows = brandWiseSales.map((brand) => {
            const prev = Number(brand.previous_fy || 0);
            const curr = Number(brand.current_fy || 0);
            const growth = prev > 0 ? ((curr - prev) / prev) * 100 : 0;

            return {
                ...brand,
                growth,
            };
        });

        const sortedGrowthRows = [...brandRows].sort((a, b) => b.growth - a.growth);

        return {
            currentFy,
            previousFy,
            previousSales,
            currentSales,
            totalGrowth,
            currentFyInsight,
            previousFyInsight,
            brandRows,
            brandCount: brandRows.length,
            bestGrowthBrand: sortedGrowthRows[0] || null,
            worstGrowthBrand: sortedGrowthRows[sortedGrowthRows.length - 1] || null,
            bestImprovingBrand: growthAnalysis?.best_improving_brand || null,
            worstImprovingBrand: growthAnalysis?.worst_improving_brand || null,
        };
    }, [salesData]);

    const brandChartConfig = useMemo(() => {
        const categories = dashboardMeta.brandRows.map((item) => item.brand);
        const previousData = dashboardMeta.brandRows.map((item) =>
            Number(((item.previous_fy || 0) / 10000000).toFixed(2))
        );
        const currentData = dashboardMeta.brandRows.map((item) =>
            Number(((item.current_fy || 0) / 10000000).toFixed(2))
        );

        return {
            series: [
                {
                    name: dashboardMeta.previousFy,
                    data: previousData,
                },
                {
                    name: dashboardMeta.currentFy,
                    data: currentData,
                },
            ],
            options: {
                chart: {
                    type: "bar",
                    height: 420,
                    toolbar: { show: false },
                    background: "transparent",
                    foreColor: isDark ? "#E5E7EB" : "#334155",
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: "50%",
                        gap:'2px',
                        borderRadius: 20,
                        borderRadiusApplication: "end",
                    },
                },
                dataLabels: {
                    enabled: true,
                    offsetY: -8,
                    style: {
                        fontSize: "12px",
                        fontWeight: 800,
                        colors: ["#E5E7EB" ],
                    },
                    formatter: function (val) {
                        return `${Number(val).toFixed(2)} Cr`;
                    },
                },
                stroke: {
                    show: false,
                },
                legend: {
                    position: "top",
                    horizontalAlign: "left",
                    fontSize: "13px",
                    labels: {
                        colors: isDark ? "#E5E7EB" : "#334155",
                    },
                },
                grid: {
                    borderColor: isDark ? "rgba(148,163,184,0.15)" : "#E5E7EB",
                    strokeDashArray: 4,
                },
                xaxis: {
                    categories,
                    labels: {
                        style: {
                            colors: categories.map(() => (isDark ? "#ADB5BD" : "#64748B")),
                            fontSize: "12px",
                            fontWeight: 600,
                        },
                        rotate: -20,
                        trim: true,
                        hideOverlappingLabels: false,
                    },
                    axisBorder: {
                        color: isDark ? "rgba(148,163,184,0.18)" : "#E2E8F0",
                    },
                    axisTicks: {
                        color: isDark ? "rgba(148,163,184,0.18)" : "#E2E8F0",
                    },
                },
                yaxis: {
                    title: {
                        text: "Sales (₹ Cr)",
                        style: {
                            color: isDark ? "#CBD5E1" : "#475569",
                            fontSize: "12px",
                            fontWeight: 700,
                        },
                    },
                    labels: {
                        formatter: (val) => `${val.toFixed(0)}`,
                        style: {
                            colors: isDark ? "#ADB5BD" : "#64748B",
                            fontSize: "12px",
                        },
                    },
                },
                tooltip: {
                    theme: isDark ? "dark" : "light",
                    y: {
                        formatter: (val) => `₹ ${val.toFixed(2)} Cr`,
                    },
                },
                colors: ["#0D7C66", "#17A2B8"],
                responsive: [
                    {
                        breakpoint: 768,
                        options: {
                            chart: {
                                height: 380,
                            },
                            plotOptions: {
                                bar: {
                                    columnWidth: "55%",
                                },
                            },
                            xaxis: {
                                labels: {
                                    rotate: -35,
                                },
                            },
                        },
                    },
                ],
            },
        };
    }, [dashboardMeta.brandRows, dashboardMeta.currentFy, dashboardMeta.previousFy, isDark]);

    const premiumStyles = `
    .cmo-dashboard {
      --surface-bg: ${isDark ? "rgba(21, 32, 46, 0.92)" : "rgba(255, 255, 255, 0.96)"};
      --surface-bg-strong: ${isDark ? "#1E2A3A" : "#FFFFFF"};
      --surface-bg-soft: ${isDark ? "#243447" : "#F8FAFC"};
      --surface-bg-soft-2: ${isDark ? "#173A34" : "#ECFDF3"};
      --border-soft: ${isDark ? "rgba(148, 163, 184, 0.16)" : "#E5E7EB"};
      --text-primary: ${isDark ? "#F8FAFC" : "#1E293B"};
      --text-secondary: ${isDark ? "#E2E8F0" : "#334155"};
      --text-muted: ${isDark ? "#94A3B8" : "#64748B"};
      --chip-bg: ${isDark ? "rgba(36, 52, 71, 0.9)" : "#FFFFFF"};
      --chip-text: ${isDark ? "#E2E8F0" : "#1E293B"};
      --chip-success-bg: ${isDark ? "rgba(16, 185, 129, 0.14)" : "#ECFDF3"};
      --chip-success-text: ${isDark ? "#6EE7B7" : "#047857"};
      --chip-danger-bg: ${isDark ? "rgba(239, 68, 68, 0.14)" : "#FEF2F2"};
      --chip-danger-text: ${isDark ? "#FCA5A5" : "#DC2626"};
      --section-bg: ${isDark ? "rgba(25, 163, 140, 0.14)" : "#ECFDF3"};
      --section-text: ${isDark ? "#5EEAD4" : "#0F766E"};
      --icon-blue-bg: ${isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF"};
      --icon-blue-text: ${isDark ? "#93C5FD" : "#2563EB"};
      --icon-green-bg: ${isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF3"};
      --icon-green-text: ${isDark ? "#6EE7B7" : "#059669"};
      --icon-red-bg: ${isDark ? "rgba(239, 68, 68, 0.14)" : "#FEF2F2"};
      --icon-red-text: ${isDark ? "#FCA5A5" : "#DC2626"};
      --shadow-soft: ${isDark ? "0 10px 28px rgba(0, 0, 0, 0.24)" : "0 10px 28px rgba(15, 23, 42, 0.06)"};
      --shadow-hover: ${isDark ? "0 16px 38px rgba(0, 0, 0, 0.32)" : "0 16px 38px rgba(15, 23, 42, 0.12)"};
      --table-head-bg: ${isDark ? "rgba(36, 52, 71, 0.92)" : "#F8FAFC"};
      --row-hover-bg: ${isDark ? "rgba(255,255,255,0.035)" : "rgba(15,118,110,0.04)"};
      --toggle-bg: ${isDark ? "rgba(36, 52, 71, 0.9)" : "#F8FAFC"};
      --toggle-active-bg: ${isDark ? "linear-gradient(135deg, #1D4ED8 0%, #16A34A 100%)" : "linear-gradient(135deg, #2563EB 0%, #16A34A 100%)"};
      --toggle-active-text: #ffffff;
      --toggle-idle-text: ${isDark ? "#CBD5E1" : "#475569"};

      color: var(--text-primary);
      background: transparent;
    }

    .cmo-dashboard * {
      box-sizing: border-box;
    }

    .cmo-page-shell {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .premium-kpi-card {
      background: linear-gradient(
        180deg,
        var(--surface-bg-strong) 0%,
        ${isDark ? "#223246" : "#FCFEFF"} 100%
      );
      border: 1px solid var(--border-soft);
      border-left: 4px solid ${isDark ? "#5EEAD4" : "#0F766E"};
      border-radius: 20px;
      padding: 18px;
      box-shadow: var(--shadow-soft);
      transition: all 0.28s ease;
      color: var(--text-primary);
      height: 100%;
      min-height: 165px;
    }

    .premium-kpi-card:hover,
    .premium-panel:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
    }

    .kpi-label {
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      line-height: 1.4;
      margin-bottom: 10px;
    }

    .kpi-value {
      font-size: 1.55rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 6px;
      color: var(--text-primary);
      word-break: break-word;
    }

    .kpi-subtext {
      color: var(--text-muted);
      font-size: 0.92rem;
      line-height: 1.6;
      margin-bottom: 0;
    }

    .kpi-icon {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      flex-shrink: 0;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
    }

    .kpi-icon-blue {
      background: var(--icon-blue-bg);
      color: var(--icon-blue-text);
    }

    .kpi-icon-green {
      background: var(--icon-green-bg);
      color: var(--icon-green-text);
    }

    .kpi-icon-red {
      background: var(--icon-red-bg);
      color: var(--icon-red-text);
    }

    .premium-panel {
      background: var(--surface-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-soft);
      border-radius: 20px;
      box-shadow: var(--shadow-soft);
      transition: all 0.28s ease;
      overflow: hidden;
      color: var(--text-primary);
      height: 100%;
    }

    .premium-panel-body {
      padding: 20px;
    }

    .panel-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }

    .panel-subtext {
      color: var(--text-muted);
      font-size: 0.94rem;
      line-height: 1.65;
      margin-bottom: 18px;
    }

    .insight-card {
      border: 1px solid var(--border-soft);
      border-radius: 16px;
      padding: 16px;
      background: ${isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.7)"};
      height: 100%;
      transition: all 0.24s ease;
    }

    .insight-card:hover {
      transform: translateY(-2px);
    }

    .insight-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .insight-title.success {
      color: ${isDark ? "#6EE7B7" : "#047857"};
    }

    .insight-title.danger {
      color: ${isDark ? "#FCA5A5" : "#DC2626"};
    }

    .insight-brand {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .insight-value {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .insight-value.success {
      color: ${isDark ? "#6EE7B7" : "#047857"};
    }

    .insight-value.danger {
      color: ${isDark ? "#FCA5A5" : "#DC2626"};
    }

    .insight-note {
      color: var(--text-muted);
      font-size: 0.88rem;
      line-height: 1.6;
      margin: 0;
    }

    .meta-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 13px;
      border-radius: 999px;
      background: var(--chip-bg);
      border: 1px solid var(--border-soft);
      color: var(--chip-text);
      font-size: 13px;
      font-weight: 700;
      line-height: 1.4;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      white-space: nowrap;
    }

    .meta-chip-success {
      background: var(--chip-success-bg);
      color: var(--chip-success-text);
      border-color: ${isDark ? "rgba(16, 185, 129, 0.24)" : "rgba(16, 185, 129, 0.18)"};
    }

    .meta-chip-danger {
      background: var(--chip-danger-bg);
      color: var(--chip-danger-text);
      border-color: ${isDark ? "rgba(239, 68, 68, 0.24)" : "rgba(239, 68, 68, 0.18)"};
    }

    .brand-panel-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    .brand-toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .view-toggle-group {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      border-radius: 999px;
      background: var(--toggle-bg);
      border: 1px solid var(--border-soft);
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
    }

    .view-toggle-btn {
      border: none;
      outline: none;
      background: transparent;
      color: var(--toggle-idle-text);
      font-size: 13px;
      font-weight: 700;
      padding: 9px 14px;
      border-radius: 999px;
      transition: all 0.22s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .view-toggle-btn.active {
      background: var(--toggle-active-bg);
      color: var(--toggle-active-text);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
    }

    .view-toggle-btn:hover:not(.active) {
      background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(37,99,235,0.06)"};
    }

    .premium-table-wrap {
      overflow-x: auto;
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      background: ${isDark ? "rgba(255,255,255,0.015)" : "#FFFFFF"};
    }

    .premium-table {
      width: 100%;
      min-width: 760px;
      margin-bottom: 0;
      color: var(--text-primary);
      border-collapse: separate;
      border-spacing: 0;
      background: transparent;
    }

    .premium-table thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--table-head-bg);
      color: var(--text-secondary);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      padding: 15px 16px;
      border-bottom: 1px solid var(--border-soft);
      white-space: nowrap;
    }

    .premium-table tbody td {
      padding: 15px 16px;
      border-bottom: 1px solid var(--border-soft);
      vertical-align: middle;
      font-size: 14px;
      color: var(--text-primary);
    }

    .premium-table tbody tr:hover {
      background: var(--row-hover-bg);
    }

    .premium-table tbody tr:last-child td {
      border-bottom: none;
    }

    .brand-name {
      font-weight: 800;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .growth-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 96px;
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 0.02em;
      border: 1px solid transparent;
    }

    .growth-pill.positive {
      background: var(--chip-success-bg);
      color: var(--chip-success-text);
      border-color: ${isDark ? "rgba(16, 185, 129, 0.24)" : "rgba(16, 185, 129, 0.16)"};
    }

    .growth-pill.negative {
      background: var(--chip-danger-bg);
      color: var(--chip-danger-text);
      border-color: ${isDark ? "rgba(239, 68, 68, 0.24)" : "rgba(239, 68, 68, 0.16)"};
    }

    .chart-panel-wrap {
      border: 1px solid var(--border-soft);
      border-radius: 16px;
      padding: 12px 12px 2px;
      background: ${isDark ? "rgba(255,255,255,0.015)" : "#FFFFFF"};
    }

    .chart-helper-text {
      color: var(--text-muted);
      font-size: 0.84rem;
      line-height: 1.6;
      margin: 0 0 8px 2px;
    }

    .premium-loader-wrap {
      min-height: 360px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 1rem;
    }

    .premium-spinner {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 4px solid ${isDark ? "#334155" : "#E5E7EB"};
      border-top-color: ${isDark ? "#5EEAD4" : "#0F766E"};
      animation: spinPremium 0.8s linear infinite;
    }

    @keyframes spinPremium {
      to {
        transform: rotate(360deg);
      }
    }

    .loader-text {
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 600;
    }

    .empty-state {
      padding: 2.5rem 1rem;
      text-align: center;
      color: var(--text-muted);
    }

    .empty-state-icon {
      width: 58px;
      height: 58px;
      margin: 0 auto 1rem auto;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--icon-blue-bg);
      color: var(--icon-blue-text);
      font-size: 1.2rem;
    }

    @media (max-width: 992px) {
      .kpi-value {
        font-size: 1.35rem;
      }

      .premium-panel-body,
      .premium-kpi-card {
        padding: 16px;
      }
    }

    @media (max-width: 768px) {
      .premium-kpi-card,
      .premium-panel {
        border-radius: 16px;
      }

      .panel-title {
        font-size: 1.05rem;
      }

      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
      }

      .brand-panel-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .brand-toolbar-right {
        justify-content: space-between;
      }

      .view-toggle-group {
        width: 100%;
        justify-content: space-between;
      }

      .view-toggle-btn {
        flex: 1;
        justify-content: center;
      }
    }

    @media (max-width: 576px) {
      .kpi-value {
        font-size: 1.2rem;
      }

      .panel-subtext,
      .kpi-subtext,
      .insight-note {
        font-size: 0.86rem;
      }

      .meta-chip {
        font-size: 12px;
        padding: 8px 11px;
      }
    }
  `;

    if (loading) {
        return (
            <div className="cmo-dashboard">
                <style>{premiumStyles}</style>
                <div className="premium-loader-wrap">
                    <LoaderCustom text='Getting insight...'/>
                </div>
            </div>
        );
    }

    const hasData =
        salesData &&
        Object.keys(salesData).length > 0 &&
        dashboardMeta.brandRows.length > 0;

    return (
        <div className="cmo-dashboard">
            <style>{premiumStyles}</style>

            {!hasData ? (
                <div className="premium-panel">
                    <div className="premium-panel-body">
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i className="fas fa-chart-pie"></i>
                            </div>
                            <h5 className="mb-2">No CMO dashboard data available</h5>
                            <p className="mb-0">
                                Once the sales summary is available, the portfolio performance
                                view will appear here.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="cmo-page-shell">
                    <div className="row g-3">
                        <div className="col-xl-3 col-md-6">
                            <div className="premium-kpi-card d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    <div className="kpi-label">Current FY Sales</div>
                                    <div className="kpi-value">
                                        {formatCurrency(dashboardMeta.currentSales)}
                                    </div>
                                    <div className="kpi-subtext">
                                        Against {formatCurrency(dashboardMeta.previousSales)} in{" "}
                                        {dashboardMeta.previousFy}
                                    </div>
                                </div>
                                <div className="kpi-icon kpi-icon-blue">
                                    <i className="fas fa-rupee-sign"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="premium-kpi-card d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    <div className="kpi-label">YoY Growth</div>
                                    <div
                                        className="kpi-value"
                                        style={{
                                            color:
                                                dashboardMeta.totalGrowth >= 0
                                                    ? isDark
                                                        ? "#6EE7B7"
                                                        : "#059669"
                                                    : isDark
                                                        ? "#FCA5A5"
                                                        : "#DC2626",
                                        }}
                                    >
                                        {formatPercent(dashboardMeta.totalGrowth)}
                                    </div>
                                    <div className="kpi-subtext">
                                        Portfolio-level performance trend
                                    </div>
                                </div>
                                <div
                                    className={`kpi-icon ${dashboardMeta.totalGrowth >= 0
                                            ? "kpi-icon-green"
                                            : "kpi-icon-red"
                                        }`}
                                >
                                    <i
                                        className={`fas ${dashboardMeta.totalGrowth >= 0
                                                ? "fa-arrow-trend-up"
                                                : "fa-arrow-trend-down"
                                            }`}
                                    ></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="premium-kpi-card d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    <div className="kpi-label">Top Brand ({dashboardMeta.currentFy})</div>
                                    <div className="kpi-value">
                                        {dashboardMeta.currentFyInsight?.best_brand?.name || "-"}
                                    </div>
                                    <div className="kpi-subtext">
                                        {formatCurrency(
                                            dashboardMeta.currentFyInsight?.best_brand?.value
                                        )}
                                    </div>
                                </div>
                                <div className="kpi-icon kpi-icon-green">
                                    <i className="fas fa-crown"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="premium-kpi-card d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    <div className="kpi-label">Portfolio Brands</div>
                                    <div className="kpi-value">{dashboardMeta.brandCount}</div>
                                    <div className="kpi-subtext">
                                        Active brands contributing to total sales
                                    </div>
                                </div>
                                <div className="kpi-icon kpi-icon-blue">
                                    <i className="fas fa-layer-group"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-lg-6">
                            <div className="premium-panel h-100">
                                <div className="premium-panel-body">
                                    <div className="panel-title">Growth Insights</div>
                                    <div className="panel-subtext">
                                        Quick read on the strongest improvement and the brand requiring immediate attention.
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <div className="insight-card">
                                                <div className="insight-title success">Best Improving</div>
                                                <div className="insight-brand">
                                                    {dashboardMeta.bestImprovingBrand?.name || "-"}
                                                </div>
                                                <div className="insight-value success">
                                                    {formatPercent(dashboardMeta.bestImprovingBrand?.growth || 0)}
                                                </div>
                                                <p className="insight-note">
                                                    Strongest year-on-year momentum across the portfolio.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="insight-card">
                                                <div className="insight-title danger">Needs Attention</div>
                                                <div className="insight-brand">
                                                    {dashboardMeta.worstImprovingBrand?.name || "-"}
                                                </div>
                                                <div className="insight-value danger">
                                                    {formatPercent(dashboardMeta.worstImprovingBrand?.growth || 0)}
                                                </div>
                                                <p className="insight-note">
                                                    Weakest movement and candidate for focused recovery.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="premium-panel h-100">
                                <div className="premium-panel-body">
                                    <div className="panel-title">FY Summary Highlights</div>
                                    <div className="panel-subtext">
                                        Snapshot of leadership and lagging brands in both financial years.
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <div className="insight-card">
                                                <div className="insight-title success">{dashboardMeta.previousFy}</div>
                                                <div className="mb-3">
                                                    <div className="small text-muted mb-1">Best Brand</div>
                                                    <div className="insight-brand">
                                                        {dashboardMeta.previousFyInsight?.best_brand?.name || "-"}
                                                    </div>
                                                    <div className="insight-value success">
                                                        {formatCurrency(dashboardMeta.previousFyInsight?.best_brand?.value)}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="small text-muted mb-1">Weak Brand</div>
                                                    <div className="insight-brand">
                                                        {dashboardMeta.previousFyInsight?.worst_brand?.name || "-"}
                                                    </div>
                                                    <div className="insight-value danger">
                                                        {formatCurrency(dashboardMeta.previousFyInsight?.worst_brand?.value)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="insight-card">
                                                <div className="insight-title success">{dashboardMeta.currentFy}</div>
                                                <div className="mb-3">
                                                    <div className="small text-muted mb-1">Best Brand</div>
                                                    <div className="insight-brand">
                                                        {dashboardMeta.currentFyInsight?.best_brand?.name || "-"}
                                                    </div>
                                                    <div className="insight-value success">
                                                        {formatCurrency(dashboardMeta.currentFyInsight?.best_brand?.value)}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="small text-muted mb-1">Weak Brand</div>
                                                    <div className="insight-brand">
                                                        {dashboardMeta.currentFyInsight?.worst_brand?.name || "-"}
                                                    </div>
                                                    <div className="insight-value danger">
                                                        {formatCurrency(dashboardMeta.currentFyInsight?.worst_brand?.value)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-panel">
                        <div className="premium-panel-body">
                            <div className="brand-panel-toolbar">
                                <div>
                                    <div className="panel-title">Brand-wise Total Sales</div>
                                    <div className="panel-subtext mb-0">
                                        Compare previous and current financial year sales with individual growth contribution.
                                    </div>
                                </div>

                                <div className="brand-toolbar-right">
                                    <div className="view-toggle-group">
                                        <button
                                            type="button"
                                            className={`rr-btn rr-btn-secondary ${brandView === "table" ? "active" : ""}`}
                                            onClick={() => setBrandView("table")}
                                        >
                                            <i className="fas fa-table"></i>
                                            Table View
                                        </button>

                                        <button
                                            type="button"
                                            className={`rr-btn rr-btn-secondary ${brandView === "chart" ? "active" : ""}`}
                                            onClick={() => setBrandView("chart")}
                                        >
                                            <i className="fas fa-chart-column"></i>
                                            Bar Chart
                                        </button>
                                    </div>

                                    <div
                                        className={`meta-chip ${dashboardMeta.totalGrowth >= 0
                                                ? "meta-chip-success"
                                                : "meta-chip-danger"
                                            }`}
                                    >
                                        <i className="fas fa-briefcase"></i>
                                        CMO Portfolio View
                                    </div>
                                </div>
                            </div>

                            {brandView === "table" ? (
                                <div className="premium-table-wrap">
                                    <table className="premium-table">
                                        <thead>
                                            <tr>
                                                <th>Brand</th>
                                                <th>{dashboardMeta.previousFy}</th>
                                                <th>{dashboardMeta.currentFy}</th>
                                                <th>Growth %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardMeta.brandRows.map((item, index) => (
                                                <tr key={`${item.brand}-${index}`}>
                                                    <td className="brand-name">{item.brand}</td>
                                                    <td>{formatCurrency(item.previous_fy)}</td>
                                                    <td>{formatCurrency(item.current_fy)}</td>
                                                    <td>
                                                        <span
                                                            className={`growth-pill ${item.growth >= 0 ? "positive" : "negative"
                                                                }`}
                                                        >
                                                            {formatPercent(item.growth)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="chart-panel-wrap">
                                    <p className="chart-helper-text">
                                        Brand-wise comparison of sales for {dashboardMeta.previousFy} and {dashboardMeta.currentFy} in ₹ Cr.
                                    </p>
                                    <Chart
                                        options={brandChartConfig.options}
                                        series={brandChartConfig.series}
                                        type="bar"
                                        height={420}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="premium-panel h-100">
                                <div className="premium-panel-body">
                                    <div className="panel-title">Best Momentum Brand</div>
                                    <div className="panel-subtext">
                                        Brand with the strongest relative growth based on current vs previous FY.
                                    </div>

                                    <div className="insight-brand">
                                        {dashboardMeta.bestGrowthBrand?.brand || "-"}
                                    </div>
                                    <div className="insight-value success">
                                        {formatPercent(dashboardMeta.bestGrowthBrand?.growth || 0)}
                                    </div>
                                    <p className="insight-note">
                                        Sales moved from{" "}
                                        {formatCurrency(dashboardMeta.bestGrowthBrand?.previous_fy)} to{" "}
                                        {formatCurrency(dashboardMeta.bestGrowthBrand?.current_fy)}.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="premium-panel h-100">
                                <div className="premium-panel-body">
                                    <div className="panel-title">Weakest Momentum Brand</div>
                                    <div className="panel-subtext">
                                        Brand with the lowest relative growth and possible recovery opportunity.
                                    </div>

                                    <div className="insight-brand">
                                        {dashboardMeta.worstGrowthBrand?.brand || "-"}
                                    </div>
                                    <div className="insight-value danger">
                                        {formatPercent(dashboardMeta.worstGrowthBrand?.growth || 0)}
                                    </div>
                                    <p className="insight-note">
                                        Sales moved from{" "}
                                        {formatCurrency(dashboardMeta.worstGrowthBrand?.previous_fy)} to{" "}
                                        {formatCurrency(dashboardMeta.worstGrowthBrand?.current_fy)}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CMOSalesPerformance;