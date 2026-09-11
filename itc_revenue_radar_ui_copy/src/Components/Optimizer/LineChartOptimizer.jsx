import React, { useState } from 'react'
import Chart from "react-apexcharts";

function LineChartOptimizer({fulldataset1,fulldataset2,range,endDate}) {
  console.log(fulldataset1)
  const today1 = new Date();
  const currentYear = today1.getFullYear();
  const currentMonth = today1.getMonth();
 
   let unblockeddate;
   if (currentMonth >= 3) {
    unblockeddate = new Date(currentYear, currentMonth, 1);
  } else {
    const currentmonth15thdate = new Date(today1.getFullYear(), today1.getMonth(), 1);
    const isBefore15th = new Date() < currentmonth15thdate;
     unblockeddate = isBefore15th?new Date(today1.getFullYear(), today1.getMonth()-3, 1):new Date(today1.getFullYear(), today1.getMonth()-3, 1);
    }
  
  //const MonthBeforeUnlockMonth = `${unblockeddate.getFullYear()}-${String(unblockeddate.getMonth() + 1).padStart(2, "0")}`;
  //const MonthBeforeUnlockMonthreverse = MonthBeforeUnlockMonth.split("-").reverse().join("-");
  const MonthBeforeUnlockMonth = endDate;

    const predictedsalesvolumebasescenarioselectedmonths =
    fulldataset2?.plot1?.reduce((total, item) => {
      const [year, month] = item?.month_year?.split('-').map(Number);

      // Only add predicted sales if the date is within the target range
      if (item.month_year > MonthBeforeUnlockMonth) {
        return total + (Number(item?.predicted_sales) || 0);
      }

      return total;
    }, 0) / 1000;
    const optimizedsalesvolumebasescenarioselectedmonths =
    fulldataset1?.reduce((total, item) => {
      const [year, month] = item?.month_year?.split('-').map(Number);

      // Only add predicted sales if the date is within the target range
      if (item.month_year > MonthBeforeUnlockMonth) {
        return total + (Number(item?.optimized_spends) || 0);
      }

      return total;
    }, 0) / 1000;
  
    // Filter the data to include only entries starting from the next month
    // const filteredDataplot1 = fulldataset1?.plot1.map(item => {
    //   const [year, month] = item?.month_year.split('-').map(Number); // Split "YYYY-MM" into year and month

    //   // Check if the month-year should have predicted_sales as null
    //   if (year > nextYear || (year === nextYear && month >= nextMonth)) {
    //     return item; 
    //   } else {
    //     return { ...item, predicted_sales: null };
    //   }
    // });
    // const filteredDataplot2 = fulldataset1?.plot7.map(item => {
    //     const [year, month] = item?.month_year && item.month_year !== "0" && item.month_year.includes('-')
    //     ? item.month_year.split('-').map(Number)
    //     : [null, null]; 
  

    //     if (year > nextYear || (year === nextYear && month >= nextMonth)) {
    //       return item;
    //     } else {
    //       return { ...item, sales_value: null }; 
    //     }
    //   });
    //  const predictedsalesvolumebasescenarioselectedmonths=
    //     fulldataset2?.plot1?.reduce((total, item) => {
    //       const [year, month] = item?.month_year?.split('-').map(Number);
    //       // Only add if the date is within the target fiscal year
    //       if (year > nextYear || (year === nextYear && month >= nextMonth)) {
    //         return total + (Number(item?.predicted_sales) || 0);
    //       }
  
    //       return total;
    //     }, 0) /1000 
    //     const predictedsalesvaluebasescenarioselectedmonths=
    //     fulldataset2?.plot7?.reduce((total, item) => {
    //       const [year, month] = item?.month_year?.split('-').map(Number);
    //       // Only add if the date is within the target fiscal year
    //       if (year > nextYear || (year === nextYear && month >= nextMonth)) {
    //         return total + (Number(item?.total_sales_value) || 0);
    //       }
  
    //       return total;
    //     }, 0) /1000 
const options= 
{
    chart: {
      id: `Download-Sales`,
      type: "line",
      toolbar: {
        show: true,
      },
    },
    grid: {
      show: false,
    },
    title: {
      text: 'Sales',
      align: 'center',
      style: {
        fontWeight: "100",
        color: "#43474B",
      },
    },
    plotOptions: {},
    colors: ['#27ae60', '#f4d03f', '#1e81b0'],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: 11,
      },
      formatter: function (val) {
        return val ? (val) : ""; // Return empty string if val is null/0
      },
    },
    xaxis: {
      categories: fulldataset2?.plot1?.map((item) =>
        item?.month_year
      ),
      title: {
        text: 'Month-Year',
        style: {
          fontWeight: "100",
        },
      },
      labels: {
        style: {
          fontWeight: "100",
          fontSize: "14px",
        },
        formatter: function (val) {
          return val;
        },
      },
    },
    yaxis: [
      {
        seriesName: 'Scenario Predicted Sales',
        opposite: false,
        min: 0, // Ensures the Y-axis starts from 0
        labels: {
          formatter: function (val) {
            return (val );
          },
        },
        axisBorder: {
          show: true, // Ensures Y-axis line is visible
        },
        title: {
          text: "Sales Volume (Tonnes)",
          showAlways: true,
          floating: true,
          style: {
            fontWeight: "100",
          },
        },
      },
      // Uncomment other y-axis configurations if needed
    ],
  }
  const categories=fulldataset2?.plot1?.map((item) =>
    item?.month_year
  )
  const optimizedSalesData = categories?.map((category) => {
    const matchingItem = fulldataset1?.find(
      (item) => item.month_year === category
    );
    return matchingItem ? (matchingItem?.optimized_spends/1000)?.toFixed(2) : null;
  });
 
const plotdata=
[
    {
      name: "Scenario Predicted Sales Volume", data: 
      fulldataset2?.plot1?.map((item, index) => 
       item.predicted_sales!==null?(item?.predicted_sales/1000)?.toFixed(2):null
      )
    },       
    {
      name: "Optimized Sales Volume", data: 
      optimizedSalesData  

    },      
  ]
  return (
    <>
    <small>{range}</small>
   <div>
          Total Planned Predicted Sales Volume :
          {" "}
          
            <span>
              {Number(predictedsalesvolumebasescenarioselectedmonths.toFixed(2))?.toLocaleString("en-IN")}{" "}
              Tonnes
            </span>

        </div>

        <div className="mb-3">
          Total Optimized Sales Volume:
        <span>
        {Number(optimizedsalesvolumebasescenarioselectedmonths.toFixed(2))?.toLocaleString("en-IN")}{" "}
        
            Tonnes</span>


        </div> 
                            
    <Chart
    align="center"
    options={options}
    series={plotdata}
    type="line"
    height={400}
    width={'90%'}
  />
  </>
  )
}

export default LineChartOptimizer