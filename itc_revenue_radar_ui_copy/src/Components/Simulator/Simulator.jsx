import React from "react";
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'
import { useState, useEffect, useRef } from "react";
import Loader from "react-js-loader";
import Select, { components } from "react-select";
import { useDispatch, useSelector } from "react-redux";
import UserService from "../../services/UserService";
import getNotification from "../../Redux/Action/action";
import axios from "axios";
import LoaderCustom from "../LoaderCustom";
import VariableTable from "./VariableTable";
import PieCharts from "./PieCharts";
import SingleBarChart1 from "./SingleBarChart1";
import SingleBarChart2 from "./SingleBarChart2";
import SingleBarChart3 from "./SingleBarChart3";
import LineChart1 from "./LineChart1";
import { downloadPdf, uploadPDF, notifyRequestError, requireLogin, defaultJsonHeaders, formatPlotMonthYear, getCurrentFormattedTime, getBrandAbb, isValidScenarioName } from "../HelperFunction/helperFunction";
import { loadBrandFy, loadMarkets } from "../../Redux/session/sessionSlice";
import SingleBarChart4 from "./SingleBarChart4";
import SingleBarChart5 from "../Simulator/SingleBarChart5";
import SingleBarChart6 from "./SingleBarChart6";
import SingleBarChart7 from "./SingleBarChart7";
import AnnualData from "./AnnualData";
import SingleBarChart8 from "./SingleBarChart8";
import maskedBrandOption from '../JSON Files/MaskedBrandOption.json'
import { toast } from "react-toastify";
import { consumeScenarioPrefill } from "../Brand_Manager_Dashboard/ChatBot/revenueBotChatCore";
const { REACT_APP_UPLOAD_DATA } = process.env;
const { REACT_APP_UPLOAD_DATA2 } = process.env;
const XLSX = require("xlsx");

