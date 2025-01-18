import json
import re
import sys

import requests
from bs4 import BeautifulSoup

import os
from dotenv import load_dotenv

import psycopg2

def obtain_cik_number(search_term: str) -> dict:
    """
    Returns list of companies based on search and their CIK numbers
    :param search_term: string to search for
    :return: dictionary with list of companies and their CIK numbers
    """
    try:
        # Set up the payload to make the search request
        url = "https://www.sec.gov/cgi-bin/cik_lookup"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "User-Agent": "JamesAllen <ja799793@ucf.edu> (Adversarial Apps)",
            "Referer": "https://www.sec.gov/search-filings/cik-lookup",
        }

        # The term to search for
        payload = {"company": search_term}

        response = requests.post(url, headers=headers, data=payload)

        # If the request was successful (status code 200)
        if response.status_code == 200:
            # Parse the HTML to obtain the CIK number and company name
            soup = BeautifulSoup(response.text, "html.parser")

            # Find the <pre> tag that contains the CIK and company data
            pre_tag = soup.find_all("pre")

            cik_data = []

            # Iterate over each <pre> tag and extract CIK and company name
            for pre in pre_tag:
                # Regular expression to match CIK and company name
                matches = re.findall(
                    r"(\d{10})\s+(.*?)\s*$", pre.get_text(), re.MULTILINE
                )
                for cik, company in matches:
                    cik_data.append({"CIK": cik, "Company Name": company})

            # Return the result as a dictionary
            return {"status": "success", "companies": cik_data}
        else:
            return {
                "status": "error",
                "message": f"Failed to fetch data: {response.status_code} {response.text}",
            }

    except Exception as e:
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


def get_sec_data(cik: str) -> dict:
    """
    Retrieve SEC json file for company based on given CIK number

    :param cik: CIK number for company to retrieve data for
    :return: dictionary with json data
    """

    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    headers = {
        "User-Agent": "JamesAllen <ja799793@ucf.edu> (Adversarial Apps)",
        "Accept-Encoding": "gzip, deflate",
        "Host": "data.sec.gov",
    }
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return {"status": "success", "data": response.json()}  # Return JSON data
    else:
        return {
            "status": "error",
            "message": f"Unable to retrieve data for CIK {cik} (Status Code: {response.status_code})",
        }

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
        username_exists = cursor.fetchone() # fetches the first result from query

        # if we get a result from the query, means we have a at least 1 user already with username
        if username_exists:
            return {"status": "error", "message": f"Username '{username}' already exists."}
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
                return {"status": "success", "message": f"User {result[0]} added successfully"}
            else:
                return {"status": "error", "message": f"No user inserted (conflict detected)."}

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

    return {"status": "error", "message": f"An error occurred retrieving password for '{username}'"}

def add_remove_favorite(username: str, cik: int) -> dict:
    """
    Add or remove a favorite company for the user.

    :param username: Username of the user
    :param cik: CIK number of the company
    :return: Message indicating success or failure
    """
    try:
        with psycopg2.connect(os.getenv("DATABASE_URL")) as connection:
            with connection.cursor() as cursor:

                user_id = get_user_id(username, cursor)

                if not user_id:
                    return {"status": "error", "message": f"User '{username}' not found."}

                # company must exist in the database first before we can add it to favorites
                cursor.execute('SELECT 1 FROM "COMPANIES" WHERE "CIK" = %s', (cik,))
                company_exists = cursor.fetchone()

                if not company_exists:
                    # since company does not exist, we need to add it to the database before we can add it to favorites
                    # do the the CIK in FAVORITES table is a foreign key to the CIK in COMPANIES table
                    cursor.execute(
                        'INSERT INTO "COMPANIES" ("CIK", "isVerified", "riskScore") VALUES (%s, %s, %s)',
                        (cik, False, 0)
                    )
                    connection.commit()

                # Check if the user has already favorited the company
                cursor.execute(
                    'SELECT 1 FROM "FAVORITES" WHERE "userId" = %s AND "companyCIK" = %s',
                    (user_id, cik),
                )
                favorite_exists = cursor.fetchone()

                if favorite_exists:
                    # If the favorite exists, remove it
                    cursor.execute(
                        'DELETE FROM "FAVORITES" WHERE "userId" = %s AND "companyCIK" = %s',
                        (user_id, cik),
                    )
                    connection.commit()
                    return {
                        "status": "success",
                        "message": f"Removed company with CIK {cik} from favorites for {username}.",
                    }
                else:
                    # If the favorite does not exist, add it
                    cursor.execute(
                        'INSERT INTO "FAVORITES" ("userId", "companyCIK") VALUES (%s, %s)',
                        (user_id, cik),
                    )
                    connection.commit()
                    return {
                        "status": "success",
                        "message": f"Added company with CIK {cik} to favorites for {username}.",
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
                    return {"status": "error", "message": f"User '{username}' not found."}

                # Query to get the list of favorited companies
                cursor.execute(
                    'SELECT "companyCIK" FROM "FAVORITES" WHERE "userId" = %s', (user_id,)
                )
                favorites = cursor.fetchall()

                return {
                    "status": "success",
                    "favorites": [favorite[0] for favorite in favorites],
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

# the call-python-api will call it here, and provides the inputActionAndData
# which then determines which part of the API to run
if __name__ == "__main__":

    # loads the environment variables from the .env file to be referenced
    load_dotenv()

    try:
        # Read JSON data from stdin
        input_action_and_data = json.load(sys.stdin)

        # Each action corresponds to a different function, so setting action
        # determines which API call is being made
        action = input_action_and_data.get("action")
        if action == "obtain_cik_number":
            # Then the inputActionAndData is formatted as such:
            # { action: "obtain_cik_number", search_term: YOUR_SEARCH_TERM }
            result = obtain_cik_number(input_action_and_data.get("search_term"))
        elif action == "get_sec_data":
            result = get_sec_data(input_action_and_data.get("search_term"))
        elif action == "add_user":
            # Then the inputActionAndData is formatted as such:
            # { action: "add_user", username: YOUR_USERNAME, password_hashed: YOUR_PASSWORD, comnpany: YOUR_COMPANY }
            result = add_user(input_action_and_data.get("username"), input_action_and_data.get("password_hashed"), input_action_and_data.get("company"))
        elif action == "get_password":
            # Then the inputActionAndData is formatted as such:
            # { action: "get_password", username: YOUR_USERNAME }
            result = get_password(input_action_and_data.get("username"))
        elif action == "add_remove_favorite":
            # Then the inputActionAndData is formatted as such:
            # { action: "add_favorite", username: YOUR_USERNAME, cik: YOUR_CIK }
            result = add_remove_favorite(input_action_and_data.get("username"), input_action_and_data.get("cik"))
        elif action == "get_favorites":
            # Then the inputActionAndData is formatted as such:
            # { action: "get_favorites", username: YOUR_USERNAME }
            result = get_favorites(input_action_and_data.get("username"))
        else:
            # Process the input data
            result = {"status": "error", "message": "Invalid action"}

        # Print the result as a dictionary (this becomes stdout and the output of the API)
        print(json.dumps(result))

    except Exception as e:
        # Handle any errors that occur during script execution
        print(
            json.dumps({"status": "error", "message": f"An error occurred: {str(e)}"})
        )
        sys.exit(1)  # Exit with non-zero status to indicate an error
