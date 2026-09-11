import React, { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";

function StackBarChart({
  reviews,
  plotdatamonthly,
  plotdataweekly,
  displaynames,
  theme = "light",
}) {
  const [ifweekly, setifweekly] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 50, 400));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 50, 100));
  const handleZoomReset = () => setZoomLevel(100);

  const isDark = theme === "dark";

  const formatDate = (dateString) => {
    const [month, year] = dateString.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  function getStartOfWeek(weekYear) {
    const [week, year] = weekYear.split("/").map(Number);

    if (isNaN(week) || isNaN(year) || week < 1 || week > 53) {
      throw new Error(
        'Invalid input: Ensure the format is "week/year" and the week is between 1 and 53.'
      );
    }

    const firstThursday = new Date(Date.UTC(2000 + year, 0, 4));

    const firstMonday = new Date(
      firstThursday.setUTCDate(
        firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7)
      )
    );

    const startOfWeek = new Date(firstMonday);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() + (week - 1) * 7 + 5);

    const day = String(startOfWeek.getUTCDate()).padStart(2, "0");
    const month = String(startOfWeek.getUTCMonth() + 1).padStart(2, "0");
    const yearString = startOfWeek.getUTCFullYear();

    return `${day}-${month}-${yearString}`;
  }

  const getUniqueSortedDatesmonthly = (values) => {
    return Array.from(new Set(values)).sort((a, b) => new Date(a) - new Date(b));
  };

  const getUniqueSortedDatesWeekly = (values) => {
    return Array.from(new Set(values)).sort((a, b) => new Date(a) - new Date(b));
  };

  const uniqueSortedXAxismonthly = useMemo(() => {
    return getUniqueSortedDatesmonthly(
      (plotdatamonthly || []).flatMap((marketwise) =>
        (marketwise?.variables || []).flatMap((item) =>
          (item?.monthly_values || []).map((it) =>
            formatDate(it.month_format?.split("-")?.reverse().join("-"))
          )
        )
      )
    );
  }, [plotdatamonthly]);

  const uniqueSortedXAxisWeekly = useMemo(() => {
    return getUniqueSortedDatesWeekly(
      (plotdataweekly || []).flatMap((marketwise) =>
        (marketwise?.variables || []).flatMap((item) =>
          (item?.weekly_values || []).map((it) => getStartOfWeek(it.week_format))
        )
      )
    );
  }, [plotdataweekly]);

  const series = useMemo(() => {
    if (ifweekly) {
      return (
        plotdataweekly?.[0]?.variables?.map((variable) => ({
          name: variable.variables,
          data: uniqueSortedXAxisWeekly.map((week) => ({
            x: week,
            y:
              variable.weekly_values.find(
                (val) => getStartOfWeek(val.week_format) === week
              )?.rounded_value || null,
          })),
        })) || []
      );
    }

    return (
      plotdatamonthly?.[0]?.variables?.map((variable) => ({
        name: variable.variables,
        data: uniqueSortedXAxismonthly.map((month) => ({
          x: month,
          y:
            variable.monthly_values.find(
              (val) =>
                formatDate(val.month_format?.split("-")?.reverse().join("-")) ===
                month
            )?.rounded_value || null,
        })),
      })) || []
    );
  }, [
    ifweekly,
    plotdataweekly,
    plotdatamonthly,
    uniqueSortedXAxisWeekly,
    uniqueSortedXAxismonthly,
  ]);

  const chartText = {
    main: isDark ? "#f8fafc" : "#0f172a",
    muted: isDark ? "#cbd5e1" : "#475569",
    soft: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "rgba(148,163,184,0.18)" : "#e2e8f0",
    grid: isDark ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.18)",
    tooltipBg: isDark ? "#0f172a" : "#ffffff",
  };

  const options = useMemo(
    () => ({
      chart: {
        id: "Download-Brand Analysis Chart",
        height: 450,
        type: "bar",
        stacked: true,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
        foreColor: chartText.main,
        background: isDark ? "#1A252F" : "#ffffff",
      },
      theme: {
        mode: isDark ? "dark" : "light",
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%",
          borderRadius: 6,
        },
      },
      colors: [
        "#0D7C66",
        "#17A2B8",
        "#FF8C00",
        "#2C3E50",
        "#198754",
        "#DC3545",
        "#6C757D",
        "#0B6B57",
        "#FFC107",
        "#E6F7FF",
        "#34495E",
        "#8BC34A",
        "#CDDC39",
        "#FF9800",
        "#E8F5E8",
        "#795548",
        "#607D8B",
        "#ADB5BD",
        "#0A6B57",
        "#138496",
      ],
      stroke: {
        width: 0,
      },
      title: {
        text: "",
        align: "center",
        style: {
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          color: chartText.main,
        },
      },
      xaxis: {
        title: {
          text: ifweekly ? "Dates" : "Month-Year",
          style: {
            color: chartText.main,
            fontSize: "13px",
            fontWeight: 700,
          },
        },
        labels: {
          style: {
            colors: chartText.muted,
            fontSize: "12px",
            fontWeight: 500,
          },
          rotate: -45,
          formatter: function (val) {
            return val;
          },
        },
        axisBorder: {
          show: true,
          color: chartText.border,
        },
        axisTicks: {
          show: true,
          color: chartText.border,
        },
      },
      yaxis: {
        title: {
          text:
            plotdataweekly?.[0]?.variables?.[0]?.units ||
            plotdatamonthly?.[0]?.variables?.[0]?.units ||
            "Values",
          style: {
            color: chartText.main,
            fontSize: "13px",
            fontWeight: 700,
          },
        },
        labels: {
          style: {
            colors: chartText.muted,
            fontSize: "12px",
            fontWeight: 500,
          },
          formatter: function (val) {
            return val;
          },
        },
      },
      legend: {
        position: "bottom",
        fontSize: "13px",
        fontWeight: 600,
        labels: {
          colors: chartText.main,
        },
      },
      grid: {
        borderColor: chartText.grid,
        strokeDashArray: 4,
        background: isDark ? "#1A252F" : "#ffffff",
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        style: {
          fontSize: "12px",
        },
      },
    }),
    [ifweekly, isDark, plotdataweekly, plotdatamonthly, chartText.main, chartText.muted, chartText.border, chartText.grid]
  );

  const hasData = series?.length > 0;

  return (
    <>
      <div className="sbc-page">
        <div className="rr-card rr-card-section">
          <div className="rr-chart-toolbar mb-3">
            <div className="rr-chart-toolbar-left">
              <div className="rr-chip rr-chip-accent">Stacked Contribution Analysis</div>
              <h5 className="rr-chart-title mb-1">
                {displaynames?.brand || displaynames?.selectedbrand || "Brand"}{" "}
                Analysis
              </h5>
              <p className="rr-chart-subtitle mb-0">
                Compare variable contribution across {ifweekly ? "weekly" : "monthly"}{" "}
                trends with a theme-consistent stacked view.
              </p>
            </div>

            <div className="rr-chart-toolbar-right">
              <div className="sbc-zoom-controls">
                <button className="sbc-zoom-btn" onClick={handleZoomOut} disabled={zoomLevel <= 100} title="Zoom Out">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <span className="sbc-zoom-label">{zoomLevel}%</span>
                <button className="sbc-zoom-btn" onClick={handleZoomIn} disabled={zoomLevel >= 400} title="Zoom In">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <button className="sbc-zoom-btn" onClick={handleZoomReset} title="Reset Zoom">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                </button>
              </div>
              <button
                className="rr-btn rr-btn-secondary"
                onClick={() => setifweekly(!ifweekly)}
              >
                {!ifweekly ? "Weekly" : "Monthly"}
              </button>
            </div>
          </div>

          <div className="sbc-chart-wrap">
            {hasData ? (
              <div className="rr-card rr-card-mini" id="chart">
                <div className="sbc-chart-scroll">
                  <div
                    className="sbc-chart-inner"
                    style={{
                      minWidth: `${Math.max(
                        800,
                        (ifweekly
                          ? uniqueSortedXAxisWeekly.length
                          : uniqueSortedXAxismonthly.length) * 22
                      ) * (zoomLevel / 100)}px`,
                    }}
                  >
                    <ReactApexChart
                      options={options}
                      series={series}
                      type="bar"
                      height={450}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rr-card rr-card-empty">
                <div className="rr-empty-icon">📊</div>
                <div className="rr-empty-title">No data available</div>
                <div className="rr-empty-text">
                  There are no records to display for this chart right now.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default StackBarChart;