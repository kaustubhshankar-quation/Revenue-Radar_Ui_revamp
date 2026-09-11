import React, { useMemo } from "react";
import Chart from "react-apexcharts";

const ApexMediaRoiBarChart = ({ brand, yearly_roi, previous_fy, current_fy }) => {

  const filteredData = useMemo(() => {
    return yearly_roi
      .filter(item => item.previous_fy > 0 && item.current_fy > 0)
      .sort((a, b) => a.attribute_name.localeCompare(b.attribute_name));
  }, [yearly_roi]);

  const categories = filteredData.map((item) => item.attribute_name);

  const series = [
    {
      name: previous_fy,
      data: filteredData.map((item) => item.previous_fy),
    },
    {
      name: current_fy,
      data: filteredData.map((item) => item.current_fy),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 380,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif"
    },

    colors: ["#878006","#087211"],

    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 4
      }
    },

    dataLabels: {
      enabled: true,
      formatter: (val) => val.toFixed(2),
      style: {
        fontSize: "11px"
      }
    },

    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4
    },

    xaxis: {
      categories: categories,
      title: {
        text: "Media Campaign"
      },
      labels: {
        rotate: -30
      }
    },

    yaxis: {
      title: {
        text: "ROI"
      },
      labels: {
        formatter: (val) => val.toFixed(2)
      }
    },

    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(2)} ROI`
      }
    },

    legend: {
      position: "top",
      horizontalAlign: "right"
    },
  };

  return (
    <div className="accordion mt-3" id="roiAccordion">
      <div className="accordion-item border-0 shadow-sm">
        <h2 className="accordion-header" id="headingROI">
          <button
            className="accordion-button fw-semibold"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseROI"
          >
            📊 Media ROI Comparison ({previous_fy} vs {current_fy})
          </button>
        </h2>

        <div id="collapseROI" className="accordion-collapse collapse show">
          <div className="accordion-body">
            <Chart options={options} series={series} type="bar" height={380} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApexMediaRoiBarChart;