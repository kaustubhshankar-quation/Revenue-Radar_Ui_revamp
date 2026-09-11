import React from "react";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'
import maskedBrandOption from '../JSON Files/MaskedBrandOption.json'
import unMaskedBrandOption from '../JSON Files/MaskedBrandOption.json'
import Loader from "react-js-loader";
import { useOutletContext } from "react-router-dom";
import Select, { components } from "react-select";
import { useDispatch } from "react-redux";
import UserService from "../../services/UserService";
import getNotification from "../../Redux/Action/action";
import axios from "axios";
import { notifyRequestError, requireLogin, defaultJsonHeaders, formatPlotMonthYear, getCurrentFormattedTime } from "../HelperFunction/helperFunction";

import SingleBarChart4 from "../Simulator/SingleBarChart4";
import SingleBarChart5 from "../Simulator/SingleBarChart5";
import SingleBarChart6 from "../Simulator/SingleBarChart6";

import SingleBarChart1 from "../Simulator/SingleBarChart1";
import SingleBarChart2 from "../Simulator/SingleBarChart2";
import SingleBarChart3 from "../Simulator/SingleBarChart3";
import PieCharts from "../Simulator/PieCharts";
import SingleBarChart7 from "../Simulator/SingleBarChart7";
import SingleBarChart8 from "../Simulator/SingleBarChart8";

import LineChart1 from "../Simulator/LineChart1";
import AnnualData from "../Simulator/AnnualData";

