import React from 'react'
import Chart from "react-apexcharts";
import { useOutletContext } from 'react-router-dom';

function SingleBarChart8({fulldataset,type,isValue,range,maxValuedynamicVolume}) {
  const { theme } = useOutletContext();
  const isDark = theme !== 'light';
  const textColor = isDark ? '#F8F9FA' : '#2C3E50';
  const mutedColor = isDark ? '#ADB5BD' : '#6C757D';
  let filtered_data = fulldataset?.plot13.filter((it)=> it.attribute_value_per_roi > 0 )
  const isStacked = filtered_data?.some(item => item.frequency);
  let maxValue=isStacked?3*maxValuedynamicVolume:maxValuedynamicVolume
  
  
  const groupedData = {};
  if (isStacked) {
    filtered_data?.forEach(item => {
      if (!groupedData[item.variable]) {
        groupedData[item.variable] = [];
      }
      groupedData[item.variable].push({ x: item.frequency, y: item.attribute_value_per_roi.toFixed(3) });
    });
  }

  const options={
    chart: {
      id: `Download-ROI for Media Variables`,
      type: isStacked ? "bar" : "bar",
      stacked: isStacked,
      toolbar: { show: true },
      background: 'transparent',
    },
    grid: { show: false },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
    title: {
      text: `ROI for Media Variables (${type})`,
      align: 'center',
      style: { fontFamily: "'Inter', system-ui, sans-serif", fontSize: "15px", fontWeight: 700, color: textColor }
    },
    colors : [  "#17A2B8" ,"#FF8C00","#0D7C66",
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
    plotOptions: { bar: { dataLabels: { position: "top" } } },
    dataLabels: {
      enabled: isStacked?false:true,
      offsetY: -15,
      style: { fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "12px", fontWeight: 600, colors: [textColor] },
      formatter: (val) => val.toFixed(3),
    },
    xaxis: {
      categories: isStacked
        ? [...new Set(filtered_data?.map(item => item.frequency))]
        : filtered_data?.map(item => item.variable)   ?.map((item) => {
          const variable = item;
          if (!variable) return []; // Handle cases where `variable` is undefined or null
        
          const words = variable.split(/[\s_]+/);
          if (words.length <= 2) {
            // If there are 2 or fewer words, keep them as a single item array
            return [words.join(" ")];
          } else {
            // Split into two parts: first two words and the rest
            return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
          }
        }),
      title: { text: '', style: { fontWeight: 600, fontSize: "12px", color: mutedColor } },
      labels: {
        rotate: -50,
        rotateAlways: true,
        style: { fontWeight: 500, fontSize: "10px", colors: mutedColor },
        offsetY: -6,
      },
    },
    yaxis: [{
      seriesName: 'ROI',
      opposite: false,
      axisBorder: { show: true },
      labels: {
        style: { fontWeight: 500, fontSize: "11px", colors: mutedColor },
        formatter: (val) => val,
      },
      min: 0,
      max: Math.ceil(maxValue),
      title: {
        text: "ROI ",
        showAlways: true,
        floating: true,
        style: { fontWeight: 600, fontSize: "12px", color: mutedColor },
      },
    }],
    annotations: {
      yaxis: [{
        y: 0,
        borderColor: '#6C757D',
        label: { text: '', style: { color: '#6C757D', background: '#1A252F' } }
      }]
    }
  };

  const plotdata = isStacked
    ? Object.keys(groupedData).map(variable => ({
        name: variable,
        data: groupedData[variable]
      }))
    : [{
        name: "ROI",
        data: filtered_data?.map(it => Number(it?.attribute_value_per_roi?.toFixed(3)))
      }];

  return (
    <>
      <div style={{ marginBottom: '20px' }}><small style={{ color: mutedColor, fontSize: '12px', fontWeight: 600 }}>Time Period: {range}</small></div>
      <Chart
        align="center"
        options={options}
        series={plotdata}
        type="bar"
        height={400}
        width={'100%'}
      />
    </>
  )
}

export default SingleBarChart8;
