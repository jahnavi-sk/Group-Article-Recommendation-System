import os
import json

# Path to your folder containing the JSON files
input_folder_path = './sources'  # Replace with the path to your folder containing the JSON files

# Path to the new folder where the edited files will be saved
output_folder_path = './edited_files'  # Replace with the path to the new folder where you want to save the edited files

# Ensure the output folder exists
if not os.path.exists(output_folder_path):
    os.makedirs(output_folder_path)

# Function to remove "umls_aui" and "umls_cui" from the "ids" field in each entry
def remove_umls_fields_from_ids(entries):
    for entry in entries:
       if 'roles' in entry and isinstance(entry['roles'], list):
            for topic in entry['roles']:
                for key in ['works_count']:
                    topic.pop(key, None)
    return entries

# Function to process all JSON files in a folder
def process_json_files(input_folder, output_folder):
    for root, dirs, files in os.walk(input_folder):
        for file in files:
            if file.endswith('.json'):  # Only process .json files
                json_file_path = os.path.join(root, file)
                
                # Read and load the JSON data
                with open(json_file_path, 'r', encoding='utf-8') as infile:
                    try:
                        json_data = json.load(infile)
                    except json.JSONDecodeError as e:
                        print(f"Error reading {json_file_path}: {e}")
                        continue

                # Check if the JSON data is a list (multiple entries), and process each entry
                if isinstance(json_data, list):
                    json_data = remove_umls_fields_from_ids(json_data)
                else:
                    print(f"Skipping {json_file_path}, as it doesn't contain a list of entries.")
                    continue

                # Define the output file path in the new folder
                output_file_path = os.path.join(output_folder, file)

                # Write the modified data to the new folder
                with open(output_file_path, 'w', encoding='utf-8') as outfile:
                    json.dump(json_data, outfile, indent=4)  # Save with pretty print (indentation)
                
                print(f"Processed and saved to {output_file_path}")

# Call the function to process all JSON files in the input folder and save to the new folder
process_json_files(input_folder_path, output_folder_path)
