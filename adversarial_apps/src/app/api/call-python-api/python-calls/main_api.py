import html
import json
import os
import re
import sys

import psycopg2
import requests
from argon2 import PasswordHasher
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
)
from dotenv import load_dotenv
from edgar import (
    get_def_url,
    get_recent_ownerships,
    get_sec_data,
    get_total_common_stocks,
)
from search import obtain_cik_number


def send_password_reset_token(email: str) -> dict:
    """
    Verifies that the email exists (read-only) and generates a JWT reset token
    with a 1-hour expiration.
    """
    import datetime

    import jwt

    JWT_SECRET = os.getenv("JWT_SECRET")
    if not JWT_SECRET:
        return {"status": "error", "message": "JWT_SECRET is not set."}

    connection = None
    try:
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()
        cursor.execute('SELECT username FROM "USERS" WHERE username = %s', (email,))
        user = cursor.fetchone()
        if not user:
            return {"status": "error", "message": "Email not found."}

        # Generate a token that expires in 1 hour
        expiration = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            hours=1
        )
        payload = {"email": email, "exp": expiration, "action": "reset_password"}
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        return {"status": "success", "token": token}
    except Exception as e:
        # Return the error details for debugging purposes
        return {"status": "error", "message": f"Error generating token: {str(e)}"}
    finally:
        if connection:
            cursor.close()
            connection.close()


ph = PasswordHasher()


def reset_password(email: str, token: str, new_password: str) -> dict:
    JWT_SECRET = os.getenv("JWT_SECRET")
    if not JWT_SECRET:
        return {"status": "error", "message": "JWT_SECRET is not set."}

    try:
        import jwt  # ensure jwt is imported

        # Decode and verify the token
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("action") != "reset_password":
            return {"status": "error", "message": "Invalid token action."}
        if payload.get("email") != email:
            return {"status": "error", "message": "Email does not match token."}
    except jwt.ExpiredSignatureError:
        return {"status": "error", "message": "Token expired."}
    except Exception as e:
        return {"status": "error", "message": f"Token error: {str(e)}"}

    try:
        hashed_password = ph.hash(new_password)
    except Exception as e:
        return {"status": "error", "message": f"Error hashing password: {str(e)}"}

    # Update the password in the USERS table
    connection = None
    try:
        connection = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = connection.cursor()
        cursor.execute(
            'UPDATE "USERS" SET password = %s WHERE username = %s',
            (hashed_password, email),
        )
        connection.commit()
        return {"status": "success", "message": "Password reset successfully."}
    except Exception as e:
        return {"status": "error", "message": f"Database error: {str(e)}"}
    finally:
        if connection:
            cursor.close()
            connection.close()


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
        elif action == "send_reset_token":
            result = send_password_reset_token(input_action_and_data.get("email"))
        elif action == "reset_password":
            result = reset_password(
                input_action_and_data.get("email"),
                input_action_and_data.get("token"),
                input_action_and_data.get("newPassword"),
            )
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
