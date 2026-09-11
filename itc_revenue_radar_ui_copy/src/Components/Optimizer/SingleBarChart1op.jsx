import React from 'react';
import Chart from 'react-apexcharts';
import { useOutletContext } from 'react-router-dom';

function SingleBarChart1op({first2chartsdata, type, isValue,range,maxValuedynamicVolume,maxValuedynamicValue}) {
  const { theme } = useOutletContext();
  const isDark = theme !== 'light';
  const textColor = isDark ? '#e9e9e9' : '#333';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
 
  const isStacked = first2chartsdata?.some(item => item?.frequency);
  let maxValue = isValue ? maxValuedynamicValue : maxValuedynamicVolume;
  if(isStacked){
maxValue=3*maxValue
  }
  
  let categories, series;

  if (isStacked) {
    // Extract unique frequencys and media variable types
    let uniqueFrequency = Array.from(new Set(first2chartsdata.map(item => item?.frequency)));
    let uniqueMediaTypes = Array.from(new Set(first2chartsdata.map(item => item?.type)));

    // Group data by media variable type (stacked chart case)
    series = uniqueMediaTypes.map(mediaType => {
      return {
        name: mediaType,
        data: uniqueFrequency.map(frequency => {
          let dataPoint = first2chartsdata.find(item => item.type === mediaType && item?.frequency === frequency);
          return dataPoint ? (isValue ? Number(dataPoint.value / 100000).toFixed(2) : Number(dataPoint.monthly_contribution/1000).toFixed(0)) : 0;
        })
      };
    });
    categories = uniqueFrequency;
  } else {
    // Extract unique media variable types (non-stacked case)
    let uniqueMediaTypes = Array.from(new Set(first2chartsdata.map(item => item?.type)));
    
    // Group data normally
    series = [{
      name: "Contribution",
      data: uniqueMediaTypes.map(mediaType => {
        let dataPoint = first2chartsdata.find(item => item.type === mediaType);
        return dataPoint ? (isValue ? Number(dataPoint.value / 100000).toFixed(2) : Number(dataPoint.monthly_contribution/1000).toFixed(0)) : 0;
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
          colors: [mutedColor],
        },
        formatter: function (val) {
          return val?.toFixed(0);
        },
      },
    },
    legend: {
      show: isStacked,
      fontSize: "12px",
      labels: { colors: textColor },
    },
    annotations: {
      yaxis: [{
        y: 0,
        borderColor: '#939598',
        label: {
          text: '',
          style: {
            color: '#939598',
            background: '#000'
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
        width={'95%'}
      />
    </>
  );
}


export default SingleBarChart1op;
