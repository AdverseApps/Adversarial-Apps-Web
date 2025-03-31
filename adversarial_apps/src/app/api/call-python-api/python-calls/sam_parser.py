import os
import csv
import sys
from dotenv import load_dotenv
import psycopg2
from datetime import datetime, timezone
 
# Increase CSV field size limit safely (max for a 32-bit system)
csv.field_size_limit(2**31 - 1)

def parse_sam_dat_file(data_file_path: str) -> list:
    """
    Reads the SAM .DAT file (pipe-delimited, no header row) and returns a list of dictionaries 
    containing only the essential fields.
    
    We supply fieldnames manually based on the SAM Master Extract Mapping.
    
    Mapping (zero-indexed; adjust if necessary):
    0: UNIQUE ENTITY ID
    1: col1
    2: col2
    3: CAGE CODE
    4: col4
    5: col5
    6: col6
    7: INITIAL REGISTRATION DATE
    8: col8
    9: REGISTRATION EXPIRATION DATE
    10: col10
    11: LEGAL BUSINESS NAME
    12: col12
    13: col13
    14: col14
    15: ADDRESS LINE 1
    16: ADDRESS LINE 2
    17: CITY
    18: STATE/PROVINCE
    19: ZIP CODE
    20: col20
    21: COUNTRY CODE
    """
    fieldnames = [
        "UNIQUE ENTITY ID",           # 0
        "col1",                       # 1
        "col2",                       # 2
        "CAGE CODE",                  # 3
        "col4",                       # 4
        "col5",                       # 5
        "col6",                       # 6
        "INITIAL REGISTRATION DATE",  # 7
        "col8",                       # 8
        "REGISTRATION EXPIRATION DATE",  # 9
        "col10",                      # 10
        "LEGAL BUSINESS NAME",        # 11
        "col12",                      # 12
        "col13",                      # 13
        "col14",                      # 14
        "ADDRESS LINE 1",             # 15
        "ADDRESS LINE 2",             # 16
        "CITY",                       # 17
        "STATE/PROVINCE",             # 18
        "ZIP CODE",                   # 19
        "col20",                      # 20
        "COUNTRY CODE"                # 21
    ]
    records = []
    index = 0
    # limit = 100  # Process only the first 100 records for demo

    try:
        with open(data_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file, fieldnames=fieldnames, delimiter='|')
            
            # Read first line to check if it is a BOF header row
            first_line = next(reader)
            if first_line["UNIQUE ENTITY ID"].strip().upper().startswith("BOF"):
                print("Skipping BOF header row")
            else:
                records.append(process_row(first_line))
                # index += 1

            for row in reader:
               # if index >= limit:
                #    break
                processed = process_row(row)
                records.append(processed)
                index += 1
    except Exception as e:
        print(f"Failed to open or process file: {e}")
    return records

def process_row(row: dict) -> dict:
    """
    Processes a row from the CSV by converting all values to strings
    and removing any occurrence of the '!end' marker.
    """
    processed = {}
    for key, value in row.items():
        if not isinstance(value, str):
            value = str(value)
        processed[key] = value.replace("!end", "").strip() if value else ""
    return processed

def store_subset_in_db(records: list) -> None:
    """
    Stores the parsed SAM subset data into the PostgreSQL table 'sam_entities'.
    Creates the table if it does not exist and performs a full refresh.
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL environment variable not set.")
        return

    try:
        print("Storing data...")
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()

        # Create table if it doesn't exist (without primary keys or unique constraints)
        create_table_query = """
        CREATE TABLE IF NOT EXISTS sam_entities (
            "entity_id" text NOT NULL,
            "legal_business_name" text NOT NULL,
            "cage_code" text,
            "country_code" text NOT NULL,
            "state_or_province" text,
            "city" text,
            "zip_code" text,
            "registration_date" text NOT NULL,
            "expiration_date" text,
            "address_line2" text,
            "address_line1" text,
            "review_requests" int4 DEFAULT 0,
            "riskScore" float4 DEFAULT 0,
            "lastVerified" timestamp,
            "isVerified" bool NOT NULL DEFAULT false
        );
        """
        cursor.execute(create_table_query)
        conn.commit()

        # Clear existing data (full refresh demo)
        cursor.execute("DELETE FROM sam_entities;")
        conn.commit()

        # Insert records (use only fields provided)
        insert_query = """
        INSERT INTO sam_entities (
            entity_id, legal_business_name, cage_code, country_code,
            state_or_province, city, zip_code, address_line1, address_line2,
            registration_date, expiration_date
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        for record in records:
            values = (
                record.get("UNIQUE ENTITY ID", ""),
                record.get("LEGAL BUSINESS NAME", ""),
                record.get("CAGE CODE", ""),
                record.get("COUNTRY CODE", ""),
                record.get("STATE/PROVINCE", ""),
                record.get("CITY", ""),
                record.get("ZIP CODE", ""),
                record.get("ADDRESS LINE 1", ""),
                record.get("ADDRESS LINE 2", ""),
                record.get("INITIAL REGISTRATION DATE", ""),
                record.get("REGISTRATION EXPIRATION DATE", "")
            )
            try:
                cursor.execute(insert_query, values)
            except Exception as e:
                print(f"Error inserting record with entity_id {record.get('UNIQUE ENTITY ID', '')}: {e}")
                conn.rollback()

        conn.commit()
        cursor.close()
        conn.close()
        print(f"Stored {len(records)} records into sam_entities.")
    except Exception as e:
        print(f"Error storing SAM data: {e}")

def process_sam_data(data_file_path: str) -> None:
    """
    Main function to process the SAM DAT file:
    1. Parse the DAT file to extract the essential fields (subset).
    2. Store the subset in the PostgreSQL database.
    """
    print(f"Processing SAM data from: {data_file_path}")
    records = parse_sam_dat_file(data_file_path)
    if records:
        print(f"Parsed {len(records)} records.")
        store_subset_in_db(records)
    else:
        print("No records to store.")

def main():
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the relative path to the data file (adjust as needed)
    data_file_path = os.path.join(script_dir, '..', '..', '..', 'lib', 'SAM_PUBLIC_UTF-8_MONTHLY_V2_20250302.dat')
    data_file_path = os.path.normpath(data_file_path)
    
    print(f"Processing SAM data from: {data_file_path}")
    
    if os.path.exists(data_file_path):
        process_sam_data(data_file_path)
    else:
        print(f"Error: The file '{data_file_path}' does not exist.")

if __name__ == "__main__":
    load_dotenv()
    main()