import React from 'react';
import Chart from "react-apexcharts";
import { useOutletContext } from 'react-router-dom';

function SingleBarChart6op({optimizeddatasetmedia,type,isValue,range,maxValuedynamicVolume }) {
  const { theme } = useOutletContext();
  const isDark = theme !== 'light';
  const textColor = isDark ? '#e9e9e9' : '#333';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';

  let maxValue=maxValuedynamicVolume
  // optimizeddatasetmedia = optimizeddatasetmedia?.sort((a, b) => 
  //   a.variable_type.localeCompare(b.variable_type)
  // );
  // Check if frequency exists in the dataset to determine stacking
  let filtered_data = optimizeddatasetmedia?.filter(it => it.effectiveness?.toFixed(3) > 0)
  const isStacked = filtered_data?.some(item => item?.frequency);
  if(isStacked){
    maxValue=2.5*maxValue
      }
  // Transform data for stacked chart if frequency exists
  let categories = [];
  let series = [];

  if (isStacked) {
    let groupedData = {};

    filtered_data?.forEach(item => {
      if (!groupedData[item.variable_type]) {
        groupedData[item.variable_type] = {};
      }
      groupedData[item.variable_type][item.frequency] = 
        Number(item.effectiveness?.toFixed(3)) || 0;
    });

    categories = [...new Set(filtered_data?.map(item => item.frequency))];
    const variableTypes = Object.keys(groupedData);
    
    series = variableTypes.map(variable => ({
      name: variable,
      data: categories.map(freq => groupedData[variable][freq] || 0),
    }));
  } else {
    // Non-stacked chart
    categories = filtered_data?.map(item => item.variable_type);
    series = [{
      name: "Effectiveness",
      data: filtered_data?.map(it => Number(it?.effectiveness?.toFixed(3)) || 0),
    }];
  }

  const options = {
    chart: {
      id: `Download-Effectiveness for Media Variables(Grouped)`,
      type: "bar",
      stacked: isStacked,
      toolbar: { show: true },
      background: 'transparent',
    },
    grid: { show: false },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
    title: {
      text: `Effectiveness for Media Variables(Grouped) (${type})`,
      align: 'center',
      style: {
        fontSize: "15px",
        fontWeight: 700,
        color: textColor,
      },
    },
    colors : ["#17A2B8", "#FF8C00", "#0D7C66", "#DC3545",
      "#556270", // Deep Slate Blue  
      "#C7F464", // Neon Lime  
      "#FF9F1C", // Warm Orange  
      "#2EC4B6", // Rich Cyan  
      "#E71D36", // Strong Red  
      "#011627", // Deep Navy  
        
      "#6A0572", // Strong Purple  
      "#3D348B", // Royal Blue  
        
      "#43AA8B", // Rich Teal Green  
      "#B8336A", // Bold Magenta  
      "#1B998B", // Dark Turquoise  
        
        
        
        
      "#8F2D56", // Rich Burgundy  
      "#F94144", // Vivid Red  
      "#F3722C", // Bright Orange  
      "#F8961E", // Warm Gold  
      "#90BE6D", // Fresh Green  
      "#43AA8B", // Deep Aqua  
      "#577590", // Muted Blue  
      "#F9844A", // Soft Tangerine  
      "#277DA1", // Bold Teal  
      "#9D4EDD", // Electric Purple  
      "#5A189A"  // Deep Violet  
    ],    plotOptions: {
      bar: { dataLabels: { position: "top" } },
    },
    dataLabels: {
      enabled: isStacked?false:true,
      offsetY: -15,
      style: { fontSize: 12, fontWeight: 600, colors: [textColor] },
      formatter: val => val.toFixed(3),
    },
    xaxis: {
      categories,
      title: { text: '', style: { fontWeight: 600, fontSize: "12px", color: mutedColor } },
      labels: {
        rotate: -35,
        rotateAlways: true,
        style: { fontWeight: 500, fontSize: "11px", colors: mutedColor },
      },
    },
    yaxis: {
      opposite: false,
      axisBorder: { show: true },
      labels: {
        style: { fontWeight: 500, fontSize: "11px", colors: [mutedColor] },
        formatter: val => val,
      },
      min: 0,
      max: Math.ceil(maxValue),
      title: {
        text: "Effectiveness (per GRP/per 1000 IMP/per 1000 INR)",
        showAlways: true,
        floating: true,
        style: { fontWeight: 600, fontSize: "12px", color: mutedColor },
      },
    },
    annotations: {
      yaxis: [{
        y: 0,
        borderColor: '#939598',
        label: {
          text: '',
          style: { color: '#939598', background: '#000' },
        },
      }],
    },
    legend: { show: isStacked, fontSize: "12px", labels: { colors: textColor } },
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





export default SingleBarChart6op