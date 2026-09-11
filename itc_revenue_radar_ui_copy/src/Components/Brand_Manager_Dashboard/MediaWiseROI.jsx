import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import Chart from "react-apexcharts";
import RegionROIHeatMap from "./RegionWiseHeatMapROI";
import { getGrowthClass } from "../HelperFunction/helperFunction";

const MediaWiseROI = () => {
  const { mediaROIData, regionWiseROI, loading } = useSelector((state) => state.dashboard || {});
  const { theme } = useOutletContext();
  const isDark = theme === "dark";
  const yearly_roi = mediaROIData?.yearly_roi || [];
  const current_fy = mediaROIData?.current_fy || "Current FY";
  const previous_fy = mediaROIData?.previous_fy || "Previous FY";
  const dataTillMonth = mediaROIData?.data_present_till;
  const navigate = useNavigate();
  const [showRegionWiseHeatMap, setShowRegionWiseHeatMap] = useState(true);

  useEffect(() => {
    const data = mediaROIData || {};

    if (Object.keys(data).length === 0) {
      navigate("/cockpit/sales-performance");
    }
  }, [mediaROIData, navigate]);

  const ui = {
    surfaceBg: isDark ? "rgba(44, 62, 80, 0.92)" : "rgba(255, 255, 255, 0.92)",
    surfaceStrong: isDark ? "#2C3E50" : "#FFFFFF",
    surfaceSoft: isDark ? "#34495E" : "#F8F9FA",
    surfaceSoft2: isDark ? "#1E3A34" : "#E8F5E8",
    borderSoft: isDark ? "#4A6274" : "#E5E7EB",
    borderSoft2: isDark ? "#4A6274" : "#E5E7EB",
    textPrimary: isDark ? "#F8F9FA" : "#2C3E50",
    textSecondary: isDark ? "#E5E7EB" : "#2C3E50",
    textMuted: isDark ? "#ADB5BD" : "#6C757D",
    textAxis: isDark ? "#E5E7EB" : "#2C3E50",
    grid: isDark ? "#4A6274" : "#E5E7EB",
    chipBg: isDark ? "#34495E" : "#FFFFFF",
    chipText: isDark ? "#E5E7EB" : "#2C3E50",
    chipSuccessBg: isDark ? "rgba(13, 124, 102, 0.15)" : "#E8F5E8",
    chipSuccessText: isDark ? "#17A2B8" : "#0D7C66",
    blueBg: isDark ? "rgba(44, 62, 80, 0.15)" : "#F0F4F8",
    blueText: isDark ? "#F8F9FA" : "#2C3E50",
    greenBg: isDark ? "rgba(13, 124, 102, 0.15)" : "#E8F5E8",
    greenText: isDark ? "#17A2B8" : "#0D7C66",
    redBg: isDark ? "rgba(220, 53, 69, 0.15)" : "#FEF2F2",
    redText: isDark ? "#fca5a5" : "#DC3545",
    successSoft: isDark ? "rgba(13, 124, 102, 0.15)" : "#E8F5E8",
    successSoftText: isDark ? "#17A2B8" : "#0D7C66",
    dangerSoft: isDark ? "rgba(220, 53, 69, 0.15)" : "#FEF2F2",
    dangerSoftText: isDark ? "#fca5a5" : "#DC3545",
    emptyBg: isDark ? "#34495E" : "#F8F9FA",
    emptyText: isDark ? "#ADB5BD" : "#6C757D",
    shadowSoft: isDark
      ? "0 4px 24px rgba(0, 0, 0, 0.3)"
      : "0 4px 24px rgba(44, 62, 80, 0.06)",
    shadowHover: isDark
      ? "0 8px 32px rgba(0, 0, 0, 0.4)"
      : "0 8px 32px rgba(44, 62, 80, 0.10)",
    tooltipTheme: isDark ? "dark" : "light",
    spinnerTrack: isDark ? "#4A6274" : "#E5E7EB",
    spinnerHead: isDark ? "#17A2B8" : "#0D7C66",
  };

  const filteredData = useMemo(() => {
    return yearly_roi
      .filter((item) => Number(item.previous_fy) > 0 && Number(item.current_fy) > 0)
      .sort((a, b) => a.attribute_name.localeCompare(b.attribute_name));
  }, [yearly_roi]);

  const categories = filteredData.map((item) =>
    String(item.attribute_name || "").replace(/_/g, " ")
  );

  const previousAvg = useMemo(() => {
    if (!filteredData.length) return 0;
    const total = filteredData.reduce(
      (sum, item) => sum + (Number(item.previous_fy) || 0),
      0
    );
    return total / filteredData.length;
  }, [filteredData]);

  const currentAvg = useMemo(() => {
    if (!filteredData.length) return 0;
    const total = filteredData.reduce(
      (sum, item) => sum + (Number(item.current_fy) || 0),
      0
    );
    return total / filteredData.length;
  }, [filteredData]);

  const yoyChange = useMemo(() => {
    if (!previousAvg) return 0;
    return ((currentAvg - previousAvg) / previousAvg) * 100;
  }, [previousAvg, currentAvg]);

  const topPrevious = useMemo(() => {
    if (!filteredData.length) return null;
    return [...filteredData].sort((a, b) => b.previous_fy - a.previous_fy)[0];
  }, [filteredData]);

  const lowPrevious = useMemo(() => {
    if (!filteredData.length) return null;
    return [...filteredData].sort((a, b) => a.previous_fy - b.previous_fy)[0];
  }, [filteredData]);

  const topCurrent = useMemo(() => {
    if (!filteredData.length) return null;
    return [...filteredData].sort((a, b) => b.current_fy - a.current_fy)[0];
  }, [filteredData]);

  const lowCurrent = useMemo(() => {
    if (!filteredData.length) return null;
    return [...filteredData].sort((a, b) => a.current_fy - b.current_fy)[0];
  }, [filteredData]);

  const formatROI = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0.00x";
    return `${Number(value).toFixed(2)}x`;
  };

  const series = [
    {
      name: previous_fy,
      data: filteredData.map((item) => Number(item.previous_fy) || 0),
    },
    {
      name: current_fy,
      data: filteredData.map((item) => Number(item.current_fy) || 0),
    },
  ];

  const options = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: 420,
        toolbar: { show: false },
        fontFamily: "Inter, system-ui, sans-serif",
        foreColor: ui.textMuted,
        background: "transparent",
      },
      theme: {
        mode: isDark ? "dark" : "light",
      },
      colors: ["#0D7C66", "#17A2B8"],
      plotOptions: {
        bar: {
          columnWidth: "42%",
          borderRadius: 8,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        borderColor: ui.grid,
        strokeDashArray: 4,
        padding: {
          left: 8,
          right: 8,
        },
      },
      xaxis: {
        categories,
        title: {
          text: "Media Channel",
          style: {
            fontWeight: 700,
            color: ui.textAxis,
          },
        },
        labels: {
          rotate: -35,
          trim: true,
          style: {
            fontSize: "11px",
            fontWeight: 600,
            colors: categories.map(() => ui.textAxis),
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
          text: "ROI",
          style: {
            fontWeight: 700,
            color: ui.textAxis,
          },
        },
        labels: {
          formatter: (val) => `${Number(val).toFixed(1)}x`,
          style: {
            fontSize: "12px",
            colors: [ui.textMuted],
          },
        },
      },
      tooltip: {
        theme: ui.tooltipTheme,
        y: {
          formatter: (val) => `${Number(val).toFixed(2)}x ROI`,
        },
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
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 360,
            },
            plotOptions: {
              bar: {
                columnWidth: "55%",
              },
            },
            xaxis: {
              labels: {
                rotate: -45,
              },
            },
          },
        },
      ],
      noData: {
        text: "No ROI data available",
        align: "center",
        verticalAlign: "middle",
        style: {
          color: ui.textMuted,
          fontSize: "14px",
        },
      },
    }),
    [categories, current_fy, previous_fy, isDark, ui]
  );

  return (
    <div className="container-fluid py-3 media-roi-dashboard">
      {/* {
        showRegionWiseHeatMap &&
        regionWiseROI && (
          <div className="mb-4">
            <RegionROIHeatMap
              apiResponse={regionWiseROI}
              isDark={isDark}
            />
          </div>
        )
      } */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4 col-md-6 col-12">
          <div className="premium-kpi-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="kpi-label">Average ROI of Previous FY</div>
                <div className="kpi-value text-primary">{formatROI(previousAvg)}</div>
                <div className="kpi-subtext">{previous_fy}</div>
              </div>
              <div className="kpi-icon kpi-icon-blue">
                <i className="fas fa-chart-bar"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-12">
          <div className="premium-kpi-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="kpi-label">Average ROI of Current FY</div>
                <div className="kpi-value text-success">{formatROI(currentAvg)}</div>
                <div className="kpi-subtext">{current_fy}</div>
              </div>
              <div className="kpi-icon kpi-icon-green">
                <i className="fas fa-signal"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-12 col-12">
          <div className="premium-kpi-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="kpi-label">YoY ROI Change</div>
                <div className={`kpi-value ${getGrowthClass(yoyChange)}`}>
                  {Number(yoyChange) >= 0 ? "+" : ""}
                  {Number(yoyChange).toFixed(2)}%
                </div>
                <div className="kpi-subtext">Average ROI movement</div>
              </div>
              <div
                className={`kpi-icon ${
                  Number(yoyChange) >= 0 ? "kpi-icon-green" : "kpi-icon-red"
                }`}
              >
                <i
                  className={`fas ${
                    Number(yoyChange) >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                  }`}
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6 col-12">
          <div className="premium-region-card h-100">
            <div className="mini-card-label text-success">Top Performer of Previous FY</div>
            <div className="mini-card-title">
              {topPrevious?.attribute_name?.replace(/_/g, " ") || "-"}
            </div>
            <div className="mini-card-metric text-success">
              {formatROI(topPrevious?.previous_fy)}
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 col-12">
          <div className="premium-region-card h-100">
            <div className="mini-card-label text-danger">Under Performer of Previous FY</div>
            <div className="mini-card-title">
              {lowPrevious?.attribute_name?.replace(/_/g, " ") || "-"}
            </div>
            <div className="mini-card-metric text-danger">
              {formatROI(lowPrevious?.previous_fy)}
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 col-12">
          <div className="premium-region-card h-100">
            <div className="mini-card-label text-success">Top Performer of Current FY</div>
            <div className="mini-card-title">
              {topCurrent?.attribute_name?.replace(/_/g, " ") || "-"}
            </div>
            <div className="mini-card-metric text-success">
              {formatROI(topCurrent?.current_fy)}
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 col-12">
          <div className="premium-region-card h-100">
            <div className="mini-card-label text-danger">Under Performer of Current FY</div>
            <div className="mini-card-title">
              {lowCurrent?.attribute_name?.replace(/_/g, " ") || "-"}
            </div>
            <div className="mini-card-metric text-danger">
              {formatROI(lowCurrent?.current_fy)}
            </div>
          </div>
        </div>
      </div>

      <div className="premium-panel">
        <div className="panel-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="panel-title mb-1">ROI Comparison by Media Channel</h5>
            <div className="panel-subtitle">
              {previous_fy} vs {current_fy}
            </div>
          </div>
        </div>

        <div className="panel-body pt-0">
          <Chart options={options} series={series} type="bar" height={420} />
        </div>
      </div>
    </div>
  );
};

export default MediaWiseROI;
