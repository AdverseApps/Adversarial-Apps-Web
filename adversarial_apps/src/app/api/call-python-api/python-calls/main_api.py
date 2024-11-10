import json
import re
import sys

import requests
from bs4 import BeautifulSoup


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
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
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


# the call-python-api will call it here, and provides the inputActionAndData
# which then determines which part of the API to run
if __name__ == "__main__":
    try:
        # Read JSON data from stdin
        input_action_and_data = json.load(sys.stdin)

        # Each action corresponds to a different function, so setting action
        # determines which API call is being made
        if input_action_and_data.get("action") == "obtain_cik_number":
            # Then the inputActionAndData is formatted as such:
            # { action: "obtain_cik_number", search_term: YOUR_SEARCH_TERM }
            result = obtain_cik_number(input_action_and_data.get("search_term"))
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