const { REACT_APP_UPLOAD_DATA } = process.env;
const { REACT_APP_UPLOAD_DATA2 } = process.env;
const XLSX = require("xlsx");
function SavedScenarios() {
  const { collapsed } = useOutletContext() || {};
  const sidebarOffset = collapsed ? 88 : 290;
  const [referencescenarioname, setreferencescenarioname] = useState([])
  const [masterscenariotimestamp, setmasterscenariotimestamp] = useState("")
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);
  const dispatch = useDispatch();
  const [createfrombaseoruploadfileswitch, setcreatefrombaseoruploadfileswitch] = useState(false)
  const [fulldataset, setfulldataset] = useState({})
  const [fulldataset2, setfulldataset2] = useState({})
  const [timetype, settimetype] = useState("")
  const [mape, setmape] = useState(0)
  const [isValue, setisValue] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState("")
  const [predictedsalesvaluelastfy, setpredictedsalesvaluelastfy] = useState(0)
  const [originaldatasetforcolorcoding, setoriginaldatasetforcolorcoding] = useState([])
  const [yearoptions, setyearoptions] = useState([])
  const [modifybtn, setmodifybtn] = useState(false)
  const [fromrangeonplots, setfromrangeonplots] = useState("")
  const [marketoptions, setmarketoptions] = useState([])
  const [uploadfile, setuploadfile] = useState("")
  const [market, setmarket] = useState("");
  const [options1, setoptions1] = useState({})
  const [plotdata1, setplotdata1] = useState([]);
  const [loader, setloader] = useState(false);
  const [loader1, setloader1] = useState(false);
  const [loader2, setloader2] = useState(false);
  const [loader3, setloader3] = useState(false);
  const [loader4, setloader4] = useState(false);
  const [loader5, setloader5] = useState(false);
  const [deletingScenarioKey, setDeletingScenarioKey] = useState("");
  const [scenariooptions, setscenariooptions] = useState([]);
  const [scenarionewoldscreen, setscenarionewoldscreen] = useState("Select")
  const [viewscenariobtn, setviewscenariobtn] = useState(false)
  const [viewscenariodatatable, setviewscenariodatatable] = useState(false)
  const [viewscenariodatatable2, setviewscenariodatatable2] = useState(false)
  const [newscenariofile, setnewscenariofile] = useState("")
  const [isHovered, setIsHovered] = useState(true);
  const [torangeonplots, settorangeonplots] = useState("")
  const [brandoptions, setbrandoptions] = useState([
  ]);
  const [displaynames, setdisplaynames] = useState({});
  const [displaynames2, setdisplaynames2] = useState({});

  const [edit, setedit] = useState([]);
  const [selectedzone, setselectedzone] = useState("National")
  const [selectedbrand, setselectedbrand] = useState("");
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

  const sectionRef = useRef(null);
  const [monthlist, setmonthlist] = useState(["April", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec", "Jan", "Feb", "March"])
  useEffect(() => {
    handlevariablesfetchfybrand()
  }, []);
  useEffect(() => {
    handlefetchmarket()
  }, [selectedbrand])

  const today1 = new Date();
  const currentYear = today1.getFullYear();
  const currentMonth = today1.getMonth();

  let unblockeddate;

  if (currentMonth === 3) {

    unblockeddate = new Date(currentYear, currentMonth, 1);
  } else if (currentMonth >= 4) {

    unblockeddate = new Date(currentYear, currentMonth - 1, 1);
  } else {

    unblockeddate = new Date(currentYear - 1, 10, 1);
  }

  const MonthBeforeUnlockMonth = `${unblockeddate.getFullYear()}-${String(unblockeddate.getMonth() + 1).padStart(2, "0")}`;
  const MonthBeforeUnlockMonthreverse = MonthBeforeUnlockMonth.split("-").reverse().join("-");

  
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
      requireLogin("/simulator");
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
          setscenariooptions(getResponse.data?.filter(it => it.scenario_name !== "Base Scenario"))
          setresultscreen(true)
          handlefetchreferencescenario()
        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/simulator");
    }
  };
  const downloadSampleFile = async () => {
    if (timetype) {
      const fileUrl = `assets/Files/Sample${timetype}.xlsx`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', `samplefile${timetype}.xlsx`); // Set the name of the file for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up the DOM
    }
    else {
      dispatch(getNotification({
        message: "Please select tenure type!!",
        type: "danger"
      }))
    }
  }
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

  const fetchdatasettable = async (row) => {
    if (UserService.isLoggedIn()) {
      if (market && selectedbrand && market !== "Select" && selectedbrand !== "Select" && selectedyear && selectedyear !== "Select") {
        try {

          setloader2(true)
          const FormData = require("form-data");
          const sendData = new FormData();
          let config;
          sendData.append("scenario_name", row.scenario_name);
          sendData.append("scenario_timestamp", row.created_dt);
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

          if (getResponse?.data?.length > 0 && getResponse?.data[0] !== "No Records Found" && getResponse?.data[0].Error !== "Invalid User!"
          ) {

            setviewscenariodatatable(true)
            setresultscreen(true)
            //ifscenariogiven && setselectedscenarioname(ifscenariogiven)
            setdisplaynames2({
              ...displaynames2,
              brand: selectedbrand,
              scenario: selectedscenarioname,
              market: market,
              fy: selectedyear
            })
            setsampledataset(getResponse?.data)
            setoriginalset(getResponse?.data);
            setoriginaldatasetforcolorcoding(getResponse?.data)
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
          sendData.append("brand", selectedbrand)
          if (selectedscenarioname === "Base Scenario") {
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
            if (selectedyear === "2025-26") {
              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/get_annual_scenario_data`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              };
            }
            else {
              config = {
                method: "post",
                url: `${REACT_APP_UPLOAD_DATA}/api/getscenariodata`,
                headers: {
            ...defaultJsonHeaders,
          },
                data: sendData,
              };
            }

          }

          // Now you can use `config` without any errors
          const getResponse = await axios(config);

          if (getResponse.status === 200) {

            if (getResponse?.data?.length > 0 && getResponse?.data[0] !== "No Records Found" && getResponse?.data[0].Error !== "Invalid User!"
            ) {
              setcreatefrombaseoruploadfileswitch(false)
              setdisplaynames2({
                ...displaynames2,
                brand: selectedbrand,
                scenario: selectedscenarioname,
                market: market,
                fy: selectedyear

              })
              setsampledataset(getResponse?.data)
              setoriginalset(getResponse?.data);
              setviewscenariodatatable2(true)
              setoriginaldatasetforcolorcoding(getResponse?.data)

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

  };
  const handlesimulate = async (row) => {
    if (UserService.isLoggedIn()) {
      // console.log(selectedyear,market,selectedscenarioname,selectedbrand)
      if (true) {
        try {
          setmodifybtn(false)
          setloader2(true);
          setviewscenariodatatable(false)
          const FormData = require("form-data");
          const sendData = new FormData();
          sendData.append("scenario_name", row.scenario_name);
          sendData.append("scenario_timestamp", row.created_dt);
          sendData.append("user_id", "admin");
          sendData.append("brand", selectedbrand);
          sendData.append("model_id", 1);
          sendData.append("market", market);
          sendData.append("f_year", selectedyear);

          const sendData2 = new FormData();

          const sendData3 = {
            brand: selectedbrand,
            market: [market]
          };
          let config1 = {}
          let config2 = {}
          if (row.scenario_name?.match("Master")) {
            // sendData2.append("scenario_name", 'Base Scenario');
            // sendData2.append("scenario_timestamp",'2025-01-12 15:54:05');
            sendData2.append("scenario_name", `${row?.scenario_name?.startsWith("M_") ? "M" : row?.scenario_name.startsWith("Y_") ? "Y" : row?.scenario_name.startsWith("Q_") ? "Q" : "HY"}_Base_Master_Scenario`,);
            sendData2.append("scenario_timestamp", "2025-01-12 15:54:05");
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

          // let config1 = {}
          // let config2 = {}
          if (row.scenario_name?.startsWith("Y_")) {
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
          else if (row.scenario_name?.startsWith("Q_")) {
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
          else if (row.scenario_name?.startsWith("HY_")) {
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
              url: selectedscenarioname?.match("Master") ? `${REACT_APP_UPLOAD_DATA}/api/base_predict` : `${REACT_APP_UPLOAD_DATA}/api/base_predict`,
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

              setfulldataset(getResponse1?.data?.data)
              setfulldataset2(getResponse2?.data?.data)

              settorangeonplots(getResponse1?.data?.data?.plot1[getResponse1?.data?.data?.plot1.length - 1]?.month_year?.split("-").reverse()?.join("-"))
              let current_month_year = `${new Date().getFullYear()}-${(String(new Date().getMonth() + 1).padStart(2, "0"))}`;

              if (getResponse1?.data?.data?.plot1[0]?.month_year > current_month_year || row.scenario_name.startsWith("Y_")) {
                setfromrangeonplots(getResponse1?.data?.data?.plot1[0]?.month_year?.split("-").reverse()?.join("-"))
              } else {
                const [year, month] = endDate.split("-");
                const date = new Date(year, month); // Month is zero-based in JS Date
                const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

                setfromrangeonplots(formattedDate?.split("-")?.reverse()?.join("-"))

              }

              setmodifybtn(false)

              setdisplaynames({
                ...displaynames,
                scenario: row.scenario_name,
                market: market,
                fy: selectedyear,
                brand: selectedbrand
              }
              )
              setresultscreen2(true);

              const currentDate = new Date();
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() - 3; // getMonth() returns 0-indexed month
              const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
              const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

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
    setloader2(false)

  };
  

  const [modelcallibrationoptions, setmodelcallibrationoptions] = useState([
    { label: "test", value: "test" }
  ]);

  const [openindex, setopenindex] = useState([])
  useEffect(() => {

    handlevariablesfetchfybrand()
    handlevariablesfetch();
  }, []);

  useEffect(() => {
    handlefetchmarket()
  }, [selectedbrand])

  const handlefetchreferencescenario = async () => {
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

        if (getResponse.data !== "Invalid User!") {
          //console.log(referencescenarioname.filter((it)=>"M_APTG_23".charAt(0)===it?.frequency))
          // settotalBudget(getResponse.data[0].budget)
          let selectedyrsplit = selectedyear?.split("-")
          let arr = getResponse?.data?.filter((it) => Number(it?.fy?.split("-")[0]) - 1 === Number(selectedyrsplit[0]) && Number(it?.fy?.split("-")[1]) - 1 === Number(selectedyrsplit[1]))
          // console.log(arr[0]?.scenario_name.replace(`M_NEW_BASE_`,""))
          //  setreferencescenarioname(arr[0]?.scenario_name.replace(`M_NEW_BASE_`,""))
          setreferencescenarioname(getResponse?.data?.filter((it) => Number(it?.fy?.split("-")[0]) - 1 === Number(selectedyrsplit[0]) && Number(it?.fy?.split("-")[1]) - 1 === Number(selectedyrsplit[1])))

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/savedscenarios");
    }
  };
  const handlemodifyreferencecenarios = async (row) => {
    if (UserService.isLoggedIn()) {
      try {
        setloader5(true)
        const FormData = require("form-data");
        const sendData5 = new FormData();
        let config5;
        sendData5.append("scenario_name", row.scenario_name);
        sendData5.append("scenario_timestamp", row.created_dt);
        sendData5.append("user_id", "admin");
        sendData5.append("final_market", market);
        sendData5.append("brand", selectedbrand)
        sendData5.append("fy", selectedyear)
        let getResponse5 = []
        let successfulResponse = []

        if (selectedscenarioname?.startsWith("Y_")) {
          config5 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/get_annual_scenario_data`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData5,
          }
        }
        else if (selectedscenarioname?.startsWith("Q_")) {
          config5 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/get_qtr_scenario_data`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData5,
          }
        }
        else if (selectedscenarioname?.startsWith("HY_")) {
          config5 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/get_hy_scenario_data`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData5,
          }
        }
        else {
          config5 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/getscenariodata`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData5,
          }
        }

        getResponse5 = await axios(config5)

        const requestData = {
          // "scenario_name": `${displaynames?.scenario?.startsWith("M_") ? "M" : displaynames?.scenario.startsWith("Y_") ? "Y" : displaynames?.scenario.startsWith("Q_") ? "Q" : "HY"}_Base_Master_Scenario`,
          scenario_name: `${row?.scenario_name.charAt(0)}_NEW_BASE_${row?.scenario_name}`,
          "scenario_timestamp": row.created_dt,
          "user_id": "admin",
          "model_id": 1,
          "fy": selectedyear,
          "dataset": getResponse5?.data

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
          scenario_name: `M_NEW_BASE_${row?.scenario_name}`,
          "scenario_timestamp": row.created_dt,
          "user_id": "admin",
          final_market: market,
          "brand": selectedbrand,
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
          scenario_name: `M_NEW_BASE_${row?.scenario_name}`,
          "scenario_timestamp": row.created_dt,
          "user_id": "admin",
          final_market: market,
          "brand": selectedbrand,
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
          scenario_name: `M_NEW_BASE_${row?.scenario_name}`,
          "scenario_timestamp": row.created_dt,
          "user_id": "admin",
          final_market: market,
          "brand": selectedbrand,
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

        if (getResponse.data) {

          handlefetchreferencescenario()
          //setreferencescenarioname(getResponse)
          //settotalBudget(budgetfromcell)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/savedscenarios");
    }
    setloader5(false)
  };
  const handledeletescenarios = async (row) => {
    const scenarioKey = `${row?.scenario_name}-${row?.created_dt}`;
    if (UserService.isLoggedIn()) {
      try {
        setDeletingScenarioKey(scenarioKey);
        setloader5(true)
        const FormData = require("form-data");
        const sendData = new FormData();
        const currenttime = getCurrentFormattedTime()

        const FormData2 = require("form-data");
        const sendData2 = new FormData2();

        sendData2.append("scenario_name", row.scenario_name);
        sendData2.append("scenario_timestamp", row.created_dt);

        let config2 = {}
        if (row.scenario_name?.startsWith("Y_")) {
          config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/delete_annual_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData2,
          }
        }
        else if (row.scenario_name?.startsWith("Q_")) {
          config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/delete_qtr_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData2,
          }
        }
        else if (row.scenario_name?.startsWith("HY_")) {
          config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/delete_hy_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData2,
          }
        }
        else {
          config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/api/delete_monthly_scenario`,
            headers: {
            ...defaultJsonHeaders,
          },
            data: sendData2,
          }
        }

        const getResponse2 = await axios(config2);

        if (getResponse2.status === 200) {

          handlescenariosfetch()
          //setreferencescenarioname(getResponse)
          //settotalBudget(budgetfromcell)

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/savedscenarios");
    }
    setloader5(false)
    setDeletingScenarioKey("");
  };
  const handleCheckboxChange = (index, row) => {
    // If the clicked checkbox is the same as the currently selected one, uncheck it
    if (openindex[index] === true) {
      let arr = []
      setopenindex(arr)
    }
    else {

      handlesimulate(row);

      let arr = []
      arr[index] = true;
      setopenindex(arr)

    }
    // Call the analysis function

  };

  const handlevariablesfetch = async () => {
    if (UserService.isLoggedIn()) {
      try {
        const FormData = require("form-data");
        const sendData = new FormData();
        const config = {
          method: "get",
          url: `${REACT_APP_UPLOAD_DATA}/app/fetchvars`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: sendData,
        };
        const getResponse = await axios(config);
        if (getResponse.data !== "Invalid User!") {
          setStartDate(getResponse.data.dates[0].min[0].start_date);
          setEndDate(getResponse.data.dates[0].max[0].end_date);

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/brandanalysis");
    }
  };

  return (
    <>
      <div className="ss-page">
          <div className="rr-card rr-card-header">
            <div className="rr-page-header-left">
              <div className="rr-breadcrumb">Dashboard / Saved Scenarios</div>
              <h2 className="rr-page-title">Saved Scenarios</h2>
              <p className="rr-page-subtitle mb-0">
                Browse, compare, simulate, and manage saved scenarios across FY,
                brand, market, and scenario selections from one workspace.
              </p>
            </div>

            {resultscreen && (
              <div className="rr-page-header-actions">
                <button
                  className="rr-btn rr-btn-secondary"
                  onClick={() => {
                    setselectedscenarioname("");
                    setresultscreen(false);
                    setmarket("");
                    setselectedbrand("");
                    setmodifybtn(false);
                    setopenindex([]);
                  }}
                >
                  Reset
                </button>

                <button
                  className="rr-btn rr-btn-primary"
                  onClick={() => setmodifybtn(!modifybtn)}
                >
                  {modifybtn ? "Close" : "Modify"}
                </button>
              </div>
            )}
          </div>

          {modifybtn && (
            <div className="rr-card rr-card-section">
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="rr-label">
                    FY <span className="text-danger">*</span>
                  </label>
                  <Select
                    placeholder="Select"
                    classNamePrefix="rr-select"
                    value={selectedyear ? { label: selectedyear, value: selectedyear } : null}
                    options={yearoptions?.map((item) => ({ label: item.fy, value: item.fy }))}
                    onChange={(val) => {
                      setselectedyear(val ? val.value : "");
                      setselectedbrand("");
                      setmarket("");
                      setselectedscenarioname("");
                    }}
                    isClearable
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="rr-label">
                    Brand <span className="text-danger">*</span>
                  </label>
                  <Select
                    placeholder="Select"
                    classNamePrefix="rr-select"
                    value={selectedbrand && maskedBrandOption.maskedBrandOption[selectedbrand]
                      ? { label: maskedBrandOption.maskedBrandOption[selectedbrand], value: selectedbrand }
                      : null}
                    options={brandoptions?.map((option) => ({
                      label: maskedBrandOption.maskedBrandOption[option.brand],
                      value: maskedBrandOption.maskedBrandOption[option.brand]
                    }))}
                    onChange={(val) => {
                      setselectedbrand(
                        val ? unMaskedBrandOption.unMaskedBrandOption[val.value] : ""
                      );
                      setmarket("Select");
                      setselectedscenarioname("");
                      setviewscenariodatatable(false);
                      setviewscenariodatatable2(false);
                      setmodifybtn(false);
                      setresultscreen2(false);
                      setresultscreen(false);
                    }}
                    isClearable
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="rr-label">
                    Market <span className="text-danger">*</span>
                  </label>
                  <Select
                    placeholder="Select"
                    classNamePrefix="rr-select"
                    value={market && market !== "Select" ? { label: market, value: market } : null}
                    options={marketoptions?.map((item) => ({
                      label: item.final_market,
                      value: item.final_market
                    }))}
                    onChange={(val) => {
                      setmarket(val ? val.value : "");
                      setselectedscenarioname("");
                      setviewscenariodatatable(false);
                      setviewscenariodatatable2(false);
                      setmodifybtn(false);
                      setresultscreen2(false);
                      setresultscreen(false);
                    }}
                    isClearable
                  />
                </div>

                {selectedscenarioname !== "Base Scenario" && (
                  <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">
                    <div
                      id="subm"
                      className="rr-btn rr-btn-primary w-100"
                      onClick={() => handlescenariosfetch()}
                    >
                      <span>
                        Fetch Scenarios{" "}
                        <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {resultscreen ? (
            loader ? (
              <div
                className="row d-flex justify-content-center align-items-center"
                style={{ height: "75vh" }}
              >
                <Loader
                  type="box-rectangular"
                  bgColor={"#0A4742"}
                  title={"Processing Plots..."}
                  color={"#0A4742"}
                  size={75}
                />
              </div>
            ) : (
              <div>
                {scenariooptions?.length > 0 ? (
                  <div className="rr-card rr-card-section">
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6 col-lg-4">
                        <label className="rr-label">Scenario Filter</label>
                        <input
                          type="text"
                          className="form-control rr-select"
                          placeholder="Type scenario name..."
                          value={selectedscenarioname || ""}
                          onChange={(e) => {
                            setselectedscenarioname(e.target.value);
                            setopenindex([]);
                          }}
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-4 d-flex align-items-end">
                        <div className="rr-chip rr-chip-lg">
                          Showing{" "}
                          {
                            (() => {
                              const references = scenariooptions?.filter((row) =>
                                referencescenarioname.some(
                                  (master) =>
                                    row.scenario_name ===
                                    master.scenario_name.replace("M_NEW_BASE_", "")
                                )
                              );

                              const others = scenariooptions?.filter(
                                (row) =>
                                  !referencescenarioname.some(
                                    (master) =>
                                      row.scenario_name ===
                                      master.scenario_name.replace("M_NEW_BASE_", "")
                                  )
                              );

                              const sortedOthers = others.sort(
                                (a, b) =>
                                  new Date(b.created_dt) - new Date(a.created_dt)
                              );

                              const combined = [...references, ...sortedOthers];

                              return combined.filter((row) =>
                                !selectedscenarioname ||
                                  selectedscenarioname === "Select"
                                  ? true
                                  : row?.scenario_name
                                    ?.toLowerCase()
                                    ?.includes(
                                      selectedscenarioname.toLowerCase()
                                    )
                              ).length;
                            })()
                          }{" "}
                          scenario(s)
                        </div>
                      </div>
                    </div>

                    <div className="rr-table-shell">
                      <table className="table rr-table align-middle text-center mb-0">
                        <thead>
                          <tr>
                            <th>S. No.</th>
                            <th>FY</th>
                            <th>Brand</th>
                            <th>Market</th>
                            <th>Scenario Name</th>
                            <th>Date Created</th>
                            <th>Details</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                      </table>

                      <div className="rr-table-scroll">
                        <table className="table rr-table align-middle text-center mb-0">
                          <tbody>
                            {(() => {
                              const references = scenariooptions?.filter((row) =>
                                referencescenarioname.some(
                                  (master) =>
                                    row.scenario_name ===
                                    master.scenario_name.replace("M_NEW_BASE_", "")
                                )
                              );

                              const others = scenariooptions?.filter(
                                (row) =>
                                  !referencescenarioname.some(
                                    (master) =>
                                      row.scenario_name ===
                                      master.scenario_name.replace("M_NEW_BASE_", "")
                                  )
                              );

                              const sortedOthers = others.sort(
                                (a, b) =>
                                  new Date(b.created_dt) - new Date(a.created_dt)
                              );

                              const combined = [...references, ...sortedOthers];

                              const filteredCombined = combined.filter((row) =>
                                !selectedscenarioname ||
                                  selectedscenarioname === "Select"
                                  ? true
                                  : row?.scenario_name
                                    ?.toLowerCase()
                                    ?.includes(
                                      selectedscenarioname.toLowerCase()
                                    )
                              );

                              return filteredCombined.length > 0 ? (
                                filteredCombined.map((row, index) => (
                                  <React.Fragment
                                    key={`${row?.scenario_name}-${index}`}
                                  >
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{selectedyear}</td>
                                      <td>{selectedbrand}</td>
                                      <td>{market}</td>
                                      <td>
                                        <span className="rr-chip rr-chip-lg">
                                          {row?.scenario_name}
                                        </span>
                                      </td>
                                      <td>{row?.created_dt?.split("T")[0]}</td>
                                      <td>
                                        <button
                                          className="rr-btn rr-btn-primary"
                                          onClick={() => {
                                            setfulldataset({});
                                            setfulldataset2({});
                                            handleCheckboxChange(index, row);
                                          }}
                                        >
                                          {openindex[index] === true
                                            ? "Hide"
                                            : "Details"}
                                        </button>
                                      </td>
                                      <td>
                                        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                          {deletingScenarioKey ===
                                            `${row?.scenario_name}-${row?.created_dt}` ? (
                                            <span className="rr-muted-text">
                                              Loading...
                                            </span>
                                          ) : (
                                            row?.scenario_name.startsWith("M_") && (
                                              <button
                                                onClick={() => {
                                                  if (
                                                    row?.scenario_name ===
                                                    referencescenarioname.filter(
                                                      (it) => it.fy === selectedyear
                                                    )[0]?.scenario_name
                                                  ) {
                                                  } else {
                                                    handlemodifyreferencecenarios(
                                                      row
                                                    );
                                                  }
                                                }}
                                                className={
                                                  row?.scenario_name ===
                                                    referencescenarioname[0]?.scenario_name.replace(
                                                      `M_NEW_BASE_`,
                                                      ""
                                                    )
                                                    ? "rr-btn rr-btn-primary"
                                                    : "rr-btn rr-btn-secondary"
                                                }
                                              >
                                                {row?.scenario_name ===
                                                  referencescenarioname[0]?.scenario_name.replace(
                                                    `M_NEW_BASE_`,
                                                    ""
                                                  ) ? (
                                                  <b>Reference</b>
                                                ) : (
                                                  "Set as Reference"
                                                )}
                                              </button>
                                            )
                                          )}

                                          {row?.scenario_name ===
                                            referencescenarioname[0]?.scenario_name.replace(
                                              `M_NEW_BASE_`,
                                              ""
                                            ) ? (
                                            ""
                                          ) : (
                                            <button
                                              className="rr-btn rr-btn-secondary rr-btn-icon danger"
                                              onClick={() => {
                                                handledeletescenarios(row);
                                              }}
                                            >
                                              <i
                                                className="fas fa-trash-alt"
                                                style={{
                                                  color: "currentColor",
                                                  fontSize: "16px",
                                                }}
                                              ></i>
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>

                                    {openindex[index] === true && ReactDOM.createPortal(
                                      <>
                                        <div
                                          className="modal show"
                                          style={{
                                            display: "block",
                                            position: "fixed",
                                            top: 0,
                                            left: sidebarOffset,
                                            width: `calc(100vw - ${sidebarOffset}px)`,
                                            height: "100vh",
                                            zIndex: 9999,
                                            overflowX: "hidden",
                                            overflowY: "auto",
                                            background: "transparent",
                                          }}
                                          tabIndex="-1"
                                        >
                                          <div
                                            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
                                            style={{ maxWidth: "90vw", marginLeft: "auto", marginRight: "auto" }}
                                          >
                                            <div className="modal-content border-0 shadow rr-modal-content">
                                              <div
                                                className="modal-header"
                                                style={{
                                                  background: "var(--rr-bg-soft)",
                                                  borderBottom: "1px solid var(--rr-border)",
                                                  padding: "12px 20px",
                                                }}
                                              >
                                                <h5 className="modal-title fw-semibold" style={{ color: "var(--rr-text-main)", fontSize: "15px" }}>
                                                  {row?.scenario_name}
                                                </h5>
                                                <button
                                                  type="button"
                                                  className="btn-close"
                                                  style={{ filter: "var(--rr-close-filter, none)" }}
                                                  onClick={() => setopenindex([])}
                                                />
                                              </div>
                                              <div className="modal-body" style={{ padding: "20px" }}>
                                          {loader2 ? (
                                            <div className="rr-inline-loader">
                                              <div className="rr-dot-flashing"></div>
                                              <p className="rr-loader-text">Fetching Details...</p>
                                            </div>
                                          ) : fulldataset?.plot1.length > 0 ? (
                                            <div className="ss-detail-wrap">
                                              <div className="d-flex flex-row-reverse my-2">
                                                <button
                                                  className="rr-btn rr-btn-secondary"
                                                  onClick={() =>
                                                    setisValue(!isValue)
                                                  }
                                                >
                                                  {isValue
                                                    ? "By Volume"
                                                    : "By Value"}
                                                </button>
                                              </div>

                                              <div
                                                className="rr-card rr-card-mini"
                                                id="simulateddata"
                                              >
                                                {displaynames?.fy !== "2025-26" ? (
                                                  fulldataset?.plot1?.length > 0 &&
                                                  fulldataset2?.plot1?.length > 0 && (
                                                    <LineChart1
                                                      displaynames={displaynames}
                                                      fulldataset1={fulldataset}
                                                      fulldataset2={fulldataset2}
                                                      isValue={isValue}
                                                      range={`${formatPlotMonthYear(
                                                        fromrangeonplots
                                                      )}-${formatPlotMonthYear(
                                                        torangeonplots
                                                      )}`}
                                                    />
                                                  )
                                                ) : (
                                                  <AnnualData
                                                    displaynames={displaynames}
                                                    fulldataset1={fulldataset}
                                                    fulldataset2={fulldataset2}
                                                    isValue={isValue}
                                                    range={`${formatPlotMonthYear(
                                                      fromrangeonplots
                                                    )}-${formatPlotMonthYear(
                                                      torangeonplots
                                                    )}`}
                                                  />
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot2?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <PieCharts
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        displaynames={displaynames}
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot2?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <PieCharts
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot3?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart1
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...[
                                                                fulldataset?.plot3[0]
                                                                  .total_core / 1000,
                                                                fulldataset?.plot3[1]
                                                                  .total_incremental /
                                                                1000,
                                                                fulldataset?.plot3[2]
                                                                  .total_media / 1000,
                                                                fulldataset2?.plot3[0]
                                                                  .total_core / 1000,
                                                                fulldataset2?.plot3[1]
                                                                  .total_incremental /
                                                                1000,
                                                                fulldataset2?.plot3[2]
                                                                  .total_media / 1000,
                                                              ]
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                        maxValuedynamicValue={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...[
                                                                fulldataset?.plot3[0]
                                                                  .total_core_sales /
                                                                100000,
                                                                fulldataset?.plot3[1]
                                                                  .total_incremental_sales /
                                                                100000,
                                                                fulldataset?.plot3[2]
                                                                  .total_media_sales /
                                                                100000,
                                                                fulldataset2?.plot3[0]
                                                                  .total_core_sales /
                                                                100000,
                                                                fulldataset2?.plot3[1]
                                                                  .total_incremental_sales /
                                                                100000,
                                                                fulldataset2?.plot3[2]
                                                                  .total_media_sales /
                                                                100000,
                                                              ]
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot3?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart1
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...[
                                                                fulldataset?.plot3[0]
                                                                  .total_core / 1000,
                                                                fulldataset?.plot3[1]
                                                                  .total_incremental /
                                                                1000,
                                                                fulldataset?.plot3[2]
                                                                  .total_media / 1000,
                                                                fulldataset2?.plot3[0]
                                                                  .total_core / 1000,
                                                                fulldataset2?.plot3[1]
                                                                  .total_incremental /
                                                                1000,
                                                                fulldataset2?.plot3[2]
                                                                  .total_media / 1000,
                                                              ]
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                        maxValuedynamicValue={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...[
                                                                fulldataset?.plot3[0]
                                                                  .total_core_sales /
                                                                100000,
                                                                fulldataset?.plot3[1]
                                                                  .total_incremental_sales /
                                                                100000,
                                                                fulldataset?.plot3[2]
                                                                  .total_media_sales /
                                                                100000,
                                                                fulldataset2?.plot3[0]
                                                                  .total_core_sales /
                                                                100000,
                                                                fulldataset2?.plot3[1]
                                                                  .total_incremental_sales /
                                                                100000,
                                                                fulldataset2?.plot3[2]
                                                                  .total_media_sales /
                                                                100000,
                                                              ]
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot4?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart2
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot4.map(
                                                                (it) =>
                                                                  it.contribution
                                                              ),
                                                              ...fulldataset2?.plot4.map(
                                                                (it) =>
                                                                  it.contribution
                                                              )
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                        maxValuedynamicValue={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot4.map(
                                                                (it) =>
                                                                  it.contribution_sales_value /
                                                                  100000
                                                              ),
                                                              ...fulldataset2?.plot4.map(
                                                                (it) =>
                                                                  it.contribution_sales_value /
                                                                  100000
                                                              )
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot4?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart2
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot4.map(
                                                                (it) =>
                                                                  it.contribution
                                                              ),
                                                              ...fulldataset2?.plot4.map(
                                                                (it) =>
                                                                  it.contribution
                                                              )
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                        maxValuedynamicValue={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot4.map(
                                                                (it) =>
                                                                  it.contribution_sales_value /
                                                                  100000
                                                              ),
                                                              ...fulldataset2?.plot4.map(
                                                                (it) =>
                                                                  it.contribution_sales_value /
                                                                  100000
                                                              )
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot10?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart5
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot10.map(
                                                                (it) =>
                                                                  it.contribution
                                                              ),
                                                              ...fulldataset?.plot10.map(
                                                                (it) =>
                                                                  it.contribution
                                                              )
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                        maxValuedynamicValue={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot10.map(
                                                                (it) =>
                                                                  it.contribution_sales_value /
                                                                  100000
                                                              ),
                                                              ...fulldataset2?.plot10.map(
                                                                (it) =>
                                                                  it.contribution_sales_value /
                                                                  100000
                                                              )
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot10?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart5
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot10.map(
                                                                (it) =>
                                                                  it.contribution
                                                              ),
                                                              ...fulldataset?.plot10.map(
                                                                (it) =>
                                                                  it.contribution
                                                              )
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                        maxValuedynamicValue={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot10.map(
                                                                (it) =>
                                                                  it.contribution_sales_value /
                                                                  100000
                                                              ),
                                                              ...fulldataset2?.plot10.map(
                                                                (it) =>
                                                                  it.contribution_sales_value /
                                                                  100000
                                                              )
                                                            ) / 100
                                                          ) * 100
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot9?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart4
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={Math.ceil(
                                                          Math.max(
                                                            ...fulldataset?.plot5?.map(
                                                              (it) =>
                                                                Number(
                                                                  it?.attribute_value_per_roi
                                                                )
                                                            ),
                                                            ...fulldataset2?.plot5?.map(
                                                              (it) =>
                                                                Number(
                                                                  it?.attribute_value_per_roi
                                                                )
                                                            )
                                                          )
                                                        )}
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot9?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart4
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={Math.ceil(
                                                          Math.max(
                                                            ...fulldataset?.plot5?.map(
                                                              (it) =>
                                                                Number(
                                                                  it?.attribute_value_per_roi
                                                                )
                                                            ),
                                                            ...fulldataset2?.plot5?.map(
                                                              (it) =>
                                                                Number(
                                                                  it?.attribute_value_per_roi
                                                                )
                                                            )
                                                          )
                                                        )}
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot13?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart8
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot13?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.attribute_value_per_roi
                                                                  )
                                                              ),
                                                              ...fulldataset2?.plot13?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.attribute_value_per_roi
                                                                  )
                                                              )
                                                            ) / 10
                                                          ) * 10
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot13?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart8
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot13?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.attribute_value_per_roi
                                                                  )
                                                              ),
                                                              ...fulldataset2?.plot13?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.attribute_value_per_roi
                                                                  )
                                                              )
                                                            ) / 10
                                                          ) * 10
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot12?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart7
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={Math.ceil(
                                                          Math.max(
                                                            ...fulldataset?.plot12?.map(
                                                              (it) =>
                                                                Number(
                                                                  it?.attribute_value_per_roi
                                                                )
                                                            ),
                                                            ...fulldataset?.plot12?.map(
                                                              (it) =>
                                                                Number(
                                                                  it?.attribute_value_per_roi
                                                                )
                                                            )
                                                          )
                                                        )}
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot12?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart7
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={Math.ceil(
                                                          Math.max(
                                                            ...fulldataset?.plot12?.map(
                                                              (it) =>
                                                                Number(
                                                                  it?.attribute_value_per_roi
                                                                )
                                                            ),
                                                            ...fulldataset?.plot12?.map(
                                                              (it) =>
                                                                Number(
                                                                  it?.attribute_value_per_roi
                                                                )
                                                            )
                                                          )
                                                        )}
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot11?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart6
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot11?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.effectiveness
                                                                  )
                                                              ),
                                                              ...fulldataset2?.plot11?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.effectiveness
                                                                  )
                                                              )
                                                            ) / 10
                                                          ) * 10
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot11?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart6
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot11?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.effectiveness
                                                                  )
                                                              ),
                                                              ...fulldataset2?.plot11?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.effectiveness
                                                                  )
                                                              )
                                                            ) / 10
                                                          ) * 10
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="row g-3 my-3">
                                                {fulldataset2?.plot5?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart3
                                                        fulldataset={fulldataset2}
                                                        type={`${row?.scenario_name?.match(
                                                          "Master"
                                                        )
                                                          ? "Master"
                                                          : "Base"
                                                          } Scenario`}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot9?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.effectiveness
                                                                  )
                                                              ),
                                                              ...fulldataset2?.plot9?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.effectiveness
                                                                  )
                                                              )
                                                            ) / 10
                                                          ) * 10
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {fulldataset?.plot5?.length > 0 && (
                                                  <div className="col-12 col-lg-6">
                                                    <div className="rr-card rr-card-mini h-100">
                                                      <SingleBarChart3
                                                        fulldataset={fulldataset}
                                                        type={displaynames.scenario}
                                                        isValue={isValue}
                                                        range={`${formatPlotMonthYear(
                                                          fromrangeonplots
                                                        )}-${formatPlotMonthYear(
                                                          torangeonplots
                                                        )}`}
                                                        maxValuedynamicVolume={
                                                          Math.ceil(
                                                            Math.max(
                                                              ...fulldataset?.plot9?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.effectiveness
                                                                  )
                                                              ),
                                                              ...fulldataset2?.plot9?.map(
                                                                (it) =>
                                                                  Number(
                                                                    it?.effectiveness
                                                                  )
                                                              )
                                                            ) / 10
                                                          ) * 10
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="rr-empty-state rr-empty-state-soft">
                                              There was some problem generating charts!
                                            </div>
                                          )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div
                                          className="modal-backdrop show"
                                          style={{
                                            zIndex: 9998,
                                            position: "fixed",
                                            top: 0,
                                            left: sidebarOffset,
                                            width: `calc(100vw - ${sidebarOffset}px)`,
                                            height: "100vh",
                                          }}
                                          onClick={() => setopenindex([])}
                                        />
                                      </>
                                    , document.body)}
                                  </React.Fragment>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="8">
                                    <div className="rr-empty-state rr-empty-state-soft my-3">
                                      No scenarios match the current filter.
                                    </div>
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rr-card rr-card-empty">
                    <div className="rr-empty-state">
                      No records found to display.
                    </div>
                  </div>
                )}
              </div>
            )
          ) : loader ? (
            <div
              className="row d-flex justify-content-center align-items-center"
              style={{ height: "75vh" }}
            >
              <Loader
                type="box-rectangular"
                bgColor={"#0A4742"}
                title={"Processing Plots..."}
                color={"#0A4742"}
                size={75}
              />
            </div>
          ) : (
            <>
              <div className="my-3">
                {brandoptions?.length > 0 ? (
                  <div className="rr-card rr-card-section">
                    <div className="row g-3 align-items-end">
                      <div className="col-12 col-md-3">
                        <label className="rr-label">
                          FY:<span className="text-danger">*</span>
                        </label>
                        <Select
                          placeholder="Select"
                          classNamePrefix="rr-select"
                          value={selectedyear ? { label: selectedyear, value: selectedyear } : null}
                          options={yearoptions?.map((item) => ({ label: item.fy, value: item.fy }))}
                          onChange={(val) => {
                            setviewscenariodatatable(false);
                            setselectedyear(val ? val.value : "");
                            setselectedbrand("");
                            setmarket("");
                            setselectedscenarioname("");
                          }}
                        >
                          {yearoptions?.map((item) => (
                            <option key={item.fy}>{item.fy}</option>
                          ))}
                        </Select>
                      </div>

                      <div className="col-12 col-md-3">
                        <label className="rr-label">
                          Brand:<span className="text-danger">*</span>
                        </label>
                        <Select
                          placeholder="Select"
                          classNamePrefix="rr-select"
                          value={selectedbrand && maskedBrandOption.maskedBrandOption[selectedbrand]
                            ? { label: maskedBrandOption.maskedBrandOption[selectedbrand], value: selectedbrand }
                            : null}
                          options={brandoptions?.map((option) => ({
                            label: maskedBrandOption.maskedBrandOption[option.brand],
                            value: maskedBrandOption.maskedBrandOption[option.brand]
                          }))}
                          onChange={(val) => {
                            setselectedbrand(
                              val ? unMaskedBrandOption.unMaskedBrandOption[val.value] : ""
                            );
                            setmarket("Select");
                            setselectedscenarioname("");
                            setviewscenariodatatable(false);
                          }}
                        >
                          {brandoptions?.map((option) => (
                            <option key={option.brand}>
                              {maskedBrandOption.maskedBrandOption[option.brand]}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="col-12 col-md-3">
                        <label className="rr-label">
                          Market:<span className="text-danger">*</span>
                        </label>
                        <Select
                          placeholder="Select"
                          classNamePrefix="rr-select"
                          value={market && market !== "Select" ? { label: market, value: market } : null}
                          options={marketoptions?.map((item) => ({
                            label: item.final_market,
                            value: item.final_market
                          }))}
                          onChange={(val) => {
                            setmarket(val ? val.value : "");
                            setselectedscenarioname("");
                            setviewscenariodatatable(false);
                          }}  
                        >
                          {marketoptions?.map((item) => (
                            <option key={item.final_market}>
                              {item.final_market}
                            </option>
                          ))}
                          </Select>
                      </div>

                      <div className="col-12 col-md-3">
                        <div
                          className="rr-btn rr-btn-primary w-100"
                          type="button"
                          onClick={() => handlescenariosfetch()}
                        >
                          <span>
                            Fetch Scenarios{" "}
                            <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                          </span>
                        </div>
                      </div>
                    </div>

                    {scenarionewoldscreen === "new" && (
                      <div className="rr-card rr-card-inner mt-4">
                        <h6 className="fw-semibold mb-3">Select Time Type:</h6>

                        <div className="d-flex flex-wrap gap-3">
                          {[
                            { label: "Yearly", value: "Y" },
                            { label: "Half-Yearly", value: "HY" },
                            { label: "Quarterly", value: "Q" },
                            { label: "Monthly", value: "M" },
                          ].map((item, index) => (
                            <div className="form-check ss-radio-wrap" key={index}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name="timetype"
                                id={`time-${item.value}`}
                                onClick={() => {
                                  settimetype(item.value);
                                  setviewscenariodatatable(false);
                                }}
                              />
                              <label
                                className="form-check-label fw-semibold"
                                htmlFor={`time-${item.value}`}
                              >
                                {item.label}
                              </label>
                            </div>
                          ))}
                        </div>

                        <div className="d-flex flex-wrap align-items-center mt-4 gap-3">
                          {timetype && (
                            <>
                              <button
                                className="rr-btn rr-btn-primary"
                                onClick={() => {
                                  if (viewscenariodatatable) {
                                    setviewscenariodatatable(false);
                                  } else {
                                    fetchdatasettable("Base Scenario");
                                  }
                                }}
                              >
                                {!viewscenariodatatable
                                  ? "Create from Base Scenario Data"
                                  : "Hide"}
                              </button>

                              <span className="ss-divider">/</span>

                              <button
                                className="rr-btn rr-btn-secondary"
                                onClick={() =>
                                  setcreatefrombaseoruploadfileswitch(
                                    !createfrombaseoruploadfileswitch
                                  )
                                }
                              >
                                Import from Excel
                              </button>
                            </>
                          )}
                        </div>

                        {createfrombaseoruploadfileswitch && (
                          <div className="rr-card rr-card-inner rr-card-dashed mt-4">
                            <div className="row g-3 align-items-end">
                              <div className="col-12 col-md-5">
                                <label className="rr-label">
                                  Import File{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="file"
                                  accept=".xlsx"
                                  onChange={(e) =>
                                    setuploadfile(e.target.files[0])
                                  }
                                  className="form-control rr-select"
                                  placeholder="No File Chosen"
                                />

                                <ul className="list-unstyled small mt-2 mb-0">
                                  <li
                                    type="button"
                                    className="ss-download-link"
                                    onClick={() => downloadSampleFile()}
                                  >
                                    <iconify-icon icon="material-symbols:download"></iconify-icon>{" "}
                                    Download Sample File
                                  </li>
                                  <li className="rr-muted-text">
                                    (File Type: Excel & CSV)
                                  </li>
                                </ul>
                              </div>

                              <div className="col-12 col-md-2">
                                <div className="rr-btn rr-btn-primary text-center">
                                  <a>Upload</a>
                                </div>
                              </div>

                              <div className="col-12 col-md-2">
                                <div className="rr-btn rr-btn-secondary text-center">
                                  <a
                                    onClick={() => {
                                      setresultscreen(false);
                                      setresultscreen2(false);
                                      setselectedbrand("");
                                      setmarket("");
                                      setscenariooptions([])
                                    }}
                                  >
                                    Reset
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {scenarionewoldscreen === "old" &&
                      selectedscenarioname !== "Base Scenario" && (
                        <div className="d-flex justify-content-end mt-4">
                          <div
                            className="rr-btn rr-btn-primary w-100"
                            type="button"
                            onClick={() => handlesimulate()}
                          >
                            <span>
                              Simulate{" "}
                              <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="rr-card rr-card-empty">
                    <div className="rr-dot-loader">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <div className="mt-2 fw-semibold rr-muted-text">
                      Grabbing Details...
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
      </div>
    </>
  );
}

export default SavedScenarios