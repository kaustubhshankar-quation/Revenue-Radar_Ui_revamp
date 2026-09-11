import React from 'react';
import Chart from 'react-apexcharts';
import { useOutletContext } from 'react-router-dom';

function SingleBarChart2({ fulldataset, type, isValue, range, maxValuedynamicVolume, maxValuedynamicValue }) {
  const { theme } = useOutletContext();
  const isDark = theme !== 'light';
  const textColor = isDark ? '#F8F9FA' : '#2C3E50';
  const mutedColor = isDark ? '#ADB5BD' : '#6C757D';
  let maxValue = isValue ? maxValuedynamicValue : maxValuedynamicVolume;
  let filtered_data = fulldataset?.plot4.filter((it)=> it.contribution > 0 )
  // Determine if the data contains 'frequency'
  const isStacked = filtered_data?.some(item => item?.frequency);
  if(isStacked){
    maxValue=3*maxValue
      }
  let categories, series;

  if (isStacked) {
    // Extract unique frequencys and media variable types
    let uniqueFrequency = Array.from(new Set(filtered_data.map(item => item?.frequency)));
    let uniqueMediaTypes = Array.from(new Set(filtered_data.map(item => item?.media_variable_type)));

    // Group data by media variable type (stacked chart case)
    series = uniqueMediaTypes.map(mediaType => {
      return {
        name: mediaType,
        data: uniqueFrequency.map(frequency => {
          let dataPoint = filtered_data.find(item => item.media_variable_type === mediaType && item?.frequency === frequency);
          return dataPoint ? (isValue ? Number(dataPoint.contribution_sales_value / 100000).toFixed(2) : Number(dataPoint.contribution).toFixed(0)) : 0;
        })
      };
    });
    categories = uniqueFrequency;
  } else {
    // Extract unique media variable types (non-stacked case)
    let uniqueMediaTypes = Array.from(new Set(filtered_data.map(item => item?.media_variable_type)));
    
    // Group data normally
    series = [{
      name: "Contribution",
      data: uniqueMediaTypes.map(mediaType => {
        let dataPoint = filtered_data.find(item => item.media_variable_type === mediaType);
        return dataPoint ? (isValue ? Number(dataPoint.contribution_sales_value / 100000).toFixed(2) : Number(dataPoint.contribution).toFixed(0)) : 0;
      })
    }];
    categories = uniqueMediaTypes;
  }

  const options = {
    chart: {
      id: `Download-Contribution Chart for Media Variables`,
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
      text: `Contribution ${isValue ? "Value" : "Volume"} for Media Variables(${type})`,
      align: 'center',
      style: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "15px",
        fontWeight: 700,
        color: textColor,
      }
    },
   colors : ["#17A2B8", "#FF8C00", "#0D7C66" ,
      "#DC3545", // Danger Red  
        
      "#4A6274", // Deep Slate  
      "#C7F464", // Neon Lime  
      "#FFC107", // Warning Amber  
      "#20c997", // Mint Teal  
      "#DC3545", // Strong Red  
      "#1A252F", // Deep Slate  
        
      "#6A0572", // Strong Purple  
      "#3D348B", // Royal Blue  
        
      "#198754", // Success Green  
      "#B8336A", // Bold Magenta  
      "#1B998B", // Dark Turquoise  
        
        
        
        
      "#8F2D56", // Rich Burgundy  
      "#E63946", // Vivid Red  
      "#F3722C", // Bright Orange  
      "#FF8C00", // Warm Amber  
      "#90BE6D", // Fresh Green  
      "#198754", // Deep Aqua  
      "#577590", // Muted Blue  
      "#F9844A", // Soft Tangerine  
      "#17A2B8", // Teal  
      "#9D4EDD", // Electric Purple  
      "#5A189A"  // Deep Violet  
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: isStacked?false:true,
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
        text: isStacked ? 'Frequency' : 'Media Variables',
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
        text: `Contribution ${isValue ? "Value (Lacs)" : "Volume (Kgs)"}`,
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
        y: 0,
        borderColor: '#6C757D',
        label: {
          text: '',
          style: {
            color: '#6C757D',
            background: '#1A252F'
          }
        }
      }]
    },
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

export default SingleBarChart2;
