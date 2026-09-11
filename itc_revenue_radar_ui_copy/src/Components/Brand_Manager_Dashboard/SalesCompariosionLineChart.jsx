import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";
import { formatCr, buildFyTillLabels } from "../HelperFunction/helperFunction";

const QuarterlySalesDashboard = ({ theme = "light" }) => {
  const isDark = theme === "dark";
  const { salesData } = useSelector((state) => state.dashboard || {});
  const quarterlyData = salesData?.quarterly?.qtr_sales || [];
  const monthwiseData = salesData?.month_wise || {};
  const currentFY = salesData?.current_fy || "Current FY";
  const previousFY = salesData?.previous_fy || "Previous FY";
  const tilldate = salesData?.data_present_till;

  const [activeFYView, setActiveFYView] = useState("both");

  const colors = {
    textPrimary: isDark ? "#F8F9FA" : "#2C3E50",
    textSecondary: isDark ? "#E5E7EB" : "#2C3E50",
    textMuted: isDark ? "#ADB5BD" : "#6C757D",
    borderSoft: isDark ? "#4A6274" : "#E5E7EB",
    panelBg: isDark ? "rgba(44, 62, 80, 0.92)" : "rgba(255, 255, 255, 0.92)",
    panelBgSolid: isDark ? "#2C3E50" : "#FFFFFF",
    panelSoft: isDark ? "#34495E" : "#F0F4F8",
    panelSoftHover: isDark ? "#3D566E" : "#E5E7EB",
    grid: isDark ? "#4A6274" : "#E5E7EB",
    tooltipTheme: isDark ? "dark" : "light",
    primary: "#0D7C66",
    success: "#17A2B8",
    warning: "#FF8C00",
    purple: "#6C757D",
    noData: isDark ? "#ADB5BD" : "#6C757D",
    activeDark: "#F8F9FA",
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0%";
    return `${Number(value).toFixed(1)}%`;
  };

  const { previousTillLabel: previousFYLabel, currentTillLabel: currentFYLabel } =
    useMemo(
      () => buildFyTillLabels(previousFY, currentFY, tilldate),
      [previousFY, currentFY, tilldate]
    );

  const monthCategories = monthwiseData?.categories || [];

  const monthSeries = useMemo(() => {
    const rawSeries = monthwiseData?.series || [];

    const transformedSeries = rawSeries.map((item) => ({
      name:
        item.name === previousFY
          ? previousFYLabel
          : item.name === currentFY
            ? currentFYLabel
            : item.name,
      data: (item.data || []).map((val) =>
        Number((Number(val || 0) / 10000000).toFixed(2))
      ),
      rawName: item.name,
    }));

    if (activeFYView === "previous") {
      return transformedSeries.filter((item) => item.rawName === previousFY);
    }

    if (activeFYView === "current") {
      return transformedSeries.filter((item) => item.rawName === currentFY);
    }

    return transformedSeries;
  }, [
    monthwiseData,
    activeFYView,
    previousFY,
    currentFY,
    previousFYLabel,
    currentFYLabel,
  ]);

  const lineColors = activeFYView === 'current' ? [colors.success]
                    : activeFYView === 'previous' ? [colors.primary]
                      : [colors.primary, colors.success]

  const monthLineOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        height: 360,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "Inter, system-ui, sans-serif",
        foreColor: colors.textMuted,
        background: "transparent",
      },
      theme: {
        mode: isDark ? "dark" : "light",
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 5,
        hover: {
          size: 7,
        },
      },
      grid: {
        borderColor: colors.grid,
        strokeDashArray: 4,
        padding: {
          left: 8,
          right: 8,
        },
      },
      xaxis: {
        categories: monthCategories,
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: 600,
            colors: monthCategories.map(() => colors.textSecondary),
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        title: {
          text: "Months",
          style: {
            fontSize: "12px",
            fontWeight: 700,
            color: colors.textSecondary,
          },
        },
      },
      yaxis: {
        title: {
          text: "Sales (₹ in Crores)",
          style: {
            fontSize: "12px",
            fontWeight: 700,
            color: colors.textSecondary,
          },
        },
        labels: {
          formatter: (val) => `₹ ${Number(val).toFixed(0)}`,
          style: {
            fontSize: "12px",
            colors: [colors.textMuted],
          },
        },
      },
      colors: lineColors,
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
        fontWeight: 600,
        labels: {
          colors: colors.textSecondary,
        },
        markers: {
          radius: 12,
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        theme: colors.tooltipTheme,
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => formatCr(val, { scaleToCr: false }),
        },
      },
      noData: {
        text: "No month-wise sales data available",
        align: "center",
        verticalAlign: "middle",
        style: {
          color: colors.noData,
          fontSize: "14px",
        },
      },
    }),
    [isDark, monthCategories, colors]
  );

  const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

  const sortedQuarterData = useMemo(() => {
    return [...quarterlyData].sort(
      (a, b) => (quarterOrder[a.quarter] || 99) - (quarterOrder[b.quarter] || 99)
    );
  }, [quarterlyData]);

  const quarterCategories = sortedQuarterData.map((item) => item.quarter);
  const changePercentData = sortedQuarterData.map((item) =>
    Number(item.change_percent || 0)
  );

  const barSeries = [
    {
      name: "Growth %",
      data: changePercentData,
    },
  ];

  const barOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: 360,
        toolbar: { show: false },
        fontFamily: "Inter, system-ui, sans-serif",
        foreColor: colors.textMuted,
        background: "transparent",
      },
      theme: {
        mode: isDark ? "dark" : "light",
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "48%",
          distributed: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      colors: [colors.primary, colors.success, colors.warning, colors.purple],
      dataLabels: {
        enabled: true,
        formatter: (val) => formatPercent(val),
        offsetY: -18,
        style: {
          fontSize: "12px",
          fontWeight: 700,
          colors: [colors.textSecondary],
        },
      },
      grid: {
        borderColor: colors.grid,
        strokeDashArray: 4,
      },
      xaxis: {
        categories: quarterCategories,
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: 700,
            colors: quarterCategories.map(() => colors.textSecondary),
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        title: {
          text: "Growth %",
          style: {
            fontSize: "12px",
            fontWeight: 700,
            color: colors.textSecondary,
          },
        },
        labels: {
          formatter: (val) => `${Number(val).toFixed(0)}%`,
          style: {
            colors: [colors.textMuted],
          },
        },
      },
      tooltip: {
        theme: colors.tooltipTheme,
        y: {
          formatter: (val) => formatPercent(val),
        },
      },
      legend: {
        show: false,
      },
      noData: {
        text: "No quarter-wise growth data available",
        align: "center",
        verticalAlign: "middle",
        style: {
          color: colors.noData,
          fontSize: "14px",
        },
      },
    }),
    [isDark, quarterCategories, colors]
  );

  return (
    <div className="row g-4 sales-trend-dashboard">
      <div className="col-lg-8">
        <div className="premium-panel h-100">
          <div className="panel-header d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h5 className="panel-title mb-1">Month-wise Sales Trend</h5>
              <div className="panel-subtitle">
                Compare monthly sales performance across financial years
              </div>
            </div>

            <div className="fy-toggle">
              <button
                className={`fy-btn ${activeFYView === "both" ? "active" : ""}`}
                onClick={() => setActiveFYView("both")}
                type="button"
              >
                Both
              </button>

              <button
                className={`fy-btn ${activeFYView === "previous" ? "active previous" : ""}`}
                onClick={() => setActiveFYView("previous")}
                type="button"
              >
                Previous FY
              </button>

              <button
                className={`fy-btn ${activeFYView === "current" ? "active current" : ""}`}
                onClick={() => setActiveFYView("current")}
                type="button"
              >
                Current FY
              </button>
            </div>
          </div>

          <div className="panel-body pt-0">
            <Chart
              options={monthLineOptions}
              series={monthSeries}
              type="line"
              height={360}
            />
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="premium-panel h-100">
          <div className="panel-header">
            <h5 className="panel-title mb-1">Quarter-wise Growth %</h5>
            <div className="panel-subtitle">
              Quarterly performance trend against previous FY
            </div>
          </div>

          <div className="panel-body pt-0">
            <Chart
              options={barOptions}
              series={barSeries}
              type="bar"
              height={360}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlySalesDashboard;