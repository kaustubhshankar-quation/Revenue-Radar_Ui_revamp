import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import maskedBrandOption from "../JSON Files/MaskedBrandOption.json";
import { useOutletContext } from "react-router-dom";

const ModelPerformanceChart = ({ data }) => {

  const { theme } = useOutletContext()

  const entriesPerPage = 12;
  const totalLength = data?.predicted_sales?.length || 0;
  const [currentIndex, setCurrentIndex] = useState(totalLength);

  const currentDataSlice = (comingdata) => {
    if (!comingdata) return [];
    const startIndex =
      currentIndex % entriesPerPage === 0
        ? Math.max(0, currentIndex - entriesPerPage)
        : Math.max(0, currentIndex - (currentIndex % entriesPerPage));

    return comingdata.slice(startIndex, currentIndex);
  };

  const toggleDatanext = () => {
    const nextIndex =
      currentIndex % entriesPerPage === 0
        ? currentIndex + entriesPerPage
        : currentIndex + (data?.predicted_sales?.length % entriesPerPage);

    setCurrentIndex(nextIndex);
  };

  const toggleDataprev = () => {
    const prevIndex =
      currentIndex % entriesPerPage === 0
        ? currentIndex - entriesPerPage
        : currentIndex - (currentIndex % entriesPerPage);

    setCurrentIndex(prevIndex);
  };

  const categories = useMemo(
    () => currentDataSlice(data?.predicted_sales)?.map((it) => it.month_year),
    [data, currentIndex]
  );

  const plotdata = [
    {
      name: "Actual Sales",
      data: currentDataSlice(data?.actuals)?.map((item) =>
        item?.actuals ? Number((item.actuals / 1000).toFixed(2)) : 0
      ),
    },
    {
      name: "Predicted Sales",
      data: currentDataSlice(data?.predicted_sales)?.map((item) =>
        item?.predicted_sales ? Number((item.predicted_sales / 1000).toFixed(2)) : 0
      ),
    },
  ];

  const chartOptions = {
    chart: {
      id: "model-performance-chart",
      type: "line",
      toolbar: { show: true },
      background: "transparent",
    },
    grid: {
      borderColor: "rgba(148, 163, 184, 0.18)",
      strokeDashArray: 4,
    },
    stroke: {
      width: 3,
      curve: "smooth",
    },
    legend: {
      position: "top",
      fontSize: "13px",
      labels: {
        colors: "var(--rr-text-main)",
      },
    },
    title: {
      text: `Actual vs Predicted (${maskedBrandOption.maskedBrandOption[data?.brand]} - ${data?.market})`,
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: 700,
        fontFamily: "'Inter', sans-serif",
        color: theme === "light"
          ? "#2C3E50"
          : "#F8F9FA",
      }
    },
    colors: ["#0D7C66", "#17A2B8"],
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: theme === "light"
        ? "light"
        : "dark",
      y: {
        formatter: (val) => `${val} K`,
      },
    },
    xaxis: {
      categories,
      title: {
        text: "Month-Year",
        style: {
          color: theme === "light"
            ? "#6C757D"
            : "#ADB5BD",
          fontSize: "12px",
          fontWeight: 600,
        },
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
          colors: categories.map(() => theme === "light"
            ? "#6C757D"
            : "#ADB5BD",),
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      title: {
        text: "Sales Volume (Tonnes in K)",
        style: {
          color: theme === "light"
            ? "#6C757D"
            : "#ADB5BD",
          fontSize: "12px",
          fontWeight: 600,
        },
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: [theme === "light"
            ? "#6C757D"
            : "#ADB5BD",],
        },
      },
    },
  };

  return (
    <>
      <div className="mp-chart-shell">
        <Chart options={chartOptions} series={plotdata} height={380} width="100%" />
      </div>

      <div className="mp-chart-footer">
        <button
          className={`rr-btn rr-btn-primary ${currentIndex - entriesPerPage <= 0 ? "rr-btn-disabled" : ""}`}
          onClick={toggleDataprev}
          disabled={currentIndex - entriesPerPage <= 0}
        >
          Previous
        </button>

        <button
          className={`rr-btn rr-btn-primary ${currentIndex >= data?.predicted_sales?.length ? "rr-btn-disabled" : ""}`}
          onClick={toggleDatanext}
          disabled={currentIndex >= data?.predicted_sales?.length}
        >
          Next
        </button>
      </div>

    </>
  );
};

export default ModelPerformanceChart;