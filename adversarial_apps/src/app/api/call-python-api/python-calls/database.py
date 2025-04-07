import base64
import os
from io import BytesIO

import psycopg2
from edgar import get_sec_data
from openpyxl import Workbook


def add_user(username: str, password_hashed: str, company: str) -> dict:
    """
    Add user to the system

    :param username: username of user
    :param password_hashed: hashed password of user
    :param company: company of user
    :return: message indicating success or failure
    """

    connection = None

    try:
        # Connect to the PostgreSQL database using the URI
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()

        # Check if the username exists
        cursor.execute('SELECT username FROM "USERS" WHERE username = %s', (username,))
        username_exists = cursor.fetchone()  # fetches the first result from query

        # if we get a result from the query, means we have a at least 1 user already with username
        if username_exists:
            return {
                "status": "error",
                "message": f"Username '{username}' already exists.",
            }
        else:
            # if nothing, then we can add user since still unique

            # Query, which inserts user info with information provided
            # if username is in database, we get no result
            query = """
            INSERT INTO "public" . "USERS" (username, password, company, "isReviewer")
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (username) DO NOTHING
            RETURNING username;
            """

            # Execute the query with the provided data
            cursor.execute(query, (username, password_hashed, company, False))

            # RETURNING in query returns username, this gets the username from that return
            result = cursor.fetchone()

            if result:
                # Finalizes the query to the database to be saved
                connection.commit()
                return {
                    "status": "success",
                    "message": f"User {result[0]} added successfully",
                }
            else:
                return {
                    "status": "error",
                    "message": f"No user inserted (conflict detected).",
                }

    except psycopg2.Error as e:
        print(f"Database error: {e}")
    finally:
        # Ensure the connection is closed, as finished with code
        if connection:
            cursor.close()
            connection.close()


def get_password(username: str) -> dict:
    """
    Retrieve hashed password for user based on username

    :param username: username of user
    :return: dictionary with hashed password
    """

    connection = None

    try:
        # Connect to the PostgreSQL database using the URI
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()

        # Query to get the hashed password for the provided username
        cursor.execute('SELECT password FROM "USERS" WHERE username = %s', (username,))
        password = cursor.fetchone()

        if password:
            return {"status": "success", "password": password[0]}
        else:
            return {"status": "error", "message": f"Username '{username}' not found."}

    except psycopg2.Error as e:
        print(f"Database error: {e}")
    finally:
        # Ensure the connection is closed, as finished with code
        if connection:
            cursor.close()
            connection.close()

    return {
        "status": "error",
        "message": f"An error occurred retrieving password for '{username}'",
    }


def get_reviewer_status(username: str) -> dict:
    """
    Retrieve reviewer status for user based on username

    :param username: username of user
    :return: dictionary with reviewer status value
    """
    connection = None

    try:
        # Connect to the PostgreSQL database using the URI
        db_url = os.getenv("DATABASE_URL")

        connection = psycopg2.connect(db_url)
        cursor = connection.cursor()

        # Query to get the hashed password for the provided username
        cursor.execute(
            'SELECT "isReviewer" FROM "USERS" WHERE username = %s', (username,)
        )
        reviewerStatus = cursor.fetchone()

        if reviewerStatus:
            return {"status": "success", "reviewerStatus": reviewerStatus[0]}
        else:
            return {"status": "error", "message": f"Username '{username}' not found."}

    except psycopg2.Error as e:
        return {"status": "error", "message": str(e)}
    finally:
        # Ensure the connection is closed, as finished with code
        if connection:
            cursor.close()
            connection.close()

    return {
        "status": "error",
        "message": f"An error occurred retrieving reviewer status for '{username}'",
    }


def add_remove_favorite(
    username: str, identifier: str, source: str, entityName: str
) -> dict:
    """
    Add or remove a favorite company for the user, supporting both SEC and SAM companies.

    :param username: Username of the user
    :param identifier: CIK (SEC) or UEI (SAM)
    :param company_type: "SEC" or "SAM"
    :return: Message indicating success or failure
    """
    connection = None
    try:
        db_url = os.getenv("DATABASE_URL")
        connection = psycopg2.connect(db_url)
        cursor = connection.cursor()

        user_id = get_user_id(username, cursor)

        if not user_id:
            return {
                "status": "error",
                "message": f"User '{username}' not found.",
            }

        if source == "SEC":
            table = "COMPANIES"
            id_column = "CIK"
        else:
            table = "sam_entities"
            id_column = "entity_id"

        # Check if the company exists in the database
        cursor.execute(
            f'SELECT 1 FROM "{table}" WHERE "{id_column}" = %s', (identifier,)
        )

        company_exists = cursor.fetchone()

        if not company_exists:
            # since company does not exist, we need to add it to the database before we can add it to favorites
            # do the the CIK in FAVORITES table is a foreign key to the CIK in COMPANIES table
            if source == "SEC":
                cursor.execute(
                    'INSERT INTO "COMPANIES" ("CIK", "isVerified", "riskScore", "entityName") VALUES (%s, %s, %s, %s)',
                    (identifier, False, 0, entityName),
                )
            connection.commit()

        # Check if the user has already favorited the company
        cursor.execute(
            'SELECT 1 FROM "FAVORITES" WHERE "userId" = %s AND "identifier" = %s AND "source" = %s',
            (user_id, identifier, source),
        )
        favorite_exists = cursor.fetchone()

        if favorite_exists:
            # If the favorite exists, remove it
            cursor.execute(
                'DELETE FROM "FAVORITES" WHERE "userId" = %s AND "identifier" = %s AND "source" = %s',
                (user_id, identifier, source),
            )
            connection.commit()
            return {
                "status": "success",
                "message": f"Removed {source} company with ID {identifier} from favorites for {username}.",
            }
        else:
            # If the favorite does not exist, add it
            cursor.execute(
                'INSERT INTO "FAVORITES" ("userId", "identifier", "source") VALUES (%s, %s, %s)',
                (user_id, identifier, source),
            )
            connection.commit()
            return {
                "status": "success",
                "message": f"Added {source} company with ID {identifier} to favorites for {username}.",
            }
    except psycopg2.Error as e:
        return {"status": "error", "message": f"Database error: {e}"}


def get_favorites(username: str) -> dict:
    """
    Retrieve the list of favorited companies for the user.

    :param username: Username of the user
    :return: Dictionary containing the list of favorited companies
    """
    connection = None
    try:
        db_url = os.getenv("DATABASE_URL")
        connection = psycopg2.connect(db_url)
        cursor = connection.cursor()

        user_id = get_user_id(username, cursor)

        # If the user does not exist, return an error message
        if not user_id:
            return {
                "status": "error",
                "message": f"User '{username}' not found.",
            }

        # Query to get the list of favorited companies
        # Query for both SEC and SAM favorites
        cursor.execute(
            'SELECT "identifier", "source" FROM "FAVORITES" WHERE "userId" = %s',
            (user_id,),
        )
        favorites = cursor.fetchall()

        sec_favorites = [fav[0] for fav in favorites if fav[1] == "SEC"]
        sam_favorites = [fav[0] for fav in favorites if fav[1] == "SAM"]

        return {
            "status": "success",
            "sec_favorites": sec_favorites,
            "sam_favorites": sam_favorites,
        }
    except psycopg2.Error as e:
        return {"status": "error", "message": f"Database error: {e}"}


def get_user_id(username: str, cursor) -> int:
    """
    Retrieve the user ID for the provided username.

    :param username: Username of the user
    :param cursor: Cursor object to execute the query (already connected to the database)
    :return: User ID
    """

    try:
        cursor.execute('SELECT id FROM "USERS" WHERE username = %s', (username,))
        user = cursor.fetchone()

        # if the entry is not found, then no user so no ID
        if not user:
            return None
        # the id is the first element in the user row, which is what was fetched
        return user[0]
    except psycopg2.Error as e:
        return None


