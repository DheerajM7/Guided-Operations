import streamlit as st
import pandas as pd
import numpy as np

# Read the CSV data
df = pd.read_csv('data/extruder_telemetry.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Create a list to store chart objects
chart_objects = []

# Temperature over time
chart_objects.append(('line_chart', (df.set_index('timestamp')['temperature'],), {'use_container_width': True}))

# Pressure over time
chart_objects.append(('line_chart', (df.set_index('timestamp')['pressure'],), {'use_container_width': True}))

# Screw speed over time
chart_objects.append(('line_chart', (df.set_index('timestamp')['screw_speed'],), {'use_container_width': True}))

# Motor load over time
chart_objects.append(('line_chart', (df.set_index('timestamp')['motor_load'],), {'use_container_width': True}))

# Output rate over time
chart_objects.append(('line_chart', (df.set_index('timestamp')['output_rate'],), {'use_container_width': True}))

# Display summary statistics
st.write("Extruder Telemetry Summary Statistics:")
st.write(df.describe())

# Display correlation matrix
st.write("Correlation Matrix:")
st.write(df[['temperature', 'pressure', 'screw_speed', 'motor_load', 'output_rate']].corr())

# Display all charts
for chart_type, args, kwargs in chart_objects:
    chart_function = getattr(st, chart_type)
    chart_function(*args, **kwargs)

# Note: In a real scenario, you would return the chart_objects list
# instead of directly rendering the charts with Streamlit.
# The actual rendering would be handled by the create_streamlit_chart function.
# Don't try to give a chart a title. It will not work.