# import json
# import re

# # Path to your input file (replace with your actual file path)

# input_file_path = './updated_date=2025-01-27/part_000'
# inter_file_path = 'temp.json'
# output_file_path = 'output.json'
# def add_commas_and_convert(input_file, inter_file):
#     with open(input_file, 'r') as infile:
#         data = infile.read()  # Read the content of the file

#     # Add commas between each JSON object
#     # Assuming each object is separate by a newline or a space
#     # Adding a comma after each closing bracket "}"
#     data = re.sub(r'(?<=\})\s*(?=\{)', ',', data)
    
#     # Wrap the whole data into a valid JSON array by adding square brackets at the start and end
#     data = f"[{data}]"

#     try:
#         # Convert to JSON
#         json_data = json.loads(data)

#         # Write the formatted JSON to the output file
#         with open(output_file, 'w') as outfile:
#             json.dump(json_data, outfile, indent=4)  # Write the formatted JSON with indentation

#         print(f"File successfully converted to JSON and saved at {output_file}")
    
#     except json.JSONDecodeError as e:
#         print(f"Error decoding JSON: {e}")

# def remove_fields(inter_file, output_file):
#     # Read the content of the input JSON file
#     with open(inter_file, 'r') as infile:
#         data = json.load(infile)  # Load the JSON content

#     # Iterate over all entries and remove the specified fields
#     for entry in data:
#         entry.pop('ids', None)  # Remove the 'ids' field, if it exists
#         entry.pop('created_date', None)  # Remove the 'created_date' field, if it exists
#         entry.pop('updated_date', None)  # Remove the 'updated_date' field, if it exists

#     # Write the modified data back to the output JSON file
#     with open(output_file, 'w') as outfile:
#         json.dump(data, outfile, indent=4)  # Save as formatted JSON with indentation

#     print(f"File successfully modified and saved at {output_file}")

# # Call the function with the file paths
# add_commas_and_convert(input_file_path, output_file_path)


import json
import re
import gzip
import os

# Paths to your files
input_file_path = './updated_date=2025-01-27/part_000.gz'  # Your gzipped input file
inter_file_path = 'temp.json'
output_file_path = 'output.json'
unzipped_file_path = 'unzipped_part_000.json'  # Temporary file after unzipping

def unzip_gz_file(gz_file_path, unzip_to_path):
    """Unzips the gzipped file to a temporary JSON file."""
    with gzip.open(gz_file_path, 'rt', encoding='utf-8') as gz_ref:
        with open(unzip_to_path, 'w', encoding='utf-8') as out_file:
            out_file.write(gz_ref.read())  # Write the decompressed content to the output file
    return unzip_to_path

def add_commas_and_convert(input_file, inter_file):
    with open(input_file, 'r', encoding='utf-8') as infile:
        data = infile.read()  # Read the content of the file

    # Add commas between each JSON object
    data = re.sub(r'(?<=\})\s*(?=\{)', ',', data)
    
    # Wrap the whole data into a valid JSON array by adding square brackets at the start and end
    data = f"[{data}]"

    try:
        # Convert to JSON
        json_data = json.loads(data)

        # Write the formatted JSON to the intermediate file
        with open(inter_file, 'w', encoding='utf-8') as outfile:
            json.dump(json_data, outfile, indent=4)  # Write the formatted JSON with indentation

        print(f"File successfully converted to JSON and saved at {inter_file}")
    
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")

def remove_fields(inter_file, output_file):
    # Read the content of the intermediate JSON file
    with open(inter_file, 'r', encoding='utf-8') as infile:
        data = json.load(infile)  # Load the JSON content

    # Iterate over all entries and remove the specified fields
    for entry in data:
        entry.pop('ids', None)  # Remove the 'ids' field, if it exists
        entry.pop('created_date', None)  # Remove the 'created_date' field, if it exists
        entry.pop('updated_date', None)  # Remove the 'updated_date' field, if it exists

    # Write the modified data back to the output JSON file
    with open(output_file, 'w', encoding='utf-8') as outfile:
        json.dump(data, outfile, indent=4)  # Save as formatted JSON with indentation

    print(f"File successfully modified and saved at {output_file}")

# Main processing function
def process_json_file(gz_file_path):
    # Unzip the gz file
    unzipped_file = unzip_gz_file(gz_file_path, unzipped_file_path)
    
    # Process the unzipped file
    add_commas_and_convert(unzipped_file, inter_file_path)
    
    # Remove unnecessary fields and save to the output file
    remove_fields(inter_file_path, output_file_path)
    
    # Clean up the temporary files
    os.remove(unzipped_file)
    os.remove(inter_file_path)
    print(f"Temporary files cleaned up.")

# Call the function with the gzipped file
process_json_file(input_file_path)
