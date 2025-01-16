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
    :return: dictionary with status of user addition
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
                print(f"Inserted user: {result[0]}")
            else:
                return {"status": "error", "message": f"No user inserted (conflict detected)."}

            # Finalizes the query to the database to be saved
            connection.commit()

    except psycopg2.Error as e:
        print(f"Database error: {e}")
    finally:
        # Ensure the connection is closed, as finished with code
        if connection:
            cursor.close()
            connection.close()

    return {"status": "success", "message": f"User {username} added successfully"}


# the call-python-api will call it here, and provides the inputActionAndData
# which then determines which part of the API to run
if __name__ == "__main__":

    # loads the environment variables from the .env file to be referenced
    load_dotenv()

    print("test: ", os.getenv("DATABASE_URL"))

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
