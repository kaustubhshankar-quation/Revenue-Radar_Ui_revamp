import { useState, useRef, useEffect } from "react";
import { useDispatch } from 'react-redux';
import getNotification from '../../Redux/Action/action';
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'

function VariableTableYearly({ sampledataset, changesampledataset, originalset, changeoriginalset, originaldatasetforcolorcoding, endDate }) {
  const inputRefs = useRef({});

  useEffect(() => {
    if (inputRefs.current.activeIndex !== undefined) {
      inputRefs.current[inputRefs.current.activeIndex]?.focus();
    }
  }, [sampledataset]);
  const today1 = new Date();
  const currentmonth15thdate = new Date(today1.getFullYear(), today1.getMonth(), 1);
  const isBefore15th = new Date() < currentmonth15thdate;
  const unblockeddate = isBefore15th ? new Date(today1.getFullYear(), today1.getMonth() - 3, 1) : new Date(today1.getFullYear(), today1.getMonth() - 2, 1);
  const MonthBeforeUnlockMonth = `${unblockeddate.getFullYear()}-${String(unblockeddate.getMonth()).padStart(2, "0")}`;

  const hidingvariablelist = ExceptionVariables?.hiddenvariables;

  const [viewzerotvcampaigns, setviewzerotvcampaigns] = useState(false)


  const zerotvvariables = sampledataset
    .filter(item => item.attribute_name.startsWith("TV") && item.subtotal === 0)

  const uniquetypes = Array.from(new Set(sampledataset?.map((item) => item.type)))
  const dispatch = useDispatch()
  const [edit, setedit] = useState([])

  const updatedatasetdecimal = (variableIndex) => {
    const updatedDataset = [...sampledataset];
    const today1 = new Date();
    const today = new Date(today1.getFullYear(), today1.getMonth() - 1, 1);
    const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, "0")}`;
    if (false) {

      updatedDataset[variableIndex].subtotal =
        (updatedDataset[
          variableIndex
        ].month_data.reduce((acc, value) => acc + parseFloat(value.attribute_value), 0));

    }
    else {
      updatedDataset[variableIndex].subtotal = updatedDataset[
        variableIndex
      ].month_data.reduce((acc, value) => acc + parseFloat(value.attribute_value), 0);

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

    }
    let arr = [];
    setedit(arr);
    dispatch(getNotification({
      message: `Value updated for ${updatedDataset[variableIndex].attribute_name}`,
      type: "Success"
    }))

  }
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

  const changeelementsdecimal = (variableIndex, valueIndex, e) => {
    const updatedDataset = JSON.parse(JSON.stringify(sampledataset));
    const value = e.target.value;
    const isValidInput = /^-?\d*\.?\d*$/.test(value);
    if (!isValidInput) {
      dispatch(getNotification({ message: "Please enter a valid number", type: "warning" }));
      return;
    }

    // Parse the input value (default to 0 if empty)
    const inputValue = value !== "" ? value : 0;
    updatedDataset[variableIndex].month_data[valueIndex].attribute_value = inputValue;

    //   if (ExceptionVariables?.maxVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name || ExceptionVariables?.zeroOrOneVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name)))
    //      {
    //      if (updatedDataset[variableIndex].month_data[valueIndex].frozen === 0) {
    //       if (updatedDataset[variableIndex].frozen === 0) {


    //         updatedDataset[variableIndex].subtotal = Math.max(...updatedDataset[
    //           variableIndex
    //         ].month_data.map(( item) => item.attribute_value));
    //       } 
    //       else if (
    //         updatedDataset[variableIndex].frozen === 1 &&
    //         updatedDataset[variableIndex].subtotal === 0
    //       ) {
    //         dispatch(
    //           getNotification({
    //             message: "Entry is not valid!",
    //             type: "danger",
    //           })
    //         );
    //       } 
    //     }  
    //    }
    // else if (ExceptionVariables?.lastPriceAvailableVariables?.some(variable => variable === updatedDataset[variableIndex]?.attribute_name)) {

    //     if (updatedDataset[variableIndex].month_data[valueIndex].frozen === 0) {
    //       if (updatedDataset[variableIndex].frozen === 0) {

    //         const latestMonthData = updatedDataset[variableIndex].month_data
    //         .sort((a, b) => (a.month_year > b.month_year ? 1 : -1)) // Sort by month_year in ascending order
    //         .slice() // Create a copy of the sorted array
    //         .reverse() // Reverse to iterate from the latest to the earliest
    //         .find((item) => item.attribute_value !== 0);

    //        updatedDataset[variableIndex].subtotal = latestMonthData ? latestMonthData.attribute_value : 0;
    //       } 
    //       else if (
    //         updatedDataset[variableIndex].frozen === 1 &&
    //         updatedDataset[variableIndex].subtotal === 0
    //       ) {
    //         dispatch(
    //           getNotification({
    //             message: "Entry is not valid!",
    //             type: "danger",
    //           })
    //         );
    //       } 
    //     }  
    //    }
    if (false) { }
    else {

      if (updatedDataset[variableIndex].type === ExceptionVariables?.variabletypes[2]) {

        if (updatedDataset[variableIndex].month_data[valueIndex].frozen === 0) {

          if (updatedDataset[variableIndex].frozen === 0) {
            console.log("H")
            updatedDataset[variableIndex].subtotal = updatedDataset[
              variableIndex
            ].month_data.reduce((acc, item) => acc + (parseFloat(item.attribute_value) || 0), 0);
          }

        }

      }

      else {

        if (updatedDataset[variableIndex].frozen === 0) {

          updatedDataset[variableIndex].subtotal = updatedDataset[
            variableIndex
          ].month_data.reduce((acc, item) => acc + (parseFloat(item.attribute_value) || 0), 0);
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
        else {


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


    updatedDataset[variableIndex]?.month_data[valueIndex].attribute_value !== originaldatasetforcolorcoding[variableIndex].month_data[valueIndex].attribute_value ?
      updatedDataset[variableIndex].to_show_in = 1 : updatedDataset[variableIndex].to_show_in = 0
    changesampledataset(updatedDataset);
  };


  const changesubtotaldecimal = (e, variableIndex) => {

    const updatedDataset = JSON.parse(JSON.stringify(sampledataset))

    const today1 = new Date();
    const today = new Date(today1.getFullYear(), today1.getMonth() - 2, 1);
    const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, "0")}`;

    if (updatedDataset[variableIndex].frozen === 0) {
      const subtotalValue = e.target.value || 0;
      if (subtotalValue === "0" || subtotalValue === 0 || Number.isNaN(subtotalValue)) {

        updatedDataset[variableIndex].month_data = updatedDataset[variableIndex].month_data.map((item) => {
          if (item.frozen === 0 && item?.month_year > currentMonthYear) {
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
            (it) => it?.frozen === 0 && it?.month_year > currentMonthYear
          );
          const numberOfNonFrozenMonths = nonFrozenArray.length;
          const FrozenArray = updatedDataset[variableIndex].month_data.filter(
            (it) => it?.frozen === 1 || it?.month_year < currentMonthYear
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
                if (item.frozen === 0 && item?.month_year > currentMonthYear) {
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
          if (next?.frozen === 1 || next?.month_year < currentMonthYear) {
            return prev + parseFloat(next.attribute_value || 0);
          }
          return prev
        }, 0) === 0
        ) {
          const nonFrozenArray = updatedDataset[variableIndex].month_data.filter(
            (it) => it?.frozen === 0 && it?.month_year > currentMonthYear
          );
          const numberOfNonFrozenMonths = nonFrozenArray.length;
          const validSubtotalValue = parseFloat(subtotalValue) - updatedDataset[variableIndex].subtotal;
          if (numberOfNonFrozenMonths > 0) {
            // Distribute the entered value equally among non-frozen months
            const equalValue = validSubtotalValue / numberOfNonFrozenMonths;
            updatedDataset[variableIndex].month_data = updatedDataset[variableIndex].month_data.map(
              (item) => {
                if (item.frozen === 0 && item?.month_year > currentMonthYear) {
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
        //             if (next?.frozen === 1 || next?.month_year < currentMonthYear) {
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
            (item) => { return item?.frozen === 0 && item?.month_year > currentMonthYear }
          );
          const FrozenArray = updatedDataset[variableIndex].month_data.filter(
            (item) => { return item?.frozen === 1 || item?.month_year <= currentMonthYear }
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
              if (item.frozen === 0 && item?.month_year > currentMonthYear) {
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
    //changesampledataset(originalset);
  };

  const clearAll = (variableIndex) => {
    const today1 = new Date();
    const today = new Date(today1.getFullYear(), today1.getMonth() - 2, 1);
    const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, "0")}`;
    const updatedDataset = JSON.parse(JSON.stringify(sampledataset));
    updatedDataset[variableIndex].month_data = updatedDataset[
      variableIndex
    ].month_data.map((item) => {
      if (`{04-${item.fy?.split("-")}` > currentMonthYear) {
        return { ...item, attribute_value: 0, frozen: 0 };
      }
      else {
        return { ...item, attribute_value: 0, frozen: 0 };
      }
    }
    );
    updatedDataset[variableIndex].subtotal = 0;
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
return (
  <>
    <div className="rr-variable-page">
      <div className="rr-variable-card">
        <div className="accordion rr-accordion" id="accordionExample">
          {/* Media */}
          <div className="accordion-item rr-accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button rr-accordion-btn"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                {ExceptionVariables?.variabletypes[0]}
              </button>
            </h2>

            <div
              id="collapseOne"
              className="accordion-collapse collapse show"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body rr-accordion-body">
                <div className="rr-table-wrap">
                  <table className="table rr-variable-table">
                    <thead>
                      <tr>
                        <th>Attribute</th>
                        {sampledataset[0].month_data?.map((it, idx) => (
                          <th key={idx} className="text-center">
                            {it?.fy}
                          </th>
                        ))}
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sampledataset?.map((item, variableIndex) => {
                        return (
                          item?.type === ExceptionVariables?.variabletypes[0] &&
                          !hidingvariablelist.some(
                            (variable) => variable === item.attribute_name
                          ) &&
                          !zerotvvariables.some(
                            (variable) => variable.attribute_name === item.attribute_name
                          ) && (
                            <tr key={`outside${variableIndex}`}>
                              <td className={item.to_show_in === 1 ? "text-danger" : ""}>
                                <b>
                                  {Object.keys(ExceptionVariables?.spellingChanges).some(
                                    (key) => key === item.attribute_name
                                  )
                                    ? ExceptionVariables?.spellingChanges[item.attribute_name]
                                    : item.attribute_name}
                                </b>{" "}
                                ({item?.units})
                              </td>

                              {item.month_data?.map((it, valueIndex) => {
                                const today1 = new Date();
                                const today = new Date(
                                  today1.getFullYear(),
                                  today1.getMonth() - 2,
                                  1
                                );
                                const currentMonthYear = `${today.getFullYear()}-${String(
                                  today.getMonth()
                                ).padStart(2, "0")}`;
                                const isBeforeToday = it?.month_year <= currentMonthYear;

                                return (
                                  <td className="text-center" key={valueIndex}>
                                    {edit[variableIndex] ? (
                                      <div className="rr-edit-cell rr-edit-cell--row">
                                        <input
                                          className={`rr-input rr-input-cell ${
                                            it?.frozen ? "noborder" : ""
                                          }`}
                                          value={it.attribute_value}
                                          disabled={isBeforeToday || it?.frozen}
                                          onChange={(e) => {
                                            item.allow_decimal !== 0
                                              ? changeelementsdecimal(
                                                  variableIndex,
                                                  valueIndex,
                                                  e
                                                )
                                              : changeelementsdecimal(
                                                  variableIndex,
                                                  valueIndex,
                                                  e
                                                );
                                          }}
                                          onFocus={() =>
                                            (inputRefs.current.activeIndex = `${variableIndex}-${valueIndex}`)
                                          }
                                          ref={(el) =>
                                            (inputRefs.current[
                                              `${variableIndex}-${valueIndex}`
                                            ] = el)
                                          }
                                        />
                                      </div>
                                    ) : Number.isInteger(it.attribute_value) ? (
                                      Number(it.attribute_value).toLocaleString("en-IN")
                                    ) : !isNaN(it.attribute_value) ? (
                                      it.attribute_value > 10000
                                        ? parseFloat(
                                            Number(it.attribute_value).toFixed(0)
                                          ).toLocaleString("en-IN")
                                        : parseFloat(
                                            Number(it.attribute_value).toFixed(1)
                                          ).toLocaleString("en-IN")
                                    ) : (
                                      it.attribute_value
                                    )}
                                  </td>
                                );
                              })}

                              <td className="text-center">
                                {edit[variableIndex] ? (
                                  <div className="d-flex justify-content-center gap-1 flex-wrap">
                                    <button
                                      className="btn btn-sm checktickbtn"
                                      onClick={() => {
                                        item.allow_decimal !== 0
                                          ? updatedatasetdecimal(variableIndex)
                                          : updatedatasetdecimal(variableIndex);
                                      }}
                                    >
                                      <i className="fa fa-check rr-success-icon"></i>
                                    </button>

                                    <button
                                      className="btn btn-sm"
                                      onClick={() => {
                                        clearAll(variableIndex);
                                      }}
                                    >
                                      <i className="fas fa-trash-alt rr-danger-icon"></i>
                                    </button>

                                    <button
                                      className="btn btn-sm"
                                      onClick={() => {
                                        let arr = [];
                                        setedit(arr);
                                        handlecancel(variableIndex);
                                      }}
                                    >
                                      <i className="fa fa-arrow-circle-left rr-neutral-icon"></i>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn"
                                    onClick={() => {
                                      changesampledataset(originalset);
                                      let arr = [];
                                      arr[variableIndex] = true;
                                      setedit(arr);
                                    }}
                                  >
                                    <i className="fas fa-edit rr-edit-icon"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        );
                      })}

                      {zerotvvariables?.length > 0 && (
                        <tr>
                          <td colSpan={sampledataset[0].month_data?.length + 2}>
                            <button
                              className="rr-link-btn my-2"
                              type="button"
                              onClick={() => setviewzerotvcampaigns(!viewzerotvcampaigns)}
                            >
                              {viewzerotvcampaigns
                                ? "Hide Old Tv Campaigns"
                                : "View Old Tv Campaigns"}
                            </button>
                          </td>
                        </tr>
                      )}

                      {viewzerotvcampaigns &&
                        zerotvvariables?.length > 0 &&
                        sampledataset?.map((item, variableIndex) => {
                          return (
                            item?.type === ExceptionVariables?.variabletypes[0] &&
                            !hidingvariablelist.some(
                              (variable) => variable === item.attribute_name
                            ) &&
                            zerotvvariables.some(
                              (variable) => variable.attribute_name === item.attribute_name
                            ) && (
                              <tr key={`zerotv-${variableIndex}`}>
                                <td className={item.to_show_in === 1 ? "text-danger" : ""}>
                                  <b>
                                    {Object.keys(ExceptionVariables?.spellingChanges).some(
                                      (key) => key === item.attribute_name
                                    )
                                      ? ExceptionVariables?.spellingChanges[
                                          item.attribute_name
                                        ]
                                      : item.attribute_name}
                                  </b>{" "}
                                  ({item?.units})
                                </td>

                                {item.month_data?.map((it, valueIndex) => {
                                  const today1 = new Date();
                                  const today = new Date(
                                    today1.getFullYear(),
                                    today1.getMonth() - 2,
                                    1
                                  );
                                  const currentMonthYear = `${today.getFullYear()}-${String(
                                    today.getMonth()
                                  ).padStart(2, "0")}`;
                                  const isBeforeToday = it?.month_year <= currentMonthYear;

                                  return (
                                    <td className="text-center" key={valueIndex}>
                                      {edit[variableIndex] ? (
                                        <div className="rr-edit-cell rr-edit-cell--row">
                                          <input
                                            className={`rr-input rr-input-cell ${
                                              it?.frozen ? "noborder" : ""
                                            }`}
                                            value={it.attribute_value}
                                            disabled={isBeforeToday || it?.frozen}
                                            onChange={(e) => {
                                              item.allow_decimal !== 0
                                                ? changeelementsdecimal(
                                                    variableIndex,
                                                    valueIndex,
                                                    e
                                                  )
                                                : changeelementsdecimal(
                                                    variableIndex,
                                                    valueIndex,
                                                    e
                                                  );
                                            }}
                                            onFocus={() =>
                                              (inputRefs.current.activeIndex = `${variableIndex}-${valueIndex}`)
                                            }
                                            ref={(el) =>
                                              (inputRefs.current[
                                                `${variableIndex}-${valueIndex}`
                                              ] = el)
                                            }
                                          />
                                        </div>
                                      ) : Number.isInteger(it.attribute_value) ? (
                                        Number(it.attribute_value).toLocaleString("en-IN")
                                      ) : !isNaN(it.attribute_value) ? (
                                        it.attribute_value > 10000
                                          ? parseFloat(
                                              Number(it.attribute_value).toFixed(0)
                                            ).toLocaleString("en-IN")
                                          : parseFloat(
                                              Number(it.attribute_value).toFixed(1)
                                            ).toLocaleString("en-IN")
                                      ) : (
                                        it.attribute_value
                                      )}
                                    </td>
                                  );
                                })}

                                <td className="text-center">
                                  {edit[variableIndex] ? (
                                    <div className="d-flex justify-content-center gap-1 flex-wrap">
                                      <button
                                        className="btn btn-sm checktickbtn"
                                        onClick={() => {
                                          item.allow_decimal !== 0
                                            ? updatedatasetdecimal(variableIndex)
                                            : updatedatasetdecimal(variableIndex);
                                        }}
                                      >
                                        <i className="fa fa-check rr-success-icon"></i>
                                      </button>

                                      <button
                                        className="btn btn-sm"
                                        onClick={() => {
                                          clearAll(variableIndex);
                                        }}
                                      >
                                        <i className="fas fa-trash-alt rr-danger-icon"></i>
                                      </button>

                                      <button
                                        className="btn btn-sm"
                                        onClick={() => {
                                          let arr = [];
                                          setedit(arr);
                                          handlecancel(variableIndex);
                                        }}
                                      >
                                        <i className="fa fa-arrow-circle-left rr-neutral-icon"></i>
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className="btn"
                                      onClick={() => {
                                        changesampledataset(originalset);
                                        let arr = [];
                                        arr[variableIndex] = true;
                                        setedit(arr);
                                      }}
                                    >
                                      <i className="fas fa-edit rr-edit-icon"></i>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Incremental */}
          <div className="accordion-item rr-accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button rr-accordion-btn collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo"
              >
                {ExceptionVariables?.variabletypes[1]}
              </button>
            </h2>

            <div
              id="collapseTwo"
              className="accordion-collapse collapse"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body rr-accordion-body">
                <div className="rr-table-wrap">
                  <table className="table rr-variable-table">
                    <thead>
                      <tr>
                        <th>Attribute</th>
                        {sampledataset[0].month_data?.map((it, idx) => (
                          <th key={idx} className="text-center">
                            {it?.fy}
                          </th>
                        ))}
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sampledataset?.map((item, variableIndex) => {
                        return (
                          item?.type === ExceptionVariables?.variabletypes[1] &&
                          !hidingvariablelist.some(
                            (variable) => variable === item.attribute_name
                          ) && (
                            <tr key={`inc-${variableIndex}`}>
                              <td className={item.to_show_in === 1 ? "text-danger" : ""}>
                                <b>
                                  {Object.keys(ExceptionVariables?.spellingChanges).some(
                                    (key) => key === item.attribute_name
                                  )
                                    ? ExceptionVariables?.spellingChanges[item.attribute_name]
                                    : item.attribute_name}
                                </b>{" "}
                                ({item?.units})
                              </td>

                              {item.month_data?.map((it, valueIndex) => {
                                const today1 = new Date();
                                const today = new Date(
                                  today1.getFullYear(),
                                  today1.getMonth() - 2,
                                  1
                                );
                                const currentMonthYear = `${today.getFullYear()}-${String(
                                  today.getMonth()
                                ).padStart(2, "0")}`;
                                const isBeforeToday = it?.month_year <= currentMonthYear;

                                return (
                                  <td key={valueIndex} className="text-center">
                                    {edit[variableIndex] ? (
                                      <div className="rr-edit-cell rr-edit-cell--row">
                                        <input
                                          className={`rr-input rr-input-cell ${
                                            it?.frozen ? "noborder" : ""
                                          }`}
                                          value={it.attribute_value}
                                          disabled={isBeforeToday || it?.frozen}
                                          onChange={(e) => {
                                            item.allow_decimal !== 0
                                              ? changeelementsdecimal(
                                                  variableIndex,
                                                  valueIndex,
                                                  e
                                                )
                                              : changeelementsdecimal(
                                                  variableIndex,
                                                  valueIndex,
                                                  e
                                                );
                                          }}
                                        />
                                      </div>
                                    ) : Number.isInteger(it.attribute_value) ? (
                                      Number(it.attribute_value).toLocaleString("en-IN")
                                    ) : !isNaN(it.attribute_value) ? (
                                      it.attribute_value > 10000
                                        ? parseFloat(
                                            Number(it.attribute_value).toFixed(0)
                                          ).toLocaleString("en-IN")
                                        : parseFloat(
                                            Number(it.attribute_value).toFixed(1)
                                          ).toLocaleString("en-IN")
                                    ) : (
                                      it.attribute_value
                                    )}
                                  </td>
                                );
                              })}

                              <td className="text-center">
                                {edit[variableIndex] ? (
                                  <div className="d-flex justify-content-center gap-1 flex-wrap">
                                    <button
                                      className="btn btn-sm checktickbtn"
                                      onClick={() => {
                                        item.allow_decimal !== 0
                                          ? updatedatasetdecimal(variableIndex)
                                          : updatedatasetdecimal(variableIndex);
                                      }}
                                    >
                                      <i className="fa fa-check rr-success-icon"></i>
                                    </button>

                                    <button
                                      className="btn btn-sm"
                                      onClick={() => {
                                        clearAll(variableIndex);
                                      }}
                                    >
                                      <i className="fas fa-trash-alt rr-danger-icon"></i>
                                    </button>

                                    <button
                                      className="btn btn-sm"
                                      onClick={() => {
                                        let arr = [];
                                        setedit(arr);
                                        handlecancel(variableIndex);
                                      }}
                                    >
                                      <i className="fa fa-arrow-circle-left rr-neutral-icon"></i>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn"
                                    onClick={() => {
                                      changesampledataset(originalset);
                                      let arr = [];
                                      arr[variableIndex] = true;
                                      setedit(arr);
                                    }}
                                  >
                                    <i className="fas fa-edit rr-edit-icon"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Core */}
          <div className="accordion-item rr-accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button rr-accordion-btn collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThree"
                aria-expanded="false"
                aria-controls="collapseThree"
              >
                {ExceptionVariables?.variabletypes[2]}
              </button>
            </h2>

            <div
              id="collapseThree"
              className="accordion-collapse collapse"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body rr-accordion-body">
                <div className="rr-table-wrap">
                  <table className="table rr-variable-table">
                    <thead>
                      <tr>
                        <th>Core Type</th>
                        <th>Attribute</th>
                        {sampledataset[0].month_data?.map((it, idx) => (
                          <th key={idx} className="text-center">
                            {it?.fy}
                          </th>
                        ))}
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sampledataset?.map((item, variableIndex) => {
                        return (
                          item?.type === ExceptionVariables?.variabletypes[2] &&
                          !hidingvariablelist.some(
                            (variable) => variable === item.attribute_name
                          ) && (
                            <tr key={`core-${variableIndex}`}>
                              <td
                                className={
                                  item.variable_type === "core_ITC"
                                    ? "text-success"
                                    : "text-primary"
                                }
                              >
                                <b>{item.variable_type}</b>
                              </td>

                              <td className={item.to_show_in === 1 ? "text-danger" : ""}>
                                <b>
                                  {Object.keys(ExceptionVariables?.spellingChanges).some(
                                    (key) => key === item.attribute_name
                                  )
                                    ? ExceptionVariables?.spellingChanges[item.attribute_name]
                                    : item.attribute_name}
                                </b>{" "}
                                ({item?.units})
                              </td>

                              {item.month_data?.map((it, valueIndex) => {
                                const today1 = new Date();
                                const today = new Date(
                                  today1.getFullYear(),
                                  today1.getMonth() - 2,
                                  1
                                );
                                const currentMonthYear = `${today.getFullYear()}-${String(
                                  today.getMonth()
                                ).padStart(2, "0")}`;
                                const isBeforeToday = it?.month_year <= currentMonthYear;

                                return (
                                  <td className="text-center" key={valueIndex}>
                                    {edit[variableIndex] ? (
                                      <div className="rr-edit-cell rr-edit-cell--row">
                                        <input
                                          className={`rr-input rr-input-cell ${
                                            it?.frozen ? "noborder" : ""
                                          }`}
                                          value={it.attribute_value}
                                          disabled={isBeforeToday || it?.frozen}
                                          onChange={(e) => {
                                            if (!isBeforeToday) {
                                              item.allow_decimal !== 0
                                                ? changeelementsdecimal(
                                                    variableIndex,
                                                    valueIndex,
                                                    e
                                                  )
                                                : changeelementsdecimal(
                                                    variableIndex,
                                                    valueIndex,
                                                    e
                                                  );
                                            }
                                          }}
                                        />
                                      </div>
                                    ) : Number.isInteger(it.attribute_value) ? (
                                      Number(it.attribute_value).toLocaleString("en-IN")
                                    ) : !isNaN(it.attribute_value) ? (
                                      it.attribute_value > 10000
                                        ? parseFloat(
                                            Number(it.attribute_value).toFixed(0)
                                          ).toLocaleString("en-IN")
                                        : parseFloat(
                                            Number(it.attribute_value).toFixed(1)
                                          ).toLocaleString("en-IN")
                                    ) : (
                                      it.attribute_value
                                    )}
                                  </td>
                                );
                              })}

                              <td className="text-center">
                                {edit[variableIndex] ? (
                                  <div className="d-flex justify-content-center gap-1 flex-wrap">
                                    <button
                                      className="btn btn-sm checktickbtn"
                                      onClick={() => {
                                        item.allow_decimal !== 0
                                          ? updatedatasetdecimal(variableIndex)
                                          : updatedatasetdecimal(variableIndex);
                                      }}
                                    >
                                      <i className="fa fa-check rr-success-icon"></i>
                                    </button>

                                    <button
                                      className="btn btn-sm"
                                      onClick={() => {
                                        clearAll(variableIndex);
                                      }}
                                    >
                                      <i className="fas fa-trash-alt rr-danger-icon"></i>
                                    </button>

                                    <button
                                      className="btn btn-sm"
                                      onClick={() => {
                                        let arr = [];
                                        setedit(arr);
                                        handlecancel(variableIndex);
                                      }}
                                    >
                                      <i className="fa fa-arrow-circle-left rr-neutral-icon"></i>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn"
                                    onClick={() => {
                                      changesampledataset(originalset);
                                      let arr = [];
                                      arr[variableIndex] = true;
                                      setedit(arr);
                                    }}
                                  >
                                    <i className="fas fa-edit rr-edit-icon"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}

export default VariableTableYearly