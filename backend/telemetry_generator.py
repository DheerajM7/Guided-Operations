import csv

def generate_telemetry_data():
    # Simulate generating telemetry data (you can replace this with real logic)
    telemetry_data = [
        {"timestamp": "2024-10-08T12:00:00Z", "value": 42},
        {"timestamp": "2024-10-08T12:01:00Z", "value": 45},
        {"timestamp": "2024-10-08T12:02:00Z", "value": 43},
    ]
    return telemetry_data

# Optional: If you're processing telemetry data from a CSV file, add this

file_path ="/Users/dheerajmendu/Desktop/Milvian Group/guided-operations-main/backend/mock_sales_data.csv"
def generate_telemetry_from_csv(file_path):
    telemetry_data = []
    with open(file_path, mode='r') as csvfile:
        csvreader = csv.DictReader(csvfile)
        for row in csvreader:
            telemetry_data.append({
                "timestamp": row['timestamp'],
                "value": float(row['value'])
            })
    return telemetry_data

