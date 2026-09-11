import React from "react";
import Chart from "react-apexcharts";
import { useOutletContext } from 'react-router-dom';

function PieCharts({ fulldataset, isValue, type, range }) {
  const { theme } = useOutletContext();
  const isDark = theme !== 'light';
  const textColor = isDark ? '#F8F9FA' : '#2C3E50';
  const mutedColor = isDark ? '#ADB5BD' : '#6C757D';
  const plotdata = isValue
    ? [
      { name: "Core", data: Number(fulldataset?.plot2[0]?.total_core_sales_percent?.toFixed(2)) },
      { name: "Incremental", data: Number(fulldataset?.plot2[1]?.total_incremental_sales_percent?.toFixed(2)) },
      { name: "Media", data: Number(fulldataset?.plot2[2]?.total_media_sales_percent?.toFixed(2)) },
    ]
    : [
      { name: "Core", data: Number(fulldataset?.plot2[0]?.total_core_percent?.toFixed(2)) },
      { name: "Incremental", data: Number(fulldataset?.plot2[1]?.total_incremental_percent?.toFixed(2)) },
      { name: "Media", data: Number(fulldataset?.plot2[2]?.total_media_percent?.toFixed(2)) },
    ];

  const total = plotdata.reduce((sum, item) => sum + item.data, 0);
  const series = plotdata.map((item) => (item.data / total) * 100);

  const options = {
    labels: ["Core", "Incremental", "Media"],
    title: {
      text: `Contribution Percentage (${type})`,
      align: "left",
      margin: 30,
      style: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "15px",
        fontWeight: 700,
        color: textColor,
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {

          minAngleToShowLabel: 0,
          // offset: function(val, opts) {
          //   const value = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
          //   console.log('Data value:', value); // Debugging
          //   return value < 2 ? 30 : 0; // Apply offset based on value at data point
          // },
          offset: 10,

          style: {
            fontSize: "12px",
            colors: ["#000"],
          },

        },
        donut: {
          size: "30%",  // Donut size, adjust as needed
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

        // Adjust spacing for "Media" by adding spaces
        if (label === "Media") {
          return `\xa0\xa0\xa0\xa0${val.toFixed(2)}`; // Adds spacing before value
        }
        if (label === "Incremental") {
          return `${val.toFixed(2)}\xa0\xa0\xa0\xa0`;
        }
        return val.toFixed(2);
      },
    },
    legend: {
      position: "right",
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: "13px",
      fontWeight: 600,
      labels: {
        colors: textColor,
      },
      offsetY: 0,
    },
  };

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <small style={{ color: mutedColor, fontSize: '12px', fontWeight: 600 }}>Time Period: {range}</small>
      </div>
      <Chart className="my-auto" type="donut" height={340} width="100%" options={options} series={series} />
    </div>
  );
}

export default PieCharts;
