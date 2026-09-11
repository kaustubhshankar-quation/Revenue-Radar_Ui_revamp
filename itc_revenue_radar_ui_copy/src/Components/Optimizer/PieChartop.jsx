import React from "react";
import Chart from "react-apexcharts";
import { useOutletContext } from 'react-router-dom';

function PieChartop({ optimizeddatasetcontripercentage, range, type }) {
  const { theme } = useOutletContext();
  const isDark = theme !== 'light';
  const textColor = isDark ? '#e9e9e9' : '#333';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  // Preprocess the dataset to group by type and calculate percentage contributions
  const plotdata = optimizeddatasetcontripercentage.map((item) => ({
    name: item.type,
    data: item.percentage_contribution,
  }));

  const total = plotdata.reduce((sum, item) => sum + item.data, 0);
  const series = plotdata.map((item) => (item.data / total) * 100);

  const options = {
    labels: ["Core", "Incremental", "Media"],
    title: {
      text: `Contribution Percentage (${type})`,
      align: "left",
      margin: 30,
      style: {
        fontSize: "15px",
        fontWeight: 700,
        fontFamily: "Inter, system-ui, sans-serif",
        color: textColor,
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          minAngleToShowLabel: 0,
          offset: 10,
          style: {
            fontSize: "12px",
            colors: ["#000"],
          },
        },
        donut: {
          size: "30%",
        },
      },
    },
    colors: ["#17A2B8", "#FF8C00", "#0D7C66"],
    chart: {
      id: "Download-Pie chart",
      type: "pie",
      toolbar: {
        show: true,
      },
      background: 'transparent',
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'middle',
      offset: function (val, opts) {
        const value = opts.w.config.series[opts.seriesIndex];
        return value < 2 ? 40 : 10;
      },
      style: {
        fontSize: "13px",
        fontWeight: 700,
        colors: ["white"],
      },
      formatter: function (val, opts) {
        const labels = ["Core", "Incremental", "Media"];
        const label = labels[opts.seriesIndex];

        if (label === "Media") {
          return `\xa0\xa0\xa0\xa0${val.toFixed(2)}`;
        }
        if (label === "Incremental") {
          return `${val.toFixed(2)}\xa0\xa0\xa0\xa0`;
        }
        return val.toFixed(2);
      },
    },
    legend: {
      fontSize: "13px",
      fontWeight: 600,
      fontFamily: "Inter, system-ui, sans-serif",
      labels: {
        colors: textColor,
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <small style={{ color: mutedColor, fontSize: '12px', fontWeight: 600 }}>Time Period: {range}</small>
      </div>
      <Chart
        className="my-auto"
        align="center"
        type="donut"
        height={320}
        options={options}
        series={series}
      />
    </div>
  );
}

export default PieChartop;
