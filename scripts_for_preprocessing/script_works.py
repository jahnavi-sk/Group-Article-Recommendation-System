import json
import re
import gzip
import os
import shutil

# Paths to your main folder and output folder
input_folder_path = './works'  # The folder containing subfolders with gz files
output_folder_path = input_folder_path
inter_file_path = 'tempodoo.json'

# Function to check disk space
def check_disk_space():
    total, used, free = shutil.disk_usage("/")
    return free > 500 * 1024 * 1024  # Stop if less than 500MB free space

# Function to unzip the gzipped file to a temporary JSON file
def unzip_gz_file(gz_file_path, unzip_to_path):
    print(f"Unzipping {gz_file_path}...")
    with gzip.open(gz_file_path, 'rt', encoding='utf-8') as gz_ref:
        with open(unzip_to_path, 'w', encoding='utf-8') as out_file:
            out_file.write(gz_ref.read())
    return unzip_to_path

# Function to process JSON line-by-line
def remove_fields(inter_file, output_file):
    print(f"Processing {inter_file} line by line...")
    with open(inter_file, 'r', encoding='utf-8') as infile, open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("[")  # Start JSON array
        first_entry = True

        for line in infile:
            try:
                entry = json.loads(line.strip())  # Read one JSON object at a time
                
                # Remove top-level fields
                for key in ["title", "publication_year", "language_id", "best_oa_location", "countries_distinct_count", 
                            "institutions_distinct_count", "corresponding_institution_ids", "cited_by_count", "biblio", 
                            "created_date", "is_retracted", "is_paratext", "mesh", "locations_count", "locations", 
                            "grants", "apc_list", "apc_paid", "updated_date"]:
                    entry.pop(key, None)

                if 'ids' in entry and isinstance(entry['ids'], dict):
                    for key in ['openalex', 'doi', 'pmid']:
                        entry['ids'].pop(key, None)

                for loc_key in ['primary_location', 'best_oa_location']:
                    if loc_key in entry and isinstance(entry[loc_key], dict):
                        if 'source' in entry[loc_key] and isinstance(entry[loc_key]['source'], dict):
                            for key in ['issn_l', 'issn', 'publisher', 'host_organization', 'host_organization_name', 
                                        'host_organization_lineage_names', 'host_institution_lineage', 'host_institution_lineage_names', 'is_oa', 'is_in_doaj', 'is_core', 'type_id']:
                                entry[loc_key]['source'].pop(key, None)
                        for key in ['pdf_url', 'landing_page_url', 'is_oa', 'license']:
                            entry[loc_key].pop(key, None)

                if 'authorships' in entry and isinstance(entry['authorships'], list):
                    for author in entry['authorships']:
                        if 'author' in author and isinstance(author['author'], dict):
                            author['author'].pop('orcid', None)
                        if 'institutions' in author and isinstance(author['institutions'], list):
                            for institution in author['institutions']:
                                for key in ['ror', 'country_code', 'type', 'country_id', 'type_id', 'lineage']:
                                    institution.pop(key, None)
                        for key in ['countries', 'country_ids', 'affiliations', 'raw_affiliation_strings']:
                            author.pop(key, None)

                if 'open_access' in entry and isinstance(entry['open_access'], dict):
                    for key in ['oa_status', 'oa_url', 'any_repository_has_fulltext']:
                        entry['open_access'].pop(key, None)

                if 'concepts' in entry and isinstance(entry['concepts'], list):
                    for concept in entry['concepts']:
                        concept.pop('wikidata', None)

                for topic_key in ['topics', 'primary_topic']:
                    if topic_key in entry and isinstance(entry[topic_key], list):
                        for topic in entry[topic_key]:
                            for key in ['display_name', 'subfield', 'field', 'domain']:
                                topic.pop(key, None)
                
                # Write modified entry back
                if not first_entry:
                    outfile.write(",\n")  # Add comma between JSON objects
                json.dump(entry, outfile, indent=4)
                first_entry = False  # Ensure commas are added only after the first entry

            except json.JSONDecodeError:
                continue  # Skip invalid JSON lines

        outfile.write("\n]")  # End JSON array
    print(f"File successfully modified and saved at {output_file}")

# Main processing function
def process_json_file(gz_file_path, output_file_path):
    if not check_disk_space():
        print("Low disk space! Stopping process.")
        return
    
    print(f"Processing {gz_file_path}...")
    unzipped_file = unzip_gz_file(gz_file_path, 'unzipped_temp.json')
    remove_fields(unzipped_file, output_file_path)
    os.remove(unzipped_file)
    print(f"Finished processing {gz_file_path} -> {output_file_path}")

# Process all .gz files in the input folder
def process_all_gz_files(input_folder, output_folder):
    output_counter = 180
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for root, dirs, files in os.walk(input_folder):
        for file in files:
            if file.endswith('.gz'):
                if not check_disk_space():
                    print("Low disk space! Stopping process.")
                    return
                
                gz_file_path = os.path.join(root, file)
                output_file_path = os.path.join(output_folder, f"works_{output_counter}.json")
                print(f"Processing file from folder: {root}")
                process_json_file(gz_file_path, output_file_path)
                output_counter += 1

process_all_gz_files(input_folder_path, output_folder_path)
