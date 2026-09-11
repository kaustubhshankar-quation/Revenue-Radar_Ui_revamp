import React from 'react';
import Chart from 'react-apexcharts';
import { useOutletContext } from 'react-router-dom';

function SingleBarChart1({ fulldataset, type, isValue, range, maxValuedynamicVolume, maxValuedynamicValue }) {
  const { theme } = useOutletContext();
  const isDark = theme !== 'light';
  const textColor = isDark ? '#F8F9FA' : '#2C3E50';
  const mutedColor = isDark ? '#ADB5BD' : '#6C757D';
  const formatedplot3 = fulldataset?.plot3?.map((item) => {
    if (item.type === "Core") {
      return {
        ...item,
        volume: item.total_core,
        value: item.total_core_sales
      }
    }
    else if (item.type === "Incremental" || item.type === "Increment") {
      return {
        ...item,
        volume: item.total_incremental,
        value: item.total_incremental_sales
      }
    }
    else {
      return {
        ...item,
        volume: item.total_media,
        value: item.total_media_sales
      }
    }

  })
  const isStacked = formatedplot3?.some(item => item?.frequency);
  let maxValue = isValue ? maxValuedynamicValue : maxValuedynamicVolume;
  if (isStacked) {
    maxValue = 3 * maxValue
  }

  // Determine if the data contains 'frequency'


  let categories, series;

  if (isStacked) {
    // Extract unique frequencys and media variable types
    let uniqueFrequency = Array.from(new Set(formatedplot3.map(item => item?.frequency)));
    let uniqueMediaTypes = Array.from(new Set(formatedplot3.map(item => item?.type)));

    // Group data by media variable type (stacked chart case)
    series = uniqueMediaTypes.map(mediaType => {
      return {
        name: mediaType,
        data: uniqueFrequency.map(frequency => {
          let dataPoint = formatedplot3.find(item => item.type === mediaType && item?.frequency === frequency);
          return dataPoint ? (isValue ? Number(dataPoint.value / 100000).toFixed(2) : Number(dataPoint.volume / 1000).toFixed(0)) : 0;
        })
      };
    });
    categories = uniqueFrequency;
  } else {
    // Extract unique media variable types (non-stacked case)
    let uniqueMediaTypes = Array.from(new Set(formatedplot3.map(item => item?.type)));

    // Group data normally
    series = [{
      name: "Contribution",
      data: uniqueMediaTypes.map(mediaType => {
        let dataPoint = formatedplot3.find(item => item.type === mediaType);
        return dataPoint ? (isValue ? Number(dataPoint.value / 100000).toFixed(2) : Number(dataPoint.volume / 1000).toFixed(0)) : 0;
      })
    }];
    categories = uniqueMediaTypes;
  }

  const options = {
    chart: {
      id: `Download-Contribution Chart `,
      type: 'bar',
      stacked: isStacked,
      toolbar: {
        show: true,
      },
      background: 'transparent',
    },
    grid: {
      show: false
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
    title: {
      text: `Contribution ${isValue ? "Value" : "Volume"} (${type})`,
      align: 'center',
      style: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "15px",
        fontWeight: 700,
        color: textColor,
      }
    },
    colors: ["#17A2B8", "#FF8C00", "#0D7C66"],
    plotOptions: {
      bar: {
        horizontal: false,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: isStacked ? false : true,
      offsetY: -15,
      style: {
        fontFamily: "'JetBrains Mono', 'Inter', monospace",
        fontSize: '12px',
        fontWeight: 600,
        colors: [textColor],
      },
      formatter: function (val) {
        return (val?.toLocaleString("en-IN"));
      },
    },
    xaxis: {
      categories: categories,
      title: {
        text: isStacked ? 'Frequency' : '',
        style: {
          fontWeight: 600,
          fontSize: "12px",
          color: mutedColor,
        },
      },
      labels: {
        rotate: -35,
        rotateAlways: true,
        style: {
          fontWeight: 500,
          fontSize: "11px",
          colors: mutedColor,
        },
      },
    },
    yaxis: {
      title: {
        text: `Contribution ${isValue ? "Value (Lacs)" : "Volume (Kg Tonnes)"}`,
        floating: true,
        style: {
          fontWeight: 600,
          fontSize: "12px",
          color: mutedColor,
        },
      },
      axisBorder: {
        show: true
      },
      min: 0,
      max: Math.ceil(maxValue),
      labels: {
        style: {
          fontWeight: 500,
          fontSize: "11px",
          colors: mutedColor,
        },
        formatter: function (val) {
          return val?.toFixed(0);
        },
      },
    },
    legend: {
      show: isStacked,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: "12px",
      labels: {
        colors: textColor,
      },
    },
    annotations: {
      yaxis: [{
        y: 0, // Place the annotation at zero
        borderColor: '#6C757D',
        label: {
          text: '',
          style: {
            color: '#6C757D',
            background: '#1A252F'
          }
        }
      }]
    }
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <small style={{ color: mutedColor, fontSize: '12px', fontWeight: 600 }}>Time Period: {range}</small>
      </div>
      <Chart
        align="center"
        options={options}
        series={series}
        type="bar"
        height={400}
        width={'100%'}
      />
    </>
  );
}

export default SingleBarChart1;