function Simulator() {
  const [savedmasterscenarioname, setsavedmasterscenarioname] = useState("")
  const [isprocessing, setisprocessing] = useState(false)
  const [endDate, setEndDate] = useState("");
  const [actualsEndMonthYear, setactualsEndMonthYear] = useState('')
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);
  const dispatch = useDispatch();
  const yearoptions = useSelector((state) => state.session?.fyOptions || []);
  const brandoptions = useSelector((state) => state.session?.brandOptions || []);
  const marketsByBrand = useSelector((state) => state.session?.marketsByBrand || {});
  const [createfrombaseoruploadfileswitch, setcreatefrombaseoruploadfileswitch] = useState(false)
  const [fulldataset, setfulldataset] = useState([])
  const [fulldataset2, setfulldataset2] = useState([])
  const [timetype, settimetype] = useState("")
  const [mape, setmape] = useState(0)
  const [isValue, setisValue] = useState(false)
  const [predictedsalesvaluelastfy, setpredictedsalesvaluelastfy] = useState(0)
  const [originaldatasetforcolorcoding, setoriginaldatasetforcolorcoding] = useState([])
  const [modifybtn, setmodifybtn] = useState(false)
  const [fromrangeonplots, setfromrangeonplots] = useState("")
  const [uploadfile, setuploadfile] = useState("")
  const [market, setmarket] = useState("");
  const [options1, setoptions1] = useState({})
  const [plotdata1, setplotdata1] = useState([]);
  const [uniquescenarioname, setuniquescenarioname] = useState(false)
  const [savednewbasescenarioname, setsavednewbasescenarioname] = useState([])
  const [newbasedetailsold, setnewbasedetailsold] = useState({})
  const [newbasedetailscreatenew, setnewbasedetailscreatenew] = useState({})
  const [getAnnualOptimizePlan, setGetAnnualOptimizePlan] = useState({})
  const [loader, setloader] = useState(false);
  const [loader1, setloader1] = useState(false);
  const [loader2, setloader2] = useState(false);
  const [loader3, setloader3] = useState(false);
  const [loader4, setloader4] = useState(false);
  const [loader5, setloader5] = useState(false);
  const [loader6, setloader6] = useState(false);
  const [scenariooptions, setscenariooptions] = useState([{ scenario_name: "Base Scenario", scenario_timestamp: "2024-10-22 14:11:01" }]);
  const [scenarionewoldscreen, setscenarionewoldscreen] = useState("Select")
  const [viewscenariobtn, setviewscenariobtn] = useState(false)
  const [viewscenariodatatable, setviewscenariodatatable] = useState(false)
  const [viewscenariodatatable2, setviewscenariodatatable2] = useState(false)
  const [newscenariofile, setnewscenariofile] = useState("")
  const [viewnewbasescenariodata, setviewnewbasescenariodata] = useState(false)
  const [viewannualoptimizeplan, setviewannualoptimizeplan] = useState(false)
  const [isHovered, setIsHovered] = useState(true);
  const [torangeonplots, settorangeonplots] = useState("")
  const [displaynames, setdisplaynames] = useState({});
  const [displaynames2, setdisplaynames2] = useState({});

  const [edit, setedit] = useState([]);
  const [selectedzone, setselectedzone] = useState("National")
  const [selectedbrand, setselectedbrand] = useState("");
  const marketoptions = marketsByBrand[selectedbrand] || [];
  const [selectedscenarioname, setselectedscenarioname] = useState("");
  const [selectedscenarioid, setselectedscenarioid] = useState("");
  const [selectedscenarionametimestamp, setselectedscenarionametimestamp] =
    useState("");
  const [selectedyear, setselectedyear] = useState("");
  const [resultscreen, setresultscreen] = useState(false);
  const [resultscreen2, setresultscreen2] = useState(false);
  const [newscenarionamegiven, setnewscenarionamegiven] = useState("");
  const [originalset, setoriginalset] = useState([]);
  const [sampledataset, setsampledataset] = useState(
    []);
  const [uploadfileoldscenarios, setuploadfileoldscenarios] = useState("")
  const [uploadfiledata, setuploadfiledata] = useState([])

  const [tablepredictionsdataset, settablepredictionsdataset] = useState([]);
  const [tablecontributiondataset, settablecontributiondataset] = useState([]);
  const sectionRef = useRef(null);

  const [scenarioNameErrorFlag, setScenarioNameError] = useState(false)
  const chatbotPrefillRef = useRef(false)

  const runSimulate = () => {
    if (isprocessing || loader) return;
    if (!chatbotPrefillRef.current) fetchdatasettable2();
    handlesimulate();
  };

  useEffect(() => {
    handlevariablesfetchfybrand();
    const prefill = consumeScenarioPrefill();
    if (!prefill) return;
    chatbotPrefillRef.current = Boolean(prefill.from_chatbot);
    if (prefill.fy) setselectedyear(prefill.fy);
    if (prefill.brand) setselectedbrand(prefill.brand);
    if (prefill.market) setmarket(prefill.market);
    if (prefill.timetype) settimetype(prefill.timetype);
    if (prefill.scenario_name) {
      setscenarionewoldscreen(prefill.scenarionewoldscreen || "old");
      setselectedscenarioname(prefill.scenario_name);
    }
    if (prefill.scenario_timestamp) {
      setselectedscenarionametimestamp(prefill.scenario_timestamp);
    }
  }, []);

  useEffect(() => {
    handlefetchmarket()
    handlevariablesfetch()
  }, [selectedbrand])
  useEffect(() => {
    handlescenariosfetch()
  }, [market])

  const today1 = new Date();
  const currentYear = today1.getFullYear();
  const currentMonth = today1.getMonth();

  let unblockeddate;
  if (currentMonth >= 3) {
    unblockeddate = new Date(currentYear, currentMonth, 1);
  } else {
    const currentmonth15thdate = new Date(today1.getFullYear(), today1.getMonth(), 1);
    const isBefore15th = new Date() < currentmonth15thdate;
    unblockeddate = isBefore15th ? new Date(today1.getFullYear(), today1.getMonth() - 3, 1) : new Date(today1.getFullYear(), today1.getMonth() - 3, 1);
  }

  const MonthBeforeUnlockMonth = `${unblockeddate.getFullYear()}-${String(unblockeddate.getMonth() + 1).padStart(2, "0")}`;
  const MonthBeforeUnlockMonthreverse = MonthBeforeUnlockMonth.split("-").reverse().join("-");

  const handlevariablesfetch = async () => {
    if (UserService.isLoggedIn()) {
      try {
        setisprocessing(true)
        const FormData = require("form-data");
        const sendData = new FormData();
        const config = {
          method: "get",
          url: `${REACT_APP_UPLOAD_DATA}/app/fetchvars`,
          headers: {
            ...defaultJsonHeaders,
            // "req-header":UserService.getToken()
          },
          data: sendData,
        };
        const getResponse = selectedbrand ? await axios(config) : [];
        if (getResponse.status === 200) {

          let inputDate = getResponse.data.dates[0].max[0].end_date

          const [day, month, year] = inputDate.split("-").map(Number);
          const date = new Date(year, month, day); // Month is zero-based in JS Date
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
          setEndDate(formattedDate)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/simulator");
    }
    setisprocessing(false)
  };
  const handlefetchnewbasescenario = async (type) => {
    if (UserService.isLoggedIn()) {
      try {

        const FormData = require("form-data");
        const sendData = new FormData();
        sendData.append("fy", selectedyear)
        sendData.append("brand", selectedbrand)
        sendData.append("market", market)

        // sendData.append("scenario_timestamp",selectedscenarionametimestamp)
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/get_new_base_scenario_names`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: sendData,
        };

        const getResponse = await axios(config);

        if (getResponse.data.length > 0 && getResponse.status === 200) {
          let selectedyrsplit = selectedyear?.split("-")
          //let arr = getResponse?.data?.data?.filter((it) => type === it?.frequency && Number(it?.fy?.split("-")[0]) + 1 === Number(selectedyrsplit[0]) && Number(it?.fy?.split("-")[1]) + 1 === Number(selectedyrsplit[1]))
          let arr = getResponse?.data?.filter((it) => it?.fy === selectedyear)
          if (arr.length > 0) {
            setnewbasedetailscreatenew(arr[0])
          }
          else {

            setnewbasedetailscreatenew({})
          }
        }

      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/simulator");
    }
  };

  const handleFetchAnnualOptimizePlan = async () => {
    if (UserService.isLoggedIn()) {
      try {

        const FormData = require("form-data");
        const sendData = new FormData();
        sendData.append("fy", selectedyear)
        sendData.append("brand", selectedbrand)
        sendData.append("market", market)

        // sendData.append("scenario_timestamp",selectedscenarionametimestamp)
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/get_qtr_optimal_scenario_names`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: sendData,
        };

        const getResponse = await axios(config);

        if (getResponse.data.length > 0 && getResponse.status === 200) {
          let selectedyrsplit = selectedyear?.split("-")
          //let arr = getResponse?.data?.data?.filter((it) => type === it?.frequency && Number(it?.fy?.split("-")[0]) + 1 === Number(selectedyrsplit[0]) && Number(it?.fy?.split("-")[1]) + 1 === Number(selectedyrsplit[1]))
          let arr = getResponse?.data?.filter((it) => it?.fy === selectedyear)
          if (arr.length > 0) {
            setGetAnnualOptimizePlan(arr[0])
          }
          else {

            setGetAnnualOptimizePlan({})
          }
        }

      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/simulator");
    }
  };

  
  const scrollToSection = (sectionname) => {
    // Replace 'section2' with the id of the section you want to scroll to

    if (document.getElementById(sectionname)) {
      document
        .getElementById(sectionname)
        .scrollIntoView({ behavior: "smooth" });
    } else {
      dispatch(
        getNotification({
          message: "Please proceed with first analysis ",
          type: "Default",
        })
      );
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger the file input click
  };

  const handleFileUploadoldscenario = (event) => {

    const files = event.target.files;
    // Handle the uploaded files here
    handleimportoldscenarios(files)
  };

  const handleexportoldscenarios = () => {

    const data = [];

    const headers = [];
    headers.push("Scenario")
    headers.push("brand")
    headers.push("final_market")
    headers.push("fy")
    headers.push(["Attribute"]);

    const monthHeaders = sampledataset[0].month_data?.map((it) => { return it?.month_year || it?.fy || it?.quarter || it?.half_year })
    headers.push(...monthHeaders, "subtotal");
    data.push(headers);
    sampledataset?.filter((varItem) =>
      !ExceptionVariables.hiddenvariables.some((it) => it === varItem.attribute_name)
    )
      ?.forEach((item) => {
        // Extract the attribute name
        const scenario_name = displaynames2.scenario;
        const brand_name = item.brand;
        const final_market_name = item.final_market;
        const fy = item.fy;
        const attributeName = item.attribute_name;
        // Process month_data and extract values
        const monthDataValues = item.month_data.map((month) => {
          const value = month.attribute_value;
          return Array.isArray(value) && value.length === 0 ? "No matched category" : value;
        });

        // Calculate subtotal (e.g., summing numeric values)
        const subtotal = monthDataValues.reduce((sum, val) => {
          return typeof val === "number" ? sum + val : sum;
        }, 0);

        // Push the row data
        data.push([scenario_name, brand_name, final_market_name, fy, attributeName, ...monthDataValues, subtotal]);
      });

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create a new worksheet and add data to it
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Convert the workbook to a binary Excel file
    const excelBuffer = XLSX.write(workbook, { type: "array" });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    // Create a URL from the Blob
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${displaynames2.brand}-${displaynames2.market}-${displaynames2.scenario}.xlsx`;
    link.click();

  }

  const handleimportoldscenarios = (file) => {
    try {
      setloader4(true)
      //console.log(file)
      const reader = new FileReader();
      reader.readAsBinaryString(file[0]);
      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Assuming the first sheet contains the data
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert Excel data to JSON format
        const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // First row is assumed to be headers (e.g., ["Attribute", "Month 1", "Month 2", ..., "Subtotal"])
        const headers = excelData[0];
        const rows = excelData.slice(1);
        const formattedData = excelData.slice(1).map(row => {
          const keys = excelData[0]; // First row contains the keys
          return keys.reduce((obj, key, index) => {
            obj[key] = row[index]; // Map the key to the corresponding value in the row
            return obj;
          }, {});
        });

        const validCombination = rows.some(row =>
          row[0] === displaynames2.scenario && row[1] === displaynames2.brand && row[2] === displaynames2.market && row[3] === displaynames2.fy
        );

        if (!validCombination) {
          dispatch(getNotification({
            message: "Invalid combination of Scenario, Brand,FY and Market!",
            type: "danger"
          }));
          return;
        }

        let datasetprevious = [...sampledataset]
        if (rows[0].length - 6 !== datasetprevious[0].month_data.length) {
          dispatch(getNotification({
            message: "Time Period type does not match!!",
            type: "danger"
          }));
          return;
        }

        // Update the original JSON set

        if (datasetprevious[0]?.month_data?.length === 1) {
          datasetprevious.forEach((item) => {
            const row = rows.find((r) => r[4] === item.attribute_name); // Match by attribute name
            if (row) {
              // Update the month_data values

              item.month_data.forEach((month, index) => {

                if (index < row.length - 1) {
                  month.attribute_value = row[index + 5];
                }
              });

            }
          });
          datasetprevious = datasetprevious?.map((variable, variableIndex) => {
            const attributeName = variable?.attribute_name;

            variable.subtotal = variable.month_data.reduce(
              (acc, value) => acc + parseFloat(value.attribute_value),
              0
            );
            // Check for lastPriceAvailableVariables condition

            return variable; // Ensure the modified variable is returned
          });
        }
        else if (datasetprevious[0]?.month_data?.length == 4) {

          datasetprevious.forEach((item) => {
            const row = rows.find((r) => r[4] === item.attribute_name); // Match by attribute name
            if (row) {
              // Update the month_data values

              item.month_data.forEach((month, index) => {

                if (index < row.length - 1) { // Ensure index is within Excel data range
                  month.attribute_value = row[index + 5]; // Skip the "Attribute" column in Excel
                }

                else {
                  month.attribute_value = row[index + 5];
                }
              });

            }
          });
          datasetprevious = datasetprevious?.map((variable, variableIndex) => {
            const attributeName = variable?.attribute_name;

            // Check for maxVariables or zeroOrOneVariables conditions
            if (
              ExceptionVariables?.maxVariables?.some((varName) => varName === attributeName) ||
              ExceptionVariables?.zeroOrOneVariables?.some((varName) => varName === attributeName)
            ) {
              variable.subtotal = Math.max(
                ...variable.month_data.map((item) => item.attribute_value)
              );
            }
            // Check for lastPriceAvailableVariables condition
            else if (
              ExceptionVariables?.lastPriceAvailableVariables?.some((varName) => varName === attributeName)
            ) {
              const latestMonthData = variable.month_data.reduce((latest, current) => {
                if (current.attribute_value !== 0 && (!latest || current.quarter > latest.quarter)) {
                  return current;
                }
                return latest;
              }, null);

              variable.subtotal = latestMonthData ? latestMonthData.attribute_value : 0;
            }

            // Handle other conditions
            else {
              if (variable.type === ExceptionVariables?.variabletypes[2]) {
                variable.subtotal = variable.month_data.reduce(
                  (acc, value) => acc + parseFloat(value.attribute_value),
                  0
                );
              } else {
                variable.subtotal = variable.month_data.reduce(
                  (acc, value) => acc + parseFloat(value.attribute_value),
                  0
                );
              }
            }

            return variable; // Ensure the modified variable is returned
          });
        }
        else if (datasetprevious[0]?.month_data?.length == 2) {

          datasetprevious.forEach((item) => {
            const row = rows.find((r) => r[4] === item.attribute_name); // Match by attribute name
            if (row) {
              // Update the month_data values

              item.month_data.forEach((month, index) => {

                if (index < row.length - 1) { // Ensure index is within Excel data range
                  month.attribute_value = row[index + 5]; // Skip the "Attribute" column in Excel
                }

                else {
                  month.attribute_value = row[index + 5];
                }
              });

            }
          });
          datasetprevious = datasetprevious?.map((variable, variableIndex) => {
            const attributeName = variable?.attribute_name;

            // Check for maxVariables or zeroOrOneVariables conditions
            if (
              ExceptionVariables?.maxVariables?.some((varName) => varName === attributeName) ||
              ExceptionVariables?.zeroOrOneVariables?.some((varName) => varName === attributeName)
            ) {
              variable.subtotal = Math.max(
                ...variable.month_data.map((item) => item.attribute_value)
              );
            }
            // Check for lastPriceAvailableVariables condition
            else if (
              ExceptionVariables?.lastPriceAvailableVariables?.some((varName) => varName === attributeName)
            ) {
              const latestMonthData = variable.month_data.reduce((latest, current) => {
                if (current.attribute_value !== 0 && (!latest || current.quarter > latest.quarter)) {
                  return current;
                }
                return latest;
              }, null);

              variable.subtotal = latestMonthData ? latestMonthData.attribute_value : 0;
            }

            // Handle other conditions
            else {
              if (variable.type === ExceptionVariables?.variabletypes[2]) {
                variable.subtotal = variable.month_data.reduce(
                  (acc, value) => acc + parseFloat(value.attribute_value),
                  0
                );
              } else {
                variable.subtotal = variable.month_data.reduce(
                  (acc, value) => acc + parseFloat(value.attribute_value),
                  0
                );
              }
            }

            return variable; // Ensure the modified variable is returned
          });
        }
        else {
          datasetprevious.forEach((item) => {
            const row = rows.find((r) => r[4] === item.attribute_name); // Match by attribute name
            if (row) {
              // Update the month_data values

              item.month_data.forEach((month, index) => {

                if (month?.month_year && month?.month_year > endDate && index < row.length - 1) { // Ensure index is within Excel data range
                  month.attribute_value = row[index + 5]; // Skip the "Attribute" column in Excel
                }

                else {

                }
              });

            }
          });
          datasetprevious = datasetprevious?.map((variable, variableIndex) => {
            const attributeName = variable?.attribute_name;

            // Check for maxVariables or zeroOrOneVariables conditions
            if (
              ExceptionVariables?.maxVariables?.some((varName) => varName === attributeName) ||
              ExceptionVariables?.zeroOrOneVariables?.some((varName) => varName === attributeName)
            ) {
              variable.subtotal = Math.max(
                ...variable.month_data.map((item) => item.attribute_value)
              );
            }
            // Check for lastPriceAvailableVariables condition
            else if (
              ExceptionVariables?.lastPriceAvailableVariables?.some((varName) => varName === attributeName)
            ) {
              const latestMonthData = variable.month_data.reduce((latest, current) => {
                if (current.attribute_value !== 0 && (!latest || current.month_year > latest.month_year)) {
                  return current;
                }
                return latest;
              }, null);

              variable.subtotal = latestMonthData ? latestMonthData.attribute_value : 0;
            }

            // Handle other conditions
            else {
              if (variable.type === ExceptionVariables?.variabletypes[2]) {
                variable.subtotal = variable.month_data.reduce(
                  (acc, value) => acc + parseFloat(value.attribute_value),
                  0
                );
              } else {
                variable.subtotal = variable.month_data.reduce(
                  (acc, value) => acc + parseFloat(value.attribute_value),
                  0
                );
              }
            }

            return variable; // Ensure the modified variable is returned
          });
        }

        setsampledataset(datasetprevious)
        setoriginalset(datasetprevious)
      };

    }
    catch (error) {
      console.log(error)
      dispatch(getNotification({
        message: "Please upload correct file format!",
        type: "danger"
      }))
    }
    setloader4(false)

  }
  const handleimportoldscenarios2 = (file) => {
    setloader4(true)
    try {

      //console.log(file)
      const reader = new FileReader();
      reader.readAsBinaryString(file[0]);
      reader.onload = async (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        // Assuming the first sheet contains the data
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Convert Excel data to JSON format
        const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // First row is assumed to be headers (e.g., ["Attribute", "Month 1", "Month 2", ..., "Subtotal"])
        const headers = excelData[0];
        const rows = excelData.slice(1);

        setselectedbrand(rows[0][1])
        setmarket(rows[0][2])
        setselectedyear(rows[0][3])
        setscenarionewoldscreen("old")
        setselectedscenarioname(rows[0][0])
        let arr = scenariooptions.filter((it) => { return rows[0][0] === it.scenario_name })
        setselectedscenarionametimestamp(arr[0]?.created_dt)

        const FormData = require("form-data");
        const sendData = new FormData();
        let config;
        sendData.append("scenario_name", rows[0][0]);
        sendData.append("user_id", "admin");
        sendData.append("final_market", rows[0][2]);
        sendData.append('brand', rows[0][1])
        if (selectedscenarioname === "Base Scenario") {
          // sendData.append("fin_year", selectedyear);

          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/basegetscenariodata`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData,
          };
        } else {

          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/getscenariodata`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData,
          };
        }

        // Now you can use `config` without any errors
        const getResponse = await axios(config);
        let datasetprevious = getResponse?.data

        if (rows[0].length - 6 !== datasetprevious[0]?.month_data.length) {
          dispatch(getNotification({
            message: "Time Period type does not match!!",
            type: "danger"
          }));
          return;
        }
        datasetprevious.forEach((item) => {
          const row = rows.find((r) => r[4] === item.attribute_name); // Match by attribute name
          if (row) {

            Object.assign(item, {
              brand: row[1],
              fy: row[3],
              final_market: row[2],
            });

            item?.month_data.forEach((month, index) => {
              if (index < row.length - 1) { // Ensure index is within Excel data range
                month.attribute_value = row[index + 5]; // Skip the "Attribute" column in Excel
              }
            });
          }
        });

        setsampledataset(datasetprevious)
        setoriginalset(datasetprevious)
        setviewscenariodatatable(true)
      };

    }
    catch (error) {
      console.log(error)
      dispatch(getNotification({
        message: "Please upload correct file format!",
        type: "danger"
      }))
    }
    setloader4(false)

  }

  const handlevariablesfetchfybrand = async () => {
    if (UserService.isLoggedIn()) {
      try {
        await dispatch(loadBrandFy()).unwrap();
      } catch (err) {
        console.log("Server Error", err);
        if (err?.response) {
          notifyRequestError(dispatch, err);
        } else if (err?.message) {
          dispatch(getNotification({ message: err.message, type: "danger" }));
        }
      }
    } else {
      requireLogin("/simulator");
    }
  };
  const handlefetchmarket = async () => {
    if (UserService.isLoggedIn()) {
      try {
        await dispatch(loadMarkets(selectedbrand)).unwrap();
      } catch (err) {
        console.log("Server Error", err);
        if (err?.response) {
          notifyRequestError(dispatch, err);
        } else if (err?.message) {
          dispatch(getNotification({ message: err.message, type: "danger" }));
        }
      }
    } else {
      requireLogin("/simulator");
    }
  };

  const handlescenariosfetch = async () => {
    if (UserService.isLoggedIn()) {
      try {
        const FormData = require("form-data");
        const sendData = new FormData();
        sendData.append("brand", selectedbrand)
        sendData.append("market", market)
        sendData.append("fy", selectedyear)
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/get_scenario_names`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: sendData,
        };
        const getResponse = await axios(config);
        // console.log(getResponse)
        if (getResponse.data !== "Invalid User!") {
          setscenariooptions(getResponse.data?.filter((scenario) => scenario.scenario_name !== "Base Scenario")?.sort((a, b) => new Date(b.created_dt) - new Date(a.created_dt))?.map((it) => {
            return {
              label: it.scenario_name,
              value: it.scenario_name,
              timestamp: it.created_dt
            }
          }))

          // setscenariooptions(getResponse.data)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/simulator");
    }
  };

  const scrollToTop = () => {
    if (sectionRef.current) {
      const yOffset = -50; // Adjust this value based on your preference
      const elementTop = sectionRef.current.offsetTop;
      const offsetPosition = elementTop + yOffset;

      window.scrollBy(500, 500);
      // window.scroll({
      //   top: offsetPosition,
      //   behavior: 'smooth',
      // });
    }
  };

  const fetchdatasettablenewbasescenario = async () => {
    if (UserService.isLoggedIn()) {
      if (true) {
        try {
          setloader2(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;

          let getResponse = []
          let successfulResponse = []
          //console.log(newbasedetailscreatenew)

          if (timetype === "Y") {
            sendData.append("scenario_name", `Y_${newbasedetailscreatenew?.scenario_name}`);
            sendData.append("scenario_timestamp", newbasedetailscreatenew?.created_dt);
            sendData.append("user_id", "admin");
            sendData.append("final_market", newbasedetailscreatenew?.final_market);
            sendData.append("brand", newbasedetailscreatenew?.brand)
            sendData.append("fy", selectedyear)

            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/annualbasegetscenariodata`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }
          else if (timetype === "Q") {
            sendData.append("scenario_name", `Q_${newbasedetailscreatenew?.scenario_name}`);
            sendData.append("scenario_timestamp", newbasedetailscreatenew?.created_dt);
            sendData.append("user_id", "admin");
            sendData.append("final_market", newbasedetailscreatenew?.final_market);
            sendData.append("brand", newbasedetailscreatenew?.brand)
            sendData.append("fy", selectedyear)
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/qtrbasegetscenariodata`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }
          else if (timetype === "HY") {
            sendData.append("scenario_name", `HY_${newbasedetailscreatenew?.scenario_name}`);
            sendData.append("scenario_timestamp", newbasedetailscreatenew?.created_dt);
            sendData.append("user_id", "admin");
            sendData.append("final_market", newbasedetailscreatenew?.final_market);
            sendData.append("brand", newbasedetailscreatenew?.brand)
            sendData.append("fy", selectedyear)
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/HYbasegetscenariodata`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }
          else {
            sendData.append("scenario_name", newbasedetailscreatenew?.scenario_name);
            sendData.append("scenario_timestamp", newbasedetailscreatenew?.created_dt);
            sendData.append("user_id", "admin");
            sendData.append("final_market", newbasedetailscreatenew?.final_market);
            sendData.append("brand", newbasedetailscreatenew?.brand)
            sendData.append("fy", selectedyear)
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/basegetscenariodata`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }

          getResponse = await axios(config)

          if (getResponse?.data?.length > 0 && getResponse?.data[0] !== "No Records Found" && getResponse?.data[0].Error !== "Invalid User!") {
            setviewnewbasescenariodata(true)
            setviewscenariodatatable(false)
            setresultscreen(true)
            setdisplaynames2({
              ...displaynames2,
              brand: selectedbrand,
              scenario: "newbase",
              market: market,
              fy: selectedyear
            })
            const mediaVariables = getResponse?.data
              .filter(item => item.type === "Media")
              .sort((a, b) => {
                // First, sort by variable_type (assuming it's a string)
                if (a.variable_type < b.variable_type) return -1;
                if (a.variable_type > b.variable_type) return 1;

                // If variable_type is the same, sort by subtotal (descending order)
                return b.subtotal - a.subtotal;
              });

            const cpAttributes = getResponse?.data
              .filter(item => item.attribute_name.startsWith("CP") || item.attribute_name.startsWith("cp"))
              .sort((a, b) => b.subtotal - a.subtotal);

            const otherAttributes = getResponse?.data
              .filter(
                item =>
                  item.type !== "Media" &&
                  !item.attribute_name.startsWith("CP") &&
                  !item.attribute_name.startsWith("cp")
              )
              .sort((a, b) => {
                const customOrder = ExceptionVariables.customOrder;

                // Ensure "Distribution" is always on top
                if (a.attribute_name === "Distribution") return -1;
                if (b.attribute_name === "Distribution") return 1;

                const getIndex = (variableType) => {
                  return customOrder.findIndex(order => variableType.includes(order));
                };

                let indexA = getIndex(a.variable_type);
                let indexB = getIndex(b.variable_type);

                // Move elements not found in customOrder to the end
                if (indexA === -1) indexA = Infinity;
                if (indexB === -1) indexB = Infinity;

                return indexA - indexB;
              });

            const arrangeddataset = [...otherAttributes, ...mediaVariables, ...cpAttributes]

            setsampledataset(arrangeddataset)
            setoriginalset(arrangeddataset);
            setoriginaldatasetforcolorcoding(arrangeddataset)

          }

          else {
            dispatch(
              getNotification({
                message: `There is no valid data to display for selected brand and scenario combination`,
                type: "default",
              })
            );
            setresultscreen2(false)
          }

        } catch (err) {
          console.log("Server Error", err);
          // if (displaynames) {
          //   setselectedbrand(displaynames.brand || brandoptions[0].brand)
          //   setselectedscenarioname(displaynames.scenarioname || scenariooptions[0].scenario_name)
          //   setselectedyear(displaynames.fy || '2024-25')
          //   setmarket(displaynames.market || "Select")
          // }

          // else{
          //       setselectedscenarioname(scenariooptions[0].scenario_name)
          //       setselectedscenarioid(scenariooptions[0].id)
          //       setselectedbrand(brandoptions[0]?.brand)
          //       setselectedzone('National')
          //       setselectedyear('2021-22')
          // }
          //handleMouseEnter()
          notifyRequestError(dispatch, err);
        }
      }
      else {
        dispatch(
          getNotification({
            message: "Please select market to view scenario data!!",
            type: "danger",
          })
        );
      }
    } else {
      requireLogin("/simulator");
    }
    setloader2(false);

    setTimeout(() => {
      scrollToSection("attributetable")

    }, 1000);

  };

  const fetchanuualoptimalplan = async () => {
    if (UserService.isLoggedIn()) {
      if (true) {
        try {
          setloader2(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;

          let getResponse = []
          let successfulResponse = []
          //console.log(newbasedetailscreatenew)

          if (timetype === "Q") {
            sendData.append("scenario_name", `${getAnnualOptimizePlan?.scenario_name}`);
            sendData.append("scenario_timestamp", getAnnualOptimizePlan?.created_dt);
            sendData.append("user_id", "admin");
            sendData.append("final_market", getAnnualOptimizePlan?.final_market);
            sendData.append("brand", getAnnualOptimizePlan?.brand)
            sendData.append("fy", selectedyear)
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/qtrbasegetscenariodata`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }

          getResponse = await axios(config)

          if (getResponse?.data?.length > 0 && getResponse?.data[0] !== "No Records Found" && getResponse?.data[0].Error !== "Invalid User!") {
            setviewannualoptimizeplan(true)
            setresultscreen(true)
            console.log(displaynames2.scenario)
            setdisplaynames2({
              ...displaynames2,
              brand: selectedbrand,
              scenario: "Annual Optimize PLan",
              market: market,
              fy: selectedyear
            })
            const mediaVariables = getResponse?.data
              .filter(item => item.type === "Media")
              .sort((a, b) => {
                // First, sort by variable_type (assuming it's a string)
                if (a.variable_type < b.variable_type) return -1;
                if (a.variable_type > b.variable_type) return 1;

                // If variable_type is the same, sort by subtotal (descending order)
                return b.subtotal - a.subtotal;
              });

            const cpAttributes = getResponse?.data
              .filter(item => item.attribute_name.startsWith("CP") || item.attribute_name.startsWith("cp"))
              .sort((a, b) => b.subtotal - a.subtotal);

            const otherAttributes = getResponse?.data
              .filter(
                item =>
                  item.type !== "Media" &&
                  !item.attribute_name.startsWith("CP") &&
                  !item.attribute_name.startsWith("cp")
              )
              .sort((a, b) => {
                const customOrder = ExceptionVariables.customOrder;

                // Ensure "Distribution" is always on top
                if (a.attribute_name === "Distribution") return -1;
                if (b.attribute_name === "Distribution") return 1;

                const getIndex = (variableType) => {
                  return customOrder.findIndex(order => variableType.includes(order));
                };

                let indexA = getIndex(a.variable_type);
                let indexB = getIndex(b.variable_type);

                // Move elements not found in customOrder to the end
                if (indexA === -1) indexA = Infinity;
                if (indexB === -1) indexB = Infinity;

                return indexA - indexB;
              });

            const arrangeddataset = [...otherAttributes, ...mediaVariables, ...cpAttributes]

            setsampledataset(arrangeddataset)
            setoriginalset(arrangeddataset);
            setoriginaldatasetforcolorcoding(arrangeddataset)

          }

          else {

            dispatch(
              getNotification({
                message: `There is no valid data to display for selected brand and scenario combination`,
                type: "default",
              })
            );
            setresultscreen2(false)
          }
        } catch (err) {
          console.log("Server Error", err);
          notifyRequestError(dispatch, err);
        }
      }
    } else {
      requireLogin("/simulator");
    }
    setloader2(false);

    setTimeout(() => {
      scrollToSection("attributetable")

    }, 1000);

  };

  const handlemodifynewbasescenarios = async () => {
    setloader6(true)
    if (UserService.isLoggedIn()) {
      try {

        const FormData = require("form-data");
        const sendData = new FormData();
        const currenttime = getCurrentFormattedTime()

        const requestData = {
          // "scenario_name": `${displaynames?.scenario?.startsWith("M_") ? "M" : displaynames?.scenario.startsWith("Y_") ? "Y" : displaynames?.scenario.startsWith("Q_") ? "Q" : "HY"}_Base_Master_Scenario`,
          scenario_name: `${displaynames?.scenario.charAt(0)}_NEW_BASE_${displaynames?.scenario}`,
          "scenario_timestamp": displaynames.timestamp,
          "user_id": "admin",
          "model_id": 1,
          "fy": displaynames?.fy,
          "dataset": originalset

        };
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/save_new_base_scenario`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData,
        };
        const requestData2 =
        {
          scenario_name: `M_NEW_BASE_${displaynames?.scenario}`,
          "scenario_timestamp": displaynames.timestamp,
          "user_id": "admin",
          final_market: displaynames.market,
          "brand": displaynames.brand,
          "fy": `${Number(selectedyear.split("-")[0]) + 1}-${Number(selectedyear.split("-")[1]) + 1}`
        }

        const config2 = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/monthly_to_annual_new_base`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData2,
        };
        const requestData3 =
        {
          scenario_name: `M_NEW_BASE_${displaynames?.scenario}`,
          "scenario_timestamp": displaynames.timestamp,
          "user_id": "admin",
          final_market: displaynames.market,
          "brand": displaynames.brand,
          "fy": `${Number(selectedyear.split("-")[0]) + 1}-${Number(selectedyear.split("-")[1]) + 1}`
        }

        const config3 = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/monthly_to_qtr_new_base`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData3,
        };
        const requestData4 =
        {
          scenario_name: `M_NEW_BASE_${displaynames?.scenario}`,
          "scenario_timestamp": displaynames.timestamp,
          "user_id": "admin",
          final_market: displaynames.market,
          "brand": displaynames.brand,
          "fy": `${Number(selectedyear.split("-")[0]) + 1}-${Number(selectedyear.split("-")[1]) + 1}`
        }

        const config4 = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/monthly_to_hy_new_base
 `,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData4,
        };
        const getResponse = await axios(config);
        const getResponse2 = await axios(config2);
        const getResponse3 = await axios(config3);
        const getResponse4 = await axios(config4);
        // await axios(config2);

        if (getResponse.status === 200) {
          console.log(displaynames?.scenario)
          setsavednewbasescenarioname(displaynames?.scenario)
          //setnewbasescenarioname(getResponse)
          //settotalBudget(budgetfromcell)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/simulator");
    }

    setloader6(false)
  };
  const handlemodifymasterscenarios = async () => {
    setloader3(true)
    if (UserService.isLoggedIn()) {
      try {

        const FormData = require("form-data");
        const sendData = new FormData();
        const currenttime = getCurrentFormattedTime()
        const requestData = {
          fy: selectedyear,
          brand: selectedbrand,
          final_market: market,
          scenario_name: `${displaynames?.scenario}`,
          frequency: displaynames?.scenario?.startsWith("M_") ? "M" : displaynames?.scenario.startsWith("Y_") ? "Y" : displaynames?.scenario.startsWith("Q_") ? "Q" : "HY",
          scenario_created_timestamp: displaynames.timestamp,
          updated_by: "admin",
          brand_market_frequency: `${selectedbrand}_${market}_${displaynames?.scenario?.startsWith("M_") ? "M" : displaynames?.scenario.startsWith("Y_") ? "Y" : displaynames?.scenario.startsWith("Q_") ? "Q" : "HY"}`
        };

        const requestData2 = {
          "scenario_name": `${displaynames?.scenario?.startsWith("M_") ? "M" : displaynames?.scenario.startsWith("Y_") ? "Y" : displaynames?.scenario.startsWith("Q_") ? "Q" : "HY"}_Base_Master_Scenario`,
          "scenario_timestamp": "2025-01-12 15:54:05",
          "user_id": "admin",
          "model_id": 1,
          "fy": displaynames?.fy,
          "dataset": originalset
          // frequency:row?.scenario?.startsWith("M_")?"M":row?.scenario.startsWith("Y_")?"Y":row?.scenario.startsWith("Q_")?"Q":"HY",
          // scenario_created_timestamp:row.timestamp,
          // updated_by:"admin",
          // brand_market_frequency:`${selectedbrand}_${market}_${row?.scenario?.startsWith("M_")?"M":row?.scenario.startsWith("Y_")?"Y":row?.scenario.startsWith("Q_")?"Q":"HY"}`

        };
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData,
        };

        const config2 = {
          method: "post",
          url: displaynames?.scenario?.startsWith("HY_") ? `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario_hy` : displaynames?.scenario.startsWith("Y_") ? `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario_annual` : displaynames?.scenario.startsWith("Q_") ? `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario_qtr` : `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario_monthly`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData2,
        };
        const getResponse = await axios(config);
        const getResponse2 = await axios(config2);
        if (getResponse.data) {

          setsavedmasterscenarioname(getResponse.data.scenario_name)
          //setnewbasescenarioname(getResponse)
          //settotalBudget(budgetfromcell)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/simulator");
    }
    setloader3(false)
  };
  const fetchdatasettable = async (ifscenariogiven) => {
    if (UserService.isLoggedIn()) {
      if (market && selectedbrand && market !== "Select" && selectedbrand !== "Select" && selectedyear && selectedyear !== "Select") {
        try {
          setisprocessing(true)
          setloader2(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;
          sendData.append("scenario_name", ifscenariogiven === "Base Scenario" ? "Base Scenario" : selectedscenarioname);
          sendData.append("scenario_timestamp", ifscenariogiven === "Base Scenario" ? "2025-01-12 15:54:05" : selectedscenarionametimestamp);
          sendData.append("user_id", "admin");
          sendData.append("final_market", market);
          sendData.append("brand", selectedbrand)
          sendData.append("fy", selectedyear)
          let getResponse = []
          let successfulResponse = []
          if (ifscenariogiven === "Base Scenario") {
            if (timetype === "Y") {
              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/annualbasegetscenariodata`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              };
            }
            else if (timetype === "Q") {

              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/qtrbasegetscenariodata`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              };
            }
            else if (timetype === "HY") {

              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/HYbasegetscenariodata`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              };
            }
            else {
              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/basegetscenariodata`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              };

            }

          }

          else {
            if (selectedscenarioname?.startsWith("Y_")) {
              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/get_annual_scenario_data`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              }
            }
            else if (selectedscenarioname?.startsWith("Q_")) {
              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/get_qtr_scenario_data`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              }
            }
            else if (selectedscenarioname?.startsWith("HY_")) {
              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/get_hy_scenario_data`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              }
            }
            else {
              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/getscenariodata`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              }
            }

          }

          getResponse = await axios(config)
          if (getResponse?.data?.length > 0 && getResponse?.data[0] !== "No Records Found" && getResponse?.data[0].Error !== "Invalid User!"
          ) {
            setviewnewbasescenariodata(false)
            setviewscenariodatatable(true)
            setresultscreen(true)
            ifscenariogiven && setselectedscenarioname(ifscenariogiven)
            setdisplaynames2({
              ...displaynames2,
              brand: selectedbrand,
              scenario: ifscenariogiven ? ifscenariogiven : selectedscenarioname,
              market: market,
              fy: selectedyear
            })

            const mediaVariables = getResponse?.data
              .filter(item => item.type === "Media")
              .sort((a, b) => {
                // First, sort by variable_type (assuming it's a string)
                if (a.variable_type < b.variable_type) return -1;
                if (a.variable_type > b.variable_type) return 1;

                // If variable_type is the same, sort by subtotal (descending order)
                return b.subtotal - a.subtotal;
              });

            const cpAttributes = getResponse?.data
              .filter(item => item.attribute_name.startsWith("CP") || item.attribute_name.startsWith("cp"))
              .sort((a, b) => b.subtotal - a.subtotal);

            const otherAttributes = getResponse?.data
              .filter(
                item =>
                  item.type !== "Media" &&
                  !item.attribute_name.startsWith("CP") &&
                  !item.attribute_name.startsWith("cp")
              )
              .sort((a, b) => {
                const customOrder = ExceptionVariables.customOrder;

                // Ensure "Distribution" is always on top
                if (a.attribute_name === "Distribution") return -1;
                if (b.attribute_name === "Distribution") return 1;

                const getIndex = (variableType) => {
                  return customOrder.findIndex(order => variableType.includes(order));
                };

                let indexA = getIndex(a.variable_type);
                let indexB = getIndex(b.variable_type);

                // Move elements not found in customOrder to the end
                if (indexA === -1) indexA = Infinity;
                if (indexB === -1) indexB = Infinity;

                return indexA - indexB;
              });
            const arrangeddataset = [...otherAttributes, ...mediaVariables, ...cpAttributes]
            setsampledataset(arrangeddataset)
            setoriginalset(arrangeddataset);
            setoriginaldatasetforcolorcoding(arrangeddataset)
          }
          else {

            dispatch(
              getNotification({
                message: `There is no valid data to display for selected brand and scenario combination`,
                type: "default",
              })

            );

            setresultscreen2(false)
          }

        } catch (err) {
          console.log("Server Error", err);

          notifyRequestError(dispatch, err);
        }
      }
      else {
        dispatch(
          getNotification({
            message: "Please select market to view scenario data!!",
            type: "danger",
          })
        );
      }
    } else {
      requireLogin("/simulator");
    }
    setisprocessing(false)
    setloader2(false);

    setTimeout(() => {
      scrollToSection("attributetable")

    }, 1000);

  };
  const fetchdatasettable2 = async () => {
    // console.log(selectedyear,market,selectedscenarioname,selectedbrand)
    if (UserService.isLoggedIn()) {
      if (market && selectedbrand && market !== "Select" && selectedbrand !== "Select") {
        try {
          setisprocessing(true)
          setloader5(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;
          sendData.append("scenario_name", selectedscenarioname);
          sendData.append("scenario_timestamp", selectedscenarionametimestamp);
          sendData.append("user_id", "admin");
          sendData.append("final_market", market);
          sendData.append("brand", selectedbrand)
          sendData.append("fy", selectedyear)
          if (selectedscenarioname?.startsWith("Y_")) {
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/get_annual_scenario_data`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }
          else if (selectedscenarioname?.startsWith("Q_")) {
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/get_qtr_scenario_data`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }
          else if (selectedscenarioname?.startsWith("HY_")) {
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/get_hy_scenario_data`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }
          else {
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/getscenariodata`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            }
          }

          const getResponse = await axios(config)

          if (getResponse.status === 200) {

            if (getResponse?.data?.length > 0 && getResponse?.data[0] !== "No Records Found" && getResponse?.data[0].Error !== "Invalid User!"
            ) {
              setcreatefrombaseoruploadfileswitch(false)
              setdisplaynames2({
                ...displaynames2,
                brand: selectedbrand,
                scenario: selectedscenarioname,
                market: market,
                fy: selectedyear,
                dataset: getResponse?.data

              })
              const mediaVariables = getResponse?.data
                .filter(item => item.type === "Media")
                .sort((a, b) => {
                  // First, sort by variable_type (assuming it's a string)
                  if (a.variable_type < b.variable_type) return -1;
                  if (a.variable_type > b.variable_type) return 1;

                  return b.subtotal - a.subtotal;
                });

              const cpAttributes = getResponse?.data
                .filter(item => item.attribute_name.startsWith("CP") || item.attribute_name.startsWith("cp"))
                .sort((a, b) => b.subtotal - a.subtotal);

              const otherAttributes = getResponse?.data
                .filter(
                  item =>
                    item.type !== "Media" &&
                    !item.attribute_name.startsWith("CP") &&
                    !item.attribute_name.startsWith("cp")
                )
                .sort((a, b) => {
                  const customOrder = ExceptionVariables.customOrder;

                  // Ensure "Distribution" is always on top
                  if (a.attribute_name === "Distribution") return -1;
                  if (b.attribute_name === "Distribution") return 1;

                  const getIndex = (variableType) => {
                    return customOrder.findIndex(order => variableType.includes(order));
                  };

                  let indexA = getIndex(a.variable_type);
                  let indexB = getIndex(b.variable_type);

                  // Move elements not found in customOrder to the end
                  if (indexA === -1) indexA = Infinity;
                  if (indexB === -1) indexB = Infinity;

                  return indexA - indexB;
                });

              const arrangeddataset = [...otherAttributes, ...mediaVariables, ...cpAttributes]

              setsampledataset(arrangeddataset)
              setoriginalset(arrangeddataset);
              setoriginaldatasetforcolorcoding(arrangeddataset);

              setviewscenariodatatable2(true)

            }

            else {
              //console.log(scenariooptions[0].scenario_name)
              //  if (displaynames) {
              //    setselectedbrand(displaynames.brand || brandoptions[0].brand)
              //    setselectedscenarioname(displaynames.scenarioname || scenariooptions[0].scenario_name)
              //    setselectedzone(displaynames.zone || 'National')
              //    setselectedyear(displaynames.year || '2021-22')
              //    setselectedscenarioid(displaynames.id || scenariooptions[0].id)
              //  }
              // else{
              //   setselectedscenarioname(scenariooptions[0].scenario_name)
              //   setselectedscenarioid(scenariooptions[0].id)
              //   setselectedbrand(brandoptions[0]?.brand)
              //   setselectedzone('National')
              //   setselectedyear("2021-22")
              // }

              dispatch(
                getNotification({
                  message: `There is no valid data to display for selected brand and scenario combination`,
                  type: "default",
                })

              );
              //handleMouseEnter()
              setresultscreen2(false)
            }

          }
        } catch (err) {
          console.log("Server Error", err);
          // if (displaynames) {
          //   setselectedbrand(displaynames.brand || brandoptions[0].brand)
          //   setselectedscenarioname(displaynames.scenarioname || scenariooptions[0].scenario_name)
          //   setselectedyear(displaynames.fy || '2024-25')
          //   setmarket(displaynames.market || "Select")
          // }

          // else{
          //       setselectedscenarioname(scenariooptions[0].scenario_name)
          //       setselectedscenarioid(scenariooptions[0].id)
          //       setselectedbrand(brandoptions[0]?.brand)
          //       setselectedzone('National')
          //       setselectedyear('2021-22')
          // }
          //handleMouseEnter()
          notifyRequestError(dispatch, err);
        }
      }
      else {
        dispatch(
          getNotification({
            message: "Please select market to view scenario data!!",
            type: "danger",
          })
        );
      }
    } else {
      requireLogin("/simulator");
    }
    setloader5(false);
    setisprocessing(false)

  };

  useEffect(() => {
    if (chatbotPrefillRef.current) return;
    if (
      !selectedscenarioname ||
      selectedscenarioname === "Select" ||
      !selectedscenarionametimestamp ||
      !market ||
      market === "Select" ||
      !selectedbrand ||
      selectedbrand === "Select" ||
      !selectedyear ||
      selectedyear === "Select"
    ) {
      return;
    }

    fetchdatasettable2();
  }, [
    selectedscenarioname,
    selectedscenarionametimestamp,
    market,
    selectedbrand,
    selectedyear
  ]);

  const handlesimulate = async (newname) => {
    if (UserService.isLoggedIn()) {
      if (selectedyear && selectedyear !== "Select" && market && market !== "Select" && selectedscenarioname && selectedscenarioname !== "Select" && selectedbrand && selectedbrand !== "Select") {
        try {
          setmodifybtn(false)
          setloader(true);
          setviewscenariodatatable(false)
          setviewnewbasescenariodata(false)
          setviewannualoptimizeplan(false)
          const FormData = require("form-data");
          const sendData = new FormData();

          sendData.append("scenario_name", selectedscenarioname);
          sendData.append("scenario_timestamp", selectedscenarionametimestamp);
          sendData.append("user_id", "admin");
          sendData.append("brand", selectedbrand);
          sendData.append("model_id", 1);
          sendData.append("market", market);
          sendData.append("f_year", selectedyear);

          const sendData2 = new FormData();
          console.log(selectedyear)
          const FormData5 = require("form-data");
          const sendData5 = new FormData5();
          sendData5.append("fy", selectedyear)
          sendData5.append("brand", selectedbrand)
          sendData5.append("market", market)

          const config5 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/get_new_base_scenario_names`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData5,
          }
          const FormData6 = require("form-data");
          const sendData6 = new FormData6();
          sendData6.append("fy", selectedyear)
          sendData6.append("brand_market", `${selectedbrand}_${market}`)
          const config6 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/get_master_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData6,
          }
          let type = ""
          if (selectedscenarioname?.startsWith("M_")) {
            type = "M"
          }
          else if (selectedscenarioname?.startsWith("Y_")) {
            type = "Y"
          }
          else if (selectedscenarioname?.startsWith("Q_")) {
            type = "Q"
          }
          else {
            type = "HY"
          }
          const getResponse5 = await axios(config5)
          const getResponse6 = await axios(config6)

          // let arr = getResponse5?.data?.data.filter((it) => selectedyear === it?.fy)
          // let arr2=getResponse6?.data?.data.filter((it) => type === it?.frequency)
          //let arr = getResponse?.data?.data?.filter((it) => type === it?.frequency && Number(it?.fy?.split("-")[0]) + 1 === Number(selectedyrsplit[0]) && Number(it?.fy?.split("-")[1]) + 1 === Number(selectedyrsplit[1]))
          let selectedyrsplit = selectedyear?.split("-")

          getResponse5?.data.length > 0 && setsavednewbasescenarioname(
            getResponse5?.data?.filter((it) => Number(it?.fy?.split("-")[0]) - 1 === Number(selectedyrsplit[0]) && Number(it?.fy?.split("-")[1]) - 1 === Number(selectedyrsplit[1]))[0]?.scenario_name.replace(`${type}_NEW_BASE_`, ""))
          let arr = getResponse5?.data?.filter((it) => it?.fy === selectedyear)
          getResponse6?.data?.data.length > 0 && setsavedmasterscenarioname(getResponse6?.data?.data.filter((it) => it.fy === selectedyear && type === it?.frequency)[0]?.scenerio_name)

          if (selectedscenarioname?.match("Reference")) {
            // sendData2.append("scenario_name", 'Base Scenario');
            // sendData2.append("scenario_timestamp",'2025-01-12 15:54:05');
            sendData2.append("scenario_name", selectedscenarioname.charAt(0) === "M" ? `${arr[0]?.scenario_name}` : selectedscenarioname.charAt(0) === "H" ? `HY_${arr[0]?.scenario_name}` : `${selectedscenarioname.charAt(0)}_${arr[0]?.scenario_name}`);
            sendData2.append("scenario_timestamp", arr[0].created_dt);
            sendData2.append("user_id", "admin");
            sendData2.append("market", market);
            sendData2.append("model_id", 1);
            sendData2.append("brand", selectedbrand);
            sendData2.append("f_year", selectedyear)

          }
          else if (selectedscenarioname?.match("Annual_Optimize_Plan")) {
            // sendData2.append("scenario_name", 'Base Scenario');
            // sendData2.append("scenario_timestamp",'2025-01-12 15:54:05');
            sendData2.append("scenario_name", `optimized_annual_scenario`);
            sendData2.append("scenario_timestamp", '2025-01-12 15:54:05');
            sendData2.append("user_id", "admin");
            sendData2.append("market", market);
            sendData2.append("model_id", 1);
            sendData2.append("brand", selectedbrand);
            sendData2.append("f_year", selectedyear)

          }
          else {
            sendData2.append("scenario_name", 'Base Scenario');
            sendData2.append("scenario_timestamp", '2025-01-12 15:54:05');
            sendData2.append("user_id", "admin");
            sendData2.append("market", market);
            sendData2.append("model_id", 1);
            sendData2.append("brand", selectedbrand);
            sendData2.append("f_year", selectedyear)
          }
          let config1 = {}
          let config2 = {}
          if (selectedscenarioname?.startsWith("Y_")) {
            config1 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/annual_predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            };
            config2 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/annual_basescenario_predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData2,
            };
          }
          else if (selectedscenarioname?.startsWith("Q_")) {
            config1 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/qtr_predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            };
            config2 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/base_qtr_predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData2,
            };
          }
          else if (selectedscenarioname?.startsWith("HY_")) {
            config1 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/hy_predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            };
            config2 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/base_hy_predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData2,
            };
          }
          else {
            config1 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            };
            config2 = {
              method: "post",
              url: selectedscenarioname?.match("Reference") ? `${REACT_APP_UPLOAD_DATA}/api/base_predict` : `${REACT_APP_UPLOAD_DATA}/api/base_predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData2,
            };
          }

          const getResponse2 = await axios(config2);
          const getResponse1 = await axios(config1);
          if (getResponse1.data.data) {
            if (getResponse1?.data?.data?.plot1?.length > 0) {
              fetchdatasettable2()
              setfulldataset(getResponse1?.data?.data)
              setfulldataset2(getResponse2?.data?.data)
              settorangeonplots(getResponse1?.data?.data?.plot1[getResponse1?.data?.data?.plot1.length - 1]?.month_year?.split("-").reverse()?.join("-"))

              let current_month_year = `${new Date().getFullYear()}-${(String(new Date().getMonth() + 1).padStart(2, "0"))}`;

              if (getResponse1?.data?.data?.plot1[0]?.month_year >= current_month_year || selectedscenarioname.startsWith("Y_")) {
                setfromrangeonplots(getResponse1?.data?.data?.plot1[0]?.month_year?.split("-").reverse()?.join("-"))
              }

              else {
                const [year, month] = endDate.split("-");
                const date = new Date(year, month); // Month is zero-based in JS Date
                const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

                setfromrangeonplots(formattedDate?.split("-")?.reverse()?.join("-"))

              }
              setmodifybtn(false)
              setdisplaynames({
                ...displaynames,
                scenario: selectedscenarioname,
                market: market,
                fy: selectedyear,
                brand: selectedbrand,
                timestamp: selectedscenarionametimestamp,
                dataset: originalset
              }
              )
              setresultscreen2(true);

              setTimeout(() => {
                scrollToSection('simulateddata')
              }, 1000)

            }
            else {

              dispatch(
                getNotification({
                  message: "There is no data for selected options",
                  type: "default",
                })
              );
            }

            // setTimeout(() => {
            //   document.getElementById("SimulatorInputs").click()
            // }, 1000)
            scrollToTop();

            //settablegraphdataset(getResponse.data);

            //(getResponse.data)
          }
          else {
            dispatch(
              getNotification({
                message: "There is no data for selected options",
                type: "default",
              })
            );
          }
        } catch (err) {
          console.log("Server Error", err);
          notifyRequestError(dispatch, err);
        }
      } else {
        dispatch(
          getNotification({
            message: "Please fill all entries",
            type: "default",
          })
        );
      }
    } else {
      requireLogin("/simulator");
    }
    setloader(false)

  };
  
  const updatescenario = async (update) => {
    if (UserService.isLoggedIn()) {
      try {
        setisprocessing(true)
        const updatedDataset = [...sampledataset];

        let arr = [];
        setedit(arr);
        const currenttime = getCurrentFormattedTime()
        const requestData = {
          scenario_name: displaynames2.scenario,
          user_id: "admin",
          scenario_timestamp: currenttime,
          fy: selectedyear,
          model_id: 1,

        };
        const requestData2 = {
          scenario_name: displaynames2.scenario,
          scenario_timestamp: currenttime,
          user_id: "admin",
          model_id: 1,
          dataset: originalset,
          fy: selectedyear
        };
        let config = {}
        let config2 = {}

        if (sampledataset[0]?.month_data?.length === 1) {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/update_annual_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };
          config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_annual_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData2
          };
        }
        else if (sampledataset[0]?.month_data?.length === 2) {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/update_hy_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };
          config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_hy_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData2
          };
        }
        else if (sampledataset[0]?.month_data?.length === 4) {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/update_qtr_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };
          config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_qtr_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData2
          };
        }
        else {

          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/updatescenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };
          config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/savescenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData2
          };

        }

        const getResponse2 = await axios(config2);
        const getResponse = await axios(config);

        if (getResponse.status === 200) {

          handlescenariosfetch()
          setresultscreen2(false)
          setmodifybtn(false)
          document.getElementById("closemodal").click()
          setdisplaynames({ ...displaynames, scenario: getResponse.data.new_scenario_name, timestamp: currenttime });
          setscenarionewoldscreen('old')
          setselectedscenarioname(`${getResponse.data.new_scenario_name}`)
          setselectedscenarionametimestamp(currenttime)
          setdisplaynames2({
            ...displaynames2,
            scenario: `${getResponse?.data?.new_scenario_name}`,
            market: market,
            timestamp: currenttime
          })
          dispatch(
            getNotification({
              message: `Scenario has been saved successfully with name ${getResponse.data.new_scenario_name}`,
              type: "success",
            })
          );
        }
      }
      catch (err) {
        console.log("Server Error", err);
        if (err.response && err.response.status === 500) {
          if (err.response.data.detail === `scenario name: ${newscenarionamegiven} already present in the DB, please try again with new scenario name`) {
            dispatch(
              getNotification({
                message: "Please provide unique scenario name",
                type: "default",
              })
            );
          }
          else {
            dispatch(
              getNotification({
                message: "There is some server error.Please try again later!",
                type: "default",
              })
            );
          }
        }
        else if (err.response && err.response.status === 400) {
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
      requireLogin("/simulator");
    }
    setisprocessing(false)
  };

  

  

  const savescenario = async () => {
    if (UserService.isLoggedIn()) {
      try {
        if (!isValidScenarioName(newscenarionamegiven)) {
          setnewscenarionamegiven('')
          setScenarioNameError(true)
          return;
        }
        if (scenariooptions?.length > 0 && scenariooptions?.some(option => option.value === `${timetype}_${displaynames2.market}_${newscenarionamegiven}`)) {
          setuniquescenarioname(true)
          setTimeout(() => setuniquescenarioname(false), 5000)
          return;
        }
        setisprocessing(true)

        let arr = [];
        setedit(arr);

        const currentime = getCurrentFormattedTime()
        const requestData = {
          scenario_name: `${timetype}_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`,
          scenario_timestamp: currentime,
          user_id: "admin",
          model_id: 1,
          dataset: originalset,
          fy: selectedyear
        };

        let config = {}
        if (timetype === "Y") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_annual_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else if (timetype === "Q") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_qtr_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else if (timetype === "HY") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_hy_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/savescenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }

        const getResponse = await axios(config);
        console.log(getResponse)
        if (getResponse.status === 200) {

          // fetchscenariooptions();
          // handlesimulate(newscenarionamegiven);
          setnewscenarionamegiven('')
          setresultscreen2(false)
          setmodifybtn(false)
          setscenarionewoldscreen("old")
          document.getElementById("closemodal").click()
          document.getElementById("closemodal2").click()
          handlescenariosfetch()
          setselectedscenarioname(`${timetype}_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`)
          setselectedscenarionametimestamp(currentime)
          setdisplaynames2({
            ...displaynames2,
            scenario: `${timetype}_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`,
            market: market,
            timestamp: currentime
          })
          dispatch(
            getNotification({
              message: "Scenario has been saved successfully",
              type: "success",
            })
          );
        }
        setnewscenarionamegiven("")

      }
      catch (err) {
        console.log("Server Error", err);
        if (err.response && err.response.status === 500) {
          if (err.response.data.detail === `scenario name: ${newscenarionamegiven} already present in the DB, please try again with new scenario name`) {
            dispatch(
              getNotification({
                message: "Please provide unique scenario name",
                type: "default",
              })
            );
          }
          else {
            dispatch(
              getNotification({
                message: "There is some server error.Please try again later!",
                type: "default",
              })
            );
          }
        }
        else if (err.response && err.response.status === 400) {
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
      requireLogin("/simulator");
    }
    setisprocessing(false)
  };

  const savescenarioNewBase = async () => {
    if (UserService.isLoggedIn()) {
      try {
        if (!isValidScenarioName(newscenarionamegiven)) {
          setnewscenarionamegiven('')
          setScenarioNameError(true)
          return
        }
        let arr = [];
        setedit(arr);
        const currentime = getCurrentFormattedTime()
        const requestData = {
          scenario_name: `${timetype}_Reference_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`,
          scenario_timestamp: currentime,
          user_id: "admin",
          model_id: 1,
          dataset: originalset,
          fy: selectedyear
        };

        let config = {}
        if (timetype === "Y") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_annual_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else if (timetype === "Q") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_qtr_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else if (timetype === "HY") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_hy_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/savescenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }

        const getResponse = await axios(config);

        if (getResponse.status === 200) {

          // fetchscenariooptions();
          // handlesimulate(newscenarionamegiven);
          setresultscreen2(false)
          setmodifybtn(false)
          setscenarionewoldscreen("old")
          setviewannualoptimizeplan(false)
          document.getElementById("closemodal").click()
          document.getElementById("closemodal2").click()
          document.getElementById("closemodal3").click()
          handlescenariosfetch()
          setselectedscenarioname(`${timetype}_Reference_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`)
          setselectedscenarionametimestamp(currentime)
          setdisplaynames2({
            ...displaynames2,
            scenario: `${timetype}_Reference_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`,
            market: market,
            timestamp: currentime
          })
          dispatch(
            getNotification({
              message: "Scenario has been saved successfully",
              type: "success",
            })
          );
        }
        setnewscenarionamegiven("")

      }
      catch (err) {
        console.log("Server Error", err);
        if (err.response && err.response.status === 500) {
          if (err.response.data.detail === `scenario name: ${newscenarionamegiven} already present in the DB, please try again with new scenario name`) {
            dispatch(
              getNotification({
                message: "Please provide unique scenario name",
                type: "default",
              })
            );
          }
          else {
            dispatch(
              getNotification({
                message: "There is some server error.Please try again later!",
                type: "default",
              })
            );
          }
        }
        else if (err.response && err.response.status === 400) {
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
      requireLogin("/simulator");
    }
  };
  const savescenarioAtoQ = async () => {
    if (UserService.isLoggedIn()) {
      try {
        if (!isValidScenarioName(newscenarionamegiven)) {
          setnewscenarionamegiven('')
          setScenarioNameError(true)
          return
        }
        let arr = [];
        setedit(arr);
        const currentime = getCurrentFormattedTime()
        const requestData = {
          scenario_name: `${timetype}_Annual_Optimize_Plan_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`,
          scenario_timestamp: currentime,
          user_id: "admin",
          model_id: 1,
          dataset: originalset,
          fy: selectedyear
        };

        let config = {}
        if (timetype === "Y") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_annual_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else if (timetype === "Q") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_qtr_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else if (timetype === "HY") {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/save_hy_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }
        else {
          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/savescenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData
          };

        }

        const getResponse = await axios(config);

        if (getResponse.status === 200) {

          // fetchscenariooptions();
          // handlesimulate(newscenarionamegiven);
          setresultscreen2(false)
          setmodifybtn(false)
          setscenarionewoldscreen("old")
          setviewannualoptimizeplan(false)
          document.getElementById("closemodal3").click()
          handlescenariosfetch()
          setselectedscenarioname(`${timetype}_Annual_Optimize_Plan_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`)
          setselectedscenarionametimestamp(currentime)
          setdisplaynames2({
            ...displaynames2,
            scenario: `${timetype}_Annual_Optimize_Plan_${displaynames2.market}_${getBrandAbb(selectedbrand)}_${newscenarionamegiven}`,
            market: market,
            timestamp: currentime
          })
          dispatch(
            getNotification({
              message: "Scenario has been saved successfully",
              type: "success",
            })
          );
        }
        setnewscenarionamegiven("")

      }
      catch (err) {
        console.log("Server Error", err);
        if (err.response && err.response.status === 500) {
          if (err.response.data.detail === `scenario name: ${newscenarionamegiven} already present in the DB, please try again with new scenario name`) {
            dispatch(
              getNotification({
                message: "Please provide unique scenario name",
                type: "default",
              })
            );
          }
          else {
            dispatch(
              getNotification({
                message: "There is some server error.Please try again later!",
                type: "default",
              })
            );
          }
        }
        else if (err.response && err.response.status === 400) {
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
      requireLogin("/simulator");
    }
  };

  const changesampledataset = (changedValue) => {
    setsampledataset(changedValue)
  }
  const changeoriginalset = (changedValue) => {
    setoriginalset(changedValue)
  }

  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [originalFilters, setOriginalFilters] = useState({});
  useEffect(() => {
    if (modifybtn) {
      setOriginalFilters({
        year: selectedyear,
        brand: selectedbrand,
        market: market,
        scenario: selectedscenarioname,
      });
    }
  }, [modifybtn]);

  useEffect(() => {
    if (Object.keys(originalFilters).length > 0) {
      const hasChanged =
        originalFilters.year !== selectedyear ||
        originalFilters.brand !== selectedbrand ||
        originalFilters.market !== market ||
        originalFilters.scenario !== selectedscenarioname;

      if (hasChanged) {
        setDownloadUrl('')
      }
    }
  }, [selectedyear, selectedbrand, market, selectedscenarioname]);

  return (
    <>
      {/* Save Scenario Modal */}
      <div
        className="modal"
        id="exampleModal1"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content rr-modal-content">
            <div className="modal-header rr-modal-header">
              <h6 className="modal-title font-weight-bold" id="exampleModalLabel">
                Save Scenario
              </h6>
              <button
                type="button"
                className="close rr-btn rr-btn-secondary rr-btn-icon"
                data-dismiss="modal"
                aria-label="Close"
                id="closemodal"
                onClick={() => {
                  setnewscenarionamegiven("");
                  setScenarioNameError(false);
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <label className="rr-label mb-2">
                Please enter Scenario Name:
              </label>

              <div className="d-flex flex-wrap align-items-center">
                <span className="my-auto mr-1 mb-2 rr-modal-prefix">
                  {timetype}_{displaynames2.market}_{maskedBrandOption.maskedBrandOption[selectedbrand]}_
                </span>
                <input
                  type="text"
                  id="scenarionamebox"
                  className="form-control rr-input flex-grow-1 mb-2"
                  value={newscenarionamegiven}
                  onChange={(e) => setnewscenarionamegiven(e.target.value)}
                />
              </div>

              {scenarioNameErrorFlag && (
                <small className="text-danger d-block mt-1">
                  Scenario Name can't contain any special Character Other than underscore and whitespace.!
                </small>
              )}

              {uniquescenarioname && (
                <small className="text-danger d-block mt-1">
                  Scenario Name is already present. Please provide a different name!
                </small>
              )}
            </div>

            <div className="modal-footer rr-modal-footer">
              <button
                type="button"
                className="rr-btn rr-btn-secondary"
                data-dismiss="modal"
                onClick={() => {
                  setnewscenarionamegiven("");
                  setScenarioNameError(false);
                }}
              >
                Close
              </button>

              <button
                type="button"
                disabled={isprocessing}
                className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                onClick={() => {
                  if (
                    newscenarionamegiven === "" ||
                    newscenarionamegiven === "Base Scenario"
                  ) {
                    document.getElementById("scenarionamebox").focus();
                  } else {
                    savescenario();
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Scenario */}
      <div
        className="modal"
        id="exampleModal2"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content rr-modal-content">
            <div className="modal-header rr-modal-header">
              <h6 className="modal-title font-weight-bold" id="exampleModalLabel">
                Save Scenario
              </h6>
              <button
                type="button"
                className="close rr-btn rr-btn-secondary rr-btn-icon"
                data-dismiss="modal"
                aria-label="Close"
                id="closemodal2"
                onClick={() => {
                  setnewscenarionamegiven("");
                  setScenarioNameError(false);
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <label className="rr-label mb-2">Please enter Scenario Name:</label>
              <div className="d-flex flex-wrap align-items-center">
                <span className="my-auto mr-1 mb-2 rr-modal-prefix">
                  {timetype}_Reference_{displaynames2.market}_{selectedbrand}_
                </span>
                <input
                  type="text"
                  id="scenarionamebox"
                  className="form-control rr-input flex-grow-1 mb-2"
                  value={newscenarionamegiven}
                  onChange={(e) => setnewscenarionamegiven(e.target.value)}
                />
              </div>

              {scenarioNameErrorFlag && (
                <small className="text-danger d-block mt-1">
                  Scenario Name can't contain any special Character Other than underscore and whitespace.!
                </small>
              )}
              {uniquescenarioname && (
                <small className="text-danger d-block mt-1">
                  Scenario Name is already present. Please provide other scenario name!
                </small>
              )}
            </div>

            <div className="modal-footer rr-modal-footer">
              <button
                type="button"
                className="rr-btn rr-btn-secondary"
                data-dismiss="modal"
                onClick={() => {
                  setnewscenarionamegiven("");
                  setScenarioNameError(false);
                }}
              >
                Close
              </button>

              <button
                type="button"
                className="rr-btn rr-btn-primary"
                onClick={() => {
                  if (
                    newscenarionamegiven === "" ||
                    newscenarionamegiven === "Base Scenario"
                  ) {
                    document.getElementById("scenarionamebox").focus();
                  } else {
                    savescenarioNewBase();
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optimize Annual Planned Qtr Scenario */}
      <div
        className="modal"
        id="exampleModal3"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content rr-modal-content">
            <div className="modal-header rr-modal-header">
              <h6 className="modal-title font-weight-bold" id="exampleModalLabel">
                Save Scenario
              </h6>
              <button
                type="button"
                className="close rr-btn rr-btn-secondary rr-btn-icon"
                data-dismiss="modal"
                aria-label="Close"
                id="closemodal3"
                onClick={() => {
                  setnewscenarionamegiven("");
                  setScenarioNameError(false);
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <label className="rr-label mb-2">Please enter Scenario Name:</label>
              <div className="d-flex flex-wrap align-items-center">
                <span className="my-auto mr-1 mb-2 rr-modal-prefix">
                  {timetype}_Annual_optimize_planned_{displaynames2.market}_{selectedbrand}_
                </span>
                <input
                  type="text"
                  id="scenarionamebox"
                  className="form-control rr-input flex-grow-1 mb-2"
                  value={newscenarionamegiven}
                  onChange={(e) => setnewscenarionamegiven(e.target.value)}
                />
              </div>

              {scenarioNameErrorFlag && (
                <small className="text-danger d-block mt-1">
                  Scenario Name can't contain any special Character Other than underscore and whitespace.!
                </small>
              )}
              {uniquescenarioname && (
                <small className="text-danger d-block mt-1">
                  Scenario Name is already present. Please provide other scenario name!
                </small>
              )}
            </div>

            <div className="modal-footer rr-modal-footer">
              <button
                type="button"
                className="rr-btn rr-btn-secondary"
                data-dismiss="modal"
                onClick={() => {
                  setnewscenarionamegiven("");
                  setScenarioNameError(false);
                }}
              >
                Close
              </button>

              <button
                type="button"
                className="rr-btn rr-btn-primary"
                onClick={() => {
                  if (
                    newscenarionamegiven === "" ||
                    newscenarionamegiven === "Base Scenario"
                  ) {
                    document.getElementById("scenarionamebox").focus();
                  } else {
                    savescenarioAtoQ();
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sim-page">
        <div className="rr-card rr-card-header">
          <div className="rr-page-header-left">
            <div className="rr-breadcrumb">Dashboard / Scenario Planner</div>
            <h2 className="rr-page-title">Scenario Planner</h2>
            <p className="rr-page-subtitle mb-0">
              Build, simulate, compare, export and manage scenario plans using a unified workspace.
            </p>
          </div>

          {resultscreen2 && (
            <div className="rr-page-header-actions">
              <button
                className="rr-btn rr-btn-secondary"
                onClick={() => {
                  setresultscreen(false);
                  setresultscreen2(false);
                  setmarket("");
                  setselectedbrand("");
                  setscenarionewoldscreen("Select");
                  setoriginalset([]);
                  setsampledataset([]);
                  setmodifybtn(false);
                  setsavednewbasescenarioname("");
                  setsavedmasterscenarioname("");
                  setnewbasedetailscreatenew({});
                  setDownloadUrl("");
                }}
                disabled={loading}
              >
                Reset
              </button>

              <button
                className="rr-btn rr-btn-primary"
                onClick={() => setmodifybtn(!modifybtn)}
                disabled={loading}
              >
                {modifybtn ? "Close" : "Modify"}
              </button>

              {loading ? (
                <button className="rr-btn rr-btn-disabled" disabled>
                  Preparing your Report...
                </button>
              ) : downloadUrl ? (
                <button
                  className="rr-btn rr-btn-primary"
                  onClick={() => {
                    setIsDownloading(true);
                    downloadPdf(downloadUrl, () => setIsDownloading(false));
                  }}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Dowloading...." : "Download Report"}
                </button>
              ) : (
                <button
                  className="rr-btn rr-btn-primary"
                  // onClick={() => {
                  //   const file_name = prompt("Enter the Report Name to Genrate the Report");
                  //   if (file_name) {
                  //     uploadPDF(
                  //       document.getElementById("pdfConvertible"),
                  //       file_name,
                  //       selectedbrand,
                  //       "Simulator_Report",
                  //       setLoading,
                  //       setDownloadUrl
                  //     );
                  //   } else {
                  //     alert("File Name can't be empty!!!");
                  //   }
                  // }}
                  onClick={() => { toast.warning('The Feature will be live from 20 April,2026.') }}
                >
                  Generate Report
                </button>
              )}
            </div>
          )}
        </div>

        {modifybtn ? (
          <div className="rr-card rr-card-section">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-3">
                <label className="rr-label">
                  FY:<span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="rr-select"
                  placeholder="Select"
                  options={[
                    ...yearoptions?.map((item) => ({
                      label: item.fy,
                      value: item.fy,
                    }))] || []}
                  value={
                    selectedyear && selectedyear !== "Select"
                      ? { label: selectedyear, value: selectedyear }
                      : null
                  }
                  onChange={(option) => {
                    const value = option?.value || "Select";
                    setscenarionewoldscreen("Select");
                    settimetype("");
                    setselectedyear(value);
                    setselectedbrand("");
                    setmarket("");
                    setselectedscenarioname("");
                  }}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="rr-label">
                  Brand:<span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="rr-select"
                  placeholder="Select"
                  options={[
                    ...brandoptions?.map((option) => ({
                      label: maskedBrandOption.maskedBrandOption[option.brand],
                      value: option.brand,
                    }))] || []}
                  value={
                    selectedbrand && selectedbrand !== "Select"
                      ? {
                        label: maskedBrandOption.maskedBrandOption[selectedbrand],
                        value: selectedbrand,
                      }
                      : null
                  }
                  onChange={(option) => {
                    const newBrand = option?.value || "";
                    setselectedbrand(newBrand);
                    setmarket("Select");
                    setselectedscenarioname("Select");
                    setviewscenariodatatable(false);
                    setviewnewbasescenariodata(false);
                  }}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="rr-label">
                  Market:<span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="rr-select"
                  placeholder="Select"
                  options={[
                    ...marketoptions?.map((item) => ({
                      label: item?.final_market,
                      value: item?.final_market,
                    }))] || []}
                  value={
                    market && market !== "Select"
                      ? { label: market, value: market }
                      : null
                  }
                  onChange={(option) => {
                    const value = option?.value || "Select";
                    setmarket(value);
                    setselectedscenarioname("Select");
                    setviewscenariodatatable(false);
                    setviewnewbasescenariodata(false);
                    setviewscenariodatatable2(false);
                    setmodifybtn(false);
                    setresultscreen2(false);
                  }}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="rr-label">
                  Scenario:<span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="rr-select"
                  placeholder="Select Scenario"
                  options={scenariooptions}
                  value={
                    selectedscenarioname && selectedscenarioname !== "Select"
                      ? { label: selectedscenarioname, value: selectedscenarioname }
                      : null
                  }
                  onChange={(value) => {
                    setviewscenariodatatable2(false);
                    setviewscenariodatatable(false);
                    setviewnewbasescenariodata(false);
                    setselectedscenarioname(value?.value || "Select");
                    setselectedscenarionametimestamp(value?.timestamp);
                    setmodifybtn(false);
                    setresultscreen2(false);
                  }}
                />

                {selectedscenarioname && selectedscenarioname !== "Select" && (
                  <button
                    className={isprocessing ? "rr-btn rr-btn-disabled mt-2" : "rr-btn rr-btn-primary mt-2"}
                    disabled={isprocessing}
                    onClick={() => {
                      if (viewscenariodatatable2) {
                        setviewscenariodatatable2(false);
                      } else {
                        fetchdatasettable2();
                      }
                    }}
                  >
                    {!viewscenariodatatable2 ? "View Scenario Data" : "Hide"}
                  </button>
                )}

                {loader5 && (
                  <div className="my-3 d-flex flex-column align-items-center justify-content-center">
                    <div className="rr-dot-loader">
                      <div></div><div></div><div></div>
                    </div>
                    <div className="mt-2 fw-semibold text-muted">Loading scenario data...</div>
                  </div>
                )}
              </div>
            </div>

            {selectedscenarioname !== "Base Scenario" && (
              <div className="mt-3">
                <div
                  className="rr-btn rr-btn-primary"
                  type="button"
                  onClick={runSimulate}
                >
                  <span>Simulate <iconify-icon icon="iconamoon:arrow-right-2-bold" /></span>
                </div>
              </div>
            )}

            {viewscenariodatatable2 && (
              <div className="mt-4" id="attributetable">
                <div className="d-flex flex-row-reverse flex-wrap gap-2 mb-3">
                  <button
                    disabled={isprocessing}
                    className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                    data-toggle={displaynames2.scenario === "Base Scenario" && "modal"}
                    data-target="#exampleModal1"
                    onClick={() => {
                      if (
                        displaynames2.scenario !== "Base Scenario" &&
                        displaynames2.scenario !== "base scenario"
                      ) {
                        updatescenario();
                      }
                    }}
                  >
                    {displaynames2.scenario === "Base Scenario" ||
                      displaynames2.scenario === "base scenario"
                      ? "Save Scenario"
                      : "Update Scenario"}
                  </button>
                </div>

                <VariableTable
                  sampledataset={sampledataset}
                  changesampledataset={changesampledataset}
                  originalset={originalset}
                  changeoriginalset={changeoriginalset}
                  originaldatasetforcolorcoding={originaldatasetforcolorcoding}
                  endDate={endDate}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="">
            {loader ? (
              <div className="sim-loader-wrap">
                <LoaderCustom text="Simulating..." />
              </div>
            ) : resultscreen2 ? (
              <div className="container-fluid my-3">
                <div id="pdfConvertible" className="w-100">
                  <div className="rr-card rr-card-section">
                    <div className="row g-3 align-items-center my-1">
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="rr-card-meta">
                          <strong>FY:</strong>
                          <div className="rr-meta-value rr-meta-value--clamp">{displaynames.fy}</div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="rr-card-meta">
                          <strong>Brand:</strong>
                          <div className="rr-meta-value rr-meta-value--clamp">
                            {maskedBrandOption.maskedBrandOption[displaynames.brand]}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="rr-card-meta">
                          <strong>Market:</strong>
                          <div className="rr-meta-value rr-meta-value--clamp">{displaynames.market}</div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="rr-card-meta">
                          <strong>Scenario:</strong>
                          <div className="rr-meta-value rr-meta-value--clamp">{displaynames.scenario}</div>
                        </div>
                      </div>

                      {/* <div className="col-12 d-flex flex-wrap gap-2 mt-2">
                          {loader6 ? (
                            <small className="text-primary">Setting as reference...</small>
                          ) : (
                            <span
                              onClick={() => {
                                if (displaynames.scenario === savednewbasescenarioname) return;
                                handlemodifynewbasescenarios(displaynames);
                              }}
                              type={displaynames.scenario === savednewbasescenarioname ? "" : "button"}
                              className={
                                displaynames.scenario === savednewbasescenarioname
                                  ? "text-success fw-bold"
                                  : "rr-btn rr-btn-primary"
                              }
                            >
                              {displaynames.scenario === savednewbasescenarioname
                                ? "Reference"
                                : "Set as Reference (Next FY)"}
                            </span>
                          )}
                        </div> */}
                    </div>
                  </div>

                  <div className="container-fluid px-0">
                    <div id="simulateddata">
                      <div className="d-flex my-2 justify-content-between align-items-center flex-wrap gap-2">
                        <h5 className="mb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: '16px', letterSpacing: '0.01em' }}>Simulated Results</h5>
                        <button
                          className="rr-btn rr-btn-primary"
                          onClick={() => setisValue(!isValue)}
                        >
                          {isValue ? "By Volume" : "By Value"}
                        </button>
                      </div>
                    </div>
                    <div className="row g-3">
                      {displaynames?.scenario.startsWith("M_") ? (
                        fulldataset?.plot1?.length > 0 &&
                        fulldataset2?.plot1?.length > 0 && (
                          <div className="col-12">
                            <LineChart1
                              displaynames={displaynames}
                              fulldataset1={fulldataset}
                              fulldataset2={fulldataset2}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                            />
                          </div>
                        )
                      ) : (
                        <AnnualData
                          displaynames={displaynames}
                          fulldataset1={fulldataset}
                          fulldataset2={fulldataset2}
                          isValue={isValue}
                          range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                        />
                      )}

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot2?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <PieCharts
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              displaynames={displaynames}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot2?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <PieCharts
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot3?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart1
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(...[
                                fulldataset?.plot3[0]?.total_core / 1000,
                                fulldataset?.plot3[1]?.total_incremental / 1000,
                                fulldataset?.plot3[2]?.total_media / 1000,
                                fulldataset2?.plot3[0]?.total_core / 1000,
                                fulldataset2?.plot3[1]?.total_incremental / 1000,
                                fulldataset2?.plot3[2]?.total_media / 1000,
                              ]) / 100) * 100}
                              maxValuedynamicValue={Math.ceil(Math.max(...[
                                fulldataset?.plot3[0]?.total_core_sales / 100000,
                                fulldataset?.plot3[1]?.total_incremental_sales / 100000,
                                fulldataset?.plot3[2]?.total_media_sales / 100000,
                                fulldataset2?.plot3[0]?.total_core_sales / 100000,
                                fulldataset2?.plot3[1]?.total_incremental_sales / 100000,
                                fulldataset2?.plot3[2]?.total_media_sales / 100000,
                              ]) / 100) * 100}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot3?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart1
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(...[
                                fulldataset?.plot3[0]?.total_core / 1000,
                                fulldataset?.plot3[1]?.total_incremental / 1000,
                                fulldataset?.plot3[2]?.total_media / 1000,
                                fulldataset2?.plot3[0]?.total_core / 1000,
                                fulldataset2?.plot3[1]?.total_incremental / 1000,
                                fulldataset2?.plot3[2]?.total_media / 1000,
                              ]) / 100) * 100}
                              maxValuedynamicValue={Math.ceil(Math.max(...[
                                fulldataset?.plot3[0]?.total_core_sales / 100000,
                                fulldataset?.plot3[1]?.total_incremental_sales / 100000,
                                fulldataset?.plot3[2]?.total_media_sales / 100000,
                                fulldataset2?.plot3[0]?.total_core_sales / 100000,
                                fulldataset2?.plot3[1]?.total_incremental_sales / 100000,
                                fulldataset2?.plot3[2]?.total_media_sales / 100000,
                              ]) / 100) * 100}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot4?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart2
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(...fulldataset?.plot4.map((it) => it.contribution), ...fulldataset2?.plot4.map((it) => it.contribution)) / 100
                              ) * 100}
                              maxValuedynamicValue={Math.ceil(
                                Math.max(...fulldataset?.plot4.map((it) => it.contribution_sales_value / 100000, ...fulldataset2?.plot4.map((it) => it.contribution_sales_value / 100000)))
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot4?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart2
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(...fulldataset?.plot4.map((it) => it.contribution), ...fulldataset2?.plot4.map((it) => it.contribution)) / 100
                              ) * 100}
                              maxValuedynamicValue={Math.ceil(
                                Math.max(...fulldataset?.plot4.map((it) => it.contribution_sales_value / 100000, ...fulldataset2?.plot4.map((it) => it.contribution_sales_value / 100000)))
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot10?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart5
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(...fulldataset?.plot10.map((it) => it.contribution), ...fulldataset2?.plot10.map((it) => it.contribution)) / 100
                              ) * 100}
                              maxValuedynamicValue={Math.ceil(
                                Math.max(...fulldataset?.plot10.map((it) => it.contribution_sales_value / 100000), ...fulldataset2?.plot10.map((it) => it.contribution_sales_value / 100000))
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot10?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart5
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(...fulldataset?.plot10.map((it) => it.contribution), ...fulldataset2?.plot10.map((it) => it.contribution)) / 100
                              ) * 100}
                              maxValuedynamicValue={Math.ceil(
                                Math.max(...fulldataset?.plot10.map((it) => it.contribution_sales_value / 100000), ...fulldataset2?.plot10.map((it) => it.contribution_sales_value / 100000))
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot5?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart4
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot5?.map((it) => Number(it?.attribute_value_per_roi)),
                                ...fulldataset2?.plot5?.map((it) => Number(it?.attribute_value_per_roi))
                              ))}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot5?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart4
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot5?.map((it) => Number(it?.attribute_value_per_roi)),
                                ...fulldataset2?.plot5?.map((it) => Number(it?.attribute_value_per_roi))
                              ))}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot13?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart8
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot13?.map((it) => Number(it?.attribute_value_per_roi)),
                                ...fulldataset2?.plot13?.map((it) => Number(it?.attribute_value_per_roi))
                              ))}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot13?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart8
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot13?.map((it) => Number(it?.attribute_value_per_roi)),
                                ...fulldataset2?.plot13?.map((it) => Number(it?.attribute_value_per_roi))
                              ))}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot12?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart7
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot12?.filter(varObj => !ExceptionVariables.hiddenroichart?.includes(varObj?.variable))?.map((it) => Number(it?.attribute_value_per_roi)),
                                ...fulldataset?.plot12?.filter(varObj => !ExceptionVariables.hiddenroichart?.includes(varObj?.variable))?.map((it) => Number(it?.attribute_value_per_roi))
                              ))}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot12?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart7
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot12?.filter(varObj => !ExceptionVariables.hiddenroichart?.includes(varObj?.variable))?.map((it) => Number(it?.attribute_value_per_roi)),
                                ...fulldataset?.plot12?.filter(varObj => !ExceptionVariables.hiddenroichart?.includes(varObj?.variable))?.map((it) => Number(it?.attribute_value_per_roi))
                              ))}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot11?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart6
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot11?.map((it) => Number(it?.effectiveness)),
                                ...fulldataset2?.plot11?.map((it) => Number(it?.effectiveness))
                              ) / 10) * 10}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot11?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart6
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot11?.map((it) => Number(it?.effectiveness)),
                                ...fulldataset2?.plot11?.map((it) => Number(it?.effectiveness))
                              ) / 10) * 10}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset2?.plot9?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart3
                              fulldataset={fulldataset2}
                              type={`${displaynames?.scenario?.match("Reference") ? "Reference" : "Base"} Scenario`}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot9?.map((it) => Number(it?.effectiveness)),
                                ...fulldataset2?.plot9?.map((it) => Number(it?.effectiveness))
                              ) / 10) * 10}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6 col-12">
                        {fulldataset?.plot9?.length > 0 && (
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart3
                              fulldataset={fulldataset}
                              type={displaynames.scenario}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(
                                ...fulldataset?.plot9?.map((it) => Number(it?.effectiveness)),
                                ...fulldataset2?.plot9?.map((it) => Number(it?.effectiveness))
                              ) / 10) * 10}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {brandoptions?.length > 0 ? (
                  <div className="rr-card rr-card-section">
                    <div className="row g-3 align-items-end">
                      <div className="col-12 col-md-3">
                        <label className="rr-label">
                          FY:<span className="text-danger">*</span>
                        </label>
                        <Select
                          classNamePrefix="rr-select"
                          placeholder="Select"
                          options={[
                            ...yearoptions?.map((item) => ({
                              label: item.fy,
                              value: item.fy,
                            }))] || []}
                          value={
                            selectedyear && selectedyear !== "Select"
                              ? { label: selectedyear, value: selectedyear }
                              : null
                          }
                          onChange={(option) => {
                            const value = option?.value || "Select";
                            setscenarionewoldscreen("Select");
                            settimetype("");
                            setviewscenariodatatable(false);
                            setviewnewbasescenariodata(false);
                            setviewannualoptimizeplan(false);
                            setselectedyear(value);
                            setselectedbrand("");
                            setmarket("");
                            setselectedscenarioname("");
                          }}
                        />
                      </div>

                      <div className="col-12 col-md-3">
                        <label className="rr-label">
                          Brand:<span className="text-danger">*</span>
                        </label>
                        <Select
                          classNamePrefix="rr-select"
                          placeholder="Select"
                          options={[
                            ...brandoptions?.map((option) => ({
                              label: maskedBrandOption.maskedBrandOption[option.brand],
                              value: option.brand,
                            }))] || []}
                          value={
                            selectedbrand && selectedbrand !== "Select"
                              ? {
                                label: maskedBrandOption.maskedBrandOption[selectedbrand],
                                value: selectedbrand,
                              }
                              : null
                          }
                          onChange={(option) => {
                            const value = option?.value || "Select";
                            setselectedbrand(value);
                            setmarket("Select");
                            setselectedscenarioname("Select");
                            setviewscenariodatatable(false);
                            setviewnewbasescenariodata(false);
                            setviewannualoptimizeplan(false);
                          }}
                        />
                      </div>

                      <div className="col-12 col-md-3">
                        <label className="rr-label">
                          Market:<span className="text-danger">*</span>
                        </label>
                        <Select
                          classNamePrefix="rr-select"
                          placeholder="Select"
                          options={[
                            ...marketoptions?.map((item) => ({
                              label: item.final_market,
                              value: item.final_market,
                            }))] || []}
                          value={
                            market && market !== "Select"
                              ? { label: market, value: market }
                              : null
                          }
                          onChange={(option) => {
                            const value = option?.value || "Select";
                            setmarket(value);
                            setselectedscenarioname("Select");
                            setviewscenariodatatable(false);
                            setviewnewbasescenariodata(false);
                            setviewannualoptimizeplan(false);
                          }}
                        />
                      </div>

                      <div className="col-12 col-md-3">
                        <label className="rr-label">
                          Scenario:<span className="text-danger">*</span>
                        </label>
                        <Select
                          classNamePrefix="rr-select"
                          placeholder="Select"
                          options={[
                            { label: "Old Scenarios", value: "old" },
                            { label: "New Scenario", value: "new" },
                          ]}
                            value={
                              scenarionewoldscreen
                                ? {
                                  label:
                                    scenarionewoldscreen === "old"
                                      ? "Old Scenarios"
                                      : scenarionewoldscreen === "new"
                                        ? "New Scenario"
                                        : "Select",
                                  value: scenarionewoldscreen,
                                }
                                : { label: "Select", value: "select" }
                            }
                            onChange={(option) => {
                              const value = option?.value || "select";
                              if (market && selectedbrand && market !== "Select" && selectedbrand !== "Select") {
                                setscenarionewoldscreen(value);
                                setviewscenariodatatable(false);
                                setviewscenariobtn(false);
                                setuploadfiledata([]);
                                setviewnewbasescenariodata(false);
                                setviewannualoptimizeplan(false);
                                settimetype("");
                                setselectedscenarioname("");
                              } else {
                                dispatch(
                                  getNotification({
                                    message: "Please select brand and market!",
                                    type: "danger",
                                  })
                                );
                              }
                            }}
                          />
                      </div>
                    </div>

                    {scenarionewoldscreen === "old" && (
                      <>
                        <label className="rr-label my-2">
                          Scenario Name:<span className="text-danger">*</span>
                        </label>
                        <Select
                          classNamePrefix="rr-select"
                          placeholder="Select Scenario"
                          options={scenariooptions}
                          value={
                            selectedscenarioname
                              ? { label: selectedscenarioname, value: selectedscenarioname }
                              : null
                          }
                          onChange={(value) => {
                            setviewscenariodatatable(false);
                            setviewnewbasescenariodata(false);
                            setviewannualoptimizeplan(false);
                            setselectedscenarioname(value?.value);
                            setselectedscenarionametimestamp(value?.timestamp);
                          }}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        />

                        <div className="d-flex justify-content-start mt-2">
                          {selectedscenarioname && selectedscenarioname !== "Select" && (
                            <button
                              className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                              disabled={isprocessing}
                              onClick={() => {
                                if (viewscenariodatatable) {
                                  setviewnewbasescenariodata(false);
                                  setviewannualoptimizeplan(false);
                                  setviewscenariodatatable(false);
                                } else {
                                  fetchdatasettable();
                                }
                              }}
                            >
                              {!viewscenariodatatable ? "View Scenario Data" : "Hide"}
                            </button>
                          )}
                        </div>

                        {loader2 && (
                          <div className="my-3 d-flex flex-column align-items-center justify-content-center">
                            <div className="rr-dot-loader">
                              <div></div><div></div><div></div>
                            </div>
                            <div className="mt-2 fw-semibold text-muted">Loading scenario data...</div>
                          </div>
                        )}
                      </>
                    )}

                    {scenarionewoldscreen === "new" && (
                      <>
                        <div className="d-flex flex-wrap gap-3 my-3">
                          {["Y", "HY", "Q", "M"].map((type) => {
                            const disableType = ['HY','Q','M']
                            let disableFlag = UserService.hasRole(['SALES']) ? disableType.includes(type) : false
                            return (
                              <div className="form-check" key={type}>
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="timetype"
                                  id={`radio-${type}`}
                                  onClick={() => {
                                    settimetype(type);
                                    setviewnewbasescenariodata(false);
                                    setviewannualoptimizeplan(false);
                                    setviewscenariodatatable(false);
                                    handlefetchnewbasescenario(type);
                                    if (type === "Q") {
                                      handleFetchAnnualOptimizePlan();
                                    }
                                  }}
                                  disabled={disableFlag}
                                />
                                <label
                                  className="form-check-label fw-bold"
                                  htmlFor={`radio-${type}`}
                                  style={{ cursor: "pointer" }}
                                >
                                  {type === "Y"
                                    ? "Yearly"
                                    : type === "HY"
                                      ? "Half-Yearly"
                                      : type === "Q"
                                        ? "Quarterly"
                                        : "Monthly"
                                  }
                                </label>
                              </div>
                            )
                          }
                          )
                          }
                        </div>

                        <div className="d-flex flex-wrap gap-2 my-3">
                          {timetype && (
                            <button
                              disabled={isprocessing}
                              className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                              onClick={() => {
                                if (!viewscenariodatatable) fetchdatasettable("Base Scenario");
                                setviewscenariodatatable(!viewscenariodatatable);
                              }}
                            >
                              {!viewscenariodatatable && timetype
                                ? "Create from Base Scenario Data"
                                : "Hide"}
                            </button>
                          )}

                          {timetype && Object.keys(newbasedetailscreatenew).length > 0 && (
                            <button
                              disabled={isprocessing}
                              className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                              onClick={() => {
                                if (!viewnewbasescenariodata) fetchdatasettablenewbasescenario();
                                setviewnewbasescenariodata(!viewnewbasescenariodata);
                              }}
                            >
                              {!viewnewbasescenariodata
                                ? "Create from Reference Scenario Data"
                                : "Hide"}
                            </button>
                          )}

                          {timetype === "Q" && Object.keys(getAnnualOptimizePlan).length > 0 && (
                            <button
                              disabled={isprocessing}
                              className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                              onClick={() => {
                                if (!viewannualoptimizeplan) fetchanuualoptimalplan();
                                setviewannualoptimizeplan(!viewannualoptimizeplan);
                              }}
                            >
                              {!viewannualoptimizeplan
                                ? "Create from Annual Optimize Plan"
                                : "Hide"}
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {scenarionewoldscreen === "old" &&
                      selectedscenarioname !== "Base Scenario" && (
                      <div className="mt-3">
                        <div
                          className="rr-btn rr-btn-primary"
                          type="button"
                          onClick={runSimulate}
                        >
                          <span>
                            Simulate <iconify-icon icon="iconamoon:arrow-right-2-bold" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rr-card rr-card-empty my-3">
                    <div className="rr-dot-loader">
                      <div></div><div></div><div></div>
                    </div>
                    <div className="mt-2 fw-semibold text-muted">Grabbing Details...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {uploadfiledata?.length > 0 && (
          <div className="rr-card rr-card-section mt-3">
            <div className="rr-table-scroll" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table className="table table-sm text-center rr-table">
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th scope="col">#</th>
                    {Object.keys(uploadfiledata[0])?.map((item) => (
                      <th
                        key={item}
                        scope="col"
                        style={item === "Brand" || item === "FY" ? { minWidth: "126px" } : {}}
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadfiledata?.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {Object.values(row).map((value, idx) => (
                        <td key={idx}>
                          {!isNaN(Number(value)) && isFinite(Number(value))
                            ? Number(value).toFixed(0)
                            : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!viewscenariodatatable ? (
          ""
        ) : (
          <div className="mt-4" id="attributetable">
            <div className="d-flex flex-row-reverse flex-wrap gap-2 mb-3">
              <button
                disabled={isprocessing}
                className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                data-toggle={false && "modal"}
                data-target="#exampleModal1"
                onClick={handleButtonClick}
              >
                Import
              </button>

              <input
                type="file"
                accept=".xlsx"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUploadoldscenario}
              />

              <button
                disabled={isprocessing}
                className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                data-toggle={false && "modal"}
                data-target="#exampleModal1"
                onClick={() => {
                  handleexportoldscenarios();
                }}
              >
                Export
              </button>

              <button
                disabled={isprocessing}
                className={isprocessing ? "rr-btn rr-btn-disabled" : "rr-btn rr-btn-primary"}
                data-toggle={displaynames2.scenario === "Base Scenario" && "modal"}
                data-target="#exampleModal1"
                onClick={() => {
                  if (displaynames2.scenario !== "Base Scenario") {
                    updatescenario();
                  }
                }}
              >
                {displaynames2.scenario === "Base Scenario" ? "Save Scenario" : "Update Scenario"}
              </button>
            </div>

            {loader4 ? (
              "Loading..."
            ) : (
              <>
                <VariableTable
                  sampledataset={sampledataset}
                  changesampledataset={changesampledataset}
                  originalset={originalset}
                  changeoriginalset={changeoriginalset}
                  originaldatasetforcolorcoding={originaldatasetforcolorcoding}
                  endDate={endDate}
                />
              </>
            )}
          </div>
        )}

        {!viewnewbasescenariodata ? (
          ""
        ) : (
          <div className="mt-4" id="attributetable">
            <div className="d-flex flex-row-reverse flex-wrap gap-2 mb-3">
              <button
                className="rr-btn rr-btn-primary"
                data-toggle={false && "modal"}
                data-target="#exampleModal1"
                onClick={handleButtonClick}
              >
                Import
              </button>

              <input
                type="file"
                accept=".xlsx"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUploadoldscenario}
              />

              <button
                className="rr-btn rr-btn-primary"
                data-toggle={false && "modal"}
                data-target="#exampleModal1"
                onClick={() => {
                  handleexportoldscenarios();
                }}
              >
                Export
              </button>

              <button
                className="rr-btn rr-btn-primary"
                data-toggle={(displaynames2.scenario === "Base Scenario" || displaynames2.scenario === "newbase") && "modal"}
                data-target="#exampleModal2"
                onClick={() => {
                  if (displaynames2.scenario !== "Base Scenario" && displaynames2.scenario !== "newbase") {
                    updatescenario();
                  }
                }}
              >
                {displaynames2.scenario === "Base Scenario" || displaynames2.scenario === "newbase"
                  ? "Save Scenario"
                  : "Update Scenario"}
              </button>
            </div>

            {loader4 ? (
              "Loading..."
            ) : (
              <>
                <VariableTable
                  sampledataset={sampledataset}
                  changesampledataset={changesampledataset}
                  originalset={originalset}
                  changeoriginalset={changeoriginalset}
                  originaldatasetforcolorcoding={originaldatasetforcolorcoding}
                  endDate={endDate}
                />
              </>
            )}
          </div>
        )}

        {!viewannualoptimizeplan ? (
          ""
        ) : (
          <div className="mt-4" id="attributetable">
            <div className="d-flex flex-row-reverse flex-wrap gap-2 mb-3">
              <button
                className="rr-btn rr-btn-primary"
                data-toggle={false && "modal"}
                data-target="#exampleModal3"
                onClick={handleButtonClick}
              >
                Import
              </button>

              <input
                type="file"
                accept=".xlsx"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUploadoldscenario}
              />

              <button
                className="rr-btn rr-btn-primary"
                data-toggle={false && "modal"}
                data-target="#exampleModal3"
                onClick={() => {
                  handleexportoldscenarios();
                }}
              >
                Export
              </button>

              <button
                className="rr-btn rr-btn-primary"
                data-toggle={displaynames2.scenario === "Annual Optimize PLan" && "modal"}
                data-target="#exampleModal3"
                onClick={() => {
                  if (displaynames2.scenario !== "Annual Optimize PLan") {
                    updatescenario();
                  }
                }}
              >
                {displaynames2.scenario === "Annual Optimize PLan" ? "Save Scenario" : "Update Scenario"}
              </button>
            </div>

            {loader4 ? (
              "Loading..."
            ) : (
              <>
                <VariableTable
                  sampledataset={sampledataset}
                  changesampledataset={changesampledataset}
                  originalset={originalset}
                  changeoriginalset={changeoriginalset}
                  originaldatasetforcolorcoding={originaldatasetforcolorcoding}
                  endDate={endDate}
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Simulator;
