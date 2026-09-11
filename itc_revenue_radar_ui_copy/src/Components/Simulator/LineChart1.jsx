import React, { useState,useEffect } from 'react'
import Chart from "react-apexcharts";
import { useDispatch } from 'react-redux';
import axios from "axios";
import getNotification from "../../Redux/Action/action.js";
import UserService from '../../services/UserService';
const { REACT_APP_REDIRECT_URI } = process.env;
const { REACT_APP_UPLOAD_DATA } = process.env;

function LineChart1({fulldataset1,fulldataset2,isValue,displaynames,range}) {
    useEffect(() => {
      // handledatemenu();
      handlevariablesfetch();
      // handlevariablesmenu();
    }, []);
     const [isfullYear,setIsFullYear]=useState(false)
const [endDate, setendDate] = useState("");
const  dispatch=useDispatch()
const reverseDate = (dateString) => {
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}
  const handlevariablesfetch = async () => {
    if (UserService.isLoggedIn()) {
      try {
      const FormData = require("form-data");
      const sendData = new FormData();
      const config = {
          method: "get",
          url: `${REACT_APP_UPLOAD_DATA}/app/fetchvars`,
          headers: {
            Accept: "text/plain",
            "Content-Type": "application/json",
            // "req-header":UserService.getToken()
          },
          data: sendData,
        };
        const getResponse = await axios(config);
        if (getResponse.data !== "Invalid User!") {
          if (Array.isArray(fulldataset2?.plot6) && fulldataset2.plot6.length > 0) {

            setendDate(fulldataset2?.plot6[fulldataset2?.plot6?.length - 1]?.month_year)

          }
          else {

            const [year, month] = fulldataset2?.plot1[0]?.month_year.split("-")
            setendDate(`${year}-0${Number(month) - 1}`)
            //console.log(`${year}-0${Number(month) - 1}`)
          }

       
          // setendDate(reverseDate(getResponse.data.dates[0].max[0].end_date));
          // setvariablesoptions(
          //   getResponse.data.variables?.map((it) => {
          //     return { value: it.attribute_name, label: it.attribute_name };
          //   })
          // );
                }
      } catch (err) {
        console.log("Server Error", err);
        if (err.response && err.response.status === 500) {
          dispatch(
            getNotification({
              message: "Server is Down! Please try again after sometime",
              type: "default",
            })
          );
        } else if (err.response && err.response.status === 400) {
          dispatch(
            getNotification({
              message: "Input is not in prescribed format",
              type: "default",
            })
          );
        } else if (err.response && err.response.status === 422) {
          dispatch(
            getNotification({
              message: "Input is not in prescribed format",
              type: "default",
            })
          );
        } else if (err.response && err.response.status === 404) {
          dispatch(
            getNotification({
              message: "Page not Found",
              type: "default",
            })
          );
        } else if (err.response && err.response.status === 401) {
          dispatch(
            getNotification({
              message: "Session expired! Please log in again",
              type: "default",
            })
          );
        } else {
          dispatch(
            getNotification({
              message: "Server is Down! Please try again after sometime",
              type: "default",
            })
          );
        }
      }
    } else {
      setTimeout(() => {
        UserService.doLogin({
          redirectUri: `${REACT_APP_REDIRECT_URI}/simulator`,
        });
      }, 1000);
    }
  };
 const [startYear, startMonth] = endDate?.split('-');

// Process and filter the dataset
const filteredDataplot1 = fulldataset1?.plot1.map(item => {
  // Extract year and month from the dataset's "month_year" field
  const [year, month] = item?.month_year.split('-').map(Number);

  // Check if the year-month is beyond the start date
  if (item?.month_year && item?.month_year>endDate) {
      return item; // Keep the item unchanged
  } else {
      return { ...item, predicted_sales: null }; // Nullify predicted_sales
  }
});

// Filtered Dataplot2
const filteredDataplot2 = fulldataset1?.plot7.map(item => {
  // Extract year and month with a fallback for invalid data
  const [year, month] = item?.month_year && item?.month_year !== "0" && item?.month_year.includes('-')
      ? item.month_year.split('-').map(Number)
      : [null, null];

  // Check if the year-month is beyond the start date
  if (item.month_year>endDate) {
      return item; // Keep the item unchanged
  } else {
      return { ...item, total_sales_value: null }; // Nullify total_sales_value
  }
});

// Predicted Sales Volume for Selected Months
const predictedsalesvolumebasescenarioselectedmonths = 
  fulldataset2?.plot1?.reduce((total, item) => {
      const [year, month] = item?.month_year?.split('-').map(Number);

      // Only add predicted sales if the date is within the target range
      if (item.month_year>endDate) {
          return total + (Number(item?.predicted_sales) || 0);
      }

      return total;
  }, 0) / 1000;
//console.log(endDate,predictedsalesvolumebasescenarioselectedmonths)
// Predicted Sales Value for Selected Months
const predictedsalesvaluebasescenarioselectedmonths = 
  fulldataset2?.plot7?.reduce((total, item) => {
      const [year, month] = item?.month_year?.split('-').map(Number);

      // Only add total sales value if the date is within the target range
      if (item.month_year>endDate) {
          return total + (Number(item?.total_sales_value) || 0);
      }

      return total;
  }, 0) / 100000;
const options=   {
    chart: {
      id: `Download-Predicted Sales`,
      type: "line",
      toolbar: {
        show: true,
      },
    },
    grid: {
      show: false,
    },
    title: {
      text:`${isValue?"Sales Value":"Sales Volume"}`,
      align: 'center',
      style: {
        fontWeight: "100",
        color: "#43474B",
      },
    },
    plotOptions: {},
   // colors: isfullYear?[ '#e66c37','#27ae60','#1e81b0']:[ '#f4d03f','#27ae60', '#1e81b0','#e66c37'],
    colors: isfullYear?[ '#27ae60','#1e81b0']:[ '#f4d03f','#27ae60', '#1e81b0','#e66c37'],
  
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "13px",
      },
      formatter: function (val) {
        return val ? Number((val).toFixed(2))?.toLocaleString("en-IN") : ""; // Return empty string if val is null/0
      },
    },
    xaxis: {
      categories: fulldataset2?.plot1?.map((item) =>
        item?.month_year?.trim()
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
            return (val)?.toFixed(2);
          },
        },
        axisBorder: {
          show: true, // Ensures Y-axis line is visible
        },
        title: {
          text: `${isValue?"Value (Lacs)":"Volume (Tonnes)"}`,
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
  const plotdataremmonths =
    [
      {
        name: isValue?`Predicted Sales Value (${displaynames?.scenario?.match("Reference")?"Reference":"Base"} Scenario)`:`Predicted Volume (${displaynames?.scenario?.match("Reference")?"Reference":"Base"} Scenario)`,
        data:isValue? fulldataset2?.plot7?.map((item) => item?.total_sales_value / 100000):fulldataset2?.plot1?.map((item) => item?.predicted_sales / 1000),
        show: true,
      },


      {
        name: isValue? "Scenario Predicted Sales Value":"Scenario Predicted Volume",
        data: isValue?filteredDataplot2?.map((item, index) =>
          item.total_sales_value !== null ? item?.total_sales_value  / 100000?.toFixed(2) : null
        ):filteredDataplot1?.map((item, index) =>
          item.predicted_sales !== null ? item?.predicted_sales / 1000?.toFixed(2) : null
        ),
      },
      ...(isValue && Array.isArray(fulldataset2?.plot8) && fulldataset2.plot8.length
        ? [
            {
              name: "Actual Sales Value",
              data: fulldataset2.plot8.map((item) => item?.actuals / 100000),
              show: true,
            },
          ]
        : !isValue && Array.isArray(fulldataset2?.plot6) && fulldataset2.plot6.length
        ? [
            {
              name: "Actual Volume",
              data: fulldataset2.plot6.map((item) => item?.actuals / 1000),
              show: true,
            },
          ]
        : []),
       
    ]
const plotdatafullyear= 
fulldataset1?.prev_fy_trend ?
[




    // {
    //   name: isValue?`Last Yr Predicted Sales Value (${fulldataset1?.prev_fy_trend[0].month_year?.split("-")[0]}-${Number(fulldataset1?.prev_fy_trend[0].month_year?.split("-")[0])+1})`:`Last Yr Predicted Sales Volume (${fulldataset1?.prev_fy_trend[0].month_year?.split("-")[0]}-${Number(fulldataset1?.prev_fy_trend[0].month_year?.split("-")[0])+1})`,
    //   data: isValue?fulldataset1?.prev_fy_trend?.map((item) => item?.contribution_sales_value / 100000):fulldataset1?.prev_fy_trend?.map((item) => item?.predicted_sales_volume / 1000),
    //   show: true
    // },
    {
      name: isValue? "Scenario Predicted Sales Value":"Scenario Predicted Volume",
      data: isValue?fulldataset1.plot1?.map((item, index) =>
        item.total_sales_value !== null ? item?.total_sales_value  / 100000?.toFixed(2) : null
      ):fulldataset1.plot1?.map((item, index) =>
        item.predicted_sales !== null ? item?.predicted_sales / 1000?.toFixed(2) : null
      ),
    },
    ...(isValue && Array.isArray(fulldataset2?.plot8) && fulldataset2.plot8.length
      ? [
          {
            name: "Actual Sales Value",
            data: fulldataset2.plot8.map((item) => item?.actuals / 100000),
            show: true,
          },
        ]
      : !isValue && Array.isArray(fulldataset2?.plot6) && fulldataset2.plot6.length
      ? [
          {
            name: "Actual Volume",
            data: fulldataset2.plot6.map((item) => item?.actuals / 1000),
            show: true,
          },
        ]
      : []),
   
]:[]
 


  // const plotdata = isValue
  // ?
  //  [
  //     {
  //       name: `Predicted Sales Value (${displaynames?.scenario?.match("Reference")?"Reference":"Base"} Scenario)`,
  //       data: fulldataset2?.plot7?.map((item) => item?.total_sales_value / 100000),
  //       show: true,
  //     },
    
     
  //     {
  //       name: "Scenario Predicted Sales Value (2023-24)",
  //       data: filteredDataplot2?.map((item, index) =>
  //         item.total_sales_value !== null ? item?.total_sales_value / 100000?.toFixed(2) : null
  //       ),
  //     },
  //     ...(fulldataset2?.plot8?.length
  //       ? [
  //           {
  //             name: "Actual Sales Value",
  //             data: fulldataset2?.plot8
  //               ?.slice(0, fulldataset2?.plot8?.length)
  //               ?.map((item) => item?.actuals / 100000),
  //             show: true,
  //           },
  //         ]
  //       : []),
  //       {
  //         name: "Last Yr Predicted Sales Value",
  //         data: fulldataset1?.prev_fy_trend?.map((item) => item?.contribution_sales_value / 100000),
  //         show: true,
  //       },
  //   ]
  // : [
  //     {
  //       name: `Predicted Volume (${displaynames?.scenario?.match("Reference")?"Reference":"Base"} Scenario)`,
  //       data: fulldataset2?.plot1?.map((item) => item?.predicted_sales / 1000),
  //       show: true,
  //     },
    
       
  //     {
  //       name: "Scenario Predicted Volume",
  //       data: filteredDataplot1?.map((item, index) =>
  //         item.predicted_sales !== null ? item?.predicted_sales / 1000?.toFixed(2) : null
  //       ),
  //     },
  //     ...(fulldataset2?.plot6?.length?
  //   [  {
  //       name: "Actual Volume",
  //       data: fulldataset2?.plot6
  //         ?.slice(0, fulldataset2?.plot6?.length)
  //         ?.map((item) => item?.actuals / 1000),
  //       show: true,
       
  //     }]:[]),
  //     {
  //       name: "Last Yr Predicted Sales Volume (2023-24)",
  //       data: fulldataset1?.prev_fy_trend?.map((item) => item?.predicted_sales_volume / 1000),
  //       show: true,
  //     },
  //   ];


  return (
    <>
    {fulldataset1?.prev_fy_trend && <div className='mx-5 my-2'>
      <select className='form-select rr-select w-25' onChange={(e)=>{
        if(e.target.value==="fullYear"){
          setIsFullYear(true)
        }
        else{
          setIsFullYear(false)
        }
      }}>
        <option>{range}</option>
        <option value="fullYear">Full Financial Year</option>
      </select>
    </div>}

      <div className="mx-5 mt-1 text-start">
      <div>
          <small className=''>Time Period: {isfullYear?fulldataset1?.plot1[0].fy:range}</small>
        </div>
        
        {isfullYear? <div>
        Total Predicted Sales {isValue?"Value":"Volume"} ({fulldataset1?.prev_fy_trend[0].month_year?.split("-")[0]}-{Number(fulldataset1?.prev_fy_trend[0].month_year?.split("-")[0])+1}):
        {" "}
      
          {isValue ?
            <span>
              {Number(fulldataset1?.prev_fy_trend?.reduce((prev, next) =>
              prev + Number(next.contribution_sales_value/100000), 0
               
              )?.toFixed(2))?.toLocaleString("en-IN")}{" "}
              Lacs
            </span> :
            <span>
              {Number(fulldataset1?.prev_fy_trend?.reduce((prev, next) =>
              prev + Number(next.predicted_sales_volume/1000), 0
               
              )?.toFixed(2))?.toLocaleString("en-IN")}{" "}
              Tonnes
            </span>}

        </div>:
        <div>
        Total Predicted Sales {isValue?"Value":"Volume"} ({displaynames?.scenario?.match("Reference")?"Reference":"Base"} Scenario):
        {" "}
      
          {isValue ?
            <span>
              {Number(predictedsalesvaluebasescenarioselectedmonths?.toFixed(2))?.toLocaleString("en-IN")}{" "}
              Lacs
            </span> :
            <span>
              {Number(predictedsalesvolumebasescenarioselectedmonths.toFixed(2))?.toLocaleString("en-IN")}{" "}
              Tonnes
            </span>}

        </div>}
        {isfullYear? 
        <div className=" text-start">
        Total Predicted Sales  {isValue ? "Value" : "Volume"} ({displaynames.scenario}):
        {isValue ? <span>
          {Number(((plotdatafullyear[0]?.data.reduce((prev, next) =>
            prev + Number(next), 0
          )))?.toFixed(2))?.toLocaleString("en-IN")}{" "} Lacs
        </span> : <span>{Number(((plotdatafullyear[0]?.data.reduce((prev, next) =>
          prev + Number(next), 0
        )))?.toFixed(2))?.toLocaleString("en-IN")}{" "}
          Tonnes</span>}


      </div>:
        <div className=" text-start">
          Total Predicted Sales  {isValue ? "Value" : "Volume"} ({range}) ({displaynames.scenario}):
          {isValue ? <span>
            {Number(((plotdataremmonths[1]?.data.reduce((prev, next) =>
              prev + Number(next), 0
            )))?.toFixed(2))?.toLocaleString("en-IN")}{" "} Lacs
          </span> : <span>{Number(((plotdataremmonths[1]?.data.reduce((prev, next) =>
            prev + Number(next), 0
          )))?.toFixed(2))?.toLocaleString("en-IN")}{" "}
            Tonnes</span>}


        </div>}
        {
        isfullYear &&
        <div>
        Percentage Difference:
        {isValue ?
        <span>
{
  ((Number(((plotdatafullyear[0]?.data.reduce((prev, next) =>
    prev + Number(next), 0
  ))))-
  Number(fulldataset1?.prev_fy_trend?.reduce((prev, next) =>
    prev + Number(next.contribution_sales_value/100000), 0
     
    )))/Number(fulldataset1?.prev_fy_trend?.reduce((prev, next) =>
      prev + Number(next.contribution_sales_value/100000), 0
       
      ))*100).toFixed(2) 
} %
        </span>:
        <span>
          
         { ((Number(((plotdatafullyear[0]?.data.reduce((prev, next) =>
          prev + Number(next), 0
        ))))
        -Number(fulldataset1?.prev_fy_trend?.reduce((prev, next) =>
              prev + Number(next.predicted_sales_volume/1000), 0
               
              )))*100/
              Number(fulldataset1?.prev_fy_trend?.reduce((prev, next) =>
                prev + Number(next.predicted_sales_volume/1000), 0
                 
                )))?.toFixed(2)
              
              }%
        </span> }
             </div>

       }
  





                             
                             </div>
                         
                            { !displaynames?.scenario?.startsWith("Y_") &&
    <div className='my-2'>
      {isfullYear 
           ?  <Chart
           key={0}
           align="center"
           options={options}
           series={plotdatafullyear}
           type="line"
           height={400}
           width={'90%'}
         />:
           <Chart
           key={1}
             align="center"
             options={options}
             series={plotdataremmonths}
             type="line"
             height={400}
             width={'90%'}
           />}
  </div>}
  </>
  )
}

export default LineChart1