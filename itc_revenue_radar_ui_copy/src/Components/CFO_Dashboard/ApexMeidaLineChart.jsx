import React, { useState, useMemo, useEffect } from "react";
import Chart from "react-apexcharts";

const CampaignSalesChart = ({
  theme = "light",
  tilldate,
  heading = "Heading Required",
  campaignData = [],
  previousFY,
  currentFY,
  metricLabel = "Sales (₹ in Crores)",
  viewType = 'Channel_Wise'
}) => {
  const isDark = theme === "dark";
  const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

  const ui = {
    cardBg: isDark ? "linear-gradient(180deg, #2C3E50 0%, #1A252F 100%)" : "linear-gradient(180deg, #FFFFFF 0%, #FCFDFF 100%)",
    border: isDark ? "#4A6274" : "#E5E7EB",
    textPrimary: isDark ? "#F8F9FA" : "#2C3E50",
    textSecondary: isDark ? "#E5E7EB" : "#2C3E50",
    textMuted: isDark ? "#ADB5BD" : "#6C757D",
    grid: isDark ? "#4A6274" : "#E5E7EB",
    tableHeadBg: isDark ? "#34495E" : "#F0F4F8",
    tableBorder: isDark ? "#4A6274" : "#E5E7EB",
    tableHover: isDark ? "#3D566E" : "#F8F9FA",
    switchBg: isDark ? "#34495E" : "#F0F4F8",
    switchBorder: isDark ? "#4A6274" : "#E5E7EB",
    switchHover: isDark ? "#3D566E" : "#E5E7EB",
    codePillBg: isDark ? "rgba(13, 124, 102, 0.15)" : "#E8F5E8",
    codePillText: isDark ? "#17A2B8" : "#0D7C66",
    tooltipTheme: isDark ? "dark" : "light",
    noData: isDark ? "#ADB5BD" : "#6C757D",
    shadow: isDark
      ? "0 4px 24px rgba(0, 0, 0, 0.3)"
      : "0 4px 24px rgba(44, 62, 80, 0.06)",
  };

  const quarters = useMemo(() => {
    const qtrs = [...new Set(campaignData.map((item) => item.quarter).filter(Boolean))];
    return qtrs.sort((a, b) => (quarterOrder[a] || 99) - (quarterOrder[b] || 99));
  }, [campaignData]);

  const [selectedQuarter, setSelectedQuarter] = useState("");

  useEffect(() => {
    if (quarters.length > 0) {
      setSelectedQuarter((prev) => (prev && quarters.includes(prev) ? prev : quarters[0]));
    }
  }, [quarters]);

  const filteredData = useMemo(() => {
    return campaignData
      .filter(
        (item) =>
          item.quarter === selectedQuarter &&
          (Number(item.previous_fy) !== 0 || Number(item.current_fy) !== 0)
      )
      .sort((a, b) => {
        if ((Number(b.current_fy) || 0) !== (Number(a.current_fy) || 0)) {
          return (Number(b.current_fy) || 0) - (Number(a.current_fy) || 0);
        }
        return (Number(b.previous_fy) || 0) - (Number(a.previous_fy) || 0);
      });
  }, [campaignData, selectedQuarter]);

  const categories = filteredData.map((item) => viewType === 'Channel_Wise' ? item.attribute_name : item.media_group);

  const labelMap = useMemo(() => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    return categories.map((name, index) => ({
      short: alphabet[index] || `x${index + 1}`,
      full: String(name || "").replace(/_/g, " "),
    }));
  }, [categories]);

  const previousFYSeries = filteredData.map((item) =>
    Number((Number(item.previous_fy || 0) / 10000000).toFixed(2))
  );

  const currentFYSeries = filteredData.map((item) =>
    Number((Number(item.current_fy || 0) / 10000000).toFixed(2))
  );

  const previousLabel = useMemo(() => {
    if (!tilldate) return previousFY;
    const [year, month] = tilldate.split("-");
    return `${previousFY} (${year}-${String(Number(month) - 1).padStart(2, "0")})`;
  }, [previousFY, tilldate]);

  const currentLabel = useMemo(() => {
    if (!tilldate) return currentFY;
    return `${currentFY} (${tilldate})`;
  }, [currentFY, tilldate]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: "Inter, system-ui, sans-serif",
        foreColor: ui.textMuted,
        background: "transparent",
      },
      theme: {
        mode: isDark ? "dark" : "light",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "48%",
          borderRadius: 8,
          borderRadiusApplication: "end",
        },
      },
      stroke: {
        show: false,
      },
      xaxis: {
        categories: labelMap.map((item) => viewType === 'Channel_Wise' ? item.short : item.full),
        title: {
          text: viewType === 'Channel_Wise' ? "Channel Code" : 'Media Group',
          style: {
            fontWeight: 700,
            color: ui.textSecondary,
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: 700,
            colors: labelMap.map(() => ui.textSecondary),
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
          text: metricLabel,
          style: {
            fontWeight: 700,
            color: ui.textSecondary,
          },
        },
        labels: {
          formatter: (val) => `₹ ${Number(val).toFixed(0)}`,
          style: {
            fontSize: "12px",
            colors: [ui.textMuted],
          },
        },
      },
      tooltip: {
        theme: ui.tooltipTheme,
        y: {
          formatter: (val) =>
            `₹ ${Number(val).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} Cr`,
        },
      },
      colors: ["#0D7C66", "#17A2B8"],
      dataLabels: {
        enabled: viewType === 'Group_Wise',
        position: 'top',
        formatter: function (val) {
          if (val === 0) return "₹ 0";

          return `₹ ${val.toFixed(2)} Cr`;
        },
        style: {
          fontSize: "11px",
          fontWeight: 600,
          colors: [isDark ? "#E5E7EB" : "#2C3E50"], // text color
        },
        background: {
          enabled: true,
          borderRadius: 6,
          padding: 4,
          opacity: isDark ? 0.9 : 0.95,
          foreColor: isDark ? "#1A252F" : "#E5E7EB",
          borderWidth: 1,
          borderColor: isDark ? "#4A6274" : "#E5E7EB",
          color: isDark
            ? "rgba(44, 62, 80, 0.31)"
            : "rgba(255, 255, 255, 0.9)",
        },
        offsetY: 0,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
        fontWeight: 600,
        labels: {
          colors: ui.textSecondary,
        },
        markers: {
          radius: 10,
        },
      },
      grid: {
        borderColor: ui.grid,
        strokeDashArray: 4,
        padding: {
          left: 8,
          right: 8,
        },
      },
      noData: {
        text: "No quarter-wise data available",
        align: "center",
        verticalAlign: "middle",
        style: {
          color: ui.noData,
          fontSize: "14px",
        },
      },
    }),
    [isDark, labelMap, metricLabel, ui]
  );

  const series = [
    {
      name: previousLabel,
      data: previousFYSeries,
    },
    {
      name: currentLabel,
      data: currentFYSeries,
    },
  ];

  return (
    <div className="campaign-chart-card">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <div>
          <h5 className="campaign-title mb-1">{heading}</h5>
          <div className="campaign-subtitle">
            {viewType === 'Channel_Wise'
              ? `Quarter-wise channel comparison with detailed reference table`
              : `Quarter-wise media group comparison`
            }
          </div>
        </div>

        <div className="quarter-switch">
          {quarters.map((qtr) => (
            <button
              key={qtr}
              className={`quarter-switch-btn ${qtr === selectedQuarter ? "active" : ""}`}
              onClick={() => setSelectedQuarter(qtr)}
              type="button"
            >
              {qtr}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 ? (
        <>
          <Chart options={chartOptions} series={series} type="bar" height={340} />

          {viewType === 'Channel_Wise' &&
            <div className="campaign-table-wrap mt-4">
              <div className="campaign-table-title">Channel Details</div>

              <div className="table-responsive">
                <table className="table premium-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>Code</th>
                      <th>Channel Name</th>
                      <th className="text-end">{previousFY}</th>
                      <th className="text-end">{currentFY}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labelMap.map((item, index) => (
                      <tr key={item.short}>
                        <td>
                          <span className="code-pill">{item.short}</span>
                        </td>
                        <td className="fw-semibold channel-name-cell">{item.full}</td>
                        <td className="text-end">
                          ₹{" "}
                          {previousFYSeries[index]?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-end">
                          ₹{" "}
                          {currentFYSeries[index]?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>}
        </>
      ) : (
        <div className="empty-quarter-state text-center py-5 text-muted">
          No data available for this quarter
        </div>
      )}

      <style>{`
        .campaign-chart-card {
          background: ${ui.cardBg};
          border: 1px solid ${ui.border};
          border-radius: 16px;
          padding: 1rem;
          box-shadow: ${ui.shadow};
          color: ${ui.textPrimary};
        }

        .campaign-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.4;
          color: ${ui.textPrimary};
        }

        .campaign-subtitle {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          color: ${ui.textMuted};
          font-weight: 400;
          line-height: 1.5;
        }

        .quarter-switch {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 4px;
          background: ${ui.switchBg};
          border-radius: 10px;
          border: 1px solid ${ui.switchBorder};
        }

        .quarter-switch-btn {
          border: none;
          background: transparent;
          color: ${ui.textMuted};
          padding: 8px 14px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.22s ease;
        }

        .quarter-switch-btn:hover {
          background: ${ui.switchHover};
          color: ${ui.textPrimary};
        }

        .quarter-switch-btn.active {
          background: #0D7C66;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(13, 124, 102, 0.25);
        }

        .campaign-table-wrap {
          border-top: 1px solid ${ui.tableBorder};
          padding-top: 1rem;
        }

        .campaign-table-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: ${ui.textMuted};
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .premium-table {
          --bs-table-bg: transparent;
          --bs-table-color: ${ui.textSecondary};
          --bs-table-border-color: ${ui.tableBorder};
          margin-bottom: 0;
        }

        .premium-table thead th {
          background: ${ui.tableHeadBg};
          color: ${ui.textSecondary};
          font-size: 12px;
          font-weight: 700;
          border-bottom: 1px solid ${ui.border};
          border-top: none;
          white-space: nowrap;
        }

        .premium-table tbody td {
          border-color: ${ui.tableBorder};
          font-size: 13px;
          color: ${ui.textSecondary};
          vertical-align: middle;
          background: transparent;
        }

        .premium-table tbody tr:hover {
          background: ${ui.tableHover};
        }

        .channel-name-cell {
          color: ${ui.textPrimary};
        }

        .code-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 30px;
          padding: 0 10px;
          border-radius: 999px;
          background: ${ui.codePillBg};
          color: ${ui.codePillText};
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: lowercase;
        }

        .empty-quarter-state {
          color: ${ui.textMuted} !important;
        }

        @media (max-width: 768px) {
          .campaign-chart-card {
            border-radius: 12px;
            padding: 0.9rem;
          }

          .quarter-switch {
            width: 100%;
          }

          .quarter-switch-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CampaignSalesChart;