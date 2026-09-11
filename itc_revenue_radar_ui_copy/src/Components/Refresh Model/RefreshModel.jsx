import React, { useEffect, useState } from 'react'
import Loader from "react-js-loader";
import UserService from '../../services/UserService';
import { useDispatch } from "react-redux";
import getNotification from '../../Redux/Action/action';
import swal from 'sweetalert'
import axios from 'axios'
import Select, { components } from "react-select";
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'
import LoaderCustom from '../LoaderCustom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { notifyRequestError, requireLogin, defaultJsonHeaders } from "../HelperFunction/helperFunction";
const XLSX = require("xlsx");

const { REACT_APP_UPLOAD_DATA } = process.env;

function RefreshModel() {
  const [modifybtn, setmodifybtn] = useState(false)
  const [brandoptions, setbrandoptions] = useState([]);
  const [selectedbrand, setselectedbrand] = useState("");
  const [timetorefresh, settimetorefresh] = useState(9000);
  const [percentagetoshowonloader, setpercentagetoshowonloader] = useState(0);
  const [loaderrefresh, setloaderrefresh] = useState(false)
  const [displaynames, setdisplaynames] = useState({});
  const [resultscreen, setresultscreen] = useState(false);
  const [loader1, setloader1] = useState(false);
  const [loader2, setloader2] = useState(false);
  const [uploadfiledata, setuploadfiledata] = useState([])
  const [uploadfilefilterobject, setuploadfilefilterobject] = useState({ Brand: "Select", FY: "Select", Final_Market: "Select" })
  const [resultscreen4, setresultscreen4] = useState(false)
  const [resultscreen2, setresultscreen2] = useState(true)
  const [maxdatebeforerefresh, setmaxdatebeforerefresh] = useState("")
  const [newrecordstable, setnewrecordstable] = useState([])
  let counter = 1;
  const dispatch = useDispatch();

  const [pullingDataFlag, setPullingDataFlag] = useState(false)
  const [pushingDataFlag, setPushingDataFlag] = useState(false)

  useEffect(() => {
    handlevariablesfetchfybrand()
    //handlevariablesfetch();
  }, []);

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
          setbrandoptions(
            getResponse.data.brands?.filter(it => !ExceptionVariables?.brandoptionshide2?.includes(it?.brand))?.sort((a, b) => a.brand.localeCompare(b.brand))?.map((it) => {
              return { value: it.brand, label: it.brand };
            })
          );

        }
      } catch (err) {
        console.log("Server Error", err);
        notifyRequestError(dispatch, err);
      }
    } else {
      requireLogin("/dashboard/refreshmodel");
    }
  };

  const handlefetchmaxdatebeforerefresh = async (brand) => {
    if (UserService.isLoggedIn()) {
      try {

        if (true) {
          try {
            setmaxdatebeforerefresh("")
            let config = {};
            const requestData = {
              brand: brand,
            };
            config = {
              method: "post",
              url: `${REACT_APP_UPLOAD_DATA}/app/model_Min_date_before_refresh`,
              headers: {
            ...defaultJsonHeaders,
          },
              data: requestData,
            };
            const getResponse = await axios(config);
            if (getResponse.status === 200) {
              setmaxdatebeforerefresh(getResponse?.data[0]?.max_date_before_refresh?.split("T")[0]?.split("-")?.reverse()?.join("-"))
              setresultscreen2(true)
              setdisplaynames({
                ...displaynames,
                brand: selectedbrand,
              })
            }
          } catch (err) {
            console.log("Server Error", err);

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
      requireLogin("/dashboard/refreshmodel");
    }

  }

  const handlepulllatestdata = async () => {
    if (!UserService.isLoggedIn()) {
      requireLogin("/dashboard/refreshmodel");
      return;
    }

    if (selectedbrand === "") {
      dispatch(
        getNotification({
          message: "Please select brand!",
          type: "danger",
        })
      );
      return;
    }

    setnewrecordstable([]);
    setPullingDataFlag(true);

    try {
      const requestData = { brand: selectedbrand };
      const url = `${REACT_APP_UPLOAD_DATA}/app/model_refresh_pull`;

      const config = {
        method: "post",
        url,
        headers: {
            ...defaultJsonHeaders,
          },
        data: requestData,
      };

      const getResponse = await axios(config);

      if (getResponse.status === 200) {
        setpercentagetoshowonloader(0);
        const responseData = getResponse.data;

        if (responseData === null) {
          dispatch(
            getNotification({
              message: "There are no records to upload!",
              type: "default",
            })
          );
          return;
        }

        setnewrecordstable(responseData?.[4] || []);
        setresultscreen(true);
        setdisplaynames((prev) => ({
          ...prev,
          brand: selectedbrand,
        }));
      }
    } catch (err) {
      notifyRequestError(dispatch, err);
    } finally {
      setPullingDataFlag(false);
    }
  };

  const handlerefreshmodel = async () => {
    if (!UserService.isLoggedIn()) {
      requireLogin("/dashboard/refreshmodel");
      return;
    }

    try {
      setnewrecordstable([]);
      setloaderrefresh(true);
      setPushingDataFlag(true)
      const requestData = { brand: selectedbrand };

      const config = {
        method: "post",
        url: `${REACT_APP_UPLOAD_DATA}/app/model_refresh_save`,
        headers: {
            ...defaultJsonHeaders,
          },
        data: requestData,
      };

      // Progress bar simulation
      let percentage = 0;
      let refreshTimer = 0;
      const interval = setInterval(() => {
        if (percentage < 100) {
          percentage += 1;
          refreshTimer += 30;
          setpercentagetoshowonloader(percentage);
          console.log(refreshTimer);
        } else {
          clearInterval(interval);
        }
      }, timetorefresh);

      const response = await axios(config);

      if (response.status === 200) {
        clearInterval(interval);
        const minDate = formatDate(response?.data[0][0]?.min_date);
        const maxDate = formatDate(response?.data[1][0]?.max_date);
        const newRecords = response?.data[3][0]?.new_records;
        setmaxdatebeforerefresh(maxDate);
        swal(
          'Data uploaded successfully!',
          `Data Available from: ${minDate}\nTill: ${maxDate}\nNew Records Inserted: ${newRecords}`,
          'success'
        );
        setresultscreen2(true);
        setdisplaynames((prev) => ({ ...prev, brand: selectedbrand }));
      }
    } catch (err) {
      handleErrorResponse(err);

      if (displaynames?.brand) {
        setselectedbrand(displaynames.brand || brandoptions[0].brand);
      }
    } finally {
      setloaderrefresh(false);
      setPushingDataFlag(false);
    }
  };

  // Helper to format date
  const formatDate = (dateStr) =>
    dateStr?.split("T")[0]?.split("-")?.reverse()?.join("-") || "N/A";

  const handleErrorResponse = (err) => {
    console.error("Server Error", err);
    notifyRequestError(dispatch, err);
  };

  return (
    <>
      <div className="rm-page">
          {/* Header Card with Breadcrumb + Title */}
          <div className="rr-card rr-card-header">
            <div className="rr-page-header-left">
              <div className="rr-breadcrumb">Dashboard / Refresh Model</div>
              <h2 className="rr-page-title">Refresh Model</h2>
              <p className="rr-page-subtitle mb-0">
                Pull latest data and update your brand models with the most recent records.
              </p>
            </div>
          </div>

          <div>
            {loader2 ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <Loader
                  type="box-rectangular"
                  bgColor={"#0D7C66"}
                  title={"Processing..."}
                  color={"#0D7C66"}
                  size={75}
                />
              </div>
            ) :
              resultscreen2 &&
              <div>
                {/* Filter Card */}
                <div className="rr-card rr-card-section">
                  <div className="row g-3 align-items-end">
                    <div className="col-lg-4 col-md-6 col-12">
                      <label className="rr-label">
                        Brand <span className="text-danger">*</span>
                      </label>
                      <Select
                        placeholder="Select Brand"
                        value={selectedbrand ? { label: selectedbrand, value: selectedbrand } : null}
                        options={brandoptions}
                        onChange={(value) => {
                          handlefetchmaxdatebeforerefresh(value.value);
                          setselectedbrand(value.value);
                          setnewrecordstable([]);
                          setresultscreen(false);
                        }}
                        classNamePrefix="rr-select"
                      />
                    </div>
                    <div className="col-lg-3 col-md-6 col-12">
                      {newrecordstable?.length > 0
                        ? (
                          <button
                            className="rr-btn rr-btn-primary w-100"
                            disabled={pushingDataFlag}
                            onClick={() => { if (!pushingDataFlag) handlerefreshmodel(); }}
                          >
                            <span>
                              {pushingDataFlag
                                ? <>Saving...</>
                                : <>Save <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon></>
                              }
                            </span>
                          </button>
                        ) : (
                          <button
                            className="rr-btn rr-btn-primary w-100"
                            disabled={pullingDataFlag}
                            onClick={() => { if (!pullingDataFlag) handlepulllatestdata(); }}
                          >
                            <span>
                              {pullingDataFlag
                                ? <>Pulling...</>
                                : <>Pull Latest Data <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon></>
                              }
                            </span>
                          </button>
                        )
                      }
                    </div>
                  </div>

                  {/* Date Info Badges */}
                  {maxdatebeforerefresh && (
                    <div className="rr-info-bar mt-3">
                      <div className="rr-info-item">
                        <i className="fas fa-calendar-check rr-info-icon"></i>
                        <span className="rr-info-label">{selectedbrand} Data Available Till:</span>
                        <span className="rr-info-value">{maxdatebeforerefresh || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loader States */}
                {pushingDataFlag
                  ? <LoaderCustom text={'Pushing Data To The Working DataBase'} />
                  : <>
                    {pullingDataFlag
                      ? <LoaderCustom text={'Data Pulling is happening...'} />
                      : <>
                        {newrecordstable?.length > 0 && (
                          <div className="rr-accordion-wrap mt-4">
                            <div className="rr-accordion-item">
                              <h2 className="accordion-header" id="headingNew">
                                <button
                                  className="rr-accordion-btn"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseNew"
                                  aria-expanded="true"
                                  aria-controls="collapseNew"
                                >
                                  <span className="rr-chip rr-chip-accent">
                                    <i className="fas fa-plus-circle"></i> NEW
                                  </span>
                                  <span>New Records — {newrecordstable.length} rows, {Object.keys(newrecordstable[0]).length} columns</span>
                                </button>
                              </h2>
                              <div id="collapseNew" className="accordion-collapse show" aria-labelledby="headingNew">
                                <div className="rr-accordion-body">
                                  <div className="rr-table-wrap">
                                    <table className="rr-table">
                                      <thead>
                                        <tr>
                                          <th>#</th>
                                          {Object.keys(newrecordstable[0])?.map((key, index) => (
                                            <th key={index}>{key}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {newrecordstable.map((row, rowIndex) => (
                                          <tr key={rowIndex}>
                                            <td>{rowIndex + 1}</td>
                                            {Object.keys(row).map((key, colIndex) => (
                                              <td key={colIndex}>{row[key]}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    }
                  </>
                }
              </div>
            }
          </div>
      </div>

    </>

  )
}

export default RefreshModel