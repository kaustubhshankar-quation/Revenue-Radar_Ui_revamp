import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Loader from "react-js-loader";
import { useDispatch } from "react-redux";
import UserService from "../../services/UserService";
import Select, { components } from "react-select";
import getNotification from "../../Redux/Action/action";
import axios from "axios";
import LoaderCustom from "../LoaderCustom";
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'
import VariableTable from "../Simulator/VariableTable";
import LineChartOptimizer from "./LineChartOptimizer";
import UbLbTable from "./UbLbTable";
import AfterOptimizationTable from "./AfterOptimizationTable";
import SingleBarChart4 from "../Simulator/SingleBarChart4";
import SingleBarChart5 from "../Simulator/SingleBarChart5";
import SingleBarChart6 from "../Simulator/SingleBarChart6";
import SingleBarChart1 from "../Simulator/SingleBarChart1";
import SingleBarChart2 from "../Simulator/SingleBarChart2";
import SingleBarChart3 from "../Simulator/SingleBarChart3";
import PieCharts from "../Simulator/PieCharts";
import SingleBarChart7 from "../Simulator/SingleBarChart7";
import SingleBarChart2op from "./SingleBarChart2op";
import SingleBarChart5op from "./SingleBarChart5op";
import SingleBarChart4op from "./SingleBarChart4op";
import SingleBarChart7op from "./SingleBarChart7op";
import SingleBarChart6op from "./SingleBarChart6op";
import PieChartop from "./PieChartop";
import SingleBarChart1op from "./SingleBarChart1op";
import VariableTableYearly from "../Simulator/VariableTableYearly";
import maskedBrandOption from '../JSON Files/MaskedBrandOption.json'
import { downloadPdf, uploadPDF, notifyRequestError, requireLogin, defaultJsonHeaders, formatPlotMonthYear, getCurrentFormattedTime } from "../HelperFunction/helperFunction";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
const { REACT_APP_UPLOAD_DATA } = process.env;
function Optimizer() {
  const [savedmasterscenarioname, setsavedmasterscenarioname] = useState("")
  const [savedatoqscenarioname, setsavedatoqscenarioname] = useState("")
  const [loader3, setloader3] = useState(false);
  const [atoqLoader, setatoqLoader] = useState(false);
  const [endDate, setEndDate] = useState("")
  const [percentagegrowthrqd, setpercentagegrowthrqd] = useState(0)
  const [salesno, setsalesno] = useState(0)
  const [salesnooriginalobj3, setsalesnooriginalobj3] = useState(0)
  const [budgetconstraintrequired, setbudgetconstraintrequired] = useState(false)
  const [isprocessing, setisprocessing] = useState(false)
  const [fromrangeonplots, setfromrangeonplots] = useState("")
  const [isValue, setisValue] = useState(false)
  const dispatch = useDispatch();
  const [distributionvalue, setdistributionvalue] = useState([])
  const [distributionvaluecontri, setdistributionvaluecontri] = useState([])
  const [originaldatasetforcolorcoding, setoriginaldatasetforcolorcoding] = useState([])
  const [summedupvalues, setsummedupvalues] = useState([])
  const [uniquemonths, setuniquemonths] = useState([])
  const [planneddataset, setplanneddataset] = useState([])
  const [corevalue, setcorevalue] = useState([])
  const [coreDistributionvalue, setcoreDistributionvalue] = useState([])
  const [optimizeddatasetmedia, setoptimizeddatasetmedia] = useState([])
  const [optimizeddatasetcontripercentage, setoptimizeddatasetcontripercentage] = useState([])
  const [optimizeddatasetincrement, setoptimizeddatasetincrement] = useState([])
  const [optimizeddatasetincrementroi, setoptimizeddatasetincrementroi] = useState([])
  const [first2chartsdata, setfirst2chartsdata] = useState([])
  const [selectedmonth, setselectedmonth] = useState("")
  const [yearoptions, setyearoptions] = useState([])
  const [marketoptions, setmarketoptions] = useState([])
  const [modifybtn, setmodifybtn] = useState(false)
  const [scenariooptions, setscenariooptions] = useState([]);
  const [salestabledata, setsalestabledata] = useState([]);
  const [scenarionewoldscreen, setscenarionewoldscreen] = useState("select");
  const [market, setmarket] = useState("");
  const [loader, setloader] = useState(false);
  const [optimizationTime, setOptimizationTime] = useState(null);
  const handleOptElapsed = useCallback((secs) => setOptimizationTime(secs), []);
  const [loader5, setloader5] = useState(false);
  const [loader2, setloader2] = useState(false);
  const [loader6, setloader6] = useState(false);
  const [loader4, setloader4] = useState(false);
  const [viewscenariodatatable2, setviewscenariodatatable2] = useState(false)
  const [viewscenariodatatable, setviewscenariodatatable] = useState(false)
  const [newscenariofile, setnewscenariofile] = useState("")
  const [brandoptions, setbrandoptions] = useState([]);
  const [fulldataset2, setfulldataset2] = useState([]);
  const [upperboundlowerboundscreen, setupperboundlowerboundscreen] = useState(false)
  const [totalBudget, settotalBudget] = useState(0)
  const [displaynames, setdisplaynames] = useState({});
  const [displaynames2, setdisplaynames2] = useState({});
  const [edit, setedit] = useState([]);
  const [edit2, setedit2] = useState([]);
  const [selectedzone, setselectedzone] = useState("National")
  const [selectedbrand, setselectedbrand] = useState("");
  const [selectedscenarioname, setselectedscenarioname] = useState("");
  const [selectedscenarioid, setselectedscenarioid] = useState("");
  const [selectedscenarionametimestamp, setselectedscenarionametimestamp] = useState("");
  const [selectedyear, setselectedyear] = useState("");
  const [resultscreen, setresultscreen] = useState(false);
  const [resultscreen2, setresultscreen2] = useState(false);
  const [resultscreen3, setresultscreen3] = useState(true);
  const [newscenarionamegiven, setnewscenarionamegiven] = useState("");
  const [sampledataset, setsampledataset] = useState([]);
  const [selectedobjective, setselectedobjective] = useState("");
  const [originalset2, setoriginalset2] = useState([]);
  const [originalset, setoriginalset] = useState([]);
  const [sampledataset2, setsampledataset2] = useState([]);
  const [originalsetublboriginal, setoriginalsetublboriginal] = useState([]);
  const [plotdata1, setplotdata1] = useState([]);
  const [filteredplotdata1, setfilteredplotdata1] = useState([]);
  const [plotdata2, setplotdata2] = useState([]);
  const [atoqData, setAtoQData] = useState([])
  const [resultValueData, setResultValueData] = useState([])
  const [torangeonplots, settorangeonplots] = useState("")
  const [haloResults, sethaloResults] = useState([])
  const [sales_agg, setSales_agg] = useState([])
  const sectionRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    handlevariablesfetchfybrand()
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
    unblockeddate = isBefore15th ? new Date(today1.getFullYear(), today1.getMonth() - 2, 1) : new Date(today1.getFullYear(), today1.getMonth() - 2, 1);
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
      requireLogin("/optimizer");
    }
    setisprocessing(false)
  };
  
  const fetchlowerupperboundtabledata = () => {
    if (selectedscenarioname && selectedscenarioname !== "Select") {
      setupperboundlowerboundscreen(true)

    }
    else {
      setupperboundlowerboundscreen(false)
    }

  }
  
  const updatescenario = async (update) => {
    if (UserService.isLoggedIn()) {
      try {
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
      requireLogin("/optimizer");
    }

  };

  const handlevariablesfetchfybrand = async () => {
    if (UserService.isLoggedIn()) {
      try {
        const FormData = require("form-data");
        const sendData = new FormData();

        const config = {
          method: "get",
          url: `${REACT_APP_UPLOAD_DATA}/app/get_brand_fy`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: sendData,
        };
        const getResponse = await axios(config);
        if (getResponse.data !== "Invalid User!") {
          setyearoptions([
            ...(getResponse.data?.fy || [])]);
          const filteredBrands = getResponse.data.brands?.filter(it => !ExceptionVariables?.brandoptionshide?.includes(it?.brand))?.sort((a, b) => a.brand.localeCompare(b.brand))

          let finalBrands = filteredBrands

          if (UserService.hasRole(["BBMNGR"])) {
            finalBrands = filteredBrands?.filter(it => it?.brand === "BAD BANGLES");
          }
          else if (UserService.hasRole(["OODMNGR"])) {
            finalBrands = filteredBrands?.filter(it => it?.brand === "OODLES");
          }
          else if (UserService.hasRole(["SALES"])) {
            finalBrands = filteredBrands?.filter(it => it?.brand === "OODLES");
          }
          else if (UserService.hasRole(["MUMNGR"])) {
            finalBrands = filteredBrands?.filter(it => it?.brand === "MILD URGENCY");
          }
          else if (UserService.hasRole(["CBMNGR"])) {
            finalBrands = filteredBrands?.filter(it => it?.brand === "CHERRY BRIGHT");
          }
          console.log(filteredBrands)
          setbrandoptions(finalBrands)
        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/optimizer");
    }
  };
  const handlefetchmarket = async () => {
    if (UserService.isLoggedIn()) {
      try {
        const FormData = require("form-data");
        const sendData = new FormData();
        sendData.append("brand", selectedbrand)
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/app/get_markets`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: sendData,
        };
        const getResponse = await axios(config);
        if (getResponse.data !== "Invalid User!") {
          const markets = getResponse.data.markets;
          if (UserService.hasRole(["SALES"])) {
            // let finalmarkets = markets?.filter(it => it.final_market === "EAST");
            setmarketoptions(markets)
          }
          else {
            setmarketoptions(markets);
          }
        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/optimizer");
    }
  };
  const handlefetchtotalsalesnoforobjective3 = async (objective) => {
    setloader6(true)
    if (UserService.isLoggedIn()) {
      if (selectedyear && selectedyear !== "Select" && market && market !== "Select" && selectedscenarioname && selectedscenarioname !== "Select" && selectedbrand && selectedbrand !== "Select") {
        try {
          setisprocessing(true)
          //setmodifybtn(false)

          const FormData = require("form-data");
          const sendData = new FormData();
          sendData.append("scenario_name", selectedscenarioname);
          sendData.append("scenario_timestamp", selectedscenarionametimestamp);
          sendData.append("user_id", "admin");
          sendData.append("brand", selectedbrand);
          sendData.append("model_id", 1);
          sendData.append("market", market);
          sendData.append("f_year", selectedyear);

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
          }
          const getResponse1 = await axios(config1);
          //const getResponse2 = await axios(config2);

          if (getResponse1.data.data) {
            if (getResponse1?.data?.data?.plot1?.length > 0) {
              console.log(getResponse1.data.data)
              setsalesno(getResponse1.data.data.total_sales_opt[0]?.total_sales)
              setsalesnooriginalobj3(getResponse1.data.data.total_sales_opt[0]?.total_sales)
            }
          }
          else {

            dispatch(
              getNotification({
                message: "There is no data for selected options",
                type: "default",
              })
            );
          }

        }
        catch (err) {
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
      requireLogin("/optimizer");
    }
    setisprocessing(false)
    setloader6(false)
  };

  const handlemodifytotalsalesobj3 = async (budgetfromcell) => {
    if (UserService.isLoggedIn()) {
      try {
        const FormData = require("form-data");
        const sendData = new FormData();
        const currenttime = getCurrentFormattedTime()

        const requestData = {
          dataset: [
            {
              scenario_name: selectedscenarioname,
              created_dt: currenttime,

              brand: selectedbrand,
              "total_sales": salesnooriginalobj3,
              "expected_sales": salesnooriginalobj3 * (budgetfromcell / 100 + 1),
              market: market,
            }
          ]

          // budget:totalBudget,
        };
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/modify_total_sales_opt`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData,
        };
        const getResponse = await axios(config);
        // console.log(getResponse)
        if (getResponse.data !== "Invalid User!") {

          // settotalBudget(budgetfromcell)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/optimizer");
    }
  };
  const handlefetchbudget = async (objective) => {
    if (UserService.isLoggedIn()) {
      try {

        setisprocessing(true)
        const FormData = require("form-data");
        const sendData = new FormData();
        sendData.append("brand", selectedbrand)
        sendData.append("scenario_name", selectedscenarioname)
        sendData.append("final_market", market)
        sendData.append("scenario_timestamp", selectedscenarionametimestamp)
        const config2 = {
          method: "post",
          url: selectedscenarioname?.startsWith("Y_") ? `${REACT_APP_UPLOAD_DATA}/api/get_annual_obj_budget` : `${REACT_APP_UPLOAD_DATA}/api/get_obj_budget`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: sendData,
        };
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/get_budget`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: sendData,
        };

        // const sendData2 = new FormData();
        // sendData2.append("brand", selectedbrand)
        // sendData2.append("scenario_name", selectedscenarioname)
        // sendData2.append("final_market", market)
        // sendData2.append("scenario_timestamp",selectedscenarionametimestamp)
        // const config2 = {
        //   method: "post",
        //   url: `${REACT_APP_UPLOAD_DATA}/api/get_obj_budget`,
        //   headers: {
        //     Accept: "text/plain",
        //     "Content-Type": "application/json",

        //   },
        //   data: sendData2,
        // };
        if (objective === "Optimize Spends to Maximize Sales" || objective === "Maintain Sales and Minimize Spends") {
          const getResponse2 = await axios(config2);

        }

        const getResponse = await axios(config);

        if (getResponse.data !== "Invalid User!") {

          settotalBudget(getResponse.data[0].budget)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/optimizer");
    }
    setisprocessing(false)
  };
  const handlemodifybudget = async (budgetfromcell) => {
    if (UserService.isLoggedIn()) {
      try {
        const FormData = require("form-data");
        const sendData = new FormData();
        const currenttime = getCurrentFormattedTime()

        const requestData = {
          dataset: [
            {
              scenario_name: selectedscenarioname,
              created_dt: currenttime,
              user_id: "admin",
              brand: selectedbrand,
              final_market: market,
              budget: budgetfromcell
            }
          ]

          // budget:totalBudget,
        };
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/modify_budget`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData,
        };
        const getResponse = await axios(config);
        if (getResponse.status === 200) {

          settotalBudget(budgetfromcell)

        }
      } catch (err) {
        console.log("Server Error", err);
        if (err.response && err.response.status === 500) {
          dispatch(
            getNotification({
              message: "Budget entered is out of range!",
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
      requireLogin("/optimizer");
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
              created_dt: it.created_dt
            }
          }))
        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/optimizer");
    }
  };
  const handlemodifymasterscenarios = async () => {
    setloader4(true)
    if (UserService.isLoggedIn()) {
      try {

        const FormData = require("form-data");
        const sendData = new FormData();
        const currenttime = getCurrentFormattedTime()
        //console.log(displaynames.timestamp)

        let config;
        sendData.append("scenario_name", selectedscenarioname);
        sendData.append("scenario_timestamp", selectedscenarionametimestamp);
        sendData.append("user_id", "admin");
        sendData.append("final_market", market);
        sendData.append("brand", selectedbrand)
        sendData.append("fy", selectedyear)
        let getResponse = []
        let successfulResponse = []

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

        getResponse = await axios(config)

        const requestData2 = {
          fy: selectedyear,
          brand: selectedbrand,
          final_market: market,
          scenario_name: `${displaynames?.scenario}`,
          frequency: displaynames?.scenario?.startsWith("M_") ? "M" : displaynames?.scenario.startsWith("Y_") ? "Y" : displaynames?.scenario.startsWith("Q_") ? "Q" : "HY",
          scenario_created_timestamp: displaynames.timestamp,
          updated_by: "admin",
          brand_market_frequency: `${selectedbrand}_${market}_${displaynames?.scenario?.startsWith("M_") ? "M" : displaynames?.scenario.startsWith("Y_") ? "Y" : displaynames?.scenario.startsWith("Q_") ? "Q" : "HY"}`
        };
        const requestData3 = {
          "scenario_name": `${displaynames?.scenario?.startsWith("M_") ? "M" : displaynames?.scenario.startsWith("Y_") ? "Y" : displaynames?.scenario.startsWith("Q_") ? "Q" : "HY"}_Base_Master_Scenario`,
          "scenario_timestamp": "2025-01-12 15:54:05",
          "user_id": "admin",
          "model_id": 1,
          "fy": displaynames?.fy,
          "dataset": getResponse?.data
        };

        const config2 = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData2,
        };

        const config3 = {
          method: "post",
          url: displaynames?.scenario?.startsWith("HY_") ? `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario_hy` : displaynames?.scenario.startsWith("Y_") ? `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario_annual` : displaynames?.scenario.startsWith("Q_") ? `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario_qtr` : `${REACT_APP_UPLOAD_DATA}/api/save_master_scenario_monthly`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData3,
        };
        const getResponse2 = await axios(config2);
        const getResponse3 = await axios(config3);
        if (getResponse2.data) {

          setsavedmasterscenarioname(getResponse2.data.scenario_name)
          //setnewbasescenarioname(getResponse)
          //settotalBudget(budgetfromcell)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/optimizer");
    }
    setloader4(false)
  };

  const handleSetAsAnuualOptimizePlanbtn = async () => {
    if (UserService.isLoggedIn()) {
      setatoqLoader(true)
      try {
        const requestData = {
          fy: selectedyear,
          brand: selectedbrand,
          final_market: market,
          scenario_name: `${displaynames?.scenario}`,
          created_dt: new Date().toLocaleString(),
          user_id: "1",
          dataset: atoqData
        };
        if (selectedscenarioname?.startsWith("Y_")) {
          const config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/save-qtr-optimized-scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData,
          };
          const response = await axios(config)
          if (response.data) {
            setsavedatoqscenarioname(response.data.scenario_name)
          }
        }
        else {
          dispatch(
            getNotification({
              message: "The Selected Scenario is Not Valid for this Functionality",
              type: "danger",
            }))
        }
      }
      catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
      finally {
        setatoqLoader(false)
      }
    }
    else {
      requireLogin("/optimizer");
    }
  }

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
  const fetchdatasettable = async (ifscenariogiven) => {

    if (UserService.isLoggedIn()) {
      if (market && selectedbrand && market !== "Select" && selectedbrand !== "Select") {
        try {
          setloader2(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;
          sendData.append("scenario_name", ifscenariogiven === "Base Scenario" ? "Base Scenario" : selectedscenarioname);
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

          // Now you can use `config` without any errors
          const getResponse = await axios(config);

          if (getResponse.status === 200) {

            if (getResponse?.data?.length > 0 && getResponse?.data[0] !== "No Records Found" && getResponse?.data[0].Error !== "Invalid User!"
            ) {
              setviewscenariodatatable(true)
              setresultscreen(true)
              ifscenariogiven && setselectedscenarioname(ifscenariogiven)
              setdisplaynames2({
                ...displaynames2,
                brand: selectedbrand,
                scenario: selectedscenarioname,
                market: market,
                fy: selectedyear

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
              setoriginaldatasetforcolorcoding(arrangeddataset)

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
      requireLogin("/optimizer");
    }
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
          setloader5(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;
          sendData.append("scenario_name", selectedscenarioname);

          sendData.append("scenario_timestamp", selectedscenarionametimestamp);
          sendData.append("user_id", "admin");
          sendData.append("final_market", market);
          sendData.append("fy", selectedyear)
          sendData.append("brand", selectedbrand)
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

          // Now you can use `config` without any errors
          const getResponse = await axios(config);

          if (getResponse.status === 200) {

            if (getResponse?.data?.length > 0 && getResponse?.data[0] !== "No Records Found" && getResponse?.data[0].Error !== "Invalid User!"
            ) {

              setdisplaynames2({
                ...displaynames2,
                brand: selectedbrand,
                scenario: selectedscenarioname,
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

              setviewscenariodatatable2(true)

              setTimeout(() => {
                scrollToSection("attributetable2")
              }, 500)

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
      requireLogin("/optimizer");
    }
    setloader5(false);

  };
  const fetchublbtable = async (ifscenariogiven) => {
    setupperboundlowerboundscreen(false)
    if (UserService.isLoggedIn()) {
      if (market && selectedbrand && market !== "Select" && selectedbrand !== "Select") {
        try {
          setloader2(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;
          // sendData.append("scenario_name",ifscenariogiven?ifscenariogiven:selectedscenarioname);
          // sendData.append("user_id", "admin");
          // sendData.append("market", market);
          console.log(selectedscenarioname)
          sendData.append("brand", selectedbrand)
          sendData.append("scenario_name", ifscenariogiven)
          sendData.append("final_market", market)
          if (ifscenariogiven === "Base Scenario" || selectedscenarioname === "Base Scenario") {
            // sendData.append("fin_year", selectedyear);

            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/get_constraints`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            };
          } else {

            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/get_constraints`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData,
            };
          }

          // Now you can use `config` without any errors
          const getResponse = await axios(config);
          //console.log(getResponse)
          if (getResponse.status === 200) {

            if (getResponse?.data?.length > 0) {

              //  let arr=getResponse?.data
              //  arr?.map((it)=>{
              // return {
              //   ...it,
              //   scenario_name:selectedscenarioname
              // }
              // })
              // console.log(arr)
              // "a_point": 45,
              // "b_point": 95,
              // "c_point": 145,
              // "d_point": 165,
              setoriginalset2(
                getResponse?.data?.map((it) => ({
                  ...it,
                  a_point: it.a_point?.toFixed(1),
                  b_point: it.b_point?.toFixed(1),
                  c_point: it.c_point?.toFixed(1),
                  d_point: it.d_point?.toFixed(1),

                }))
              );
              setsampledataset2(getResponse?.data?.map((it) => ({
                ...it,
                a_point: it.a_point?.toFixed(1),
                b_point: it.b_point?.toFixed(1),
                c_point: it.c_point?.toFixed(1),
                d_point: it.d_point?.toFixed(1),

              })))
              setoriginalsetublboriginal(getResponse?.data?.map((it) => ({
                ...it,
                a_point: it.a_point?.toFixed(1),
                b_point: it.b_point?.toFixed(1),
                c_point: it.c_point?.toFixed(1),
                d_point: it.d_point?.toFixed(1),

              })))
              //setsampledataset2(getResponse.data)
              setupperboundlowerboundscreen(true)

            }

            else {
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
      requireLogin("/optimizer");
    }
    setloader2(false);

  };
  const changesampledataset = (changedValue) => {

    setsampledataset(changedValue)
  }
  const changeoriginalset = (changedValue) => {
    setoriginalset(changedValue)
  }
  const modifyublbtable = async (ifscenariogiven) => {
    if (UserService.isLoggedIn()) {
      if (market && selectedbrand && market !== "Select" && selectedbrand !== "Select") {
        try {
          setloader2(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;
          const currenttime = getCurrentFormattedTime()

          const requestData = {
            scenario_name: selectedscenarioname,
            created_dt: currenttime,
            final_market:
              market,
            brand: selectedbrand,
            user_id: "admin",
            dataset: originalset2,
            budget: totalBudget,
            model_id: 1
          };

          config = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/modify_constraints`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: requestData,
          };

          // Now you can use `config` without any errors
          const getResponse = await axios(config);
          //console.log(getResponse)
          if (getResponse.status === 200) {
            dispatch(
              getNotification({
                message: "Bounds updated!!",
                type: "success",
              })

            )

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
      requireLogin("/optimizer");
    }
    setloader2(false);

  };

  const removeTfromtimestamp = (time) => {

    return time.split("T").join(" ")
  }

  const handleoptimize = async () => {
    modifyublbtable()
    setviewscenariodatatable(false)
    setmodifybtn(false)
    if (UserService.isLoggedIn()) {
      try {
        if (selectedscenarioname && selectedscenarioname !== "Select" && selectedyear && selectedyear !== "Select" && market && market !== "Select" && selectedscenarioname && selectedscenarioname !== "Select" && selectedbrand && selectedbrand !== "Select" && selectedobjective && selectedobjective !== "Select") {
          try {
            setOptimizationTime(null)
            setloader(true)
            const FormData1 = require("form-data");
            const sendData1 = new FormData1();
            let config1;
            let currenttime = getCurrentFormattedTime()
            const requestData1 = {
              scenario_name: selectedscenarioname,
              scenario_timestamp: removeTfromtimestamp(selectedscenarionametimestamp),
              user_id: "admin",
              market: market,
              brand: selectedbrand,
              //dataset1: getResponse1.data,
              total_budget: totalBudget,
              mode: selectedobjective,
              f_year:selectedyear

            };

            const sendData2 = new FormData();
            sendData2.append("scenario_name", selectedscenarioname);
            sendData2.append("scenario_timestamp", selectedscenarionametimestamp);
            sendData2.append("user_id", "admin");
            sendData2.append("market", market);
            sendData2.append("model_id", 1);
            sendData2.append("brand", selectedbrand);
            sendData2.append("f_year", selectedyear);
            sendData2.append('mode', selectedobjective);

            config1 = {
              method: "post",
              url: selectedscenarioname?.startsWith("Y_") ? `${REACT_APP_UPLOAD_DATA}/api/annual_optimize` : selectedscenarioname?.startsWith("Q_") ? `${REACT_APP_UPLOAD_DATA}/api/qtr_optimize` : selectedscenarioname?.startsWith("HY_") ? `${REACT_APP_UPLOAD_DATA}/api/hy_optimize` : `${REACT_APP_UPLOAD_DATA}/api/optimize`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: requestData1,
              timeout: 15 * 60 * 1000,
            };
            const config2 = {
              method: "post",
              url: selectedscenarioname?.startsWith("Y_") ? `${REACT_APP_UPLOAD_DATA}/api/annual_predict` : selectedscenarioname?.startsWith("Q_") ? `${REACT_APP_UPLOAD_DATA}/api/qtr_predict` : selectedscenarioname?.startsWith("HY_") ? `${REACT_APP_UPLOAD_DATA}/api/hy_predict` : `${REACT_APP_UPLOAD_DATA}/api/predict`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: sendData2,
            };
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

            const getResponse6 = await axios(config6)

            // let arr = getResponse5?.data?.data.filter((it) => selectedyear === it?.fy)
            // let arr2=getResponse6?.data?.data.filter((it) => type === it?.frequency)
            //let arr = getResponse?.data?.data?.filter((it) => type === it?.frequency && Number(it?.fy?.split("-")[0]) + 1 === Number(selectedyrsplit[0]) && Number(it?.fy?.split("-")[1]) + 1 === Number(selectedyrsplit[1]))
            let selectedyrsplit = selectedyear?.split("-")

            getResponse6?.data?.data.length > 0 && setsavedmasterscenarioname(getResponse6?.data?.data.filter((it) => it.fy === selectedyear && type === it?.frequency)[0]?.scenerio_name)

            // const config3= {
            //   method: "post",
            //   url: `${REACT_APP_UPLOAD_DATA}/api/basescenario_predict`,
            //   headers: {
            //     Accept: "text/plain",
            //     "Content-Type": "application/json",
            //   },
            //   data: sendData2,
            // };
            // const getResponse3=await axios(config3)
            const getResponse2 = await axios(config2);
            const getResponse1 = await axios(config1);
            if (getResponse1?.data?.results_val?.length > 0) {
              setResultValueData(getResponse1?.data?.results_val)
            }
            if (getResponse1?.data?.halo_results?.length > 0) {
              sethaloResults(getResponse1?.data?.halo_results)
            }
            if (getResponse1?.data?.optimized_data?.length > 0) {
              setfulldataset2(getResponse2?.data?.data)
              setsalestabledata(getResponse1?.data?.optimized_sales)
              setplanneddataset(getResponse2?.data?.data)
              if (selectedscenarioname.startsWith("Q_") || selectedscenarioname.startsWith("HY_")) {

                setfirst2chartsdata(getResponse1?.data?.all_variable_monthly_contribution_value || [])
              }
              else {
                setfirst2chartsdata(getResponse1?.data?.all_variable_monthly_contribution)

              }
              setoptimizeddatasetcontripercentage(getResponse1?.data?.all_variable_monthly_contribution)
              if (selectedscenarioname.startsWith("Q_") || selectedscenarioname.startsWith("HY_")) {

                setoptimizeddatasetmedia(getResponse1?.data?.df_monthly_media_contributions?.sort((a, b) => a.frequency.localeCompare(b.frequency)))
              }
              else {
                setoptimizeddatasetmedia(getResponse1?.data?.df_monthly_media_contributions)
              }
              setoptimizeddatasetincrement(getResponse1?.data?.df_monthly_inc_contributions)
              setoptimizeddatasetincrementroi(getResponse1?.data?.df_roi_monthly_inc_contributions)

              let arr2 = []

              settorangeonplots(getResponse2?.data?.data?.plot1[getResponse2?.data?.data?.plot1.length - 1]?.month_year?.split("-").reverse()?.join("-"))

              let current_month_year = `${new Date().getFullYear()}-${(String(new Date().getMonth() + 1).padStart(2, "0"))}`;
              if (getResponse2?.data?.data?.plot1[0]?.month_year >= current_month_year) {
                setfromrangeonplots(getResponse2?.data?.data?.plot1[0]?.month_year?.split("-").reverse()?.join("-"))
              } else {

                const [year, month] = endDate.split("-");
                const date = new Date(year, month); // Month is zero-based in JS Date
                const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

                setfromrangeonplots(formattedDate?.split("-")?.reverse()?.join("-"))
              }

              setsummedupvalues(getResponse1?.data?.aggregated_results)
              setmodifybtn(false)
              const currentDate = new Date();
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() - 3; // getMonth() returns 0-indexed month
              const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
              const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

              // Filter the data to include only entries starting from the next month
              const datefiltereddatscenariopredictions = getResponse2?.data?.data?.plot1.filter(item => {
                const [year, month] = item?.month_year.split('-').map(Number); // Split "YYYY-MM" into year and month

                // Check if the month-year should have predicted_sales as null
                if (year > nextYear || (year === nextYear && month >= nextMonth)) {
                  return item; // Keep the item unchanged
                }
              });
              const categories = getResponse2?.data?.data?.plot1?.map((item) =>
                item?.month_year
              )
              const optimizedSalesData = categories?.map((category) => {
                const matchingItem = getResponse1?.data?.optimized_sales?.find(
                  (item) => item.month_year === category
                );
                return matchingItem ? matchingItem.attribute_value?.toFixed(0) : null;
              });

              setmodifybtn(false)
              setloader(false)
              setresultscreen2(true)
              setdisplaynames({
                ...displaynames,
                scenario: selectedscenarioname,
                timestamp: selectedscenarionametimestamp,
                market: market,
                fy: selectedyear,
                brand: selectedbrand,
                objective: selectedobjective,
                totalBudget: totalBudget
              })
              let arr = getResponse1?.data?.optimized_data[0]?.month_year || getResponse1?.data?.optimized_data[0]?.frequency ? Array.from(new Set(getResponse1?.data?.optimized_data.map((it) => it?.month_year || it?.frequency))) : []
              arr.push("All")
              setplotdata2(getResponse1?.data?.optimized_data)
              setplotdata1(getResponse1?.data?.optimized_data?.filter((it) => it.variable === "sales"))
              setSales_agg(getResponse1?.data?.sales_agg)
              // setfilteredplotdata1(getResponse1?.data?.optimized_data?.filter((it)=>it.month_year===(Array.from(new Set(getResponse1?.data?.optimized_data.map((it)=>it.month_year)))[0])))
              setfilteredplotdata1(getResponse1?.data?.aggregated_results)
              getResponse1?.data?.uob_planned_sales ? setcorevalue(getResponse1?.data?.uob_planned_sales) : setcorevalue([])
              // getResponse1?.data?.df_distribution ? setcoreDistributionvalue(getResponse1?.data?.df_distribution) : setcoreDistributionvalue([])
              setselectedmonth("All")
              setuniquemonths(arr)
              getResponse1?.data?.df_distribution ? setdistributionvalue([...getResponse1?.data?.df_distribution]) : setdistributionvalue([])
              getResponse1?.data?.eob_contribution_distribution ? setdistributionvaluecontri(getResponse1?.data?.eob_contribution_distribution) : setdistributionvaluecontri([])

              if (selectedscenarioname?.startsWith("Y_")) {
                setAtoQData(getResponse1?.data?.atoq_optimized)
              }

              setTimeout(() => {
                scrollToSection("optimizeddata")
              }, 1000);
            }
            else {
              dispatch(
                getNotification({
                  message: "There are no matching records to display!",
                  type: "danger",
                })
              );
            }
          }
          catch (err) {
            console.log("Server Error", err);
            setresultscreen2(false)
            if (err.response && err.response.status === 500) {
              dispatch(
                getNotification({
                  message: "Server is Down! Please try again after sometime",
                  type: "default",
                })
              );
            }
            else if (err.code === "ECONNABORTED") {
              dispatch(
                getNotification({
                  message: "Connection Timed out!",
                  type: "default",
                })
              );
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
        }
        else {
          dispatch(getNotification(
            {
              message: "Please select all entries!!",
              type: "danger"
            }
          ))
        }
      }
      catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    }
    else {
      requireLogin("/optimizer");
    }
    setloader(false)
  }

  const savescenario = async (update) => {
    if (UserService.isLoggedIn()) {
      try {

        const updatedDataset = [...sampledataset];
        //console.log(updatedDataset[0].frozen)
        updatedDataset.map((item) => {
          if (item.frozen === 0) {
            if (item.allow_decimal !== 0) {
              item.subtotal = item.month_data.reduce((acc, value) => acc + parseInt(value.attribute_value), 0); // Use parseInt for integer values
            }
          } else {
            item.subtotal = item.month_data.reduce((acc, value) => acc + parseFloat(value.attribute_value), 0); // Use parseFloat for decimal values
          }

        })

        setoriginalset(updatedDataset);
        let arr = [];
        setedit(arr);
        //console.log(formatPlotMonthYear())
        const currentime = getCurrentFormattedTime()
        const requestData = {
          scenario_name: newscenarionamegiven,
          scenario_timestamp: currentime,
          user_id: "admin",
          model_id: 1,
          dataset: originalset,
        };

        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/api/savescenario`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData
        };
        const getResponse = await axios(config);

        if (getResponse.status === 200) {

          document.getElementById("closemodal").click()
          handlescenariosfetch()
          setselectedscenarioname(newscenarionamegiven)
          setselectedscenarionametimestamp(currentime)
          setdisplaynames2({
            ...displaynames2,
            scenario: newscenarionamegiven,
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
      requireLogin("/optimizer");
    }

    setloader(false)

  };

  const table2edit = (e, variableIndex, type) => {
    const updatedDataset = [...originalset2];
    const enteredvalue = e.target.value;

    if (type === "lb") {

      if (e.target.value > updatedDataset[variableIndex].upper_limit) {
        updatedDataset[variableIndex].lower_limit = enteredvalue;

        // dispatch(
        //   getNotification({
        //     message: "Entered Lower Bound is greater than upper bound! ",
        //     type: "default",
        //   }))
      }
      else { updatedDataset[variableIndex].lower_limit = enteredvalue; }
    }

    else if (type === "ub") {
      if (e.target.value < updatedDataset[variableIndex].lower_limit) {
        updatedDataset[variableIndex].upper_limit = enteredvalue;
        // dispatch(
        //   getNotification({
        //     message: "Entered Upper Bound is less than lower bound!",
        //     type: "default",
        //   }))
      }
      else { updatedDataset[variableIndex].upper_limit = enteredvalue; }

    }

    else { updatedDataset[variableIndex].total_limit = enteredvalue; }
    //updatedDataset[variableIndex].total_limit=updatedDataset[variableIndex].lower_limit+updatedDataset[variableIndex].upper_limit || 0;
    setoriginalset2(updatedDataset)
  }
  const handlesampledataset2change = (ublbsample) => {
    setsampledataset2(ublbsample)
  }
  const handleoriginaldataset2change = (ublboriginal) => {
    setoriginalset2(ublboriginal)
  }
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';
  const customMultiSelectStyles = {
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#2C3E50" : "#ffffff",
      border: `1px solid ${isDark ? "#4A6274" : "#e2e8f0"}`,
      borderRadius: "16px",
      overflow: "hidden",
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: isDark ? "#2C3E50" : "#ffffff",
      padding: "8px",
      maxHeight: "260px",
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: "12px",
      padding: "12px 14px",
      background: state.isSelected
        ? isDark ? "linear-gradient(135deg, #17A2B8 0%, #138496 100%)" : "linear-gradient(135deg, #0D7C66 0%, #0A6B57 100%)"
        : state.isFocused
          ? isDark ? "rgba(23, 162, 184, 0.12)" : "rgba(13, 124, 102, 0.12)"
          : "transparent",
      color: state.isSelected ? "#ffffff" : isDark ? "#F8F9FA" : "#0f172a",
    }),
    multiValue: (base) => ({
      ...base,
      background: isDark ? "rgba(23, 162, 184, 0.12)" : "rgba(13, 124, 102, 0.12)",
      borderRadius: "10px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#F8F9FA" : "#0f172a",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#ADB5BD" : "#64748b",
      "&:hover": {
        background: "rgba(239, 68, 68, 0.16)",
        color: "#ef4444",
      },
    }),
  };
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
              <h6 className="modal-title fw-bold" id="exampleModalLabel">
                Save Scenario
              </h6>
              <button
                type="button"
                className="rr-btn rr-btn-secondary rr-btn-icon"
                data-dismiss="modal"
                aria-label="Close"
                id="closemodal"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <label className="rr-label mb-2">Please enter Scenario Name:</label>
              <input
                type="text"
                id="scenarionamebox"
                className="form-control rr-input"
                value={newscenarionamegiven}
                onChange={(e) => setnewscenarionamegiven(e.target.value)}
              />
            </div>

            <div className="modal-footer rr-modal-footer">
              <button
                type="button"
                className="rr-btn rr-btn-secondary"
                data-dismiss="modal"
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

      <div className="opt-page">
        <div className="rr-card rr-card-header">
          <div className="rr-page-header-left">
            <div className="rr-breadcrumb">Dashboard / Optimized Spends</div>
            <h2 className="rr-page-title">Optimized Spends</h2>
            <p className="rr-page-subtitle mb-0">
              Optimize spends, compare planned versus optimized outcomes, and generate downloadable reports from one workspace.
            </p>
          </div>

          {resultscreen2 && (
            <div className="rr-page-header-actions">
              <button
                className="rr-btn rr-btn-secondary"
                disabled={loading}
                onClick={() => {
                  setselectedscenarioname("");
                  setselectedyear("");
                  setresultscreen(false);
                  setresultscreen2(false);
                  setmarket("");
                  setselectedbrand("");
                  setscenarionewoldscreen("Select");
                  setoriginalset([]);
                  setsampledataset([]);
                  setmodifybtn(false);
                  setselectedobjective("");
                  settotalBudget(0);
                  setsampledataset2([]);
                  setoriginalset2([]);
                  setresultscreen2(false);
                  setupperboundlowerboundscreen(false);
                  setsalesno(0);
                  setpercentagegrowthrqd(0);
                  setbudgetconstraintrequired(false);
                  setDownloadUrl("");
                }}
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
                  //       "Optimizer_Report",
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

        {modifybtn && (
          <div className="rr-card rr-card-section">
            <div className="row g-3 align-items-end opt-filter-row">
              <div className="col-12 col-sm-6 col-lg">
                <label className="rr-label">
                  FY: <span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="rr-select"
                  placeholder="Select"
                  options={[
                    { label: "Select", value: "Select" },
                    ...(yearoptions?.map((item) => ({
                      label: item.fy,
                      value: item.fy,
                    })) || []),
                  ]}
                  value={
                    selectedyear
                      ? { label: selectedyear, value: selectedyear }
                      : { label: "Select", value: "Select" }
                  }
                  onChange={(option) => {
                    const value = option?.value || "Select";
                    setselectedbrand("");
                    setselectedyear(value);
                    setupperboundlowerboundscreen(false);
                    setmarket("");
                    setselectedscenarioname("");
                  }}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg">
                <label className="rr-label">
                  Brand: <span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="rr-select"
                  placeholder="Select"
                  options={[
                    { label: "Select", value: "Select" },
                    ...(brandoptions?.map((option) => ({
                      label: maskedBrandOption.maskedBrandOption[option.brand],
                      value: option.brand,
                    })) || []),
                  ]}
                  value={
                    selectedbrand
                      ? {
                        label:
                          selectedbrand === "Select"
                            ? "Select"
                            : maskedBrandOption.maskedBrandOption[selectedbrand],
                        value: selectedbrand,
                      }
                      : { label: "Select", value: "Select" }
                  }
                  onChange={(option) => {
                    const newBrand = option?.value || "Select";
                    setselectedbrand(newBrand);
                    setmarket("Select");
                    setselectedscenarioname("Select");
                    setviewscenariodatatable(false);
                  }}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg">
                <label className="rr-label">
                  Market: <span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="rr-select"
                  placeholder="Select"
                  options={[
                    { label: "Select", value: "Select" },
                    ...(marketoptions?.map((item) => ({
                      label: item?.final_market,
                      value: item?.final_market,
                    })) || []),
                  ]}
                  value={
                    market
                      ? { label: market, value: market }
                      : { label: "Select", value: "Select" }
                  }
                  onChange={(option) => {
                    const value = option?.value || "Select";
                    setmarket(value);
                    setselectedscenarioname("Select");
                    setviewscenariodatatable(false);
                    setresultscreen2(false);
                    setmodifybtn(false);
                    setupperboundlowerboundscreen(false);
                  }}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="rr-label">
                  Scenario: <span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="rr-select"
                  placeholder="Select Scenario Name"
                  options={scenariooptions}
                  value={
                    selectedscenarioname
                      ? { label: selectedscenarioname, value: selectedscenarioname }
                      : null
                  }
                  styles={customMultiSelectStyles}
                  onChange={(value) => {
                    setoriginalset2([]);
                    setsampledataset2([]);
                    settotalBudget(0);
                    setselectedobjective("Select");
                    setviewscenariodatatable(false);
                    setselectedscenarioname(value?.value);
                    setselectedscenarionametimestamp(value?.created_dt);
                    setmodifybtn(false);
                    setresultscreen2(false);

                    if (value) fetchublbtable(value.value);
                    else setupperboundlowerboundscreen(false);
                  }}
                />
              </div>

              {selectedscenarioname && selectedscenarioname !== "Select" && (
                <div className="col-12 col-sm-6 col-lg-auto">
                  <label className="rr-label rr-label-spacer">&nbsp;</label>
                  <button
                    className="rr-btn rr-btn-primary opt-filter-action-btn"
                    onClick={() =>
                      viewscenariodatatable2
                        ? setviewscenariodatatable2(false)
                        : fetchdatasettable2()
                    }
                  >
                    {!viewscenariodatatable2 ? "View Scenario Data" : "Hide"}
                  </button>
                </div>
              )}
            </div>

            {loader5 && (
              <div className="my-3 d-flex flex-column align-items-center">
                <div className="rr-dot-loader">
                  <div></div><div></div><div></div>
                </div>
                <div className="mt-2 fw-semibold rr-muted-text">
                  Grabbing Detail....
                </div>
              </div>
            )}

            {upperboundlowerboundscreen && (
              <>
                <div className="rr-card rr-card-inner mt-4">
                  <div className="row g-3">
                    <div className="col-12 col-lg-6">
                      <label className="rr-label"><strong>Objective</strong></label>
                      <Select
                        classNamePrefix="rr-select"
                        placeholder="Select"
                        options={[
                          { label: "Select", value: "Select" },
                          {
                            label: "Maintain Spends to Maximize Sales",
                            value: "Maintain Spends to Maximize Sales",
                          },
                          {
                            label: "Maintain Sales and Minimize Spends",
                            value: "Maintain Sales and Minimize Spends",
                          },
                          ...(!selectedscenarioname?.startsWith("M")
                            ? [
                              {
                                label: "Achieve goal with minimal spends",
                                value: "Achieve goal with minimal spends",
                              },
                            ]
                            : []),
                        ]}
                        value={
                          selectedobjective
                            ? { label: selectedobjective, value: selectedobjective }
                            : { label: "Select", value: "Select" }
                        }
                        onChange={(option) => {
                          const value = option?.value || "Select";
                          setselectedobjective(value);
                          handlefetchbudget(value);
                          setsalesno(0);
                          setpercentagegrowthrqd(0);
                          setbudgetconstraintrequired(false);

                          if (value === "Achieve goal with minimal spends") {
                            handlefetchtotalsalesnoforobjective3();
                          }
                        }}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                    </div>

                    {selectedobjective !== "Achieve goal with minimal spends" && (
                      <div className="col-12 col-lg-6">
                        <label className="rr-label">
                          <strong>Overall Marketing Budget</strong>
                        </label>

                        {(selectedobjective === "Maintain Sales and Minimize Spends" ||
                          selectedobjective === "Maintain Spends to Maximize Sales") ? (
                          <div className="opt-budget-display mt-2">
                            <span className="opt-budget-currency">₹</span>
                            <span className="opt-budget-value">
                              {Number(totalBudget || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ) : (
                          <input
                            type="number"
                            className="form-control rr-input my-2 w-100"
                            value={totalBudget}
                            onChange={(e) => {
                              settotalBudget(e.target.value);
                              handlemodifybudget(e.target.value);
                            }}
                            placeholder="Enter budget amount"
                          />
                        )}
                      </div>
                    )}

                    {selectedobjective === "Achieve goal with minimal spends" &&
                      (loader2 ? (
                        <div className="my-3 d-flex flex-column align-items-center justify-content-center">
                          <div className="rr-dot-loader">
                            <div></div><div></div><div></div>
                          </div>
                          <div className="mt-2 fw-semibold rr-muted-text">
                            Fetching Total Sales Volume
                          </div>
                        </div>
                      ) : (
                        <div className="col-12">
                          <div className="row g-3 my-2">
                            <div className="col-12 col-md-6">
                              <label className="rr-label">
                                <strong>Target Percentage Growth (%)</strong>
                              </label>
                              <input
                                className="form-control rr-input mt-2"
                                type="number"
                                placeholder="% increase/decrease"
                                value={percentagegrowthrqd}
                                min={0}
                                onChange={(e) => {
                                  if (e.target.value >= 0) {
                                    setpercentagegrowthrqd(e.target.value);
                                    handlemodifytotalsalesobj3(e.target.value);
                                  } else {
                                    setpercentagegrowthrqd(0);
                                  }
                                }}
                              />
                            </div>

                            <div className="col-12 col-md-6">
                              <div className="opt-budget-display mt-4">
                                Total Sales:{" "}
                                {(salesnooriginalobj3 * (percentagegrowthrqd / 100 + 1) / 1000)?.toFixed(2)} Tonnes
                              </div>
                            </div>
                          </div>

                          {budgetconstraintrequired && (
                            <div className="d-flex align-items-center gap-2 mt-2">
                              <span>Rs</span>
                              <input
                                className="form-control rr-input w-50"
                                value={totalBudget ? Number(totalBudget).toLocaleString("en-IN") : 0}
                                onChange={(e) => {
                                  const rawValue = e.target.value.replace(/,/g, "") || 0;
                                  if (!isNaN(rawValue) && rawValue !== "") {
                                    handlemodifybudget(rawValue);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                </div>

                <div className="mt-4">
                  <UbLbTable
                    sampledataset2={sampledataset2}
                    originalset2={originalset2}
                    handleoriginaldataset2change={handleoriginaldataset2change}
                    handlesampledataset2change={handlesampledataset2change}
                    originalsetublboriginal={originalsetublboriginal}
                    onOptimize={handleoptimize}
                    isprocessing={isprocessing}
                  />
                </div>
              </>
            )}

            {viewscenariodatatable2 && (
              <div className="mt-4" id="attributetable2">
                <div className="d-flex flex-row-reverse">
                  <button
                    className="rr-btn rr-btn-primary"
                    data-toggle={displaynames2.scenario === "Base Scenario" && "modal"}
                    data-target="#exampleModal1"
                    onClick={() => {
                      displaynames2.scenario !== "Base Scenario" && updatescenario();
                    }}
                  >
                    {displaynames2.scenario === "Base Scenario" ? "Save Scenario" : "Update Scenario"}
                  </button>
                </div>

                {sampledataset[0]?.month_data?.length === 1 ? (
                  <VariableTableYearly
                    sampledataset={sampledataset}
                    changesampledataset={changesampledataset}
                    originalset={originalset}
                    changeoriginalset={changeoriginalset}
                    originaldatasetforcolorcoding={originaldatasetforcolorcoding}
                  />
                ) : (
                  <VariableTable
                    sampledataset={sampledataset}
                    changesampledataset={changesampledataset}
                    originalset={originalset}
                    changeoriginalset={changeoriginalset}
                    originaldatasetforcolorcoding={originaldatasetforcolorcoding}
                    endDate={endDate}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div>
          {loader ? (
            <div
              className="row d-flex justify-content-center align-items-center"
              style={{ height: "60vh" }}
            >
              <LoaderCustom text="Optimizing..." onElapsed={handleOptElapsed} />
            </div>
          ) : resultscreen2 ? (
            !modifybtn && <>
              {optimizationTime != null && (
                <div className="rr-chip rr-chip-lg" style={{ marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  Optimization completed in {optimizationTime >= 60 ? `${Math.floor(optimizationTime / 60)}m ${optimizationTime % 60}s` : `${optimizationTime}s`}
                </div>
              )}
              <div className="rr-card rr-card-inner">
                <div className="row g-3 align-items-center my-1">
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="rr-card-meta">
                      <strong>FY</strong>
                      <div className="rr-meta-value">{displaynames.fy}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="rr-card-meta">
                      <strong>Brand</strong>
                      <div className="rr-meta-value">
                        {maskedBrandOption.maskedBrandOption[displaynames.brand]}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="rr-card-meta">
                      <strong>Market</strong>
                      <div className="rr-meta-value">{displaynames.market}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="rr-card-meta">
                      <strong>Scenario</strong>
                      <div className="rr-meta-value">{displaynames.scenario}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="my-3" id="optimizeddata">
                <AfterOptimizationTable
                  salesAgg={sales_agg}
                  resultValue={resultValueData}
                  haloResults={haloResults}
                  filteredplotdata1={filteredplotdata1}
                  corevalue={corevalue}
                  distributionvalue={distributionvalue}
                  distributionvaluecontri={distributionvaluecontri}
                  objectiveName={displaynames?.objective}
                />
              </div>

              <div className="rr-card rr-card-section">
                <div id="pdfConvertible" className="w-100">

                  <div className="container-fluid px-0">
                    {plotdata1?.length > 0 && displaynames.scenario.startsWith("M_") && (
                      <div className="rr-card rr-card-mini my-3">
                        <LineChartOptimizer
                          fulldataset1={plotdata1}
                          fulldataset2={fulldataset2}
                          range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                          endDate={endDate}
                        />
                      </div>
                    )}

                    <div className="row g-3 my-3">
                      {planneddataset?.plot2?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <PieCharts
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              fulldataset={planneddataset}
                              type={"Planned Scenario"}
                              displaynames={displaynames}
                            />
                          </div>
                        </div>
                      )}

                      {optimizeddatasetcontripercentage?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <PieChartop
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              optimizeddatasetcontripercentage={optimizeddatasetcontripercentage}
                              type={"Optimized"}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="row g-3 my-3">
                      {planneddataset?.plot3?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart1
                              fulldataset={planneddataset}
                              type={"Planned Scenario"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(...[
                                planneddataset?.plot3[0].total_core / 1000,
                                planneddataset?.plot3[1].total_incremental / 1000,
                                planneddataset?.plot3[2].total_media / 1000,
                                ...first2chartsdata?.map((it) => Number(it.monthly_contribution / 1000))
                              ]) / 100) * 100}
                              maxValuedynamicValue={Math.ceil(Math.max(...[
                                planneddataset?.plot3[0].total_core_sales / 100000,
                                planneddataset?.plot3[1].total_incremental_sales / 100000,
                                planneddataset?.plot3[2].total_media_sales / 100000,
                                ...first2chartsdata?.map((it) => Number(it.monthly_contribution / 1000))
                              ]) / 100) * 100}
                            />
                          </div>
                        </div>
                      )}

                      {first2chartsdata?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart1op
                              first2chartsdata={first2chartsdata}
                              type={"Optimized"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(Math.max(...[
                                planneddataset?.plot3[0].total_core / 1000,
                                planneddataset?.plot3[1].total_incremental / 1000,
                                planneddataset?.plot3[2].total_media / 1000,
                                ...first2chartsdata?.map((it) => Number(it.monthly_contribution / 1000))
                              ]) / 100) * 100}
                              maxValuedynamicValue={Math.ceil(Math.max(...[
                                planneddataset?.plot3[0].total_core_sales / 100000,
                                planneddataset?.plot3[1].total_incremental_sales / 100000,
                                planneddataset?.plot3[2].total_media_sales / 100000,
                                ...first2chartsdata?.map((it) => Number(it.monthly_contribution / 1000))
                              ]) / 100) * 100}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="row g-3 my-3">
                      {planneddataset?.plot4?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart2
                              fulldataset={planneddataset}
                              type={"Planned Scenario"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot4.map((it) => it.contribution),
                                  ...optimizeddatasetmedia?.map((it) => Number(it?.value_contribution))
                                ) / 100
                              ) * 100}
                              maxValuedynamicValue={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot4.map((it) => it.contribution_sales_value),
                                  ...optimizeddatasetmedia?.map((it) => Number(it?.value_contribution))
                                )
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {optimizeddatasetmedia?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart2op
                              optimizeddatasetmedia={optimizeddatasetmedia}
                              type={"Optimized"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot4.map((it) => it.contribution),
                                  ...optimizeddatasetmedia?.map((it) => Number(it?.value_contribution))
                                ) / 100
                              ) * 100}
                              maxValuedynamicValue={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot4.map((it) => it.contribution_sales_value),
                                  ...optimizeddatasetmedia?.map((it) => Number(it?.value_contribution))
                                )
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="row g-3 my-3">
                      {planneddataset?.plot10?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart5
                              fulldataset={planneddataset}
                              type={"Planned Scenario"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot10.map((it) => it.contribution),
                                  ...optimizeddatasetincrement?.map((it) => Number(it?.value_contribution))
                                ) / 100
                              ) * 100}
                              maxValuedynamicValue={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot10.map((it) => it.contribution_sales_value / 100000),
                                  ...optimizeddatasetincrement?.map((it) => Number(it?.contribution_value / 100000))
                                )
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {optimizeddatasetincrement?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart5op
                              optimizeddatasetincrement={optimizeddatasetincrement}
                              type={"Optimized"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot10.map((it) => it.contribution),
                                  ...optimizeddatasetincrement?.map((it) => Number(it?.value_contribution))
                                ) / 100
                              ) * 100}
                              maxValuedynamicValue={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot10.map((it) => it.contribution_sales_value / 100000),
                                  ...optimizeddatasetincrement?.map((it) => Number(it?.contribution_value / 100000))
                                )
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="row g-3 my-3">
                      {planneddataset?.plot9?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart4
                              fulldataset={planneddataset}
                              type={"Planned Scenario"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot5?.map((it) => Number(it?.attribute_value_per_roi)),
                                  ...optimizeddatasetmedia?.map((it) => Number(it?.roi))
                                )
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {optimizeddatasetmedia?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart4op
                              optimizeddatasetmedia={optimizeddatasetmedia}
                              type={"Optimized"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot5?.map((it) => Number(it?.attribute_value_per_roi)),
                                  ...optimizeddatasetmedia?.map((it) => Number(it?.roi))
                                )
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="row g-3 my-3">
                      {planneddataset?.plot12?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart7
                              fulldataset={planneddataset}
                              type={"Planned Scenario"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot12
                                    ?.filter(varObj => !ExceptionVariables.hiddenroichart?.includes(varObj?.variable))
                                    ?.map((it) => Number(it?.attribute_value_per_roi)),
                                  ...optimizeddatasetincrement
                                    ?.filter(varObj => !ExceptionVariables.hiddenroichart?.includes(varObj?.variable_name))
                                    ?.map((it) => Number(it?.roi))
                                )
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {optimizeddatasetincrement?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart7op
                              optimizeddatasetincrement={optimizeddatasetincrement}
                              type={"Optimized"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot12
                                    ?.filter(varObj => !ExceptionVariables.hiddenroichart?.includes(varObj?.variable))
                                    ?.map((it) => Number(it?.attribute_value_per_roi)),
                                  ...optimizeddatasetincrement
                                    ?.filter(varObj => !ExceptionVariables.hiddenroichart?.includes(varObj?.variable_name))
                                    ?.map((it) => Number(it?.roi))
                                )
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="row g-3 my-3">
                      {planneddataset?.plot11?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart6
                              fulldataset={planneddataset}
                              type={"Planned Scenario"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot11?.map(it => Number(it?.effectiveness)),
                                  ...optimizeddatasetmedia?.map(it => Number(it?.effectiveness))
                                ) / 10
                              ) * 10}
                            />
                          </div>
                        </div>
                      )}

                      {optimizeddatasetmedia?.length > 0 && (
                        <div className="col-lg-6 col-12">
                          <div className="rr-card rr-card-mini h-100">
                            <SingleBarChart6op
                              optimizeddatasetmedia={optimizeddatasetmedia}
                              type={"Optimized"}
                              isValue={isValue}
                              range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`}
                              maxValuedynamicVolume={Math.ceil(
                                Math.max(
                                  ...planneddataset?.plot11?.map(it => Number(it?.effectiveness)) ?? [],
                                  ...optimizeddatasetmedia?.map(it => Number(it?.effectiveness)) ?? []
                                ) / 10
                              ) * 10}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {brandoptions?.length > 0 ? (
                <div className="rr-card rr-card-section">
                  <div className="row g-3 align-items-end opt-filter-row">
                    <div className="col-12 col-sm-6 col-lg">
                      <label className="rr-label">
                        <strong>FY:</strong><span className="text-danger">*</span>
                      </label>

                      <Select
                        classNamePrefix="rr-select"
                        placeholder="Select FY"
                        options={
                          yearoptions?.map((item) => ({
                            label: item.fy,
                            value: item.fy,
                          })) || []
                        }
                        value={
                          selectedyear && selectedyear !== "Select"
                            ? { label: selectedyear, value: selectedyear }
                            : null
                        }
                        onChange={(option) => {
                          setselectedbrand("");
                          setselectedyear(option?.value || "");
                          setupperboundlowerboundscreen(false);
                          setmarket("");
                          setselectedscenarioname("");
                        }}
                      />
                    </div>

                    <div className="col-12 col-sm-6 col-lg">
                      <label className="rr-label">
                        <strong>Brand:</strong><span className="text-danger">*</span>
                      </label>

                      <Select
                        classNamePrefix="rr-select"
                        placeholder="Select Brand"
                        options={
                          brandoptions?.map((option) => ({
                            label: maskedBrandOption.maskedBrandOption[option.brand],
                            value: option.brand,
                          })) || []
                        }
                        value={
                          selectedbrand && selectedbrand !== "Select"
                            ? {
                              label: maskedBrandOption.maskedBrandOption[selectedbrand],
                              value: selectedbrand,
                            }
                            : null
                        }
                        onChange={(option) => {
                          setselectedbrand(option?.value || "");
                          setmarket("Select");
                          setselectedscenarioname("Select");
                          setviewscenariodatatable(false);
                          setupperboundlowerboundscreen(false);
                        }}
                      />
                    </div>

                    <div className="col-12 col-sm-6 col-lg">
                      <label className="rr-label">
                        <strong>Market:</strong><span className="text-danger">*</span>
                      </label>

                      <Select
                        classNamePrefix="rr-select"
                        placeholder="Select Market"
                        options={
                          marketoptions?.map((item) => ({
                            label: item.final_market,
                            value: item.final_market,
                          })) || []
                        }
                        value={
                          market && market !== "Select"
                            ? { label: market, value: market }
                            : null
                        }
                        onChange={(option) => {
                          setmarket(option?.value || "");
                          setselectedscenarioname("Select");
                          setviewscenariodatatable(false);
                          setupperboundlowerboundscreen(false);
                        }}
                      />
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                      <label className="rr-label">
                        <strong>Scenario:</strong><span className="text-danger">*</span>
                      </label>
                      <Select
                        placeholder="Select Scenario Name"
                        options={scenariooptions}
                        value={
                          selectedscenarioname && selectedscenarioname !== "Select"
                            ? { label: selectedscenarioname, value: selectedscenarioname }
                            : null
                        }
                        onChange={(value) => {
                          setoriginalset2([]);
                          setsampledataset2([]);
                          settotalBudget(0);
                          setselectedobjective("Select");
                          setviewscenariodatatable(false);
                          setselectedscenarioname(value?.value || "");
                          setselectedscenarionametimestamp(value?.created_dt);

                          if (value) {
                            fetchublbtable(value.value);
                          } else {
                            setupperboundlowerboundscreen(false);
                          }
                        }}
                        classNamePrefix="rr-select"
                      />
                    </div>

                    {selectedscenarioname !== "" && selectedscenarioname !== "Select" && (
                      <div className="col-12 col-sm-6 col-lg-auto">
                        <label className="rr-label rr-label-spacer">&nbsp;</label>
                        <button
                          className="rr-btn rr-btn-primary opt-filter-action-btn"
                          onClick={() => {
                            if (viewscenariodatatable) {
                              setviewscenariodatatable(false);
                            } else {
                              fetchdatasettable();
                            }
                          }}
                        >
                          {!viewscenariodatatable ? "View Scenario Data" : "Hide"}
                        </button>
                      </div>
                    )}
                  </div>

                  {loader2 && (
                    <div className="my-3 d-flex flex-column align-items-center justify-content-center">
                      <div className="rr-dot-loader">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <div className="mt-2 fw-semibold rr-muted-text">
                        Fetching Scenario Detail....
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rr-card rr-card-empty my-4">
                  <div className="rr-dot-loader">
                    <div></div><div></div><div></div>
                  </div>
                  <div className="mt-2 fw-semibold rr-muted-text">Grabbing Detail....</div>
                </div>
              )}

              {!viewscenariodatatable ? (
                ""
              ) : (
                <div className="mt-4" id="attributetable">
                  <div className="d-flex flex-row-reverse">
                    <button
                      className="rr-btn rr-btn-primary"
                      data-toggle={displaynames2.scenario === "Base Scenario" && "modal"}
                      data-target="#exampleModal1"
                      onClick={() => {
                        displaynames2.scenario !== "Base Scenario" && updatescenario();
                      }}
                    >
                      {displaynames2.scenario === "Base Scenario" ? "Save Scenario" : "Update Scenario"}
                    </button>
                  </div>

                  {loader4 ? (
                    <div className="my-3 d-flex flex-column align-items-center justify-content-center">
                      <div className="rr-dot-loader">
                        <div></div><div></div><div></div>
                      </div>
                      <div className="mt-2 fw-semibold rr-muted-text">
                        Loading scenario data...
                      </div>
                    </div>
                  ) : sampledataset[0]?.month_data?.length === 1 ? (
                    <VariableTableYearly
                      sampledataset={sampledataset}
                      changesampledataset={changesampledataset}
                      originalset={originalset}
                      changeoriginalset={changeoriginalset}
                      originaldatasetforcolorcoding={originaldatasetforcolorcoding}
                    />
                  ) : (
                    <VariableTable
                      sampledataset={sampledataset}
                      changesampledataset={changesampledataset}
                      originalset={originalset}
                      changeoriginalset={changeoriginalset}
                      originaldatasetforcolorcoding={originaldatasetforcolorcoding}
                      endDate={endDate}
                    />
                  )}
                </div>
              )}

              {upperboundlowerboundscreen && (
                <div className="rr-card rr-card-inner mt-4">
                  <div className="col-sm">
                    <label className="rr-label">
                      <strong>Objective</strong>
                    </label>

                    <Select
                      classNamePrefix="rr-select"
                      placeholder="Select Objective"
                      options={[
                        { label: "Maintain Spends to Maximize Sales", value: "Maintain Spends to Maximize Sales" },
                        { label: "Maintain Sales and Minimize Spends", value: "Maintain Sales and Minimize Spends" },
                        ...(!selectedscenarioname?.startsWith("M")
                          ? [{ label: "Achieve goal with minimal spends", value: "Achieve goal with minimal spends" }]
                          : []),
                      ]}
                      value={
                        selectedobjective && selectedobjective !== "Select"
                          ? { label: selectedobjective, value: selectedobjective }
                          : null
                      }
                      onChange={(option) => {
                        const value = option?.value || "Select";

                        setselectedobjective(value);
                        handlefetchbudget(value);
                        setsalesno(0);
                        setpercentagegrowthrqd(0);
                        setbudgetconstraintrequired(false);

                        if (value === "Achieve goal with minimal spends") {
                          handlefetchtotalsalesnoforobjective3();
                        }
                      }}
                      menuPlacement="auto"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  </div>

                  {selectedobjective !== "Achieve goal with minimal spends" && (
                    <div className="col-sm mt-3">
                      <label className="rr-label"><strong>Overall Marketing Budget</strong></label>
                      {(selectedobjective === "Maintain Sales and Minimize Spends" ||
                        selectedobjective === "Maintain Spends to Maximize Sales") ? (
                        <div className="opt-budget-display mt-2">
                          Rs {totalBudget?.toLocaleString("en-IN")}
                        </div>
                      ) : (
                        <input
                          className="form-control rr-input my-2 w-50"
                          value={totalBudget}
                          onChange={(e) => {
                            settotalBudget(e.target.value);
                            handlemodifybudget(e.target.value);
                          }}
                        />
                      )}
                    </div>
                  )}

                  {selectedobjective === "Achieve goal with minimal spends" &&
                    (loader6 ? (
                      <div className="my-3 d-flex flex-column align-items-center justify-content-center">
                        <div className="rr-dot-loader">
                          <div></div><div></div><div></div>
                        </div>
                        <div className="mt-2 fw-semibold rr-muted-text">
                          Fetching Total Sales Volume
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="row my-3 px-1">
                          <div className="col-sm">
                            <label className="rr-label"><strong>Target Percentage Growth (%)</strong></label>
                            <input
                              className="form-control rr-input mt-2"
                              type="number"
                              placeholder="% increase/decrease"
                              value={percentagegrowthrqd}
                              min={0}
                              onChange={(e) => {
                                if (e.target.value >= 0) {
                                  setpercentagegrowthrqd(e.target.value);
                                  handlemodifytotalsalesobj3(e.target.value);
                                } else {
                                  setpercentagegrowthrqd(0);
                                }
                              }}
                            />
                          </div>

                          <div className="col-sm d-flex align-items-end">
                            <div className="opt-budget-display w-100">
                              Total Sales:{" "}
                              {(salesnooriginalobj3 * (percentagegrowthrqd / 100 + 1) / 1000)?.toFixed(2)} Tonnes
                            </div>
                          </div>
                        </div>

                        {budgetconstraintrequired && (
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <span>Rs</span>
                            <input
                              className="form-control rr-input w-50"
                              value={totalBudget ? Number(totalBudget).toLocaleString("en-IN") : 0}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, "") || 0;
                                if (!isNaN(rawValue) && rawValue !== "") {
                                  handlemodifybudget(rawValue);
                                }
                              }}
                            />
                          </div>
                        )}
                      </>
                    ))}

                  {selectedobjective !== "Select" && (
                    <>
                      <div className="mt-4">
                        <UbLbTable
                          objective={selectedobjective}
                          sampledataset2={sampledataset2}
                          originalset2={originalset2}
                          handleoriginaldataset2change={handleoriginaldataset2change}
                          handlesampledataset2change={handlesampledataset2change}
                          originalsetublboriginal={originalsetublboriginal}
                          onOptimize={handleoptimize}
                          isprocessing={isprocessing}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Optimizer;
