import csv
import os
import sys
import tempfile
from collections import defaultdict
from datetime import datetime
import json
import psycopg2
import pandas as pd
import math
from dotenv import load_dotenv

# Increase CSV field size limit safely (max for a 32-bit system)
csv.field_size_limit(2**31 - 1)


def get_safe(row, idx):
    try:
        return row[idx].strip()
    except IndexError:
        return ""


def clean(val):
    if val is None:
        return None
    if isinstance(val, float) and math.isnan(val):
        return None
    if pd.isna(val):  # handles pd.NA or np.nan
        return None
    val_str = str(val).strip()
    return val_str if val_str.lower() not in ["nan", "none"] else None


def parse_sam_dat_file_with_exclusions(
    data_file_path: str, output_file_path: str, exclusion_lookup: dict
) -> int:
    """
    Parses the SAM .DAT file and writes fields into a CSV for PostgreSQL COPY, including enriched exclusion fields.
    Returns the number of records processed.
    """

    total_records = 0
    log_path = "malformed_rows_log.txt"
    match_log_path = "matched_exclusions_log.txt"
    try:
        with open(log_path, "w", encoding="utf-8") as log, open(
            match_log_path, "w", encoding="utf-8"
        ) as match_log, open(
            data_file_path, mode="r", encoding="utf-8"
        ) as infile, open(
            output_file_path, mode="w", encoding="utf-8", newline=""
        ) as outfile:

            writer = csv.writer(outfile)
            reader = csv.reader(infile, delimiter="|")

            for row_num, row in enumerate(reader, 1):
                if not row or row[0].startswith("BOF"):
                    continue

                try:
                    entity_id = get_safe(row, 0).upper()
                    cage_code = get_safe(row, 3)
                    registration_date = get_safe(row, 7)
                    expiration_date = get_safe(row, 8)
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

                    # matches exclusions from the exclusions file to the entity file by using the UEI
                    matched = exclusion_lookup.get(entity_id, [])
                    is_excluded = bool(matched)

                    if matched:
                        exclusion_type = clean(matched[0].get("exclusion_type"))
                        excluding_agency = clean(matched[0].get("excluding_agency"))
                        ex_active_date = clean(matched[0].get("ex_active_date"))
                        ex_termination_date = (
                            clean(matched[0].get("ex_termination_date")) or "Indefinite"
                        )
                    else:
                        exclusion_type = None
                        excluding_agency = None
                        ex_active_date = None
                        ex_termination_date = None

                    if matched:
                        match_log.write(
                            f"Matched exclusions for UEI {entity_id} | {legal_business_name} | "
                            f"{len(matched)} record(s) | First agency: {excluding_agency}, "
                            f"Type: {exclusion_type}, Active: {ex_active_date}\n"
                        )

                    if not country_code:
                        log.write(
                            f"Row {row_num} warning: country_code is empty | Entity ID: {entity_id}\n"
                        )

                    if len(row) < 40:
                        log.write(
                            f"Row {row_num} skipped: too few fields ({len(row)}) | Data: {row}\n"
                        )
                        continue

                    writer.writerow(
                        [
                            entity_id,
                            legal_business_name,
                            cage_code,
                            country_code,
                            state_or_province,
                            city,
                            zip_code,
                            address_line1,
                            address_line2,
                            registration_date,
                            expiration_date,
                            certifications,
                            naics_primary,
                            exclusions,
                            is_excluded,
                            exclusion_type,
                            excluding_agency,
                            ex_active_date,
                            ex_termination_date,
                        ]
                    )
                    total_records += 1

                except Exception as e:
                    log.write(f"Row {row_num} skipped: {str(e)} | Data: {row}\n")

    except Exception as e:
        print(f"Error parsing SAM file: {e}")

    return total_records


def copy_into_sam_entities(csv_path: str):
    """
    Uses PostgreSQL COPY command to insert enriched SAM data from a CSV into sam_entities.
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not set")
        return

    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()

        create_table_query = """
        CREATE TABLE IF NOT EXISTS sam_entities (
           "entity_id" text NOT NULL,
            "legal_business_name" text NOT NULL,
            "cage_code" text,
            "country_code" text,
            "state_or_province" text,
            "city" text,
            "zip_code" text,
            "registration_date" text NOT NULL,
            "expiration_date" text,
            "address_line1" text,
            "address_line2" text,
            "certifications" text DEFAULT '',
            "naics_primary" text DEFAULT '',
            "exclusions" text DEFAULT '',
            "review_requests" int4 DEFAULT 0,
            "riskScore" float4,
            "lastVerified" timestamp,
            "isVerified" bool NOT NULL DEFAULT false,
            "is_excluded" boolean DEFAULT false,
            "exclusion_type" text,
            "excluding_agency" text,
            "ex_active_date" text,
            "ex_termination_date" text
        );
        """
        cursor.execute(create_table_query)
        conn.commit()

        # Clear table for fresh insert
        print(f"emptying table\n")
        cursor.execute("TRUNCATE TABLE sam_entities;")

        # Perform bulk COPY
        print("Starting bulk copy...")
        with open(csv_path, "r", encoding="utf-8") as f:
            cursor.copy_expert(
                """
                COPY sam_entities (
                   entity_id, legal_business_name, cage_code, country_code,
                    state_or_province, city, zip_code, address_line1, address_line2,
                    registration_date, expiration_date, certifications,
                    naics_primary, exclusions,
                    is_excluded, exclusion_type, excluding_agency, ex_active_date, ex_termination_date
                ) FROM STDIN WITH CSV
                """,
                f,
            )

        conn.commit()
        cursor.close()
        conn.close()
        print(f"Successfully copied data from {csv_path} into sam_entities.")

    except Exception as e:
        print(f"Error during COPY into sam_entities: {e}")


def process_sam_data_with_exclusions(data_file_path: str, exclusion_dict: dict):
    """
    Parses SAM data into a temporary CSV, enriches with exclusions, and loads it into the database.
    """
    print(f"Processing SAM data from: {data_file_path}")
    with tempfile.NamedTemporaryFile(
        mode="w+", encoding="utf-8", newline="", delete=False
    ) as tmp_csv:
        temp_csv_path = tmp_csv.name
        record_count = parse_sam_dat_file_with_exclusions(
            data_file_path, temp_csv_path, exclusion_dict
        )
        print(f"Parsed {record_count} records into temp CSV.")

        if record_count:
            copy_into_sam_entities(temp_csv_path)
        else:
            print("No records to copy.")
    os.remove(temp_csv_path)


def main():

    # # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Construct the relative path to the data file (adjust as needed)
    data_file_path = os.path.join(
        script_dir, "..", "..", "..", "lib", "SAM_PUBLIC_UTF-8_MONTHLY_V2_20250406.dat"
    )
    data_file_path = os.path.normpath(data_file_path)

    from exclusion_dict_loader import load_exclusion_dict_from_excel

    # Set the actual path to your exclusions Excel file
    exclusion_file_path = os.path.normpath(
        os.path.join(
            script_dir,
            "..",
            "..",
            "..",
            "lib",
            "SAM_Exclusions_Public_Extract_V2_25096.CSV",
        )
    )

    # Load the exclusion dictionary
    exclusion_dict = load_exclusion_dict_from_excel(exclusion_file_path)

    if os.path.exists(data_file_path):
        process_sam_data_with_exclusions(data_file_path, exclusion_dict)
    else:
        print(f"Error: File not found at {data_file_path}")


if __name__ == "__main__":
    load_dotenv()
    main()
