import React from 'react';
import { Line } from 'react-chartjs-2';
import '../styles/TelemetryChart.css';

const TelemetryChart = ({ telemetryData }) => {
  // Process the telemetry data into chart.js compatible format
  const processTelemetryData = (data) => {
    const labels = data.map(item => item.timestamp);  // X-axis: Timestamps
    const values = data.map(item => item.value);      // Y-axis: Values

    return {
      labels,
      datasets: [
        {
          label: 'Telemetry Data',
          data: values,
          borderColor: 'rgba(75,192,192,1)',
          fill: false,
        },
      ],
    };
  };

  const chartData = processTelemetryData(telemetryData);

  return (
    <div class="telemetry-chart-container">
      <h2>Telemetry Data Chart</h2>
      {telemetryData ? <Line data={chartData} /> : <p>Loading chart...</p>}
    </div>
  );
};

export default TelemetryChart;
