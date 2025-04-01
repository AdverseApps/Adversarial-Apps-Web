import os
import csv
import sys
from dotenv import load_dotenv
import psycopg2
from datetime import datetime, timezone
import tempfile

# Increase CSV field size limit safely (max for a 32-bit system)
csv.field_size_limit(2**31 - 1)

def get_safe(row, idx):
    try:
        return row[idx].strip()
    except IndexError:
        return ""
    
def get_safe(row, idx):
    try:
        return row[idx].strip()
    except IndexError:
        return ""

def parse_sam_dat_file(data_file_path: str, output_file_path: str) -> int:
    """
    Parses the SAM .DAT file and writes necessary fields into a CSV for PostgreSQL COPY.
    Returns the number of records processed.
    """
    total_records = 0
    log_path = "malformed_rows_log.txt"

    try:
        with open(log_path, 'w', encoding='utf-8') as log, \
             open(data_file_path, mode='r', encoding='utf-8') as infile, \
             open(output_file_path, mode='w', encoding='utf-8', newline='') as outfile:

            reader = csv.reader(infile, delimiter='|')
            writer = csv.writer(outfile)

            for row_num, row in enumerate(reader, 1):
                if not row or row[0].startswith("BOF"):
                    continue

                try:
                    entity_id = get_safe(row, 0)
                    cage_code = get_safe(row, 3)
                    registration_date = get_safe(row, 7)
                    expiration_date = get_safe(row, 9)
                    legal_business_name = get_safe(row, 11)
                    address_line1 = get_safe(row, 15)
                    address_line2 = get_safe(row, 16)
                    city = get_safe(row, 17)
                    state_or_province = get_safe(row, 18)
                    zip_code = get_safe(row, 19)
                    country_code = get_safe(row, 21)
                    certifications = get_safe(row, 31)
                    naics_primary = get_safe(row, 32)
                    exclusions = get_safe(row, 36)

                    if len(row) < 40:
                        log.write(f"Row {row_num} skipped: too few fields ({len(row)}) | Data: {row}\n")
                        continue

                    writer.writerow([
                        entity_id, legal_business_name, cage_code, country_code,
                        state_or_province, city, zip_code, address_line1, address_line2,
                        registration_date, expiration_date, certifications, naics_primary,
                        exclusions
                    ])
                    total_records += 1

                except Exception as e:
                    log.write(f"Row {row_num} skipped: {str(e)} | Data: {row}\n")

    except Exception as e:
        print(f"Error parsing SAM file: {e}")

    return total_records

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

'''
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
'''

def copy_into_sam_entities(csv_path: str) -> None:
    """
    Uses PostgreSQL COPY command to insert bulk data from a CSV into sam_entities.
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not set")
        return

    try:
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
            "certifications" text DEFAULT '',
            "naics_primary" text DEFAULT '',
            "exclusions" text DEFAULT '',
            "review_requests" int4 DEFAULT 0,
            "riskScore" float4 DEFAULT 0,
            "lastVerified" timestamp,
            "isVerified" bool NOT NULL DEFAULT false
        );
        """
        cursor.execute(create_table_query)
        conn.commit()

        # Clear table for fresh insert
        print(f"emptying table\n")
        cursor.execute("TRUNCATE TABLE sam_entities;")

        print(f"starting bulk copy")

        # Perform bulk COPY
        with open(csv_path, 'r', encoding='utf-8') as f:
            cursor.copy_expert("""
                COPY sam_entities (
                    entity_id, legal_business_name, cage_code, country_code,
                    state_or_province, city, zip_code, address_line1, address_line2,
                    registration_date, expiration_date, certifications,
                    naics_primary, exclusions
                ) FROM STDIN WITH CSV
            """, f)

        conn.commit()
        cursor.close()
        conn.close()
        print(f"Successfully copied data from {csv_path} into sam_entities.")

    except Exception as e:
        print(f"Error during COPY into sam_entities: {e}")


'''
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
'''

def process_sam_data(data_file_path: str) -> None:
    """
    Parses SAM data into a temporary CSV and loads it into the database via COPY.
    The temp file is auto-deleted after use.
    """
    print(f"Processing SAM data from: {data_file_path}")
    with tempfile.NamedTemporaryFile(mode='w+', encoding='utf-8', newline='', delete=False) as tmp_csv:
        temp_csv_path = tmp_csv.name
        record_count = parse_sam_dat_file(data_file_path, temp_csv_path)
        print(f"Parsed {record_count} records into temp CSV.")

        if record_count:
            copy_into_sam_entities(temp_csv_path)
        else:
            print("No records to copy.")
    os.remove(temp_csv_path)
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
        print(f"Error: File not found at {data_file_path}")

if __name__ == "__main__":
    load_dotenv()
    main()