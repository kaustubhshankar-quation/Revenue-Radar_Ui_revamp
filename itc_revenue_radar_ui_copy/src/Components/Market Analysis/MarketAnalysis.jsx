import React, { useEffect, useState } from "react";
import 'spiketip-tooltip/spiketip.min.css'
import { useOutletContext } from "react-router-dom";
import UserService from "../../services/UserService.js";
import Select, { components } from "react-select";
import axios from "axios";
import { useDispatch } from "react-redux";
import getNotification from "../../Redux/Action/action.js";
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'
import maskedBrandOption from '../JSON Files/MaskedBrandOption.json'
import Loader from "react-js-loader";
import LoaderCustom from "../LoaderCustom.jsx";
import { downloadPdf, uploadPDF, notifyRequestError, requireLogin, defaultJsonHeaders, toSelectOptions } from "../HelperFunction/helperFunction.js";
import LineChartMarketAnalysis from "./LineChartMarketAnalysis.jsx";
import BarChartMarketAnalysis from "./BarChartMarketAnalysis.jsx";
import { toast } from "react-toastify";
const { REACT_APP_UPLOAD_DATA } = process.env;
function MarketAnalysis() {
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
  const [resultscreen, setresultscreen] = useState(false);
  const [selectedbrand, setselectedbrand] = useState("");
  const [variable, setvariable] = useState([]);
  const [selectedvariable, setselectedvariable] = useState("");
  const [plotdataweekly, setplotdataweekly] = useState({});
  const [plotdatamonthly, setplotdatamonthly] = useState({});
  const dispatch = useDispatch();
  const [reportName, setreportName] = useState("");
  const [variablesoptions, setvariablesoptions] = useState([])

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
      requireLogin("/dashboard/marketanalysis");
    }
  };
  const handlefetchvariables = async () => {
    if (UserService.isLoggedIn()) {
      try {
        const FormData = require("form-data");
        const sendData = new FormData();

        const requestData = {
          brand: selectedbrand,
          market: market,

        }

        const config = {
          method: "post",
          url: `${REACT_APP_UPLOAD_DATA}/app/get_variables`,
          headers: {
            ...defaultJsonHeaders,
          },
          data: requestData,
        };
        const getResponse = market?.length > 0 ? await axios(config) : [];
        // console.log(getResponse)
        if (getResponse.data !== "Invalid User!") {
          setvariablesoptions(
            [
              // Add Select All option
              ...getResponse.data.vars_data?.filter(
                (item) => !ExceptionVariables?.zeroOrOneVariables?.includes(item.attribute_name)
              )?.map((it) => ({
                value: it.attribute_name,
                label: it.attribute_name,
              })),
            ]
          );
        }
      } catch (err) {

      }
    } else {
      requireLogin("/dashboard/marketanalysis");
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
      requireLogin("/dashboard/marketanalysis");
    }
  };

  const handlebrandanalysis = async () => {
    if (UserService.isLoggedIn()) {
      if (variable && selectedbrand && startDate && endDate && market.length > 0 && selectedvariable) {
        try {

          setloader(true);
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
          const requestData = {
            start_date: startDate,
            end_date: endDate,
            variables: [selectedvariable],
            brand: selectedbrand,
            market: market,
            variable_type: []
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

          if (getResponse1.status === 200) {

            if (getResponse1.data[0] !== "Invalid User!") {

              setplotdataweekly(getResponse1.data?.market_data)
              setplotdatamonthly(getResponse2.data?.market_data)

              setresultscreen(true);
              setdisplaynames({
                ...displaynames,
                startDate: startDate.split('-').reverse().join('-'),
                endDate: endDate.split('-').reverse().join('-'),
                selectedbrand: selectedbrand,
                variable: selectedvariable,
                market: market,
                type: getResponse1.data[0]?.variables[0]?.units
              })
            }
            else if (getResponse1.data[0] === "Invalid User!") {
              requireLogin("/dashboard/marketanalysis");
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
      requireLogin("/dashboard/marketanalysis");
    }
    setloader(false);
  };

  const [loading, setLoading] = useState(false);
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';
  const [reportLoader, setreportLoader] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const customMultiSelectStyles = {
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#2C3E50" : "#ffffff",
      border: `1px solid ${isDark ? "#4A6274" : "#e2e8f0"}`,
      borderRadius: "12px",
      overflow: "hidden",
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: isDark ? "#2C3E50" : "#ffffff",
      padding: "4px",
      maxHeight: "260px",
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: "8px",
      padding: "10px 14px",
      background: state.isSelected
        ? isDark ? "rgba(23, 162, 184, 0.15)" : "rgba(13, 124, 102, 0.15)"
        : state.isFocused
          ? isDark ? "rgba(23, 162, 184, 0.08)" : "rgba(13, 124, 102, 0.08)"
          : "transparent",
      color: state.isSelected ? (isDark ? "#17A2B8" : "#0D7C66") : isDark ? "#F8F9FA" : "#0f172a",
      fontWeight: state.isSelected ? 600 : 400,
    }),
    multiValue: (base) => ({
      ...base,
      background: isDark ? "rgba(23, 162, 184, 0.10)" : "rgba(13, 124, 102, 0.10)",
      borderRadius: "8px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#17A2B8" : "#0D7C66",
      fontWeight: 600,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#ADB5BD" : "#64748b",
      "&:hover": {
        background: "rgba(220, 53, 69, 0.15)",
        color: "#DC3545",
      },
    }),
  };

  const handlegeneratereport = async () => {
    setreportLoader(true)
    if (!UserService.isLoggedIn()) {
      requireLogin("/dashboard/marketanalysis");
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
        market: displaynames?.market || [],
        data: plotdataweekly || [],
        user_created_by: UserService.getUsername(),
        created_on: new Date().toISOString().split("T")[0],
        report_type: "Market_Analysis",
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

      <div className="ma-page">
          <div className="rr-card rr-card-header">
            <div className="rr-page-header-left">
              <div className="rr-breadcrumb">Dashboard / Market Analysis</div>
              <h2 className="rr-page-title">Market Analysis</h2>
              <p className="rr-page-subtitle mb-0">
                Analyze market-level brand performance across selected date ranges,
                compare marketing inputs, and generate downloadable reports from a
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
                    setselectedvariable("");
                    setmarket([]);
                    setselectedbrand("");
                    setvariablesoptions([]);
                    setmarketoptions([]);
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

                <button
                  className="rr-btn rr-btn-primary"
                  onClick={() => { setShowReportModal(true) }}
                >
                  Generate Report
                </button>
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
                      setselectedvariable("");
                      setmarket([]);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rr-card rr-card-section">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-lg-5">
                  <label className="rr-label">
                    Market <span className="text-danger">*</span>
                  </label>
                  <Select
                    classNamePrefix="rr-select"
                    placeholder="Select Market(s)"
                    options={marketoptions}
                    isMulti
                    value={
                      market
                        ? toSelectOptions(market)
                        : null
                    }
                    onChange={(value) => {
                      if (!value || value.length === 0) {
                        setmarket([]);
                        setselectedvariable("");
                        return;
                      }

                      if (value.some((item) => item.value === "selectAll")) {
                        setmarket(
                          marketoptions
                            .filter((it) => it.value !== "selectAll")
                            .map((option) => option.value)
                        );
                      } else {
                        setmarket(value.map((it) => it.value));
                      }
                      setselectedvariable("");
                    }}
                    styles={customMultiSelectStyles}
                  />
                </div>

                <div className="col-12 col-lg-4">
                  <label className="rr-label">
                    Marketing Inputs <span className="text-danger">*</span>
                  </label>
                  <Select
                    classNamePrefix="rr-select"
                    placeholder="Select Marketing Input"
                    options={variablesoptions}
                    value={
                      selectedvariable
                        ? { label: selectedvariable, value: selectedvariable }
                        : null
                    }
                    onChange={(value) => {
                      setselectedvariable(value?.value || "");
                    }}
                    styles={customMultiSelectStyles}
                  />
                </div>

                <div className="col-12 col-lg-3 d-flex align-items-end">
                  <div
                    className="rr-btn rr-btn-primary w-100"
                    type="button"
                    onClick={() => handlebrandanalysis()}
                  >
                    <span>
                      Submit{" "}
                      <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </>
          )}

          <div className="my-3">
            {loader ? (
              <div
                className="row d-flex justify-content-center align-items-center"
                style={{ height: "75vh" }}
              >
                <LoaderCustom text="Fetching Market Analysis Report...." />
              </div>
            ) : resultscreen ? (
              !modifybtn && <div id="pdfConvertible" className="w-100">
                {resultscreen && displaynames.selectedbrand?.length > 0 && (
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
                              : displaynames.market?.[0]}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-5">
                        <div className="rr-card-meta">
                          <strong>Marketing Inputs</strong>
                          <div
                            className="rr-meta-value"
                            style={{ wordBreak: "break-word" }}
                          >
                            {displaynames?.variable}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rr-card rr-card-mini mt-4">
                  {displaynames?.variable === "Sales_Volume" ||
                    displaynames?.variable === "Sales_Value" ? (
                    <LineChartMarketAnalysis
                      plotdataweekly={plotdataweekly}
                      plotdatamonthly={plotdatamonthly}
                      displaynames={displaynames}
                    />
                  ) : (
                    <BarChartMarketAnalysis
                      plotdataweekly={plotdataweekly}
                      plotdatamonthly={plotdatamonthly}
                      displaynames={displaynames}
                    />
                  )}
                </div>
              </div>
            ) : (
              <>
                {brandoptions?.length > 0 ? (
                  <>
                  <div className="rr-card rr-card-section">
                    <div className="row g-3">
                      <div className="col-12 col-md-6 col-lg-4">
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
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-4">
                        <label htmlFor="EndDate" className="rr-label">
                          End Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          disabled={resultscreen}
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
                        />
                      </div>

                      <div className="col-12 col-lg-4">
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
                            setselectedvariable("");
                            setmarket([]);
                            setselectedbrand(value.value);
                          }}
                          styles={customMultiSelectStyles}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rr-card rr-card-section">
                    <div className="row g-3 align-items-end">
                      <div className="col-12 col-lg-5">
                        <label className="rr-label">
                          Market <span className="text-danger">*</span>
                        </label>
                        <Select
                          classNamePrefix="rr-select"
                          placeholder="Select Market/Markets"
                          options={marketoptions}
                          isMulti
                          value={
                            market
                              ? toSelectOptions(market)
                              : null
                          }
                          onChange={(value) => {
                            if (!value || value.length === 0) {
                              setmarket([]);
                              setselectedvariable("");
                              return;
                            }

                            if (
                              value.some((item) => item.value === "selectAll")
                            ) {
                              setmarket(
                                marketoptions
                                  .filter((it) => it.value !== "selectAll")
                                  .map((option) => option.value)
                              );
                            } else {
                              setmarket(value.map((it) => it.value));
                            }
                            setselectedvariable("");
                          }}
                          styles={customMultiSelectStyles}
                        />
                      </div>

                      <div className="col-12 col-lg-4">
                        <label className="rr-label">
                          Marketing Inputs <span className="text-danger">*</span>
                        </label>
                        <Select
                          classNamePrefix="rr-select"
                          isDisabled={resultscreen}
                          placeholder="Select Marketing Input"
                          options={variablesoptions}
                          value={
                            selectedvariable
                              ? {
                                label: selectedvariable,
                                value: selectedvariable,
                              }
                              : null
                          }
                          onChange={(value) => {
                            setselectedvariable(value?.value || "");
                          }}
                          styles={customMultiSelectStyles}
                        />
                      </div>

                      <div className="col-12 col-lg-3 d-flex align-items-end">
                        <div
                          className="rr-btn rr-btn-primary w-100"
                          type="button"
                          onClick={() => handlebrandanalysis()}
                        >
                          <span>
                            Submit{" "}
                            <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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

export default MarketAnalysis;
