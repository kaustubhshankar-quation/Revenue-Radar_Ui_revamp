import { useState, useRef, useEffect } from "react";
import { useDispatch } from 'react-redux';
import getNotification from '../../Redux/Action/action';
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'

function VariableTable({ sampledataset, changesampledataset, originalset, changeoriginalset, originaldatasetforcolorcoding, endDate }) {


  const inputRefs = useRef({});
  //console.log(sampledataset)

  useEffect(() => {

    if (inputRefs.current.activeIndex !== undefined) {
      inputRefs.current[inputRefs.current.activeIndex]?.focus();
    }
  }, [sampledataset]);
  // sampledataset?.sort((a, b) => a.variable_type.localeCompare(b.variable_type));
  const [viewzerotvcampaigns, setviewzerotvcampaigns] = useState(false)
  const [openMix, setOpenMix] = useState("media")

  const zerotvvariables = sampledataset.filter(item => item.attribute_name.startsWith("TV") && item.subtotal === 0)


  //   const zerotvvariables=sampledataset
  //   .filter(item => item.attribute_name.startsWith("TV") && item.subtotal===0)
  // console.log(zerotvvariables)



  const today1 = new Date();
  const currentmonth15thdate = new Date(today1.getFullYear(), today1.getMonth(), 1);
  const isBefore15th = new Date() < currentmonth15thdate;
  const unblockeddate = isBefore15th ? new Date(today1.getFullYear(), today1.getMonth() - 3, 1) : new Date(today1.getFullYear(), today1.getMonth() - 2, 1);
  // const MonthBeforeUnlockMonth = `${unblockeddate.getFullYear()}-${String(unblockeddate.getMonth()).padStart(2, "0")}`;
  const MonthBeforeUnlockMonth = endDate
  const uniquetypes = Array.from(new Set(sampledataset?.map((item) => item.type)))
  const hidingvariablelist = ExceptionVariables?.hiddenvariables;
  const dispatch = useDispatch()

  const [edit, setedit] = useState([])

  const updatedatasetdecimal = (variableIndex) => {
    const updatedDataset = [...sampledataset];
    if (ExceptionVariables?.maxVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name || ExceptionVariables?.zeroOrOneVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name))) {
      updatedDataset[variableIndex].subtotal = Math.max(...updatedDataset[
        variableIndex
      ].month_data.map((item) => item.attribute_value));
    }
    else if (ExceptionVariables?.lastPriceAvailableVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name)) {
      const latestMonthData = updatedDataset[variableIndex].month_data
        .sort((a, b) => {
          if (a.month_year && b.month_year) {
            return (a.month_year > b.month_year ? 1 : -1)
          }
          else if (a.quarter && b.quarter) {
            return (a.quarter > b.quarter ? 1 : -1)
          }
          else {
            return (a.half_year > b.half_year ? 1 : -1)
          }
        }) // Sort by month_year in ascending order
        .slice() // Create a copy of the sorted array
        .reverse() // Reverse to iterate from the latest to the earliest
        .find((item) => item.attribute_value !== 0);

      updatedDataset[variableIndex].subtotal = latestMonthData ? latestMonthData.attribute_value : 0;
    }
    else {

      if (updatedDataset[variableIndex].type === ExceptionVariables?.variabletypes[2]) {

        updatedDataset[variableIndex].subtotal = updatedDataset[
          variableIndex
        ].month_data.reduce((acc, value) => acc + parseFloat(value.attribute_value), 0);
      }
      else {

        updatedDataset[variableIndex].subtotal = updatedDataset[
          variableIndex
        ].month_data.reduce((acc, value) => acc + parseFloat(value.attribute_value), 0);
      }



    }
    const tvAttributes = updatedDataset
      .filter(item => item.attribute_name.startsWith("TV"))
      .sort((a, b) => b.subtotal - a.subtotal);
    const cpAttributes = updatedDataset
      .filter(item => item.attribute_name.startsWith("CP") || item.attribute_name.startsWith("cp"))
      .sort((a, b) => b.subtotal - a.subtotal);

    const otherAttributes = updatedDataset
      .filter(item => !item.attribute_name.startsWith("TV") &&
        !item.attribute_name.startsWith("CP") &&
        !item.attribute_name.startsWith("cp"))


    const arrangeddataset = [...otherAttributes, ...tvAttributes, ...cpAttributes]
    changesampledataset(arrangeddataset);
    changeoriginalset(arrangeddataset);
    let arr = [];
    setedit(arr);
    dispatch(getNotification({
      message: `Value updated for ${updatedDataset[variableIndex].attribute_name}`,
      type: "Success"
    }))

  }

  const changeelementsdecimal = (variableIndex, valueIndex, e) => {
    const updatedDataset = JSON.parse(JSON.stringify(sampledataset));
    const value = e.target.value;
    const isValidInput = /^-?\d*\.?\d*$/.test(value);
    if (!isValidInput) {
      dispatch(getNotification({ message: "Please enter a valid number", type: "warning" }));
      return;
    }

    const inputValue = value !== "" ? value : 0;
    updatedDataset[variableIndex].month_data[valueIndex].attribute_value = inputValue;
    if (ExceptionVariables?.maxVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name ||
      ExceptionVariables?.zeroOrOneVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name))) {

      if (updatedDataset[variableIndex].month_data[valueIndex].frozen === 0) {
        if (updatedDataset[variableIndex].frozen === 0) {
          updatedDataset[variableIndex].subtotal = Math.max(...updatedDataset[
            variableIndex
          ].month_data.map((item) => item.attribute_value));
        }
        else if (
          updatedDataset[variableIndex].frozen === 1 &&
          updatedDataset[variableIndex].subtotal === 0
        ) {
          dispatch(
            getNotification({
              message: "Entry is not valid!",
              type: "danger",
            })
          );
        }
      }
    }
    else if (ExceptionVariables?.lastPriceAvailableVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name)) {

      if (updatedDataset[variableIndex].month_data[valueIndex].frozen === 0) {
        if (updatedDataset[variableIndex].frozen === 0) {
          let latestMonthData
          if (updatedDataset[variableIndex].month_data[0]?.quarter) {
            latestMonthData = updatedDataset[variableIndex].month_data
              .sort((a, b) => (a.quarter > b.quarter ? 1 : -1)) // Sort by quarter in ascending order
              .slice() // Create a copy of the sorted array
              .reverse() // Reverse to iterate from the latest to the earliest
              .find((item) => item.attribute_value !== 0);
          }
          else if (updatedDataset[variableIndex].month_data[0]?.hy) {
            latestMonthData = updatedDataset[variableIndex].month_data
              .sort((a, b) => (a.half_year > b.half_year ? 1 : -1)) // Sort by half_year in ascending order
              .slice() // Create a copy of the sorted array
              .reverse() // Reverse to iterate from the latest to the earliest
              .find((item) => item.attribute_value !== 0);
          }
          else {
            latestMonthData = updatedDataset[variableIndex].month_data
              .sort((a, b) => (a.month_year > b.month_year ? 1 : -1)) // Sort by month_year in ascending order
              .slice() // Create a copy of the sorted array
              .reverse() // Reverse to iterate from the latest to the earliest
              .find((item) => item.attribute_value !== 0);
          }


          updatedDataset[variableIndex].subtotal = latestMonthData ? latestMonthData.attribute_value : 0;
        }
        else if (
          updatedDataset[variableIndex].frozen === 1 &&
          updatedDataset[variableIndex].subtotal === 0
        ) {
          dispatch(
            getNotification({
              message: "Entry is not valid!",
              type: "danger",
            })
          );
        }
      }
    }
    else {

      if (updatedDataset[variableIndex].type === ExceptionVariables?.variabletypes[2]) {

        if (updatedDataset[variableIndex].month_data[valueIndex].frozen === 0) {
          if (updatedDataset[variableIndex].frozen === 0) {

            const frozenCells = updatedDataset[variableIndex]?.month_data?.filter((it) =>
              it?.month_year < MonthBeforeUnlockMonth
            )
            updatedDataset[variableIndex].subtotal = updatedDataset[
              variableIndex
            ].month_data.reduce((acc, value) => acc + parseFloat(value.attribute_value), 0);
          }

        }

      }

      else {

        if (updatedDataset[variableIndex].frozen === 0) {

          updatedDataset[variableIndex].subtotal = updatedDataset[
            variableIndex
          ].month_data.reduce((acc, item) => acc + (parseFloat(item.attribute_value) || 0), 0);
        } else if (
          updatedDataset[variableIndex].frozen === 1 &&
          updatedDataset[variableIndex].subtotal === 0
        ) {
          dispatch(
            getNotification({
              message: "Entry is not valid!",
              type: "danger",
            })
          );
        } else {


          const subtotalFrozenValues = updatedDataset[
            variableIndex
          ].month_data.reduce((acc, item) => {
            if (item.frozen === 1 || item?.month_year <= MonthBeforeUnlockMonth) {
              return acc + (parseFloat(item.attribute_value) || 0);
            } else {
              return acc;
            }
          }, 0);

          const subtotalValueforprorata =
            updatedDataset[variableIndex].subtotal - inputValue - subtotalFrozenValues;

          if (subtotalValueforprorata < 0) {
            dispatch(getNotification({ message: "Values not valid", type: "danger" }));
          } else {
            const nonFrozenArray = updatedDataset[
              variableIndex
            ].month_data.filter((item, index) => {
              return index !== valueIndex && item?.frozen === 0 && item?.month_year > MonthBeforeUnlockMonth;
            });

            const numberOfNonFrozenMonths = nonFrozenArray.length;
            if (numberOfNonFrozenMonths > 0) {
              const subtotalNonFrozenValues = nonFrozenArray.reduce(
                (acc, item) => acc + (parseFloat(item.attribute_value) || 0),
                0
              );

              updatedDataset[variableIndex].month_data =
                updatedDataset[variableIndex].month_data.map((item, index) => {
                  if (
                    item.frozen === 0 &&
                    index !== valueIndex &&
                    item?.month_year > MonthBeforeUnlockMonth
                  ) {
                    const prorataValue =
                      subtotalValueforprorata *
                      ((parseFloat(item.attribute_value) || 0) / subtotalNonFrozenValues);

                    return {
                      ...item,
                      attribute_value: parseFloat(prorataValue) || 0,
                    };
                  } else {
                    return item;
                  }
                });
            }
          }
        }
      }

    }

    inputRefs.current.activeIndex = `${variableIndex}-${valueIndex}`;
    updatedDataset[variableIndex]?.month_data[valueIndex].attribute_value !== originaldatasetforcolorcoding[variableIndex].month_data[valueIndex].attribute_value ?
      updatedDataset[variableIndex].to_show_in = 1 : updatedDataset[variableIndex].to_show_in = 0
    changesampledataset(updatedDataset);
  };

  const changesubtotaldecimal = (e, variableIndex) => {

    const updatedDataset = JSON.parse(JSON.stringify(sampledataset))



    if (updatedDataset[variableIndex].frozen === 0) {
      const subtotalValue = e.target.value || 0;
      if (subtotalValue === "0" || subtotalValue === 0 || Number.isNaN(subtotalValue)) {

        updatedDataset[variableIndex].month_data = updatedDataset[variableIndex].month_data.map((item) => {
          if (item.frozen === 0 && item?.month_year > MonthBeforeUnlockMonth) {
            return { ...item, attribute_value: 0 };
          }
          return item;
        });

        updatedDataset[variableIndex].subtotal = 0;
        //console.log(updatedDataset[variableIndex]);
        changesampledataset(updatedDataset);
        // updatedDataset[variableIndex].subtotal = 0;
        // changesampledataset(updatedDataset);
      }

      else {
        if (updatedDataset[variableIndex].subtotal === 0) {
          const nonFrozenArray = updatedDataset[variableIndex].month_data.filter(
            (it) => it?.frozen === 0 && it?.month_year > MonthBeforeUnlockMonth
          );
          const numberOfNonFrozenMonths = nonFrozenArray.length;
          const FrozenArray = updatedDataset[variableIndex].month_data.filter(
            (it) => it?.frozen === 1 || it?.month_year < MonthBeforeUnlockMonth
          );

          const sumFrozenArray = FrozenArray?.reduce((prev, next) => {
            return prev + next
          }, 0)

          if (numberOfNonFrozenMonths > 0) {

            const validSubtotalValue = parseFloat(subtotalValue) || 0;
            // Distribute the entered value equally among non-frozen months
            const equalValue = validSubtotalValue / numberOfNonFrozenMonths;
            updatedDataset[variableIndex].month_data = updatedDataset[variableIndex].month_data.map(
              (item) => {
                if (item.frozen === 0 && item?.month_year > MonthBeforeUnlockMonth) {
                  return {
                    ...item,
                    attribute_value: parseFloat(equalValue.toFixed(2)), // Ensure 2 decimal places
                  };
                }
                return item;
              }
            );

            updatedDataset[variableIndex].subtotal = validSubtotalValue;
            changesampledataset(updatedDataset);
          } else {
            console.warn("No non-frozen items to distribute the value.");
          }
        }
        else if (updatedDataset[variableIndex].subtotal - updatedDataset[variableIndex]?.month_data.reduce((prev, next) => {
          if (next?.frozen === 1 || next?.month_year < MonthBeforeUnlockMonth) {
            return prev + parseFloat(next.attribute_value || 0);
          }
          return prev
        }, 0) === 0
        ) {
          const nonFrozenArray = updatedDataset[variableIndex].month_data.filter(
            (it) => it?.frozen === 0 && it?.month_year > MonthBeforeUnlockMonth
          );
          const numberOfNonFrozenMonths = nonFrozenArray.length;
          const validSubtotalValue = parseFloat(subtotalValue) - updatedDataset[variableIndex].subtotal;
          if (numberOfNonFrozenMonths > 0) {
            // Distribute the entered value equally among non-frozen months
            const equalValue = validSubtotalValue / numberOfNonFrozenMonths;
            updatedDataset[variableIndex].month_data = updatedDataset[variableIndex].month_data.map(
              (item) => {
                if (item.frozen === 0 && item?.month_year > MonthBeforeUnlockMonth) {
                  return {
                    ...item,
                    attribute_value: parseFloat(equalValue.toFixed(2)), // Ensure 2 decimal places
                  };
                }
                return item;
              }
            );

            updatedDataset[variableIndex].subtotal = validSubtotalValue;
            changesampledataset(updatedDataset);
          } else {
            console.warn("No non-frozen items to distribute the value.");
          }


          //console.log(updatedDataset[variableIndex]);

        }
        //         else
        //          if (
        //           updatedDataset[variableIndex].subtotal === 
        //           updatedDataset[variableIndex]?.month_data.reduce((prev, next) => {
        //             if (next?.frozen === 1 || next?.month_year < MonthBeforeUnlockMonth) {
        //               return prev + parseFloat(next.attribute_value || 0); 
        //             }
        //             return prev
        //           }, 0)
        //         )
        //   {
        // dispatch(getNotification({
        //   message:"Total not valid",
        //   type:"danger"

        // }))
        // }
        else {

          const month_data = updatedDataset[variableIndex].month_data;
          const nonFrozenArray = updatedDataset[variableIndex].month_data.filter(
            (item) => { return item?.frozen === 0 && item?.month_year > MonthBeforeUnlockMonth }
          );
          const FrozenArray = updatedDataset[variableIndex].month_data.filter(
            (item) => { return item?.frozen === 1 || item?.month_year <= MonthBeforeUnlockMonth }
          );
          const subtotalFrozenValues = FrozenArray.reduce(
            (acc, item) => acc + item.attribute_value,
            0
          );

          const numberOfNonFrozenMonths = nonFrozenArray.length;
          if (numberOfNonFrozenMonths > 0) {
            const subtotalNonFrozenValues = nonFrozenArray.reduce(
              (acc, item) => acc + item.attribute_value,
              0
            );
            updatedDataset[variableIndex].month_data = month_data.map((item) => {
              if (item.frozen === 0 && item?.month_year > MonthBeforeUnlockMonth) {
                const prorataValue =
                  (subtotalValue - subtotalFrozenValues) * (item.attribute_value / subtotalNonFrozenValues);
                return {
                  ...item,
                  attribute_value: parseFloat(prorataValue),
                };
              } else {
                return item;
              }
            });

            updatedDataset[variableIndex].subtotal = subtotalValue;
            changesampledataset(updatedDataset);
          }
        }
      }
    }
  };

  function hasAnyDifference(updatedDataset1, originalDatasetForColorCoding, variableIndex) {
    const updatedMonthData = updatedDataset1[variableIndex]?.month_data || [];
    const originalMonthData = originalDatasetForColorCoding[variableIndex]?.month_data || [];
    if (updatedMonthData.length !== originalMonthData.length) {
      return true;
    }

    for (let i = 0; i < updatedMonthData.length; i++) {
      if (updatedMonthData[i].attribute_value !== originalMonthData[i].attribute_value) {
        return true;
      }
    } return false;
  }

  const handlecancel = (variableIndex) => {
    const updatedDataset1 = [...sampledataset];
    const updatedDataset2 = [...originalset];
    updatedDataset1[variableIndex].month_data = updatedDataset2[
      variableIndex
    ].month_data.map((it) => {
      return it;
    });
    updatedDataset1[variableIndex].subtotal = updatedDataset2[variableIndex].subtotal;
    updatedDataset1[variableIndex].frozen = 0;
    if (hasAnyDifference(updatedDataset1, originaldatasetforcolorcoding, variableIndex)) {
      updatedDataset1[variableIndex].to_show_in = 1
    }
    else {
      updatedDataset1[variableIndex].to_show_in = 0
    }

    changesampledataset(updatedDataset1);

  };

  const clearAll = (variableIndex) => {
    const updatedDataset = JSON.parse(JSON.stringify(sampledataset));
    updatedDataset[variableIndex].month_data = updatedDataset[
      variableIndex
    ].month_data.map((item) => {
      if (item.month_year > MonthBeforeUnlockMonth) {
        return { ...item, attribute_value: 0, frozen: 0 };
      }
      else {
        return item;
      }
    });
    updatedDataset[variableIndex].subtotal = 0;
    if (hasAnyDifference(updatedDataset, originaldatasetforcolorcoding, variableIndex)) {
      updatedDataset[variableIndex].to_show_in = 1
    }
    else {
      updatedDataset[variableIndex].to_show_in = 0
    }
    //console.log(updatedDataset[variableIndex]);
    changesampledataset(updatedDataset);
  };

  const togglelock = (variableIndex, valueIndex) => {
    const updatedDataset = JSON.parse(JSON.stringify(sampledataset))
    if (updatedDataset[variableIndex].month_data[valueIndex].frozen === 0) {
      updatedDataset[variableIndex].month_data[valueIndex].frozen = 1;
    } else if (
      updatedDataset[variableIndex].month_data[valueIndex].frozen === 1
    ) {
      updatedDataset[variableIndex].month_data[valueIndex].frozen = 0;
    }
    changesampledataset(updatedDataset);
  };
  const togglelocksubtotal = (variableIndex) => {
    const updatedDataset = [...sampledataset];
    if (updatedDataset[variableIndex].frozen === 0) {
      updatedDataset[variableIndex].frozen = 1;
    } else if (updatedDataset[variableIndex].frozen === 1) {
      updatedDataset[variableIndex].frozen = 0;
    }
    changesampledataset(updatedDataset);
  };

  const formatDisplayValue = (val) => {
    if (Number.isInteger(val)) return Number(val).toLocaleString("en-IN");
    if (!isNaN(val)) {
      return Number(val) > 10000
        ? parseFloat(Number(val).toFixed(0)).toLocaleString("en-IN")
        : parseFloat(Number(val).toFixed(2)).toLocaleString("en-IN");
    }
    return val;
  };

  const getPeriodLabel = (it) =>
    it?.month_year
      ? it.month_year
      : it?.half_year
        ? it.half_year
        : it?.quarter
          ? `Q${it.quarter}`
          : it?.fy
            ? it.fy
            : "Period";

  const sortMonthData = (monthData = []) =>
    [...monthData].sort((a, b) => {
      if (a.month_year && b.month_year) return a.month_year > b.month_year ? 1 : -1;
      if (a.quarter && b.quarter) return a.quarter > b.quarter ? 1 : -1;
      return a.half_year > b.half_year ? 1 : -1;
    });

  const getAttributeLabel = (item) =>
    Object.keys(ExceptionVariables?.spellingChanges || {}).some((key) => key === item.attribute_name)
      ? ExceptionVariables.spellingChanges[item.attribute_name]
      : item.attribute_name;

  const getSliderOrigin = (variableIndex, valueIndex) => {
    const orig =
      Number(originaldatasetforcolorcoding?.[variableIndex]?.month_data?.[valueIndex]?.attribute_value) || 0;
    return Math.max(Math.abs(orig), 1);
  };

  // Straight track from 0 to 2× the original. The original sits halfway.
  // Amounts typed above that are kept; the thumb rests at the right end.
  const getSliderMax = (origin) => origin * 2;

  const getSliderStep = (max) => {
    if (max >= 10000) return 1;
    if (max >= 100) return 0.1;
    return 0.01;
  };

  const beginEdit = (variableIndex) => {
    changesampledataset(originalset);
    const arr = [];
    arr[variableIndex] = true;
    setedit(arr);
  };

  const resetTypeRows = (typeName, zeroTvOnly = null) => {
    const updatedDataset = JSON.parse(JSON.stringify(sampledataset));
    sampledataset.forEach((item, idx) => {
      if (item?.type !== typeName) return;
      const isZeroTv = zerotvvariables.some((v) => v.attribute_name === item.attribute_name);
      if (zeroTvOnly === true && !isZeroTv) return;
      if (zeroTvOnly === false && isZeroTv) return;
      if (!originalset?.[idx]) return;
      updatedDataset[idx].month_data = originalset[idx].month_data.map((it) => ({ ...it }));
      updatedDataset[idx].subtotal = originalset[idx].subtotal;
      updatedDataset[idx].frozen = 0;
    });
    changesampledataset(updatedDataset);
    setedit([]);
  };

  const getTypeRows = (typeName, zeroTvOnly = null) =>
    sampledataset
      ?.map((item, variableIndex) => ({ item, variableIndex }))
      .filter(({ item }) => {
        if (item?.type !== typeName) return false;
        if (hidingvariablelist.some((variable) => variable === item.attribute_name)) return false;
        const isZeroTv = zerotvvariables.some((v) => v.attribute_name === item.attribute_name);
        if (zeroTvOnly === true && !isZeroTv) return false;
        if (zeroTvOnly === false && isZeroTv) return false;
        return true;
      }) || [];

  const getTypeTotal = (typeName, zeroTvOnly = null) =>
    getTypeRows(typeName, zeroTvOnly).reduce(
      (acc, { item }) => acc + (parseFloat(item.subtotal) || 0),
      0
    );

  const renderMixRows = ({ typeName, zeroTvOnly = null, showCoreType = false }) => {
    const rows = getTypeRows(typeName, zeroTvOnly);

    if (!rows?.length) {
      return <div className="rr-mix-empty">No drivers in this block.</div>;
    }

    return rows.map(({ item, variableIndex }) => {
      const isEditing = !!edit[variableIndex];
      const periods = sortMonthData(item?.month_data);

      return (
        <div
          className={`rr-mix-row ${isEditing ? "is-editing" : ""} ${item.to_show_in === 1 ? "is-changed" : ""}`}
          key={`${typeName}-${variableIndex}`}
        >
          <div className="rr-mix-row-top">
            <div className="rr-mix-row-title">
              <span className={`rr-mix-name ${item.to_show_in === 1 ? "is-flagged" : ""}`}>
                {getAttributeLabel(item)}
              </span>
              <span className={`rr-mix-badge rr-mix-badge--${String(typeName).toLowerCase()}`}>
                {showCoreType && item.variable_type ? item.variable_type : item?.units || typeName}
              </span>
            </div>

            <div className="rr-mix-row-actions">
              <span className="rr-mix-row-total">{formatDisplayValue(item.subtotal)}</span>
              {isEditing ? (
                <div className="rr-mix-action-group">
                  <button
                    type="button"
                    className="rr-mix-icon-btn is-success"
                    title="Apply"
                    onClick={() => updatedatasetdecimal(variableIndex)}
                  >
                    <i className="fa fa-check"></i>
                  </button>
                  <button
                    type="button"
                    className="rr-mix-icon-btn is-danger"
                    title="Clear"
                    onClick={() => clearAll(variableIndex)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                  <button
                    type="button"
                    className="rr-mix-icon-btn"
                    title="Cancel"
                    onClick={() => {
                      setedit([]);
                      handlecancel(variableIndex);
                    }}
                  >
                    <i className="fa fa-arrow-circle-left"></i>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="rr-mix-icon-btn"
                  title="Edit"
                  onClick={() => beginEdit(variableIndex)}
                >
                  <i className="fas fa-edit"></i>
                </button>
              )}
            </div>
          </div>

          <div className="rr-mix-periods">
            {periods.map((it) => {
              const valueIndex = item.month_data.indexOf(it);
              const isBeforeUnlockMonth = it?.month_year <= MonthBeforeUnlockMonth;
              const disabled = !isEditing || isBeforeUnlockMonth || !!it?.frozen;
              const numericValue = Number(it.attribute_value) || 0;
              const origin = getSliderOrigin(variableIndex, valueIndex);
              const max = getSliderMax(origin);
              const step = getSliderStep(max);
              const clamped = Math.min(Math.max(numericValue, 0), max);
              const pct = max > 0 ? (clamped / max) * 100 : 0;

              return (
                <div className="rr-mix-period" key={`${variableIndex}-${valueIndex}`}>
                  <div className="rr-mix-period-meta">
                    <span className="rr-mix-period-label">{getPeriodLabel(it)}</span>
                    <div className="rr-mix-period-value-wrap">
                      {isEditing ? (
                        <input
                          className={`rr-input rr-mix-number ${it?.frozen ? "noborder" : ""}`}
                          value={it.attribute_value}
                          disabled={isBeforeUnlockMonth || !!it?.frozen}
                          onChange={(e) => {
                            if (!isBeforeUnlockMonth) {
                              changeelementsdecimal(variableIndex, valueIndex, e);
                            }
                          }}
                          onFocus={() => {
                            inputRefs.current.activeIndex = `${variableIndex}-${valueIndex}`;
                          }}
                          ref={(el) => {
                            inputRefs.current[`${variableIndex}-${valueIndex}`] = el;
                          }}
                        />
                      ) : (
                        <span className="rr-mix-period-value">{formatDisplayValue(it.attribute_value)}</span>
                      )}
                      {isEditing && (
                        <button
                          type="button"
                          className="rr-mix-icon-btn is-tiny"
                          disabled={isBeforeUnlockMonth}
                          onClick={() => {
                            if (!isBeforeUnlockMonth) togglelock(variableIndex, valueIndex);
                          }}
                        >
                          {it?.frozen === 0 && !isBeforeUnlockMonth ? (
                            <i className="fa fa-unlock"></i>
                          ) : (
                            <i className="fa fa-lock"></i>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="range"
                    className="rr-mix-slider"
                    min={0}
                    max={max}
                    step={step}
                    value={clamped}
                    disabled={disabled}
                    style={{ "--rr-mix-fill": `${pct}%` }}
                    onChange={(e) => {
                      if (disabled) return;
                      changeelementsdecimal(variableIndex, valueIndex, e);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  const renderMixBlock = ({
    typeName,
    zeroTvOnly = null,
    showCoreType = false,
    showZeroTvToggle = false,
    tone = "media",
  }) => {
    const typeTotal = getTypeTotal(typeName, zeroTvOnly);
    const isOpen = openMix === tone;
    const panelId = `rr-mix-panel-${tone}`;

    return (
      <section className={`rr-mix-block rr-mix-block--${tone}${isOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="rr-mix-header"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpenMix(isOpen ? "" : tone)}
        >
          <div className="rr-mix-header-text">
            <h3 className="rr-mix-title">
              {String(typeName || "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
            </h3>
          </div>
          <span className="rr-mix-header-side">
            <span className="rr-mix-total-pill">{formatDisplayValue(typeTotal)}</span>
            <span className="rr-mix-chevron" aria-hidden="true" />
          </span>
        </button>

        {isOpen && (
          <div id={panelId} className="rr-mix-panel">
            <div className="rr-mix-list">{renderMixRows({ typeName, zeroTvOnly, showCoreType })}</div>

            <div className="rr-mix-footer">
              <span className="rr-mix-footnote">*Edit → slide periods → Apply</span>
              <button
                type="button"
                className="rr-mix-reset"
                onClick={() => resetTypeRows(typeName, zeroTvOnly)}
              >
                Reset
              </button>
            </div>

            {showZeroTvToggle && zerotvvariables?.length > 0 && (
              <div className="rr-mix-zero-tv">
                <button
                  className="rr-link-btn"
                  type="button"
                  onClick={() => setviewzerotvcampaigns(!viewzerotvcampaigns)}
                >
                  {viewzerotvcampaigns ? "Hide Old TV Campaigns" : "View Old TV Campaigns"}
                </button>
                {viewzerotvcampaigns && (
                  <div className="rr-mix-list rr-mix-list--nested">
                    {renderMixRows({ typeName, zeroTvOnly: true, showCoreType })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      <div className="rr-variable-page">
        <div className="rr-variable-card">
          <div className="rr-mix-workspace">
            <div className="rr-mix-blocks">
              {renderMixBlock({
                typeName: ExceptionVariables?.variabletypes[0],
                zeroTvOnly: false,
                showZeroTvToggle: true,
                tone: "media",
              })}
              {renderMixBlock({
                typeName: ExceptionVariables?.variabletypes[1],
                tone: "incremental",
              })}
              {renderMixBlock({
                typeName: ExceptionVariables?.variabletypes[2],
                showCoreType: true,
                tone: "core",
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default VariableTable
