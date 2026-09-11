// import React from "react";
// import Chart from "react-apexcharts";

// const QuarterlySalesDashboard = ({
//     quarterlyData = [],
//     previousFY,
//     currentFY,
//     tilldate
// }) => {
//     const sortedData = [...quarterlyData].sort((a, b) =>
//         a.quarter.localeCompare(b.quarter)
//     );

//     const categories = sortedData.map((item) => item.quarter);

//     const previousFYData = sortedData.map((item) =>
//         Number((item.previous_fy / 10000000).toFixed(2))
//     );

//     const currentFYData = sortedData.map((item) =>
//         Number((item.current_fy / 10000000).toFixed(2))
//     );

//     const chartOptions = {
//         chart: {
//             type: "line",
//             toolbar: { show: false },
//         },
//         stroke: {
//             curve: "smooth",
//             width: 3,
//         },
//         markers: {
//             size: 5,
//         },
//         xaxis: {
//             categories: categories,
//         },
//         yaxis: {
//             title: {
//                 text: "Sales (₹ in Crores)",
//             },
//             labels: {
//                 formatter: (val) => `₹ ${val}`,
//             },
//         },
//         tooltip: {
//             y: {
//                 formatter: (val) => `₹ ${val} Cr`,
//             },
//         },
//         legend: {
//             position: "top",
//         },
//     };

//     return (
//         <div className="row g-4">
//             {/* Left: Line Chart */}
//             <div className="col-lg-8">
//                 <div className="card shadow-sm p-3 h-100">
//                     <h5 className="fw-semibold mb-3">
//                         Quarterly Sales Comparison
//                     </h5>
//                     <Chart
//                         options={chartOptions}
//                         series={series}
//                         type="line"
//                         height={350}
//                     />
//                 </div>
//             </div>

//             {/* Right: Change % Panel */}
//             <div className="col-lg-4">
//                 <div className="card shadow-sm p-3 h-100">
//                     <h6 className="fw-semibold mb-3">
//                         Quarter-wise Growth %
//                     </h6>

//                     {sortedData.map((item, index) => {
//                         const isNegative = item.change_percent < 0;

//                         return (
//                             <div
//                                 key={index}
//                                 className="d-flex justify-content-between align-items-center mb-3 p-2 rounded"
//                                 style={{
//                                     backgroundColor: isNegative
//                                         ? "#fdeaea"
//                                         : "#eafaf1",
//                                 }}
//                             >
//                                 <span className="fw-semibold">
//                                     {item.quarter}
//                                 </span>

//                                 <span
//                                     className={`fw-bold ${isNegative ? "text-danger" : "text-success"
//                                         }`}
//                                 >
//                                     {item.change_percent}%{" "}
//                                     {isNegative ? "↓" : "↑"}
//                                 </span>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default QuarterlySalesDashboard;


import React from "react";
import Chart from "react-apexcharts";

const QuarterlySalesDashboard = ({
    quarterlyData = [],
    previousFY,
    currentFY,
    tilldate
}) => {
    /* =========================
       Sort Quarter Properly
       ========================= */
    const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

    const sortedData = [...quarterlyData].sort(
        (a, b) => quarterOrder[a.quarter] - quarterOrder[b.quarter]
    );

    const categories = sortedData.map((item) => item.quarter);

    /* =========================
       Convert Sales to Crores
       ========================= */
    const previousFYData = sortedData.map((item) =>
        Number((item.previous_fy / 10000000).toFixed(2))
    );

    const currentFYData = sortedData.map((item) =>
        Number((item.current_fy / 10000000).toFixed(2))
    );

    const changePercentData = sortedData.map((item) =>
        Number(item.change_percent)
    );

    /* =========================
          LINE CHART OPTIONS
       ========================= */
    const lineOptions = {
        chart: {
            type: "line",
            toolbar: { show: false },
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        markers: {
            size: 5,
        },
        xaxis: {
            categories: categories,
        },
        yaxis: {
            title: {
                text: "Sales (₹ in Crores)",
            },
            labels: {
                formatter: (val) => `₹ ${val}`,
            },
        },
        tooltip: {
            y: {
                formatter: (val) => `₹ ${val} Cr`,
            },
        },
        colors:["#878006","#087211"],
        legend: {
            position: "bottom",
        },
    };

    const lineSeries = [
        {
            name: `${previousFY} - (${tilldate.split('-')[0]} - ${Number(tilldate.split('-')[1]) - 1})`,
            data: previousFYData,
        },
        {
            name: `${currentFY} - (${tilldate})`,
            data: currentFYData,
        },
    ];

    /* =========================
          BAR CHART OPTIONS
       ========================= */

    const quarterColors = ["#053a09", "#38062f", "#564014", "#FF4560"];

    const barOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                columnWidth: "50%",
                distributed: true, // important for different colors
                borderRadius: 6,
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val}%`,
            style: {
                fontSize: "12px",
                fontWeight: 600,
            },
        },
        xaxis: {
            categories: categories,
        },
        yaxis: {
            title: {
                text: "Growth %",
            },
            labels: {
                formatter: (val) => `${val}%`,
            },
        },
        colors: quarterColors,
        tooltip: {
            y: {
                formatter: (val) => `${val}%`,
            },
        },
    };


    const barSeries = [
        {
            name: "Growth %",
            data: changePercentData,
        },
    ];

    return (
        <div className="row g-4">
            {/* ================= LINE CHART ================= */}
            <div className="col-lg-8">
                <div className="card shadow-sm p-3 h-100">
                    <h5 className="fw-semibold mb-3">
                        Quarterly Sales Comparison
                    </h5>
                    <Chart
                        options={lineOptions}
                        series={lineSeries}
                        type="line"
                        height={350}
                    />
                </div>
            </div>

            {/* ================= BAR CHART ================= */}
            <div className="col-lg-4">
                <div className="card shadow-sm p-3 h-100">
                    <h6 className="fw-semibold mb-3">
                        Quarter-wise Growth %
                    </h6>
                    <Chart
                        options={barOptions}
                        series={barSeries}
                        type="bar"
                        height={350}

                    />
                </div>
            </div>
        </div>
    );
};

export default QuarterlySalesDashboard;