import React, { useEffect, useState } from "react";
import 'spiketip-tooltip/spiketip.min.css'
import { useOutletContext } from "react-router-dom";
import UserService from "../../services/UserService.js";
import Select, { components } from "react-select";
import axios from "axios";
import { useDispatch } from "react-redux";
import getNotification from "../../Redux/Action/action.js";
import Loader from "react-js-loader";
import LoaderCustom from "../LoaderCustom.jsx";
import { downloadPdf, uploadPDF, notifyRequestError, requireLogin, defaultJsonHeaders, toSelectOptions } from "../HelperFunction/helperFunction.js";
import StackBarChart from "./StackBarChart.jsx";
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'
import LineBarChartBrandAnalysis from "./LineBarChartBrandAnalysis.jsx";
import maskedBrandOption from '../JSON Files/MaskedBrandOption.json'
import { toast } from "react-toastify";
const { REACT_APP_UPLOAD_DATA } = process.env;

function BrandAnalysis() {

  const selectAllOption = { label: "Select All", value: "selectAll" };
  const [modifybtn, setmodifybtn] = useState(false)
  const [options, setoptions] = useState({})
  const [salesdata, setsalesdata] = useState([])
  const [displaynames, setdisplaynames] = useState({});
  const [currentScreen, setcurrentScreen] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [brandoptions, setbrandoptions] = useState([]);
  const [marketoptions, setmarketoptions] = useState([]);
  const [market, setmarket] = useState([]);
  const [loader, setloader] = useState(false);
  const [baVariablesRecived, setBAVariablesRecieved] = useState(false);
  const [reportLoader, setreportLoader] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [resultscreen, setresultscreen] = useState(false);
  const [selectedbrand, setselectedbrand] = useState("");
  const [variableslist, setvariableslist] = useState([]);
  const [variable, setvariable] = useState([]);
  const [selectedvariable, setselectedvariable] = useState([]);
  const [plotdataweekly, setplotdataweekly] = useState({});
  const [plotdatamonthly, setplotdatamonthly] = useState({});
  const [statisticsdata1, setstatisticsdata1] = useState([]);
  const [corelationdata, setcorelationdata] = useState([]);
  const dispatch = useDispatch();
  const [reportName, setreportName] = useState("");
  const [variablesoptions, setvariablesoptions] = useState([])
  const [uniquetypes, setuniquetypes] = useState([])

  useEffect(() => {
    // handledatemenu();
    handlevariablesfetch();
    // handlevariablesmenu();
  }, []);
  useEffect(() => {
    handlefetchmarket()
  }, [selectedbrand])
  useEffect(() => {
    handlefetchvariables()
  }, [market])
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
        // console.log(getResponse)
        if (getResponse.data !== "Invalid User!") {
          const markets = getResponse.data.markets;
          if (UserService.hasRole(["SALES"])) {
            // let finalmarkets = markets?.filter(it => it.final_market === "EAST");
            setmarketoptions(
              [
                // Add Select All option
                ...markets?.map((it) => ({
                  value: it.final_market,
                  label: it.final_market,
                })),
              ]
            )
          }
          else {
            setmarketoptions(
              [
                // Add Select All option
                ...markets?.map((it) => ({
                  value: it.final_market,
                  label: it.final_market,
                })),
              ]
            );
          }

        }
      } catch (err) {

      }
    } else {
      requireLogin("/dashboard/brandanalysis");
    }
  };
  const handlefetchvariables = async () => {
    if (UserService.isLoggedIn()) {
      setBAVariablesRecieved(false)
      try {
        const FormData = require("form-data");
        const sendData = new FormData();
        const requestData = {
          brand: selectedbrand,
          market: market,

        }

        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/app/get_variables_BA`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData,
        };
        const getResponse = market?.length > 0 ? await axios(config) : [];

        if (getResponse.data !== "Invalid User!") {

          let arr = getResponse?.data?.vars_data?.filter(
            (item) => !ExceptionVariables?.zeroOrOneVariables?.includes(item.attribute_name)
          );
          arr.sort((a, b) => a.attribute_name.localeCompare(b.attribute_name));
          
          // Psuhing Aggregated And Totals Varibale Type
          // arr.push(...ExceptionVariables?.additionstogetvariablesapi) 

          setvariablesoptions(arr)
          setuniquetypes(Array.from(new Set(arr?.map((item => {
            return item.type
          })))))
          setBAVariablesRecieved(true)

        }
      } catch (err) {

      }
    } else {
      requireLogin("/dashboard/brandanalysis");
    }
  };
  const reverseDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
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
          setStartDate(reverseDate(getResponse.data.dates[0].min[0].start_date));
          setEndDate(reverseDate(getResponse.data.dates[0].max[0].end_date));
          const filteredBrands = getResponse.data.brands
            ?.filter(it => !ExceptionVariables?.brandoptionshide?.includes(it?.brand))
            ?.map(it => ({
              value: it.brand,
              label: maskedBrandOption.maskedBrandOption[it.brand.trim().toUpperCase()]
            }));

          let finalBrands = filteredBrands;

          // Role-based filtering
          if (UserService.hasRole(["BBMNGR"])) {
            finalBrands = filteredBrands?.filter(it => it.value === "BAD BANGLES");
          }
          else if (UserService.hasRole(["OODMNGR"])) {
            finalBrands = filteredBrands?.filter(it => it.value === "OODLES");
          }
          else if (UserService.hasRole(["SALES"])) {
            finalBrands = filteredBrands?.filter(it => it.value === "OODLES");
          }
          else if (UserService.hasRole(["MUMNGR"])) {
            finalBrands = filteredBrands?.filter(it => it.value === "MILD URGENCY");
          }
          else if (UserService.hasRole(["CBMNGR"])) {
            finalBrands = filteredBrands?.filter(it => it.value === "CHERRY BRIGHT");
          }
          // Set once
          setbrandoptions(finalBrands);

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/dashboard/brandanalysis");
    }
  };

  const handlecheckboxesselection = (e, item) => {
    if (e.target.checked) {
      if (e.target.value === ExceptionVariables.additionstogetvariablesapi[0].attribute_name || e.target.value === ExceptionVariables.additionstogetvariablesapi[1].attribute_name
        || e.target.value === ExceptionVariables.additionstogetvariablesapi[2].attribute_name
        //  || e.target.value === ExceptionVariables.additionstogetvariablesapi[3].attribute_name ||
        // e.target.value === ExceptionVariables.additionstogetvariablesapi[4].attribute_name ||
        // e.target.value === ExceptionVariables.additionstogetvariablesapi[5].attribute_name
      ) {
        selectedvariable?.map((variable) => {
          document.getElementById(variable).checked = false
        })
        const arr = []
        arr.push(item.attribute_name)
        setselectedvariable(arr);
      }
      else {
        if (selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[0].attribute_name) || selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[1].attribute_name) ||
          selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[2].attribute_name)
          // || selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[3].attribute_name) ||
          //     selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[4].attribute_name) ||
          //     selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[5].attribute_name)
        ) {
          e.target.checked = false;
          dispatch(getNotification({ message: "Aggregated variable already selected!!", type: "danger" }))
        }
        else {
          if (false) {
            dispatch(getNotification({ message: "Only 6 variable allowed at one time!!", type: "danger" }))
            e.target.checked = false;
          }
          else {
            const arr = [...selectedvariable]
            arr.push(item.attribute_name)
            setselectedvariable(arr);
          }
        }
      }

    }

    else {
      let arr = [...selectedvariable]
      arr = arr.filter(variable => variable !== item.attribute_name);
      setselectedvariable(arr);
    }

  };
  const handlebrandanalysis = async () => {
    if (UserService.isLoggedIn()) {
      if (selectedbrand && startDate && endDate && market?.length > 0 && selectedvariable?.length > 0) {
        try {
          let arr1 = []
          let arr2 = []
          if (selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[0].attribute_name)) {
            arr1 = ExceptionVariables.tv_Aggregated_Variables_grp
          }
          else if (selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[1].attribute_name)) {
            arr1 = ExceptionVariables.tv_Aggregated_Variables_inr
          }
          else if (selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[2].attribute_name)) {
            arr1 = ExceptionVariables.cp_Aggregated_Variables_inr
          }
          else if (selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[3].attribute_name)
            || selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[4].attribute_name)
            || selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[5].attribute_name)) {
            selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[3].attribute_name) && arr2.push(ExceptionVariables.additionstogetvariablesapi[3].attribute_name)
            selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[4].attribute_name) && arr2.push(ExceptionVariables.additionstogetvariablesapi[4].attribute_name)
            selectedvariable?.includes(ExceptionVariables.additionstogetvariablesapi[5].attribute_name) && arr2.push(ExceptionVariables.additionstogetvariablesapi[5].attribute_name)
            arr1 = selectedvariable
          }

          else {
            arr1 = selectedvariable
          }

          arr1 = arr1.filter(it => !arr2.includes(it));
          if (arr1.length === 0) {
            dispatch(getNotification({
              message: "Please select atleast one variable other than totals!",
              type: "danger"
            }))
            return
          }
          setloader(true);
          const requestData = {
            start_date: startDate,
            end_date: endDate,
            variables: arr1,
            brand: selectedbrand,
            market: market,
            variable_type: arr2
          };
          const config1 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/app/brandanalysis`,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            data: requestData,
          };
          const config2 = {
            method: "post",
            url: `${REACT_APP_UPLOAD_DATA}/app/monthly_brandanalysis`,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            data: requestData,
          };
          const getResponse1 = await axios(config1);
          const getResponse2 = await axios(config2);

          if (getResponse1.status === 200 && getResponse1.data?.market_data?.length > 0) {

            if (getResponse1.data[0] !== "Invalid User!") {
              let arr1 = [...getResponse1.data?.market_data]
              arr1 = arr1.map((it) => {
                return {
                  ...it,
                  variables: [...it.variables, ...it.variable_types]
                }
              })

              console.log(arr1)

              let arr2 = [...getResponse2.data?.market_data]
              arr2 = arr2.map((it) => {
                return {
                  ...it,
                  variables: [...it.variables, ...it.variable_types]
                }
              })

              setplotdataweekly(arr1)
              setplotdatamonthly(arr2)

              setresultscreen(true);
              setdisplaynames({
                ...displaynames,
                startDate: startDate.split('-').reverse().join('-'),
                endDate: endDate.split('-').reverse().join('-'),
                selectedbrand: selectedbrand,
                variable: selectedvariable,
                market: market,

              })
            }
            else if (getResponse1.data[0] === "Invalid User!") {
              requireLogin("/dashboard/brandanalysis");
            }
          }
        } catch (err) {
          //handleMouseEnter();
          setresultscreen(false)
          setmodifybtn(false)
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
      requireLogin("/dashboard/brandanalysis");
    }
    setloader(false);
  };

  const fetchstatisticsdata = async () => {
    if (UserService.isLoggedIn()) {
      try {
        const requestData = {
          // jwttoken: UserService.getToken(),
          start_date: startDate,
          end_date: endDate,
          variables: [variable],
          brand: selectedbrand,
        };

        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/app/statistics`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData,
        };
        const getResponse = await axios(config);

        // setplot1list(Array.from(getResponse.data));
        if (getResponse.status === 200) {
          if (getResponse.data === "No Records Found." || getResponse.data === "42883: function round(real, integer) does not exist\n\nPOSITION: 25") {
            dispatch(
              getNotification({
                message: "There are no statistics record",
                type: "default",
              })
            );
          } else {

            setstatisticsdata1(getResponse.data);
          }

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/dashboard/brandanalysis");
    }
  };

  const fetchcorelationdata = async () => {
    if (UserService.isLoggedIn()) {
      try {
        const requestData = {
          // jwttoken: UserService.getToken(),
          start_date: startDate,
          end_date: endDate,
          variables: selectedvariable,
          brand: selectedbrand,
        };
        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/app/correlation`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData,
        };
        const getResponse = await axios(config);
        // setplot1list(Array.from(getResponse.data));
        if (getResponse.status === 200) {
          if (getResponse.data === "No Records Found.") {
            dispatch(
              getNotification({
                message: "There are not statistics record",
                type: "default",
              })
            );
          } else {
            setcorelationdata(getResponse.data.matrix);
          }
        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/dashboard/brandanalysis");
    }
  };
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const { theme } = useOutletContext();

  const handlegeneratereport = async () => {
    setreportLoader(true)
    if (!UserService.isLoggedIn()) {
      requireLogin("/dashboard/brandanalysis");
      return;
    }

    if (!reportName) {
      dispatch(
        getNotification({
          message: "Please fill Report Name",
          type: "warning",
        })
      );
      return;
    }

    if (!reportName || !variable || !selectedbrand || !startDate || !endDate) {
      dispatch(
        getNotification({
          message: "Please fill all entries",
          type: "warning",
        })
      );
      return;
    }

    try {
      const requestData = {
        report_name: reportName,
        start_date: displaynames?.startDate,
        end_date: displaynames?.endDate,
        brand: displaynames?.selectedbrand,
        market: displaynames?.market?.[0] || "",
        data: plotdataweekly || [],
        user_created_by: UserService.getUsername(),
        created_on: new Date().toISOString().split("T")[0],
        report_type: "Brand_Analysis",
      };

      const response = await axios.post(
        `${REACT_APP_UPLOAD_DATA}/app/generate_report`,
        requestData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setreportName("");
        setreportLoader(false);
        setShowReportModal(false)
        dispatch(
          getNotification({
            message:
              response?.data?.message ||
              "Report generation started. We will notify you once it is ready.",
            type:
              response?.data?.message === "Same report is already in Queue."
                ? "warning"
                : "success",
          })
        )
      }
    } catch (err) {
      console.log("Server Error", err);

      if (err.response?.status === 500) {
        dispatch(
          getNotification({
            message: "Server is Down! Please try again after sometime",
            type: "default",
          })
        );
      } else if (err.response?.status === 400) {
        dispatch(
          getNotification({
            message: err.response?.data?.detail || err.response?.data || "Bad Request",
            type: "danger",
          })
        );
      } else if (err.response?.status === 422) {
        dispatch(
          getNotification({
            message: "Input is not in prescribed format",
            type: "default",
          })
        );
      } else if (err.response?.status === 404) {
        dispatch(
          getNotification({
            message: "Page not Found",
            type: "default",
          })
        );
      } else if (err.response?.status === 401) {
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
    } finally {
      setreportLoader(false);
      setShowReportModal(false)
    }
  };
  return (
    <>
      {/* Save Report Modal */}
      {
        showReportModal && (
          <div
            className="rr-modal-overlay"
            onClick={() => {
              if (reportLoader) return;
              // outside click should NOT close modal
              // so do nothing here
            }}
          >
            <div
              className="rr-modal-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rr-modal-content">
                <div className="modal-header rr-modal-header">
                  <div>
                    <div className="rr-chip rr-chip-accent">Report</div>
                    <h6 className="modal-title fw-bold mb-1" id="exampleModalLabel">
                      Save Report
                    </h6>
                    <p className="rr-modal-subtitle mb-0">
                      Enter a name for this report and generate it.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rr-btn rr-btn-secondary rr-btn-icon"
                    aria-label="Close"
                    onClick={() => {
                      if (!reportLoader) {
                        setreportName("");
                        setShowReportModal(false);
                      }
                    }}
                    disabled={reportLoader}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <div className="modal-body rr-modal-body">
                  <label className="rr-label mb-2">
                    Please enter report name:
                  </label>

                  <input
                    type="text"
                    id="reportnamebox"
                    className="form-control rr-input"
                    value={reportName}
                    onChange={(e) => setreportName(e.target.value)}
                    disabled={reportLoader}
                    placeholder="Enter report name"
                    autoFocus
                  />
                </div>

                <div className="modal-footer rr-modal-footer">
                  <button
                    type="button"
                    className="rr-btn rr-btn-secondary"
                    onClick={() => {
                      if (!reportLoader) {
                        setreportName("");
                        setShowReportModal(false);
                      }
                    }}
                    disabled={reportLoader}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="rr-btn rr-btn-primary"
                    onClick={() => {
                      if (reportLoader) return;

                      if (!reportName.trim()) {
                        document.getElementById("reportnamebox")?.focus();
                        return;
                      }

                      handlegeneratereport();
                    }}
                    disabled={reportLoader}
                  >
                    {reportLoader ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Generating...
                      </>
                    ) : (
                      "Generate"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      <div className="ba-page" style={{ userSelect: "none" }}>
          <div className="rr-card rr-card-header">
            <div className="rr-page-header-left">
              <div className="rr-breadcrumb">Dashboard / Brand Analysis</div>
              <h2 className="rr-page-title">Brand Analysis</h2>
              <p className="rr-page-subtitle mb-0">
                Analyze brand performance across selected date ranges, compare
                variables across markets, and generate downloadable reports from a
                single workspace.
              </p>
            </div>

            {resultscreen && (
              <div className="rr-page-header-actions">
                <button
                  className="rr-btn rr-btn-secondary"
                  style={{ minWidth: "120px" }}
                  onClick={() => {
                    setmodifybtn(false);
                    setresultscreen(false);
                    setselectedvariable([]);
                    setmarket([]);
                    setselectedbrand("");
                    setvariablesoptions([]);
                    setmarketoptions([]);
                    setDownloadUrl("");
                  }}
                  disabled={loading}
                >
                  Reset
                </button>

                <button
                  className="rr-btn rr-btn-primary"
                  style={{ minWidth: "120px" }}
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
                    // onClick={() => { setShowReportModal(true) }}
                    onClick={()=>{toast.warning('The Feature will be live from 0 April,2026.')}}
                    data-target="#exampleModal1"
                  >
                    Generate Report
                  </button>
                )}
              </div>
            )}
          </div>

          {modifybtn && (
            <>
              <div className="rr-card rr-card-section">
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <label htmlFor="StartDateModify" className="rr-label">
                      Start Date <span className="text-danger">*</span>
                    </label>
                  <input
                    type="date"
                    className="form-control rr-input"
                    id="StartDateModify"
                    value={startDate}
                    onChange={(e) => {
                      if (endDate) {
                        if (e.target.value <= endDate) {
                          setStartDate(e.target.value);
                        } else {
                          alert("Entered start date is after end date");
                        }
                      } else {
                        setStartDate(e.target.value);
                      }
                    }}
                    placeholder="Start Date"
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label htmlFor="EndDateModify" className="rr-label">
                    End Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control rr-input"
                    id="EndDateModify"
                    value={endDate}
                    onChange={(e) => {
                      if (e.target.value >= startDate) {
                        setEndDate(e.target.value);
                      } else {
                        alert("Please enter End date after start date");
                      }
                    }}
                    placeholder="End Date"
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="rr-label">
                    Brand <span className="text-danger">*</span>
                  </label>
                  <Select
                    classNamePrefix="rr-select"
                    placeholder="Select Brand"
                    options={brandoptions}

                    value={
                      maskedBrandOption.maskedBrandOption[selectedbrand]
                        ? {
                          label:
                            maskedBrandOption.maskedBrandOption[selectedbrand],
                          value: selectedbrand,
                        }
                        : null
                    }
                    onChange={(value) => {
                      setselectedbrand(value.value);
                      setselectedvariable([]);
                      setmarket([]);
                    }}
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="rr-label">
                    Market <span className="text-danger">*</span>
                  </label>
                  <Select
                    classNamePrefix="rr-select"
                    placeholder="Select Market"
                    options={marketoptions}
                    value={
                      market?.length > 0
                        ? toSelectOptions(market)
                        : null
                    }
                    onChange={(value) => {
                      setmarket([value.value]);
                      let arr = [...selectedvariable];
                      arr.forEach((it) => {
                        const element = document.getElementById(it);
                        if (element) element.checked = false;
                      });
                      setselectedvariable([]);
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 d-flex justify-content-center justify-content-lg-end">
                <div
                  className="rr-btn rr-btn-primary w-100"
                  type="button"
                  onClick={() => {
                    handlebrandanalysis();
                  }}
                >
                  <span>
                    Submit{" "}
                    <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                  </span>
                </div>
              </div>
              </div>

              {market?.length > 0 && baVariablesRecived && (
                <div className="rr-card rr-card-section mt-3">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <h6 className="fw-bold mb-0">Select Marketing Inputs</h6>
                    <span className="rr-muted-text small">
                      Choose the variables you want to analyze for the selected
                      market
                    </span>
                  </div>

                  <div className="accordion rr-accordion" id="accordionExample2Modify">
                    {uniquetypes?.map((item, index) => (
                      <div className="accordion-item rr-accordion-item mb-2" key={index}>
                        <h2
                          className="accordion-header"
                          id={`headingModify${index}`}
                        >
                          <button
                            className="accordion-button collapsed rr-accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapseModify${index}`}
                            aria-expanded="false"
                            aria-controls={`collapseModify${index}`}
                          >
                            <b>{item ? item : "All"}</b>
                          </button>
                        </h2>
                        <div
                          id={`collapseModify${index}`}
                          className="accordion-collapse collapse"
                          aria-labelledby={`headingModify${index}`}
                          data-bs-parent="#accordionExample2Modify"
                        >
                          <div className="accordion-body rr-accordion-body">
                            <div className="row g-2">
                              {variablesoptions?.map(
                                (it, idx) =>
                                  it?.type === item && (
                                    <div
                                      key={idx}
                                      className="col-12 col-sm-6 col-md-4"
                                    >
                                      <label className="ba-check-card">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={it.attribute_name}
                                          value={it.attribute_name}
                                          checked={selectedvariable?.includes(
                                            it.attribute_name
                                          )}
                                          onChange={(e) =>
                                            handlecheckboxesselection(e, it)
                                          }
                                        />
                                        <span className="ml-2">{it.attribute_name}</span>
                                      </label>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
            )}

            <div className="my-3">
            {loader ? (
              <div
                className="row d-flex justify-content-center align-items-center"
                style={{ height: "75vh" }}
              >
                <LoaderCustom text="Fetching Brand Analysis Report...." />
              </div>
            ) : resultscreen ? (
              <>
                {!modifybtn && resultscreen && displaynames.selectedbrand?.length > 0 && (
                    <div className="rr-card rr-card-inner">
                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <div className="rr-card-meta">
                            <strong>Start Date</strong>
                            <div className="rr-meta-value">
                              {displaynames.startDate}
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-md-4">
                          <div className="rr-card-meta">
                            <strong>End Date</strong>
                            <div className="rr-meta-value">
                              {displaynames.endDate}
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-md-4">
                          <div className="rr-card-meta">
                            <strong>Brand</strong>
                            <div className="rr-meta-value">
                              {maskedBrandOption.maskedBrandOption[selectedbrand]}
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-md-7">
                          <div className="rr-card-meta">
                            <strong>Market</strong>
                            <div
                              className="rr-meta-value"
                              style={{ wordBreak: "break-word" }}
                            >
                              {displaynames.market?.length > 1
                                ? displaynames.market.join(", ")
                                : displaynames.market[0]}
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-md-5">
                          <div className="rr-card-meta">
                            <strong>Variables</strong>
                            <div
                              className="rr-meta-value"
                              style={{ wordBreak: "break-word" }}
                            >
                              {displaynames.variable?.join(", ")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!modifybtn && <div id="pdfConvertible" className="w-100">
                    {resultscreen && displaynames.selectedbrand?.length > 0 && (
                    <div className="mt-4">
                      {displaynames?.variable?.includes("Sales_Volume") ||
                        displaynames?.variable?.includes("Sales_Value") ? (
                        <StackBarChart
                          plotdataweekly={plotdataweekly}
                          plotdatamonthly={plotdatamonthly}
                          displaynames={displaynames}
                          theme={theme}
                        />
                      ) : (
                        <LineBarChartBrandAnalysis
                          plotdataweekly={plotdataweekly}
                          plotdatamonthly={plotdatamonthly}
                          displaynames={displaynames}
                          theme={theme}
                        />
                      )}
                    </div>
                  )}
                  </div>}
              </>
            ) : (
              <>
                {brandoptions?.length > 0 ? (
                    <>
                    <div className="rr-card rr-card-section">
                      <div className="row g-3">
                        <div className="col-12 col-md-6 col-lg-3">
                          <label htmlFor="StartDate" className="rr-label">
                            Start Date <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            disabled={resultscreen}
                            className="form-control rr-input"
                            id="StartDate"
                            value={startDate}
                            onChange={(e) => {
                              if (endDate) {
                                if (e.target.value <= endDate) {
                                  setStartDate(e.target.value);
                                } else {
                                  alert("Entered start date is after end date");
                                }
                              } else {
                                setStartDate(e.target.value);
                              }
                            }}
                            placeholder="Start Date"
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3">
                          <label htmlFor="EndDate" className="rr-label">
                            End Date <span className="text-danger">*</span>
                          </label>
                          <input
                            disabled={resultscreen}
                            type="date"
                            className="form-control rr-input"
                            id="EndDate"
                            value={endDate}
                            onChange={(e) => {
                              if (e.target.value >= startDate) {
                                setEndDate(e.target.value);
                              } else {
                                alert("Please enter End date after start date");
                              }
                            }}
                            placeholder="End Date"
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3">
                          <label className="rr-label">
                            Brand <span className="text-danger">*</span>
                          </label>
                          <Select
                            classNamePrefix="rr-select"
                            placeholder="Select Brand"
                            options={brandoptions}
                            value={
                              maskedBrandOption.maskedBrandOption[selectedbrand]
                                ? {
                                  label:
                                    maskedBrandOption.maskedBrandOption[
                                    selectedbrand
                                    ],
                                  value: selectedbrand,
                                }
                                : null
                            }
                            onChange={(value) => {
                              setselectedvariable([]);
                              setmarket([]);
                              setselectedbrand(value.value);
                            }}
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3">
                          <label className="rr-label">
                            Market <span className="text-danger">*</span>
                          </label>
                          <Select
                            classNamePrefix="rr-select"
                            placeholder="Select Market"
                            options={marketoptions}
                            value={
                              market?.length > 0
                                ? toSelectOptions(market)
                                : null
                            }
                            onChange={(value) => {
                              setmarket([value.value]);
                              let arr = [...selectedvariable];
                              arr.forEach((it) => {
                                const element = document.getElementById(it);
                                if (element) element.checked = false;
                              });
                              setselectedvariable([]);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {market?.length > 0 && (
                      <div className="rr-card rr-card-section mt-3">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                          <h6 className="fw-bold mb-0">Select Marketing Inputs</h6>
                          <span className="rr-muted-text small">
                            Choose the variables you want to analyze for the selected market
                          </span>
                        </div>

                        <div className="accordion rr-accordion" id="accordionExample2">
                          {uniquetypes?.map((item, index) => (
                            <div
                              className="accordion-item rr-accordion-item mb-2"
                              key={index}
                            >
                              <h2
                                className="accordion-header"
                                id={`heading${index}`}
                              >
                                <button
                                  className="accordion-button collapsed rr-accordion-button"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse${index}`}
                                  aria-expanded="false"
                                  aria-controls={`collapse${index}`}
                                >
                                  <b>{item ? item : "All"}</b>
                                </button>
                              </h2>
                              <div
                                id={`collapse${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`heading${index}`}
                                data-bs-parent="#accordionExample2"
                              >
                                <div className="accordion-body rr-accordion-body">
                                  <div className="row g-2">
                                    {variablesoptions?.map(
                                      (it, idx) =>
                                        it?.type === item && (
                                          <div
                                            key={idx}
                                            className="col-12 col-sm-6 col-md-4"
                                          >
                                            <label className="ba-check-card">
                                              <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={it.attribute_name}
                                                value={it.attribute_name}
                                                checked={
                                                  selectedvariable.length > 0 &&
                                                  selectedvariable?.includes(
                                                    it.attribute_name
                                                  )
                                                }
                                                onChange={(e) =>
                                                  handlecheckboxesselection(e, it)
                                                }
                                              />
                                              <span>{it.attribute_name}</span>
                                            </label>
                                          </div>
                                        )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 d-flex justify-content-center">
                          <div
                            className="rr-btn rr-btn-primary w-100"
                            type="button"
                            onClick={() => {
                              handlebrandanalysis();
                            }}
                          >
                            <span>
                              Submit{" "}
                              <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    </>
                ) : (
                  <div className="rr-card rr-card-empty my-4">
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
              </>
            )}
            </div>
          </div>

    </>
  );
}

export default BrandAnalysis;
