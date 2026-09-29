import React from "react";
import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import Select, { components } from "react-select";
import { useDispatch, useSelector } from "react-redux";
import UserService from "../../services/UserService";
import getNotification from "../../Redux/Action/action";
import axios from "axios";
import ModelPerformanceChart from "./ModelPerformanceChart";
import SingleBarChart4 from "../Simulator/SingleBarChart4";
import SingleBarChart5 from "../Simulator/SingleBarChart5";
import SingleBarChart6 from "../Simulator/SingleBarChart6";
import ExceptionVariables from "../JSON Files/ExceptionVariables.json"
import SingleBarChart1 from "../Simulator/SingleBarChart1";
import SingleBarChart2 from "../Simulator/SingleBarChart2";
import SingleBarChart3 from "../Simulator/SingleBarChart3";
import PieCharts from "../Simulator/PieCharts";
import SingleBarChart7 from "../Simulator/SingleBarChart7";
import SingleBarChart8 from "../Simulator/SingleBarChart8";
import maskedBrandOption from '../JSON Files/MaskedBrandOption.json'
import LoaderCustom from "../LoaderCustom";
import { notifyRequestError, requireLogin, defaultJsonHeaders, formatPlotMonthYear } from "../HelperFunction/helperFunction";
import { loadBrandFy, loadMarkets } from "../../Redux/session/sessionSlice";

