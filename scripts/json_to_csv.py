import json
import csv
import sys

# Ensure correct usage
if len(sys.argv) != 3:
    print("Usage: python json_to_csv.py <input.json> <output.csv>")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

# Load JSON data
with open(input_file, 'r') as json_file:
    data = json.load(json_file)

# Convert JSON to CSV
if isinstance(data, list) and all(isinstance(item, dict) for item in data):
    keys = data[0].keys()
    with open(output_file, 'w', newline='') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)
    print(f"Successfully converted {input_file} to {output_file}")
else:
    print("Invalid JSON format. Ensure the file contains a list of dictionaries.")
