import html
import json
import os
import re
import sys

import psycopg2
import requests
from bs4 import BeautifulSoup
from database import (
    add_remove_favorite,
    add_user,
    get_company_score,
    get_favorites,
    get_password,
    get_reviewer_status,
    update_company_score,
    verify_company,
    request_company_review,
)
from dotenv import load_dotenv
from edgar import (
    get_def_url,
    get_recent_ownerships,
    get_sec_data,
    get_total_common_stocks,
)
from search import obtain_cik_number

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
            # { "action": "obtain_cik_number", "search_term": YOUR_SEARCH_TERM }
            result = obtain_cik_number(input_action_and_data.get("search_term"))
        elif action == "get_sec_data":
            result = get_sec_data(input_action_and_data.get("search_term"))
        elif action == "add_user":
            # Then the inputActionAndData is formatted as such:
            # { "action": "add_user", "username": YOUR_USERNAME, "password_hashed": YOUR_PASSWORD, "comnpany": YOUR_COMPANY }
            result = add_user(
                input_action_and_data.get("username"),
                input_action_and_data.get("password_hashed"),
                input_action_and_data.get("company"),
            )
        elif action == "get_password":
            # Then the inputActionAndData is formatted as such:
            # { "action": "get_password", "username": YOUR_USERNAME }
            result = get_password(input_action_and_data.get("username"))
        elif action == "get_reviewer_status":
            # Then the inputActionAndData is formatted as such:
            # { "action": "get_password", "username": YOUR_USERNAME }
            result = get_reviewer_status(input_action_and_data.get("username"))
        elif action == "add_remove_favorite":
            # Then the inputActionAndData is formatted as such:
            # { "action": "add_favorite", "username": YOUR_USERNAME, "cik": YOUR_CIK }
            result = add_remove_favorite(
                input_action_and_data.get("username"), input_action_and_data.get("cik")
            )
        elif action == "get_favorites":
            # Then the inputActionAndData is formatted as such:
            # { "action": "get_favorites", "username": YOUR_USERNAME }
            result = get_favorites(input_action_and_data.get("username"))
        elif action == "get_company_score":
            # Then the inputActionAndData is formatted as such:
            # { "action": "get_company_score", "cik": YOUR_CIK }
            result = get_company_score(input_action_and_data.get("cik"))
        elif action == "get_recent_ownerships":
            # Then the inputActionAndData is formatted as such:
            # { "action": "get_recent_ownerships", "cik": YOUR_CIK, "pagination": YOUR_PAGINATION_INDEX }
            result = get_recent_ownerships(
                input_action_and_data.get("cik"),
                input_action_and_data.get("pagination"),
            )
        elif action == "verify_company":
            # Expecting JSON like { "action": "verify_company", "cik": "0000123456" }
            result = verify_company(input_action_and_data.get("cik"))

        elif action == "update_company_score":
            # Expecting JSON like { "action": "update_company_score", "cik": "0000123456", "risk_score": 3 }
            result = update_company_score(
                input_action_and_data.get("cik"),
                input_action_and_data.get("risk_score"),
            )
        elif action == "get_def_url":
            # Expecting JSON like { "action": "get_def_url", "cik": "0000123456" }
            result = get_def_url(input_action_and_data.get("cik"))
        elif action == "get_total_common_stocks":
            # Expecting JSON like { "action": "get_total_common_stocks", "cik": "0000123456" }
            result = get_total_common_stocks(input_action_and_data.get("cik"))
        elif action == "request_company_review":
            result = request_company_review(
            input_action_and_data.get("username"),
            input_action_and_data.get("cik")
        )

        else:
            # Process the input data_
            result = {"status": "error", "message": "Invalid action"}

        # Print the result as a dictionary (this becomes stdout and the output of the API)
        print(json.dumps(result))

    except Exception as e:
        # Handle any errors that occur during script execution
        print(
            json.dumps({"status": "error", "message": f"An error occurred: {str(e)}"})
        )
        sys.exit(1)  # Exit with non-zero status to indicate an error
