import streamlit as st
import pandas as pd
import numpy as np
import traceback
from io import StringIO
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

with open('streamlit_charts_example.py', 'r') as file:
    python_code = file.read()

# Tools
read_file_contents_tool = {
    "name": "read_file_contents",
    "description": "Read the contents of a file. There are two files in the data directory: data/extruder_telemetry.csv and data/hot_stamp_press_telemetry.csv.",
    "input_schema": {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "The path to the file to read."
            }
        },
        "required": ["file_path"]
    }
}

create_streamlit_chart_tool = {
    "name": "create_streamlit_chart",
    "description": "Use this when the user says 'Show me'. Create a Streamlit chart based on the provided Python code and reference file.",
    "input_schema": {
        "type": "object",
        "properties": {
            "python_code": {
                "type": "string",
                "description": f"The Python code to execute for creating the Streamlit chart.IMPORTANT: DON'T try to assign a chart a title, or any other additional arguments past what is required and supported by the chart. Only use the following libraries: built-in python libraries, numpy, pandas and streamlit. It should always store the chart objects in a list called chart_objects. Here's some example python code:\n\n{python_code}"
            },
            "reference_file": {
                "type": "string",
                "description": "The path to the reference CSV file containing the data for the chart."
            }
        },
        "required": ["python_code", "reference_file"]
    }
}

# Functions
def read_file_contents(file_path):
    logger.debug(f"Attempting to read file: {file_path}")
    try:
        with open(file_path.get('file_path'), 'r') as file:
            content = file.read()
        logger.debug(f"Successfully read file: {file_path}")
        return content
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {str(e)}")
        return f"Error reading file: {str(e)}"

def create_streamlit_chart(tool_input):
    python_code = tool_input.get('python_code')
    reference_file = tool_input.get('reference_file')
    
    logger.debug(f"Creating Streamlit chart with reference file: {reference_file}")
    logger.debug(f"Python code to execute:\n{python_code}")
    
    # Create a local namespace for executing the code
    local_namespace = {
        'st': st,
        'pd': pd,
        'np': np,
        'reference_file': reference_file
    }
    
    # Capture print output
    output = StringIO()
    
    try:
        # Modify the provided Python code to use a placeholder instead of directly rendering the chart
        modified_code = python_code.replace('st.', 'st_placeholder.')
        
        # Create a placeholder class to capture Streamlit function calls
        class StreamlitPlaceholder:
            def __getattr__(self, name):
                def method(*args, **kwargs):
                    return (name, args, kwargs)
                return method
        
        local_namespace['st_placeholder'] = StreamlitPlaceholder()
        
        # Execute the modified Python code
        exec(modified_code, globals(), local_namespace)
        
        # Get the captured chart information
        chart_info = local_namespace.get('chart_objects', None)
        charts = []
        if chart_info:
            # Return the chart information without rendering it
            for i, chart in enumerate(chart_info):
                charts.append({ 
                    'chart_type': chart[0],
                    'args': chart[1],
                    'kwargs': chart[2],
                    'whole_chart': chart
                })
            logger.debug(f"Successfully created {len(charts)} chart(s)")
            return charts
        else:
            logger.warning("No chart objects were created")
            return None
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        logger.error(error_msg)
        return {
            'chart_object': None,
            'debug_info': output.getvalue(),
            'error': error_msg
        }
    finally:
        output.close()