def get_company_score(identifier: str, source: str) -> dict:
    """
    Retrieve the risk score for a verified company based on the CIK number.

    :param cik: CIK number of the company
    :return: Dictionary containing the risk score
    """
    connection = None
    try:
        db_url = os.getenv("DATABASE_URL")
        connection = psycopg2.connect(db_url)
        cursor = connection.cursor()

        if source == "SEC":
            table = "COMPANIES"
            id_column = "CIK"
        else:
            table = "sam_entities"
            id_column = "entity_id"
        # Combined query to check if the company exists, is verified, and retrieve riskScore
        cursor.execute(
            f'SELECT "isVerified", "riskScore" FROM "{table}" WHERE "{id_column}" = %s',
            (identifier,),
        )
        result = cursor.fetchone()

        # If the company is not found
        if not result:
            return {
                "status": "error",
                "message": f"Company with {id_column} {identifier} not found.",
            }

        is_verified, risk_score = result

        # the score must be verified and reviewed before being returned
        if not is_verified:
            return {
                "status": "error",
                "message": f"Company with {id_column} {identifier} is not verified.",
            }

        # If company is verified, return the risk score
        return {
            "status": "success",
            "riskScore": risk_score,
        }

    except psycopg2.Error as e:
        return {"status": "error", "message": f"Database error: {e}"}


def update_company_score(
    identifier: str, source: str, risk_score: float, entityName: str
) -> dict:
    """
    Update the risk score for a company based on the identifier (CIK or UEI) and source.

    :param identifier: CIK for SEC or UEI for SAM
    :param source: "SEC" or "SAM"
    :param risk_score: New risk score
    :return: Dictionary containing the update status
    """
    connection = None
    try:
        db_url = os.getenv("DATABASE_URL")
        connection = psycopg2.connect(db_url)
        cursor = connection.cursor()

        if source == "SEC":
            table = "COMPANIES"
            id_column = "CIK"

            # Check if the SEC company exists
            cursor.execute(
                f'SELECT 1 FROM "{table}" WHERE "{id_column}" = %s', (identifier,)
            )
            company_exists = cursor.fetchone()

            # Insert if it doesn't exist
            if not company_exists:
                if table == "COMPANIES":
                    insert_query = f"""
                    INSERT INTO "{table}" ("{id_column}", "isVerified", "riskScore", "lastVerified", "review_requests", "entityName")
                    VALUES (%s, %s, %s, NOW(), 0, %s)
                    """
                    insert_values = (identifier, False, 0, entityName)
                else:
                    insert_query = f"""
                        INSERT INTO "{table}" ("{id_column}", "isVerified", "riskScore", "lastVerified", "review_requests")
                        VALUES (%s, %s, %s, NOW(), 0)
                    """
                    insert_values = (identifier, False, 0)
                cursor.execute(insert_query, insert_values)
                connection.commit()

        else:
            table = "sam_entities"
            id_column = "entity_id"

        # Update riskScore and verification
        update_query = f"""
            UPDATE "{table}"
            SET "riskScore" = %s,
                "isVerified" = TRUE,
                "lastVerified" = NOW(),
                "review_requests" = 0
            WHERE "{id_column}" = %s
        """
        cursor.execute(update_query, (risk_score, identifier))
        connection.commit()

        return {
            "status": "success",
            "message": f"Risk score updated for company with {id_column} {identifier}.",
        }

    except psycopg2.Error as e:
        return {"status": "error", "message": f"Database error: {e}"}


