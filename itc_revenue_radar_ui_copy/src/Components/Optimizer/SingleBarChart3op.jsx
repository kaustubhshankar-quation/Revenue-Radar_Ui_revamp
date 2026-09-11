import React from 'react'
import Chart from "react-apexcharts";

function SingleBarChart3op({fulldataset,type,isValue,range,maxValuedynamicVolume}) {
  let maxValue=maxValuedynamicVolume
const options={
    chart: {
      id: `Download-Effectiveness for Media`,
      type: "bar",

      toolbar: {
        show: true,
      },
    },
    grid: {
      show: false
    },
    title: {
      text: `Effectiveness for Media Variables(${type})`,
      align: 'center',
      style: {
        fontWeight: "100",

      }
    },

    colors : ["#FF6B6B","#1e81b0", "#f4d03f", "#27ae60" , 
        
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
    ],
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top", // Ensures data labels are on top of the bars
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -15, // Adjusts the position closer to the top of the bar
      style: {
        fontSize: "9px", 
        colors: ["black"], 
      },
      formatter: function (val) {
        return val.toFixed(3); // Ensure data labels always show 3 decimal places
      },
    },
    xaxis: {
      categories: fulldataset?.plot9?.map((item) => {
        const variable = item?.variable;
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
      title: {
        text: '',
        style: {
          fontWeight: "100"
        },
      },

      
      labels: {
        rotate: -50, // Rotates labels by 90 degrees counterclockwise
        rotateAlways: true, 
        style: {
          fontWeight: "100",
          fontSize:"8px"
        },
        offsetY: -6,
        formatter: function (val) {
          return val
        }
      },
    },
    yaxis: [
      {
        seriesName: 'Effectiveness',
        opposite: false,
        axisBorder: {
          show: true // Ensures Y-axis line is visible
        },

        labels: {
          style: {
            fontWeight: "100"

          },
          formatter: function (val) {
            return val
          }
        },
        min:0, // Start from 1
        max: Math.ceil(maxValue
        ),
        title: {
          text: "Effectiveness (per GRP/per 1000 IMP/per 1000 INR)",
          showAlways: true,
          floating: true,
          style: {
            fontWeight: "100"
          },

        },

      },
      ,
      // {
      //   seriesName: 'Predicted Sales',
      //   opposite: true,
      //   title: {
      //     text: "Predicted Sales",
      //     showAlways: true,
      //     floating: true, 
      //      style:{
      //     color:"#FFC107"
      //   },

      //   },


      // },
    ],
    annotations: {
      yaxis: [{
        y: 0, // Place the annotation at zero
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
  }

const plotdata=
[{ name: "Effectiveness", data: fulldataset?.plot9?.map((it) => { return Number(it?.effectiveness?.toFixed(3))}) },

]
  return (
    <>
   <div>
        <small className=''>Time Period: {range}</small>
        </div>
    <Chart
    align="center"
    options={options}
    series={plotdata}
    type="bar"
    height={400}
    width={'95%'}
  />    </>
  )
}

export default SingleBarChart3op