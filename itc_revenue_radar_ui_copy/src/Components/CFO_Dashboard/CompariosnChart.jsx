import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#4e73df",
  "#1cc88a",
  "#36b9cc",
  "#f6c23e",
  "#e74a3b",
  "#858796",
];

const ReusablePieChart = ({
  data = [],
  nameKey = "name",
  valueKey = "value",
  height = 350,
  title = "",
  showLegend = true,
}) => {
  if (!data.length) return null;

  return (
    <div className="card border-0 shadow-sm mt-4">
      <div className="card-body">
        {title && <h6 className="fw-semibold mb-3">{title}</h6>}

        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey={valueKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReusablePieChart;