const { REACT_APP_UPLOAD_DATA } = process.env;
const XLSX = require("xlsx");
function ModelPerformance() {
  const { collapsed } = useOutletContext() || {};
  const sidebarOffset = collapsed ? 88 : 290;
  const [isprocessing, setisprocessing] = useState(false)
  const selectAllOption = { label: "Select All", value: "selectAll" };
  const [isValue, setisValue] = useState(false)
  const dispatch = useDispatch();
  const sessionBrandOptions = useSelector((state) => state.session?.brandOptions || []);
  const marketsByBrand = useSelector((state) => state.session?.marketsByBrand || {});
  const [tablescreen, settablescreen] = useState(false)
  const [loader, setloader] = useState(false);
  const [modelcallibrationoptions, setmodelcallibrationoptions] = useState([
    { label: "test", value: "test" }
  ]);
  const [exportcontributiondata, setexportcontributiondata] = useState([])
  const [torangeonplots, settorangeonplots] = useState("")
  const [fromrangeonplots, setfromrangeonplots] = useState("")
  const [selectedmarketdataset, setselectedmarketdataset] = useState([])
  const [startDate, setStartDate] = useState("");
  const [openCollapseIndex, setOpenCollapseIndex] = useState(null);
  const [endDate, setEndDate] = useState("");
  const [mapetable, setmapetable] = useState([]);
  const [checkedbox, setcheckedbox] = useState([])
  const brandoptions = sessionBrandOptions?.map((it) => ({
    value: it.brand,
    label: maskedBrandOption.maskedBrandOption[it.brand.trim().toUpperCase()]
  })) || [];
  const [displaynames, setdisplaynames] = useState({});
  const [selectedzone, setselectedzone] = useState("National")
  const [selectedbrand, setselectedbrand] = useState("");
  const rawMarkets = marketsByBrand[selectedbrand] || [];
  const marketoptions = UserService.hasRole(["SALES"])
    ? rawMarkets.map((it) => ({
        value: it.final_market,
        label: it.final_market,
      }))
    : [
        { value: "selectAll", label: "Select All" },
        ...rawMarkets.map((it) => ({
          value: it.final_market,
          label: it.final_market,
        })),
      ];
  const [market, setmarket] = useState([]);

  const [modifybtn, setmodifybtn] = useState(false)
  const [selectedscenarioname, setselectedscenarioname] = useState("");
  const [selectedscenarioid, setselectedscenarioid] = useState("");
  const [selectedscenarionametimestamp, setselectedscenarionametimestamp] =
    useState("");
  const [selectedyear, setselectedyear] = useState("2021-22");
  const [resultscreen, setresultscreen] = useState(false);
  const [lastfymapedata, setlastfymapedata] = useState([])
  const [loader2, setloader2] = useState(false)
  const sectionRef = useRef(null);

  const [openindex, setopenindex] = useState([])
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalRow, setModalRow] = useState(null);
  useEffect(() => {

    handlevariablesfetchfybrand()
    //handlevariablesfetch();
  }, []);

  useEffect(() => {
    handlevariablesfetch()
    handlefetchmarket()
  }, [selectedbrand])

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
      requireLogin("/dashboard/modelperformance");
    }
  };
  const handleCheckboxChange = (index, row) => {
    // If the clicked checkbox is the same as the currently selected one, uncheck it
    if (openindex[index] === true) {
      let arr = []
      setopenindex(arr)
    }
    else {
      let arr = []
      arr[index] = true;

      setopenindex(arr)
      handlemodelperformanceapicharts(row.market);
    }
    // Call the analysis function

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
      requireLogin("/dashboard/modelperformance");
    }
  };

  const handlemodelperformanceapi = async () => {
    setloader(true)
    if (UserService.isLoggedIn()) {
      try {
        if (selectedbrand && selectedbrand !== "Select" && market !== "Select" && market
          //selectedscenarioname
        ) {
          try {
            setselectedmarketdataset([])
            setopenindex([])
            let config1 = {};
            const requestData1 = {
              brand: selectedbrand,
              market: market
            };
            const requestData2 = {

              "scenario_name": 'Base Scenario',
              "scenario_timestamp": '2024-12-12 18:20:35',
              "user_id": "admin",
              "market": market,
              "model_id": 0,
              "brand": selectedbrand
            }
            config1 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/app/model_performance`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: requestData1,
            };

            const getResponse1 = await axios(config1);

            if (getResponse1.data.data) {

              setfromrangeonplots(
                getResponse1?.data?.data?.market_wise_mape[0]?.predicted_sales[
                  getResponse1?.data?.data?.market_wise_mape[0]?.predicted_sales.length - 1
                ]?.month_year
                  ?.split("-")?.map((part, index) => {
                    if (index === 0) return new Date().getFullYear() > part ? part : part - 1; // Reduce the year by 1
                    if (index === 1) return "04"; // Set the month to "04"
                    return part; // Keep the day as is
                  })
                  ?.reverse()

                  ?.join("-")

              );
              settorangeonplots(
                getResponse1?.data?.data?.market_wise_mape[0]?.predicted_sales[getResponse1?.data?.data?.market_wise_mape[0]?.predicted_sales.length - 1]?.month_year?.split("-")?.reverse()?.join("-"))
              let arr1 = getResponse1?.data?.data?.fy_mape_data?.sort((a, b) => {
                const marketCompare = a.market?.localeCompare(b.market);
                if (marketCompare !== 0) return marketCompare;

                return a.fy?.localeCompare(b.fy);
              });

              let arr = getResponse1?.data?.data?.market_wise_mape

              let i = 0;
              arr = arr.map(it => {

                if (arr1[i] && arr1[i + 1]) {
                  const updatedItem = {
                    ...it,
                    lastfy: arr1[i].fy,
                    lastmape: arr1[i].mape,
                    currentfy: arr1[i + 1].fy,
                    currentmape: arr1[i + 1].mape
                  };
                  i += 2;
                  return updatedItem;
                }
                return it;
              });
              setmapetable(arr)

              setresultscreen(true);
              setloader(false);

              setdisplaynames({
                ...displaynames,
                brand: selectedbrand,
                market: market,
                scenarioname: selectedscenarioname,

              })
            }
          } catch (err) {
            console.log("Server Error", err);
            if (displaynames) {

              // setselectedscenarioid(displaynames.id || modelcallibrationoptions[1].id)
            }
            notifyRequestError(dispatch, err);
          }
        }
        else {
          dispatch(
            getNotification({
              message: "Please fill all entries",
              type: "danger",
            })
          );
        }
      }
      catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/dashboard/modelperformance");
    }
    setloader(false)
  };
  const handlemodelperformanceapicharts = async (marketrow, brandrow) => {
    setloader2(true)
    if (UserService.isLoggedIn()) {
      try {
        if (selectedbrand && selectedbrand !== "Select" && market !== "Select" && market

        ) {
          try {
            let config1 = {};

            const requestData2 = {

              "scenario_name": 'Base Scenario',
              "scenario_timestamp": '2024-12-12 18:20:35',
              "user_id": "admin",
              "market": marketrow,
              "model_id": 0,
              "brand": selectedbrand
            }

            const config2 = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/api/model_performance_plots`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: requestData2,
            };

            const getResponse2 = await axios(config2);

            if (getResponse2?.data?.data) {

              getResponse2?.data?.data?.export_contribution && setexportcontributiondata(getResponse2?.data?.data?.export_contribution)
              // settorangeonplots(getResponse2?.data?.data?.plot1[getResponse2?.data?.data?.plot1.length-1]?.month_year?.split("-").reverse()?.join("-"))
              setselectedmarketdataset(getResponse2.data.data)
              // setlastfymapedata(getResponse?.data?.data?.fy_mape_data?.sort((a,b)=>a.market?.localeCompare(b.market)))
            }
          } catch (err) {
            console.log("Server Error", err);
            if (displaynames) {
              setselectedbrand(displaynames.brand || brandoptions[0].brand)
              setselectedscenarioname(displaynames.scenarioname || modelcallibrationoptions[1]?.scenario_name)
              setselectedzone(displaynames.zone || 'National')
              setselectedyear(displaynames.year || '2021-22')
              // setselectedscenarioid(displaynames.id || modelcallibrationoptions[1].id)
            }
            notifyRequestError(dispatch, err);
          }
        }
        else {
          dispatch(
            getNotification({
              message: "Please fill all entries",
              type: "danger",
            })
          );
        }
      }
      catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/dashboard/modelperformance");
    }
    setloader2(false)
  };
  
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
          },
          data: sendData,
        };
        const getResponse = selectedbrand ? await axios(config) : [];
        if (getResponse.status === 200) {
          setStartDate(getResponse.data.dates[0].min[0].start_date);
          setEndDate(getResponse.data.dates[0].max[0].end_date);
        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/dashboard/modelperformance");
    }
    setisprocessing(false)
  };

  const downloadMapeResults = () => {
    const data = [];
    console.log(mapetable)
    const headers = [];

    headers.push("Brand")
    headers.push("Market")
    headers.push("Last FY")
    headers.push("Last FY MAPE")
    headers.push("Current FY")
    headers.push("Current FY MAPE")

    data.push(headers);
    mapetable?.map((row) => {
      const brand = row.brand;
      const market = row.market;
      const lastfy = row.lastfy;
      const lastmape = `${(row.lastmape * 100).toFixed(1)}%`;
      const currentfy = row.currentfy;
      const currentmape = `${(row.currentmape * 100).toFixed(1)}%`;
      data.push([brand, market, lastfy, lastmape, currentfy, currentmape]);
    })

    //   !ExceptionVariables.hiddenvariables.some((it) => it === varItem.attribute_name)
    // )
    //   ?.forEach((item) => {
    //   // Extract the attribute name
    //   const scenario_name = displaynames2.scenario;
    //   const brand_name = item.brand;
    //   const final_market_name = item.final_market;
    //   const fy = item.fy;
    //   const attributeName = item.attribute_name;
    //   // Process month_data and extract values
    //   const monthDataValues = item.month_data.map((month) => {
    //     const value = month.attribute_value;
    //     return Array.isArray(value) && value.length === 0 ? "No matched category" : value;
    //   });

    //   // Calculate subtotal (e.g., summing numeric values)
    //   const subtotal = monthDataValues.reduce((sum, val) => {
    //     return typeof val === "number" ? sum + val : sum;
    //   }, 0);

    //   // Push the row data
    //   data.push([scenario_name, brand_name, final_market_name, fy, attributeName, ...monthDataValues, subtotal]);
    // });

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
    link.download = `${selectedbrand}-MapeResults.xlsx`;
    link.click();

  }
  const downloadLineChartResults = () => {
    const data = [];

    const headers = [];

    //  headers.push("Brand")
    //  headers.push("Market")
    //  headers.push("Variable")

    //  data.push(headers);
    const monthHeaders = Object.keys(exportcontributiondata[0])?.map((it) => { return it })

    data.push(monthHeaders)
    exportcontributiondata?.forEach((row) => {
      const rowData = monthHeaders.map((header) => row[header]); // keep order same as headers
      data.push(rowData);
    });

    //   !ExceptionVariables.hiddenvariables.some((it) => it === varItem.attribute_name)
    // )
    //   ?.forEach((item) => {
    //   // Extract the attribute name
    //   const scenario_name = displaynames2.scenario;
    //   const brand_name = item.brand;
    //   const final_market_name = item.final_market;
    //   const fy = item.fy;
    //   const attributeName = item.attribute_name;
    //   // Process month_data and extract values
    //   const monthDataValues = item.month_data.map((month) => {
    //     const value = month.attribute_value;
    //     return Array.isArray(value) && value.length === 0 ? "No matched category" : value;
    //   });

    //   // Calculate subtotal (e.g., summing numeric values)
    //   const subtotal = monthDataValues.reduce((sum, val) => {
    //     return typeof val === "number" ? sum + val : sum;
    //   }, 0);

    //   // Push the row data
    //   data.push([scenario_name, brand_name, final_market_name, fy, attributeName, ...monthDataValues, subtotal]);
    // });

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
    link.download = `${selectedbrand}-ContributionResults.xlsx`;
    link.click();

  }
  return (
    <>
      <div className="mp-page" style={{ userSelect: "none" }}>
        <div className="rr-card rr-card-header">
          <div className="rr-page-header-left">
            <div className="rr-breadcrumb">Dashboard / Model Performance</div>
            <h2 className="rr-page-title">
              Model Performance{" "}
              {endDate && !isprocessing && (
                <span className="mp-date-note">
                  (Data updated till <strong>{endDate}</strong>)
                </span>
              )}
            </h2>
            <p className="rr-page-subtitle mb-0">
              Analyze market-wise prediction accuracy, actual vs predicted trends,
              contribution patterns and effectiveness metrics.
            </p>
          </div>

          {resultscreen && (
            <div className="rr-page-header-actions">
              <button
                className="rr-btn rr-btn-secondary"
                onClick={() => {
                  setselectedscenarioname("");
                  setresultscreen(false);
                  setmarket([]);
                  setselectedbrand("");
                  setmodifybtn(false);
                  setopenindex([]);
                  setexportcontributiondata([]);
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

        {(modifybtn || !resultscreen) && (
          <div className="rr-card rr-card-section">
            <div className="row g-3 align-items-end">
              <div className="col-lg-4 col-md-6 col-12">
                <label className="rr-label">
                  Brand <span className="text-danger">*</span>
                </label>

                <Select
                  placeholder="Select Brand"
                  value={
                    maskedBrandOption.maskedBrandOption[selectedbrand]
                      ? {
                        label: maskedBrandOption.maskedBrandOption[selectedbrand],
                        value: selectedbrand,
                      }
                      : null
                  }
                  options={brandoptions}
                  onChange={(value) => {
                    setselectedbrand(value.value);
                    setmarket([]);
                    setresultscreen(false);
                    setmodifybtn(false);
                  }}
                  classNamePrefix="rr-select"
                />
              </div>

              <div className="col-lg-5 col-md-6 col-12">
                <label className="rr-label">
                  Market <span className="text-danger">*</span>
                </label>

                <Select
                  placeholder="Select market"
                  options={marketoptions}
                  isMulti
                  value={market ? market.map((it) => ({ label: it, value: it })) : null}
                  onChange={(value) => {
                    if (value.some((item) => item.value === "selectAll")) {
                      setmarket(
                        marketoptions
                          .filter((it) => it.value !== "selectAll")
                          .map((option) => option.value)
                      );
                    } else {
                      setmarket(value.map((it) => it.value));
                    }
                  }}
                  classNamePrefix="rr-select"
                />
              </div>

              <div className="col-lg-3 col-md-12 col-12">
                <button className="rr-btn rr-btn-primary w-100" onClick={handlemodelperformanceapi}>
                  <span>Submit <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon></span>
                </button>
              </div>
            </div>
          </div>
        )}

        {loader ? (
          <div
            className="row d-flex justify-content-center align-items-center"
            style={{ height: "60vh" }}
          >
            <LoaderCustom text="Fetching Performance..." />
          </div>
        ) : resultscreen ? (
          <div className="mp-results-wrap">
            {mapetable?.length > 0 ? (
              <div className="rr-card rr-card-section">
                <div className="mp-section-head">
                  <div>
                    <h4 className="rr-section-title">Market Wise MAPE Table Details</h4>
                    <p className="rr-section-subtitle mb-0">
                      Compare previous and current financial year performance market-wise.
                    </p>
                  </div>

                  <button className="rr-btn rr-btn-secondary" onClick={downloadMapeResults}>
                    Download MAPE Comparison
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table rr-table align-middle">
                    <thead>
                      <tr>
                        <th>S. No.</th>
                        <th>Brand</th>
                        <th>Market</th>
                        <th>Last FY</th>
                        <th>Last FY MAPE</th>
                        <th>Current FY</th>
                        <th>Current MAPE</th>
                        <th style={{ width: '120px' }}>Select for More Details</th>
                      </tr>
                    </thead>

                    <tbody>
                      {mapetable.map((row, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            <td>{index + 1}</td>
                            <td>{maskedBrandOption.maskedBrandOption[row?.brand]}</td>
                            <td>{row?.market}</td>
                            <td>{row?.lastfy}</td>
                            <td>
                              <span
                                className={`rr-badge ${row?.lastmape <= 0.1
                                  ? "rr-badge-good"
                                  : row?.lastmape <= 0.15
                                    ? "rr-badge-mid"
                                    : "rr-badge-bad"
                                  }`}
                              >
                                {(row?.lastmape * 100)?.toFixed(1)}%
                              </span>
                            </td>
                            <td>{row?.currentfy}</td>
                            <td>
                              <span
                                className={`rr-badge ${row?.currentmape <= 0.1
                                  ? "rr-badge-good"
                                  : row?.currentmape <= 0.15
                                    ? "rr-badge-mid"
                                    : "rr-badge-bad"
                                  }`}
                              >
                                {(row?.currentmape * 100)?.toFixed(1)}%
                              </span>
                            </td>
                            <td>
                              <button
                                className="rr-btn rr-btn-primary"
                                onClick={() => {
                                  setexportcontributiondata([]);
                                  setModalRow(row);
                                  setShowDetailsModal(true);
                                  handlemodelperformanceapicharts(row.market);
                                }}
                              >
                                Details
                              </button>
                            </td>
                          </tr>

                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rr-card rr-card-empty">There are no records to display.</div>
            )}
          </div>
        ) : null}
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <>
          <div className="modal show" style={{ display: 'block', position: 'fixed', top: 0, left: sidebarOffset, width: `calc(100vw - ${sidebarOffset}px)`, height: '100vh', zIndex: 9999, overflowX: 'hidden', overflowY: 'auto' }} tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '90vw', marginLeft: 'auto', marginRight: 'auto' }}>
              <div className="modal-content border-0 shadow rr-modal-content">
                <div className="modal-header rr-modal-header">
                  <h5 className="modal-title fw-semibold" style={{ color: 'var(--rr-text-main)', fontSize: '15px' }}>
                    {modalRow?.brand} — {modalRow?.market}
                  </h5>
                  <div className="d-flex align-items-center gap-2">
                    {exportcontributiondata?.length > 0 && (
                      <button className="rr-btn rr-btn-secondary" onClick={downloadLineChartResults}>
                        Download Contribution
                      </button>
                    )}
                    <button type="button" className="btn-close" style={{ filter: 'var(--rr-close-filter, none)' }} onClick={() => setShowDetailsModal(false)} />
                  </div>
                </div>
                <div className="modal-body" style={{ padding: '20px' }}>
                  {loader2 ? (
                    <div className="rr-inline-loader">
                      <div className="rr-dot-flashing"></div>
                      <p className="rr-loader-text">Fetching Details...</p>
                    </div>
                  ) : (
                    <>
                      {mapetable?.find(t => t?.market === modalRow?.market) && (
                        <div className="rr-card rr-card-mini mb-3">
                          <ModelPerformanceChart data={mapetable?.find(t => t?.market === modalRow?.market)} />
                        </div>
                      )}

                      <div className="container-fluid px-0">
                        <div className="row g-3">
                          {selectedmarketdataset?.plot2?.length > 0 && (
                            <div className="col-lg-6 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <PieCharts isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} fulldataset={selectedmarketdataset} type={modalRow?.market} displaynames={displaynames} />
                              </div>
                            </div>
                          )}
                          {selectedmarketdataset?.plot3?.length > 0 && (
                            <div className="col-lg-6 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <SingleBarChart1 fulldataset={selectedmarketdataset} maxValuedynamicVolume={Math.ceil(Math.max(...[selectedmarketdataset?.plot3[0]?.total_core/1000??0,selectedmarketdataset?.plot3[1]?.total_incremental/1000??0,selectedmarketdataset?.plot3[2]?.total_media/1000??0])/100)*100} maxValuedynamicValue={Math.ceil(Math.max(...[selectedmarketdataset?.plot3[0]?.total_core_sales/1000??0,selectedmarketdataset?.plot3[1]?.total_incremental_sales/1000??0,selectedmarketdataset?.plot3[2]?.total_media_sales/1000??0])/100)*100} type={modalRow?.market} isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} />
                              </div>
                            </div>
                          )}
                          {selectedmarketdataset?.plot4?.length > 0 && (
                            <div className="col-lg-6 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <SingleBarChart2 fulldataset={selectedmarketdataset} type={modalRow?.market} isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} maxValuedynamicVolume={Math.ceil(Math.max(...selectedmarketdataset?.plot4.map(it=>it.contribution))/100)*100} maxValuedynamicValue={Math.ceil(Math.max(...selectedmarketdataset?.plot4.map(it=>it.contribution_sales_value/100000))/100)*100} />
                              </div>
                            </div>
                          )}
                          {selectedmarketdataset?.plot10?.length > 0 && (
                            <div className="col-lg-6 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <SingleBarChart5 fulldataset={selectedmarketdataset} type={modalRow?.market} isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} maxValuedynamicVolume={Math.ceil(Math.max(...selectedmarketdataset?.plot10.map(it=>it.contribution))/100)*100} maxValuedynamicValue={Math.ceil(Math.max(...selectedmarketdataset?.plot10.map(it=>it.contribution_sales_value/100000))/100)*100} />
                              </div>
                            </div>
                          )}
                          {selectedmarketdataset?.plot5?.length > 0 && (
                            <div className="col-lg-6 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <SingleBarChart4 fulldataset={selectedmarketdataset} type={modalRow?.market} isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} maxValuedynamicVolume={Math.ceil(Math.max(...selectedmarketdataset?.plot5?.map(it=>Number(it?.attribute_value_per_roi))))} />
                              </div>
                            </div>
                          )}
                          {selectedmarketdataset?.plot13?.length > 0 && (
                            <div className="col-lg-6 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <SingleBarChart8 fulldataset={selectedmarketdataset} type={modalRow?.market} isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} maxValuedynamicVolume={(Math.ceil(Math.max(...selectedmarketdataset?.plot13?.map(it=>Number(it?.attribute_value_per_roi))))/10)*10} />
                              </div>
                            </div>
                          )}
                          {selectedmarketdataset?.plot12?.length > 0 && (
                            <div className="col-lg-6 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <SingleBarChart7 fulldataset={selectedmarketdataset} type={modalRow?.market} isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} maxValuedynamicVolume={Math.ceil(Math.max(...selectedmarketdataset?.plot12?.map(it=>Number(it?.attribute_value_per_roi))))} />
                              </div>
                            </div>
                          )}
                          {selectedmarketdataset?.plot11?.length > 0 && (
                            <div className="col-lg-6 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <SingleBarChart6 fulldataset={selectedmarketdataset} type={modalRow?.market} isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} maxValuedynamicVolume={Math.ceil(Math.max(...selectedmarketdataset?.plot11?.map(it=>Number(it?.effectiveness)))/10)*10} />
                              </div>
                            </div>
                          )}
                          {selectedmarketdataset?.plot9?.length > 0 && (
                            <div className="col-lg-12 col-md-12">
                              <div className="rr-card rr-card-mini h-100">
                                <SingleBarChart3 fulldataset={selectedmarketdataset} type={modalRow?.market} isValue={isValue} range={`${formatPlotMonthYear(fromrangeonplots)}-${formatPlotMonthYear(torangeonplots)}`} maxValuedynamicVolume={Math.ceil(Math.max(...selectedmarketdataset?.plot9?.map(it=>Number(it?.effectiveness)))/10)*10} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 9998, position: 'fixed', top: 0, left: sidebarOffset, width: `calc(100vw - ${sidebarOffset}px)`, height: '100vh' }} onClick={() => setShowDetailsModal(false)} />
        </>
      )}

    </>
  );
}

export default ModelPerformance