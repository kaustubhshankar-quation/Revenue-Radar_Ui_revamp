import React from 'react'
import Chart from "react-apexcharts";

function SingleBarChart8op({ fulldataset, type, isValue, range, maxValuedynamicVolume }) {
  let maxValue = maxValuedynamicVolume
  let filtered_data = fulldataset?.plot13?.filter(it => it?.attribute_value_per_roi > 0)
  const options = {
    chart: {
      id: `Download-ROI for Media Variables`,
      type: "bar",

      toolbar: {
        show: true,
      },
    },
    grid: {
      show: false
    },
    title: {
      text: `ROI for Media Variables (${type})`,
      align: 'center',
      style: {
        fontWeight: "100",

      }
    },

    colors: ['#1e81b0'],
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
      categories: filtered_data?.map((item) => {
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
          fontSize: "8px"
        },
        offsetY: -6,



        formatter: function (val) {
          return val
        }
      },
    },
    yaxis: [
      {
        seriesName: 'ROI',
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
        min: 0, // Start from 1
        max: Math.ceil(maxValue), // Ensure the maximum value is a whole number

        title: {
          text: "ROI ",
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

  const plotdata =
    [{ name: "ROI", data: filtered_data?.map((it) => { return Number(it?.attribute_value_per_roi?.toFixed(3)) }) },

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
      /></>
  )
}

export default SingleBarChart8op