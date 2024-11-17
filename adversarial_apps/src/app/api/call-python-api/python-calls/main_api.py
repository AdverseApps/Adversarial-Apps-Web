import json
import re
import sys

import requests
from bs4 import BeautifulSoup

from typing import List, Dict

def lookup_beneficial_owners(company_info: Dict, cik_number: str) -> List:
    """
    Looks up the beneficial owners of a company based on the CIK number
    :param company_info: json data of company containing filling information
    :param cik_number: CIK number of the company
    :return: list of beneficial owners
    """
    
    filings = company_info.get("filings", {})
    recent_filings = filings.get("recent", {})
    form_list = recent_filings.get("form", [])

    # checks if DEF 14A is in fillings as that will have the beneficial owners
    if "DEF 14A" in form_list:
        
        # will always grab the most recent DEF 14A form
        # grabs accessionNumber based on same index as DEF 14A was found at
        def_14a_index = form_list.index("DEF 14A")
        def_14a_accession_number = recent_filings.get("accessionNumber")[def_14a_index]

        # removes leading 0s from CIK number
        cik_number = cik_number.lstrip("0")

        # removes dashes from accession number
        accession_number_without_dashes = def_14a_accession_number.replace("-", "")

        # obtains txt file of the DEF 14A form
        url = f"https://www.sec.gov/Archives/edgar/data/{cik_number}/{accession_number_without_dashes}/{def_14a_accession_number}.txt"

        headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Host": "www.sec.gov",
            "Referer": f"https://www.sec.gov/Archives/edgar/data/{cik_number}/{accession_number_without_dashes}",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
        }

        response = requests.get(url, headers=headers)

        # if the request was successful (status code 200)
        if response.status_code == 200:

            # initializes the BeautifulSoup library to parse the text
            soup = BeautifulSoup(response.text, "html.parser")

            # Step 3: Define a list of keywords to search for in table data cells
            keywords = ["name of beneficial owner", "name and address of beneficial owner"]

            tables = soup.find_all("table")

            tables_with_keyword = []

            for table in tables:
                for tr in table.find_all("tr"):
                    for td in tr.find_all("td"):
                        if td.get_text().lower() in keywords:
                            tables_with_keyword.append(table)
                            break

            return f"{td.get_text().lower()}"
        else:
            return {"status": "error", "message": f"Failed to fetch data: {response.status_code} {response.text}"}

        return {"accessionNumber": response.text}
       
    else:
        return "No DEF 14A form found"
    


def verify_addresses(company_info: Dict) -> Dict:
    """
    Verifies if the addresses are in the US or not and adds field to addresses marking them as such
    :param company_info: json data of company containing addresses
    :return: addresses with safe or foreign added depending on status
    """

    # includes Washington DC since is apart of US
    list_of_us_state_abbreviations = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", 
    ]

    processed_addresses = []

    addresses = company_info.get("addresses", {})

    # checks if the state of the addresses provided are in the US or apart of another country
    # each json data can have multiple types of addresses so we loop through that and check each one
    for address_type, address_data in addresses.items():
        state_or_country = address_data.get("stateOrCountry")
        
        # adds the type for reference since that is cut out when the data is returned
        address_data["address_type"] = address_type

        # adds risk info if apart of US or not
        if state_or_country in list_of_us_state_abbreviations:
            address_data["risk"] = "safe"
        else:
            address_data["risk"] = "foreign"
        
        processed_addresses.append(address_data)

    return processed_addresses


def obtain_cik_number(search_term: str) -> Dict:
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


def generate_report(cik_number: str) -> dict:

    # obtains the report for the given CIK number
    url = f"https://data.sec.gov/submissions/CIK{cik_number}.json"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
        "Accept-Encoding": "gzip, deflate",
        "Host": "data.sec.gov",
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
    
    except requests.exceptions.HTTPError as http_err:
        # this means there is no json file for that cik number or cik number is invalid
        if response.status_code == 404:
            return {
                "status": "error",
                "message": f"Invalid CIK number {cik_number}. Resource not found (404).",
            }
        else:
            return {
                "status": "error",
                "message": f"HTTP error occurred for CIK {cik_number}: {http_err}",
            }

    except requests.exceptions.RequestException as req_err:
        return {
            "status": "error",
            "message": f"Request error occurred for CIK {cik_number}: {req_err}",
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"An error occurred: {str(e)}",
        }
    
    # format the response to json to extract and get data
    company_info = response.json()

    processed_addresses = verify_addresses(company_info)

    beneficial_owners = lookup_beneficial_owners(company_info, cik_number)
    
    # extract info out of json if it exists
    final_report_data = {
            "cik_number": company_info.get("cik"),
            "company_name": company_info.get("name"),
            # sic is the Standard Industrial Classification code and is like a label for the type of business
            # the company is in
            "sic_category_code": company_info.get("sic"),
            "sicDescription": company_info.get("sicDescription"),
            "stateOfIncorporation": company_info.get("stateOfIncorporationDescription"),
            "addresses": processed_addresses,
            "beneficial_owners": beneficial_owners,
        }

    return {"status": "success", "report_data": final_report_data}


# the call-python-api will call it here, and provides the inputActionAndData
# which then determines which part of the API to run
if __name__ == "__main__":
    try:
        # Read JSON data from stdin
        input_action_and_data = json.load(sys.stdin)

        action = input_action_and_data.get("action")

        if action == "obtain_cik_number":
            # for the obtain_cik_number action input is formatted as such:
            # { action: "obtain_cik_number", search_term: YOUR_SEARCH_TERM }
            result = obtain_cik_number(input_action_and_data.get("search_term"))
        elif action == "generate_report":
            # For the generate report action input is formatted as such:
            # { action: "generate_report", cik_number: YOUR_CIK_NUMBER }
            result = generate_report(input_action_and_data.get("cik_number"))
        else:
            # No valid action was provided so error
            result = {"status": "error", "message": "Invalid action"}

        # Print the result as a dictionary (this becomes stdout and the output of the API)
        print(json.dumps(result))

    except Exception as e:
        # Handle any errors that occur during script execution
        print(
            json.dumps({"status": "error", "message": f"An error occurred: {str(e)}"})
        )
        sys.exit(1)  # Exit with non-zero status to indicate an error