def generate_excel(username: str) -> dict:
    """
    Generate an Excel file, save it in memory, and return it as a Base64-encoded string.
    """
    wb = Workbook()
    ws_company_data = wb.active
    ws_company_data.title = f"Company Data"

    # updates deminsions of the columns
    ws_company_data.column_dimensions["A"].width = 15
    ws_company_data.column_dimensions["B"].width = 35
    ws_company_data.column_dimensions["C"].width = 50
    ws_company_data.column_dimensions["D"].width = 15
    ws_company_data.column_dimensions["E"].width = 15
    ws_company_data.column_dimensions["F"].width = 10
    ws_company_data.column_dimensions["G"].width = 50  # For the More Info URL

    ws_company_data.append(
        ["Identifier", "Company Name", "Address", "Phone", "Risk Score", "Source"]
    )

    # Get the list of favorited companies for the user
    favorites = get_favorites(username)
    sec_favorites = favorites.get("sec_favorites", [])
    sam_favorites = favorites.get("sam_favorites", [])

    # displays the data in the excel sheet
    for cik in sec_favorites:
        # Get the company name and risk score
        company_score = get_company_score(cik, "SEC")

        company_data = get_sec_data(cik)

        company_info = company_data.get("company", {})

        formatted_address = (
            f"{company_info.get('address', 'N/A')}"
            f"{', ' + company_info['street2'] if company_info.get('street2') else ''}, "
            f"{company_info.get('city', 'N/A')}, "
            f"{company_info.get('stateOrCountryDescription', 'N/A')} "
            f"{company_info.get('zipCode', 'N/A')}"
        )
        more_info_url = f"https://adversarialapps.com/company/{cik}"

        if company_score["status"] == "success":
            ws_company_data.append(
                [
                    cik,
                    company_data["company"]["name"],
                    formatted_address,
                    company_data["company"]["phone"],
                    company_score["riskScore"],
                    "SEC",
                    more_info_url,
                ]
            )
        else:
            ws_company_data.append(
                [
                    cik,
                    company_data["company"]["name"],
                    formatted_address,
                    company_data["company"]["phone"],
                    "Not Verified",
                    "SEC",
                    more_info_url,
                ]
            )

    # Process SAM Favorites
    for uei in sam_favorites:
        company_score = get_company_score(uei, "SAM")
        company_data = FetchSamData(uei)
        company_info = company_data.get("company", {})

        formatted_address = (
            f"{company_info.get('address_line1', 'N/A')}"
            f"{', ' + company_info['address_line2'] if company_info.get('address_line2') else ''}, "
            f"{company_info.get('city', 'N/A')}, "
            f"{company_info.get('state_or_province', 'N/A')} "
            f"{company_info.get('zip_code', 'N/A')}"
        )
        more_info_url = f"https://adversarialapps.com/company/sam/{uei}"
        if company_score["status"] == "success":
            ws_company_data.append(
                [
                    uei,
                    company_info.get("company_name", "N/A"),
                    formatted_address,
                    "N/A",  # Phone not available for SAM, can adjust if you store it
                    company_score["riskScore"],
                    "SAM",
                    more_info_url,
                ]
            )
        else:
            ws_company_data.append(
                [
                    uei,
                    company_info.get("company_name", "N/A"),
                    formatted_address,
                    "N/A",  # Phone not available for SAM, can adjust if you store it
                    "Not Verified",
                    "SAM",
                    more_info_url,
                ]
            )

    excel_stream = BytesIO()
    wb.save(excel_stream)
    excel_stream.seek(0)  # Go to the beginning of the BytesIO stream

    # Convert the binary data to a Base64-encoded string
    encoded_file = base64.b64encode(excel_stream.getvalue()).decode("utf-8")

    return {
        "status": "success",
        "file": encoded_file,  # Return the Base64-encoded file
        "filename": f"{username}_company_data.xlsx",  # Optional: filename for download
    }


def request_company_review(
    username: str, identifier: str, source: str, entityName: str
) -> dict:
    """
    Process a review request for a company:
    - Retrieves the user's ID from the USERS table.
    - Checks if the user has already requested a review for the given company.
    - Ensures the company exists in COMPANIES:
         If it doesn't exist, inserts a new record with review_requests set to 0.
    - Inserts a new record in REVIEW_REQUESTS.
    - Increments the review_requests field in COMPANIES by 1.

    :param username: Username of the requesting user.
    :param cik: CIK number of the company.
    :return: Dictionary with status and message.
    """
    connection = None
    try:
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()

        # 1. Get the user ID from the USERS table.
        cursor.execute('SELECT id FROM "USERS" WHERE username = %s', (username,))
        user_row = cursor.fetchone()
        if not user_row:
            return {"status": "error", "message": f"User '{username}' not found."}
        user_id = user_row[0]

        # 2. Ensure the company exists.
        if source == "SEC":
            table = "COMPANIES"
            id_column = "CIK"
        else:
            table = "sam_entities"
            id_column = "entity_id"

        # Ensure the company exists
        cursor.execute(
            f'SELECT review_requests FROM "{table}" WHERE "{id_column}" = %s',
            (identifier,),
        )
        company_row = cursor.fetchone()
        if not company_row:
            # Insert the company with default values if it doesn't exist.
            if table == "COMPANIES":
                cursor.execute(
                    f'INSERT INTO "{table}" ("{id_column}", "isVerified", "riskScore", "review_requests", "entityName") VALUES (%s, %s, %s, %s, %s)',
                    (identifier, False, 0, 0, entityName),
                )
            else:
                cursor.execute(
                    f'INSERT INTO "{table}" ("{id_column}", "isVerified", "riskScore", "review_requests") VALUES (%s, %s, %s, %s)',
                    (identifier, False, 0, 0),
                )
            connection.commit()  # Commit the new company insertion.

        # 3. Check if the user has already requested a review for this company.
        cursor.execute(
            'SELECT 1 FROM "REVIEW_REQUESTS" WHERE "userId" = %s AND "identifier" = %s AND "source" = %s',
            (user_id, identifier, source),
        )
        exists = cursor.fetchone()
        if exists:
            return {
                "status": "error",
                "message": "You have already requested a review for this company.",
            }

        # 4. Insert a record into REVIEW_REQUESTS.
        cursor.execute(
            'INSERT INTO "REVIEW_REQUESTS" ("userId", "identifier", "source") VALUES (%s, %s, %s)',
            (user_id, identifier, source),
        )

        # 5. Increment review_requests in COMPANIES.
        cursor.execute(
            f'UPDATE "{table}" SET "review_requests" = COALESCE("review_requests", 0) + 1 WHERE "{id_column}" = %s',
            (identifier,),
        )

        connection.commit()
        return {
            "status": "success",
            "message": "Review request submitted successfully.",
        }

    except psycopg2.Error as e:
        if connection:
            connection.rollback()
        return {"status": "error", "message": f"Database error: {e}"}
    finally:
        if connection:
            cursor.close()
            connection.close()


def get_review_requests() -> dict:
    """
    Retrieve a list of companies that have pending review requests by checking the
    'review_requests' field in the COMPANIES table. Only returns companies where
    review_requests > 0.

    :return: Dictionary with status and a list of objects, each having 'cik' and 'requestCount'
    """
    connection = None
    try:
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()

        # Query the COMPANIES table for companies with reviewRreview_requestsequests > 0
        cursor.execute(
            'SELECT "CIK" AS identifier, "review_requests" FROM "COMPANIES" WHERE "review_requests" > 0'
        )
        company_rows = cursor.fetchall()

        cursor.execute(
            "SELECT entity_id AS identifier, review_requests FROM sam_entities WHERE review_requests > 0"
        )
        sam_rows = cursor.fetchall()

        combined = [
            {"identifier": row[0], "requestCount": row[1], "source": "SEC"}
            for row in company_rows
        ] + [
            {"identifier": row[0], "requestCount": row[1], "source": "SAM"}
            for row in sam_rows
        ]
        # ✅ Sort by requestCount descending
        combined.sort(key=lambda x: x["requestCount"], reverse=True)

        return {"status": "success", "reviewRequests": combined}

    except psycopg2.Error as e:
        if connection:
            connection.rollback()
        return {"status": "error", "message": f"Database error: {e}"}
    finally:
        if connection:
            cursor.close()
            connection.close()


def remove_all_review_requests(identifier: str, source: str) -> dict:
    """
    Removes all review requests for a specific company.

    - Resets the review_requests count in the COMPANIES table to 0.
    - Deletes all corresponding entries for that company in the REVIEW_REQUESTS table.

    :param cik: The CIK number of the company.
    :return: Dictionary with status and a message.
    """
    connection = None
    try:
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()

        if source == "SEC":
            table = "COMPANIES"
            id_column = "CIK"
        else:
            table = "sam_entities"
            id_column = "entity_id"

        # Check if the company exists
        cursor.execute(
            f'SELECT "review_requests" FROM "{table}" WHERE "{id_column}" = %s',
            (identifier,),
        )
        row = cursor.fetchone()
        if not row:
            return {
                f"status": "error",
                "message": f"Company with {id_column} {identifier} not found.",
            }

        # 1. Reset review_requests count in COMPANIES table to 0
        cursor.execute(
            f'UPDATE "{table}" SET "review_requests" = 0 WHERE "{id_column}" = %s',
            (identifier,),
        )

        # 2. Remove all entries for the company in REVIEW_REQUESTS
        cursor.execute(
            'DELETE FROM "REVIEW_REQUESTS" WHERE "identifier" = %s AND "source" = %s',
            (identifier, source),
        )

        connection.commit()
        return {
            "status": "success",
            "message": f"All review requests removed for company {identifier}.",
        }

    except psycopg2.Error as e:
        if connection:
            connection.rollback()
        return {"status": "error", "message": f"Database error: {e}"}
    finally:
        if connection:
            cursor.close()
            connection.close()


def samSearch(search_term: str) -> dict:
    """
    Searches the SAM entities stored in the database for companies matching the search term.
    Returns only the company name and UEI.
    """
    try:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            return {"status": "error", "message": "DATABASE_URL not set."}
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        # Search only by company name (case-insensitive), returning company_name and UEI.
        cursor.execute(
            """
             SELECT legal_business_name, entity_id
             FROM sam_entities
             WHERE legal_business_name ILIKE %s;
         """,
            (f"%{search_term}%",),
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        results = []
        for row in rows:
            results.append({"company_name": row[0], "uei": row[1]})
        return {"status": "success", "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def FetchSamData(uei: str) -> dict:
    """
    Retrieves detailed SAM company data from the database using the Unique Entity ID (UEI).
    """
    connection = None

    try:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            return {"status": "error", "message": "DATABASE_URL not set."}
        connection = psycopg2.connect(db_url)
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT legal_business_name, cage_code, country_code,
                   state_or_province, city, zip_code, address_line1, address_line2,
                   registration_date, expiration_date, "riskScore"
            FROM sam_entities
            WHERE entity_id = %s
            LIMIT 1;
            """,
            (uei,),
        )
        row = cursor.fetchone()
        cursor.close()
        connection.close()

        if row:
            company = {
                "company_name": row[0],
                "cage_code": row[1],
                "country_code": row[2],
                "state_or_province": row[3],
                "city": row[4],
                "zip_code": row[5],
                "address_line1": row[6],
                "address_line2": row[7],
                "registration_date": row[8] if row[8] else None,
                "expiration_date": row[9] if row[9] else None,
                "riskScore": row[10],
            }
            return {"status": "success", "company": company}
        else:
            return {
                "status": "error",
                "message": "No company found with the provided UEI.",
            }

    except Exception as e:
        return {"status": "error", "message": str(e)}


def get_reviewed_companies() -> dict:
    """
    Retrieve a list of companies that have been reviewed by checking the
    'isVerified' field in the COMPANIES table. Only returns companies where
    isVerified == TRUE.

    :return: Dictionary with status and a list of objects, each having 'cik', 'riskScore', 'lastVerified', and "entityName"
    """
    connection = None
    try:
        db_url = os.getenv("DATABASE_URL")
        connection = psycopg2.connect(db_url)
        cursor = connection.cursor()

        # Query the COMPANIES table for verified companies
        cursor.execute(
            'SELECT "CIK", "riskScore", "lastVerified", "entityName" FROM "COMPANIES" WHERE "isVerified" = TRUE'
        )
        rows = cursor.fetchall()
        reviewed_companies = []
        if rows:
            for row in rows:
                last_verified = row[2]
                # Convert datetime object to ISO 8601 string
                last_verified_str = last_verified.isoformat() if last_verified else None
                reviewed_companies.append(
                    {
                        "cik": row[0],
                        "riskScore": row[1],
                        "lastVerified": last_verified_str,
                        "entityName": row[3],
                    }
                )

        return {"status": "success", "reviewedCompanies": reviewed_companies}

    except psycopg2.Error as e:
        if connection:
            connection.rollback()
        return {"status": "error", "message": f"Database error: {e}"}
    finally:
        if connection:
            cursor.close()
            connection.close()
