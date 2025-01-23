import json
import re
import sys
import html

import requests
from bs4 import BeautifulSoup

def sanitize_search_term(search_term: str) -> str:
    
    # Validate the search term (e.g., allow only alphanumeric and a few specific characters)
    if not re.match(r'^[A-Za-z0-9&\-.,\s]+$', search_term):
        raise ValueError("Invalid search term: only alphanumeric and a few special characters allowed.")
    
    # Sanitize the input by removing unsafe characters, Allow only alphanumeric, &, -, ., ,, and spaces
    sanitized_term = re.sub(r'[^A-Za-z0-9&\-., ]', '', search_term)

    # Normalize multiple spaces to a single space
    sanitized_term = re.sub(r'\s+', ' ', sanitized_term)  

    # escape for HTML contexts to prevent XSS
    sanitized_term = html.escape(sanitized_term)
    
    return sanitized_term


def sanitize_and_validate_cik(cik: str) -> str:
    """
    Validates and sanitizes the CIK input.
    
    :param cik: Input string representing the CIK number.
    :return: Sanitized CIK number if valid, raises ValueError otherwise.
    """
    # Trim leading and trailing whitespace
    cik = cik.strip()
    
    # Validate the CIK format: must be only digits
    if not re.match(r'^\d+$', cik):
        raise ValueError("Invalid CIK: must be only digits.")
    
    # Return the sanitized and validated CIK
    return cik


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
        payload = {"company": sanitize_search_term(search_term)}

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
    except ValueError as e:
                return {"status": "error", "message": f"Invalid input: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


def get_sec_data(cik: str) -> dict:

    try:
        sanitized_cik = sanitize_and_validate_cik(cik);
    except ValueError as e:
        return {"status": "error", "message": f"{str(e)}"}
    
    url = f"https://data.sec.gov/submissions/CIK{sanitized_cik}.json"
    headers = {
        "User-Agent": "JamesAllen <ja799793@ucf.edu> (Adversarial Apps)",
        "Accept-Encoding": "gzip, deflate",
        "Host": "data.sec.gov",
    }
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        try:
            # Parse the JSON response
            data = response.json()
            
            # Extract the required fields
            company_data = {
                "name": data.get("name", "N/A"),  # Company name
                "formerNames": data.get("formerNames", []),  # Former names array
                "address": data.get("addresses", {}).get("business", {}).get("street1", "N/A"),
                "street2": data.get("addresses", {}).get("business", {}).get("street2", "N/A"),
                "city": data.get("addresses", {}).get("business", {}).get("city", "N/A"),
                "zipCode": data.get("addresses", {}).get("business", {}).get("zipCode", "N/A"),
                "stateOrCountryDescription": data.get("addresses", {}).get("business", {}).get("stateOrCountryDescription", "N/A"),
                "stateOfIncorporation": data.get("stateOfIncorporationDescription", "N/A"),
                "phone": data.get("phone", "N/A"),
                "website": data.get("website", "N/A"),  # Assume there's a website field
            }

            # Get all filing dates from the filings section
            filing_dates = data.get("filings", {}).get("recent", {}).get("filingDate", [])

            # If there are no filing dates, return 'N/A'
            if not filing_dates:
                recent_filing_date = []
            else:
                # Sort the filing dates in descending order to get the most recent one
                filing_dates_sorted = sorted(filing_dates, reverse=True)
                recent_filing_date = filing_dates_sorted[0]

            # Add the most recent filing date to the company data
            company_data["mostRecentFilingDate"] = recent_filing_date

            # Ensure proper formatting of `formerNames`
            if "formerNames" in company_data and company_data["formerNames"]:
                
                company_data["formerNames"] = [
                    {
                        "name": former.get("name", "N/A"),
                        "fromDate": former.get("from", "N/A"),
                        "toDate": former.get("to", "N/A"),
                    }
                    for former in company_data["formerNames"]
                ]

            return {"status": "success", "company": company_data}
        
        except KeyError as e:
            return {"status": "error", "message": f"KeyError: {str(e)}"}
        except Exception as e:
            return {"status": "error", "message": f"An error occurred: {str(e)}"}
    else:
        return {
            "status": "error",
            "message": f"Unable to retrieve data for CIK {sanitized_cik} (Status Code: {response.status_code})",
        }


# the call-python-api will call it here, and provides the inputActionAndData
# which then determines which part of the API to run
if __name__ == "__main__":
    try:
        # Read JSON data from stdin
        input_action_and_data = json.load(sys.stdin)

        # Each action corresponds to a different function, so setting action
        action = input_action_and_data.get("action")
        # determines which API call is being made
        if action == "obtain_cik_number":
            # Then the inputActionAndData is formatted as such:
            # { action: "obtain_cik_number", search_term: YOUR_SEARCH_TERM }
            result = obtain_cik_number(input_action_and_data.get("search_term"))
        elif action == "get_sec_data":
            result = get_sec_data(input_action_and_data.get("search_term"))
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
