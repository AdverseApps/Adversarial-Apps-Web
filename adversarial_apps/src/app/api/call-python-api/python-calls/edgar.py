import html
import re

import requests
from bs4 import BeautifulSoup


def sanitize_and_validate_cik(cik: str) -> str:
    """
    Validates and sanitizes the CIK input.

    :param cik: Input string representing the CIK number.
    :return: Sanitized CIK number if valid, raises ValueError otherwise.
    """
    # Trim leading and trailing whitespace
    cik = cik.strip()

    # Validate the CIK format: must be only digits
    if not re.match(r"^\d+$", cik):
        raise ValueError("Invalid CIK: must be only digits.")

    # Return the sanitized and validated CIK
    return cik


def get_sec_data(cik: str) -> dict:
    """
    Retrieve SEC json file for company based on given CIK number

    :param cik: CIK number for company to retrieve data for
    :return: dictionary with json data
    """

    try:
        sanitized_cik = sanitize_and_validate_cik(cik)
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
                "address": data.get("addresses", {})
                .get("business", {})
                .get("street1", "N/A"),
                "street2": data.get("addresses", {})
                .get("business", {})
                .get("street2", "N/A"),
                "city": data.get("addresses", {})
                .get("business", {})
                .get("city", "N/A"),
                "zipCode": data.get("addresses", {})
                .get("business", {})
                .get("zipCode", "N/A"),
                "stateOrCountryDescription": data.get("addresses", {})
                .get("business", {})
                .get("stateOrCountryDescription", "N/A"),
                "stateOfIncorporation": data.get(
                    "stateOfIncorporationDescription", "N/A"
                ),
                "phone": data.get("phone", "N/A"),
                "website": data.get("website", "N/A"),  # Assume there's a website field
            }

            # Get all filing dates from the filings section
            filing_dates = (
                data.get("filings", {}).get("recent", {}).get("filingDate", [])
            )

            # If there are no filing dates, return 'N/A'
            if not filing_dates:
                recent_filing_date = ""
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


def get_recent_ownerships(cik: str, pagination: int) -> dict:
    """
    Retrieve recent ownerships for a company based on the CIK number.

    :param cik: CIK number of the company
    :param pagination: Index for pagination
    :return: Dictionary containing the list of recent ownerships
    """

    # obtains the .json file from the SEC website
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"

    headers = {
        "User-Agent": "JamesAllen <ja799793@ucf.edu> (Adversarial Apps)",
        "Accept-Encoding": "gzip, deflate",
        "Host": "data.sec.gov",
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        try:
            # Parse the JSON response to grab form information
            data = response.json()

            recent = data.get("filings", {}).get("recent", {})
            forms = recent.get("form", [])
            filling_dates = recent.get("filingDate", [])
            accession_numbers = recent.get("accessionNumber", [])

            # Grabs all form 4 forms
            form_indices = [i for i, form in enumerate(forms) if form == "4"]

            # Connects forms 4 with their respective filling dates and accession numbers
            # for ease of reference
            filtered_forms = [
                {
                    "fillingDate": filling_dates[i],
                    "form": forms[i],
                    "accessionNumber": accession_numbers[i],
                }
                for i in form_indices
            ]

            # Paginate: Get the first 5 items for the given page
            start_index = (pagination - 1) * 5
            end_index = start_index + 5

            # for each of the forms within the index range, grab data file and process xml
            for form in filtered_forms[start_index:end_index]:
                # each form stored at unique url based off cik without zeros
                # and modified accession number in url following pattern below
                url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{form['accessionNumber'].replace('-', '')}/{form['accessionNumber']}.txt"

                headers = {
                    "User-Agent": "JamesAllen <ja799793@ucf.edu> (Adversarial Apps)",
                    "Accept-Encoding": "gzip, deflate",
                    "Host": "www.sec.gov",
                }

                response = requests.get(url, headers=headers)

                # if the request was successful, then we can parse the xml
                if response.status_code == 200:
                    # grabs all the content within <XML> tag which form 4 is stored in
                    xml_content = re.search(
                        r"<XML>(.*?)</XML>", response.text, re.DOTALL
                    )

                    # if the xml content is found, then we can parse it, and store it in the form dictionary to be returned
                    if xml_content:

                        # used to get the xml from the extraction above
                        xml_string = xml_content.group(1)

                        # uses beatifulsoup to parse the xml content
                        soup = BeautifulSoup(xml_string, "lxml-xml")

                        # grabs the owner information from the xml
                        issuer = soup.find("issuerName").text
                        reporter = soup.find("rptOwnerName").text

                        # adds gathered information to the form dictionary to be saved to output
                        form["issuer"] = issuer
                        form["reporter"] = reporter

                else:
                    return {
                        "status": "error",
                        "message": f"Unable to retrieve ownership data for CIK {cik} (Status Code: {response.status_code})",
                    }

            # Return the paginated list of recent ownerships
            return {
                "status": "success",
                "recentOwnerships": filtered_forms[start_index:end_index],
            }

        except Exception as e:
            return {"status": "error", "message": f"An error occurred: {str(e)}"}
    else:
        return {
            "status": "error",
            "message": f"Unable to retrieve recent fillings for CIK {cik} (Status Code: {response.status_code})",
        }


def get_def_url(cik: str) -> str:
    """
    Retrieve the URL for the most recent DEF form for a company based on the CIK number.

    :param cik: CIK number of the company
    :return: URL for the DEF form
    """

    # obtains the .json file from the SEC website
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"

    headers = {
        "User-Agent": "JamesAllen <ja799793@ucf.edu> (Adversarial Apps)",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        try:
            # Parse the JSON response to grab form information
            data = response.json()

            recent = data.get("filings", {}).get("recent", {})
            forms = recent.get("form", [])
            accession_numbers = recent.get("accessionNumber", [])

            # Grabs the most recent DEF 14 A forms
            form_indices = [i for i, form in enumerate(forms) if form == "DEF 14A"]

            # Connects forms DEF with their respective accession numbers
            # for ease of reference
            filtered_forms = [
                {
                    "form": forms[i],
                    "accessionNumber": accession_numbers[i],
                }
                for i in form_indices
            ]

            # url is based off cik without zeros and modified accession number in url following pattern below
            url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{filtered_forms[0]['accessionNumber'].replace('-', '')}/{filtered_forms[0]['accessionNumber']}"

            # returns the url as part of the success
            return {"status": "success", "url": url}
        except Exception as e:
            return {"status": "error", "message": f"An error occurred: {str(e)}"}


def get_total_common_stocks(cik: str) -> dict:
    """
    Retrieve the total common stocks for a company based on the CIK number.

    :param cik: CIK number of the company
    :return: Dictionary containing the total common stocks
    """

    # obtains the .json file from the SEC website
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"

    headers = {
        "User-Agent": "JamesAllen <ja799793@ucf.edu> (Adversarial Apps)",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        try:
            # Parse the JSON response to grab form information
            data = response.json()

            # Grabs the total common stocks
            total_common_stocks = data["facts"]["us-gaap"]["CommonStockSharesIssued"][
                "units"
            ]["shares"][-1]["val"]

            # returns the total common stocks as part of the success
            return {"status": "success", "totalCommonStocks": total_common_stocks}

        except Exception as e:
            return {"status": "error", "message": f"An error occurred: {str(e)}"}
