import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { FaChartLine, FaEye, FaEyeSlash } from "react-icons/fa";

const getFyFromMonth = (monthYear) => {
  const [yearStr, monthStr] = monthYear.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }
  return `${year - 1}-${String(year).slice(-2)}`;
};

const BrandPredictionSummary = ({ apiData, isDark = false }) => {
    const [showChart, setShowChart] = useState(false);
    const [selectedFy, setSelectedFy] = useState("current");

    const summaryData = useMemo(() => {
        const brandLevelMape = apiData?.brand_level_mape || [];

        if (!brandLevelMape.length) {
            return {
                brand: "-",
                previousFy: "-",
                previousFyMape: "-",
                currentFy: "-",
                currentFyMape: "-",
            };
        }

        const sortedFyData = [...brandLevelMape].sort((a, b) =>
            a.fy.localeCompare(b.fy)
        );

        const previous = sortedFyData[0] || {};
        const current = sortedFyData[1] || {};

        return {
            brand: previous.brand || current.brand || "-",
            previousFy: previous.fy || "-",
            previousFyMape:
                previous.sales !== undefined && previous.sales !== null
                    ? `${(previous.sales * 100).toFixed(1)}%`
                    : "-",
            currentFy: current.fy || "-",
            currentFyMape:
                current.sales !== undefined && current.sales !== null
                    ? `${(current.sales * 100).toFixed(1)}%`
                    : "-",
        };
    }, [apiData]);

    const filteredChartData = useMemo(() => {
        const chartData = apiData?.month_wise_actual_vs_predicted || {};
        const categories = chartData?.month_year || [];
        const series = chartData?.series || [];

        const previousFy = summaryData.previousFy;
        const currentFy = summaryData.currentFy;
        const targetFy = selectedFy === "previous" ? previousFy : currentFy;

        if (!categories.length || !series.length || !targetFy || targetFy === "-") {
            return {
                categories: [],
                series: [],
            };
        }

        const matchedIndexes = categories.reduce((acc, item, index) => {
            if (getFyFromMonth(item) === targetFy) acc.push(index);
            return acc;
        }, []);

        const filteredCategories = matchedIndexes.map((idx) => categories[idx]);

        const filteredSeries = series.map((item) => ({
            ...item,
            data: matchedIndexes.map((idx) =>
                Number((item.data[idx] / 10000000).toFixed(4))
            ),
        }));

        return {
            categories: filteredCategories,
            series: filteredSeries,
            fy: targetFy,
        };
    }, [apiData, summaryData.previousFy, summaryData.currentFy, selectedFy]);

    const chartConfig = useMemo(() => {
        const categories = filteredChartData?.categories || [];
        const series = filteredChartData?.series || [];

        return {
            series,
            options: {
                chart: {
                    type: "line",
                    height: 360,
                    toolbar: { show: false },
                    zoom: { enabled: false },
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
                    size: 4,
                    strokeWidth: 0,
                    hover: {
                        sizeOffset: 3,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                colors: ["#0D7C66", "#17A2B8"],
                legend: {
                    position: "top",
                    horizontalAlign: "right",
                    labels: {
                        colors: isDark ? "#E5E7EB" : "#2C3E50",
                    },
                },
                xaxis: {
                    categories,
                    tickPlacement: "on",
                    title: {
                        text: "Year-Month",
                        style: {
                            color: isDark ? "#ADB5BD" : "#6C757D",
                            fontSize: "12px",
                            fontWeight: 600,
                        },
                    },
                    labels: {
                        rotate: -45,
                        trim: true,
                        style: {
                            colors: categories.map(() => (isDark ? "#ADB5BD" : "#6C757D")),
                            fontSize: "12px",
                            fontWeight: 500,
                        },
                    },
                    axisBorder: {
                        color: isDark ? "#4A6274" : "#E5E7EB",
                    },
                    axisTicks: {
                        color: isDark ? "#4A6274" : "#E5E7EB",
                    },
                },
                yaxis: {
                    title: {
                        text: "Sales (₹ Cr)",
                        style: {
                            color: isDark ? "#ADB5BD" : "#6C757D",
                            fontSize: "12px",
                            fontWeight: 600,
                        },
                    },
                    labels: {
                        style: {
                            colors: [isDark ? "#ADB5BD" : "#6C757D"],
                            fontSize: "12px",
                            fontWeight: 500,
                        },
                        formatter: function (val) {
                            return `₹ ${Number(val).toFixed(4)} Cr`;
                        },
                    },
                },
                tooltip: {
                    theme: isDark ? "dark" : "light",
                    shared: true,
                    intersect: false,
                    y: {
                        formatter: function (val) {
                            return `₹ ${Number(val).toFixed(4)} Cr`;
                        },
                    },
                },
                grid: {
                    borderColor: isDark
                        ? "rgba(74,98,116,0.35)"
                        : "rgba(229,231,235,0.8)",
                    strokeDashArray: 4,
                },
            },
        };
    }, [filteredChartData, isDark]);


    return (
        <div className="prediction-dashboard mb-3">
            <div className="prediction-panel">
                <div className="prediction-panel-header">
                    <div className="prediction-title-wrap">
                        <div>
                            <h5 className="prediction-title">MAPE Summary</h5>
                            <p className="prediction-subtitle">
                                Brand-level MAPE summary with FY-wise expandable trend view
                            </p>
                        </div>
                    </div>

                    <span className="rr-chip rr-chip-accent">Performance Overview</span>
                </div>

                <div className="prediction-panel-body">
                    <div className="rr-table-wrap">
                        <table className="rr-table">
                            <thead>
                                <tr className="text-center">
                                    <th>Previous FY</th>
                                    <th>MAPE</th>
                                    <th>Current FY</th>
                                    <th>MAPE</th>
                                    <th style={{ textAlign: "center" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                <tr>
                                    <td>{summaryData.previousFy}</td>
                                    <td>
                                        <span className="rr-chip rr-chip-info">
                                            {summaryData.previousFyMape}
                                        </span>
                                    </td>
                                    <td>{summaryData.currentFy}</td>
                                    <td>
                                        <span className="rr-chip rr-chip-good">
                                            {summaryData.currentFyMape}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <button
                                            type="button"
                                            className="rr-btn rr-btn-primary"
                                            onClick={() => setShowChart((prev) => !prev)}
                                        >
                                            {showChart ? <FaEyeSlash /> : <FaEye />}
                                            {showChart ? "Hide Chart" : "View Chart"}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {showChart && (
                        <>
                            <div className="rr-chart-toolbar mt-3">
                                <div className="rr-chart-toolbar-left">
                                    <h6 className="rr-chart-title mb-1">
                                        Month-wise Actual vs Predicted ({filteredChartData?.fy || "-"})
                                    </h6>
                                    <p className="rr-chart-subtitle mb-0">
                                        View one FY at a time using the filter buttons
                                    </p>
                                </div>

                                <div className="rr-chart-toolbar-right">
                                    <div className="rr-chart-toggle-group" role="group">
                                        <button
                                            type="button"
                                            className={`rr-btn rr-btn-secondary ${selectedFy === "previous" ? "active" : ""}`}
                                            onClick={() => setSelectedFy("previous")}
                                        >
                                            {summaryData.previousFy}
                                        </button>

                                        <button
                                            type="button"
                                            className={`rr-btn rr-btn-secondary ${selectedFy === "current" ? "active" : ""}`}
                                            onClick={() => setSelectedFy("current")}
                                        >
                                            {summaryData.currentFy}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="rr-chart-shell">
                                <Chart
                                    options={chartConfig.options}
                                    series={chartConfig.series}
                                    type="line"
                                    height={360}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandPredictionSummary;