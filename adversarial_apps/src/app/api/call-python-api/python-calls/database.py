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


def add_remove_favorite(username: str, identifier: str, company_type: str) -> dict:
    """
    Add or remove a favorite company for the user, supporting both SEC and SAM companies.

    :param username: Username of the user
    :param identifier: CIK (SEC) or UEI (SAM)
    :param company_type: "SEC" or "SAM"
    :return: Message indicating success or failure
    """
    try:
        with psycopg2.connect(os.getenv("DATABASE_URL")) as connection:
            with connection.cursor() as cursor:

                user_id = get_user_id(username, cursor)

                if not user_id:
                    return {
                        "status": "error",
                        "message": f"User '{username}' not found.",
                    }
                # Check if the company exists in the database
                if company_type == "SEC":
                    cursor.execute('SELECT 1 FROM "COMPANIES" WHERE "CIK" = %s', (identifier,))
                else:
                    cursor.execute('SELECT 1 FROM "SAM_COMPANIES" WHERE "UEI" = %s', (identifier,))

                company_exists = cursor.fetchone()

               

                if not company_exists:
                    # since company does not exist, we need to add it to the database before we can add it to favorites
                    # do the the CIK in FAVORITES table is a foreign key to the CIK in COMPANIES table
                    if company_type == "SEC":
                        cursor.execute(
                            'INSERT INTO "COMPANIES" ("CIK", "isVerified", "riskScore") VALUES (%s, %s, %s)',
                            (identifier, False, 0)
                        )
                    else:
                        cursor.execute(
                            'INSERT INTO "SAM_COMPANIES" ("UEI", "isVerified", "riskScore") VALUES (%s, %s, %s)',
                            (identifier, False, 0)
                        )
                    connection.commit()

                # Check if the user has already favorited the company
                cursor.execute(
                    'SELECT 1 FROM "FAVORITES" WHERE "userId" = %s AND "companyId" = %s AND "type" = %s',
                    (user_id, identifier, company_type)
                )
                favorite_exists = cursor.fetchone()

                if favorite_exists:
                    # If the favorite exists, remove it
                    cursor.execute(
                        'DELETE FROM "FAVORITES" WHERE "userId" = %s AND "companyId" = %s AND "type" = %s',
                        (user_id, identifier, company_type)
                    )
                    connection.commit()
                    return {
                        "status": "success",
                        "message": f"Removed {company_type} company with ID {identifier} from favorites for {username}."
                    }
                else:
                    # If the favorite does not exist, add it
                    cursor.execute(
                        'INSERT INTO "FAVORITES" ("userId", "companyId", "type") VALUES (%s, %s, %s)',
                        (user_id, identifier, company_type)
                    )
                    connection.commit()
                    return {
                        "status": "success",
                        "message": f"Added {company_type} company with ID {identifier} to favorites for {username}."
                    }
    except psycopg2.Error as e:
        return {"status": "error", "message": f"Database error: {e}"}


def get_favorites(username: str) -> dict:
    """
    Retrieve the list of favorited companies for the user.

    :param username: Username of the user
    :return: Dictionary containing the list of favorited companies
    """
    try:
        with psycopg2.connect(os.getenv("DATABASE_URL")) as connection:
            with connection.cursor() as cursor:

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
                    'SELECT "companyId", "type" FROM "FAVORITES" WHERE "userId" = %s',
                    (user_id,)
                )
                favorites = cursor.fetchall()

                sec_favorites = [fav[0] for fav in favorites if fav[1] == "SEC"]
                sam_favorites = [fav[0] for fav in favorites if fav[1] == "SAM"]

                return {
                    "status": "success",
                    "sec_favorites": sec_favorites,
                    "sam_favorites": sam_favorites
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


def get_company_score(cik: str) -> dict:
    """
    Retrieve the risk score for a verified company based on the CIK number.

    :param cik: CIK number of the company
    :return: Dictionary containing the risk score
    """
    try:
        with psycopg2.connect(os.getenv("DATABASE_URL")) as connection:
            with connection.cursor() as cursor:

                # Combined query to check if the company exists, is verified, and retrieve riskScore
                cursor.execute(
                    'SELECT "isVerified", "riskScore" FROM "COMPANIES" WHERE "CIK" = %s',
                    (cik,),
                )
                result = cursor.fetchone()

                # If the company is not found
                if not result:
                    return {
                        "status": "error",
                        "message": f"Company with CIK {cik} not found.",
                    }

                is_verified, risk_score = result

                # the score must be verified and reviewed before being returned
                if not is_verified:
                    return {
                        "status": "error",
                        "message": f"Company with CIK {cik} is not verified.",
                    }

                # If company is verified, return the risk score
                return {
                    "status": "success",
                    "riskScore": risk_score,
                }

    except psycopg2.Error as e:
        return {"status": "error", "message": f"Database error: {e}"}


def update_company_score(cik: str, risk_score: float) -> dict:
    """
    Update the risk score for a company based on the CIK number.

    :param cik: CIK number of the company
    :param risk_score: New risk score for the company
    :return: Dictionary containing the updated risk score
    """
    try:
        with psycopg2.connect(os.getenv("DATABASE_URL")) as connection:
            with connection.cursor() as cursor:

                # checks if company is in the database and if not adds them
                cursor.execute('SELECT 1 FROM "COMPANIES" WHERE "CIK" = %s', (cik,))
                company_exists = cursor.fetchone()

                if not company_exists:
                    cursor.execute(
                        'INSERT INTO "COMPANIES" ("CIK", "isVerified", "riskScore") VALUES (%s, %s, %s)',
                        (cik, False, 0),
                    )
                    connection.commit()

                # Update the risk score for the company and sets it to be verified
                # we set reviewRequests to 0 since now the socre has been updated so those requests have been satisfied
                cursor.execute(
                    'UPDATE "COMPANIES" SET "riskScore" = %s, "isVerified" = TRUE, "lastVerified" = NOW(), "reviewRequests" = 0 WHERE "CIK" = %s',
                    (risk_score, cik),
                )

                return {
                    "status": "success",
                    "message": f"Risk score updated for company with CIK {cik}.",
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

    ws_company_data.append(["CIK", "Company Name", "Address", "Phone", "Risk Score"])

    # Get the list of favorited companies for the user
    favorites = get_favorites(username)

    # displays the data in the excel sheet
    for cik in favorites["favorites"]:
        # Get the company name and risk score
        company_score = get_company_score(cik)

        company_data = get_sec_data(cik)

        company_info = company_data.get("company", {})

        formatted_address = (
            f"{company_info.get('address', 'N/A')}"
            f"{', ' + company_info['street2'] if company_info.get('street2') else ''}, "
            f"{company_info.get('city', 'N/A')}, "
            f"{company_info.get('stateOrCountryDescription', 'N/A')} "
            f"{company_info.get('zipCode', 'N/A')}"
        )

        if company_score["status"] == "success":
            ws_company_data.append(
                [
                    cik,
                    company_data["company"]["name"],
                    formatted_address,
                    company_data["company"]["phone"],
                    company_score["riskScore"],
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


def request_company_review(username: str, cik: str) -> dict:
    """
    Process a review request for a company:
    - Retrieves the user's ID from the USERS table.
    - Checks if the user has already requested a review for the given company.
    - Ensures the company exists in COMPANIES:
         If it doesn't exist, inserts a new record with reviewRequests set to 0.
    - Inserts a new record in REVIEW_REQUESTS.
    - Increments the reviewRequests field in COMPANIES by 1.

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

        # 2. Ensure the company exists in COMPANIES.
        cursor.execute(
            'SELECT "reviewRequests" FROM "COMPANIES" WHERE "CIK" = %s', (cik,)
        )
        company_row = cursor.fetchone()
        if not company_row:
            # Insert the company with default values if it doesn't exist.
            cursor.execute(
                'INSERT INTO "COMPANIES" ("CIK", "isVerified", "riskScore", "reviewRequests") VALUES (%s, %s, %s, %s)',
                (cik, False, 0, 0),
            )
            connection.commit()  # Commit the new company insertion.

        # 3. Check if the user has already requested a review for this company.
        cursor.execute(
            'SELECT 1 FROM "REVIEW_REQUESTS" WHERE "userId" = %s AND "companyCIK" = %s',
            (user_id, cik),
        )
        exists = cursor.fetchone()
        if exists:
            return {
                "status": "error",
                "message": "You have already requested a review for this company.",
            }

        # 4. Insert a record into REVIEW_REQUESTS.
        cursor.execute(
            'INSERT INTO "REVIEW_REQUESTS" ("userId", "companyCIK") VALUES (%s, %s)',
            (user_id, cik),
        )

        # 5. Increment reviewRequests in COMPANIES.
        cursor.execute(
            'UPDATE "COMPANIES" SET "reviewRequests" = COALESCE("reviewRequests", 0) + 1 WHERE "CIK" = %s',
            (cik,),
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
    'reviewRequests' field in the COMPANIES table. Only returns companies where
    reviewRequests > 0.

    :return: Dictionary with status and a list of objects, each having 'cik' and 'requestCount'
    """
    connection = None
    try:
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()

        # Query the COMPANIES table for companies with reviewRequests > 0
        cursor.execute(
            'SELECT "CIK", "reviewRequests" FROM "COMPANIES" WHERE "reviewRequests" > 0 ORDER BY "reviewRequests" DESC'
        )
        rows = cursor.fetchall()
        review_requests = (
            [{"cik": row[0], "requestCount": row[1]} for row in rows] if rows else []
        )

        return {"status": "success", "reviewRequests": review_requests}

    except psycopg2.Error as e:
        if connection:
            connection.rollback()
        return {"status": "error", "message": f"Database error: {e}"}
    finally:
        if connection:
            cursor.close()
            connection.close()


def remove_all_review_requests(cik: str) -> dict:
    """
    Removes all review requests for a specific company.

    - Resets the reviewRequests count in the COMPANIES table to 0.
    - Deletes all corresponding entries for that company in the REVIEW_REQUESTS table.

    :param cik: The CIK number of the company.
    :return: Dictionary with status and a message.
    """
    connection = None
    try:
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()

        # Check if the company exists
        cursor.execute(
            'SELECT "reviewRequests" FROM "COMPANIES" WHERE "CIK" = %s', (cik,)
        )
        row = cursor.fetchone()
        if not row:
            return {"status": "error", "message": f"Company with CIK {cik} not found."}

        # 1. Reset reviewRequests count in COMPANIES table to 0
        cursor.execute(
            'UPDATE "COMPANIES" SET "reviewRequests" = 0 WHERE "CIK" = %s', (cik,)
        )

        # 2. Remove all entries for the company in REVIEW_REQUESTS
        cursor.execute('DELETE FROM "REVIEW_REQUESTS" WHERE "companyCIK" = %s', (cik,))

        connection.commit()
        return {
            "status": "success",
            "message": f"All review requests removed for company {cik}.",
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
         cursor.execute("""
             SELECT legal_business_name, entity_id
             FROM sam_entities
             WHERE legal_business_name ILIKE %s
             LIMIT 10;
         """, (f"%{search_term}%",))
         rows = cursor.fetchall()
         cursor.close()
         conn.close()
 
         results = []
         for row in rows:
             results.append({
                 "company_name": row[0],
                 "uei": row[1]
             })
         return {"status": "success", "results": results}
     except Exception as e:
         return {"status": "error", "message": str(e)}
     

def FetchSamData(uei: str) -> dict:
     """
     Retrieves detailed SAM company data from the database using the Unique Entity ID (UEI).
     """
     import os
     import psycopg2
 
     db_url = os.getenv("DATABASE_URL")
     if not db_url:
         return {"status": "error", "message": "DATABASE_URL not set."}
     
     try:
         conn = psycopg2.connect(db_url)
         cursor = conn.cursor()
         cursor.execute("""
             SELECT legal_business_name, cage_code, country_code,
                    state_or_province, city, zip_code, address_line1, address_line2,
                    registration_date, expiration_date
             FROM sam_entities
             WHERE entity_id = %s
             LIMIT 1;
         """, (uei,))
         row = cursor.fetchone()
         cursor.close()
         conn.close()
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
                 "expiration_date": row[9] if row[9] else None
             }
             return {"status": "success", "company": company}
         else:
             return {"status": "error", "message": "No company found with the provided UEI."}
     except Exception as e:
         return {"status": "error", "message": str(e)}