import html
import re

import requests
from bs4 import BeautifulSoup


def sanitize_search_term(search_term: str) -> str:
    """
    Returns the search term but sanitizes it to ensure its valid
    :param search_term: The term to sanitize
    :return: A sanitized version of the search term

    """

    # Validate the search term (e.g., allow only alphanumeric and a few specific characters)
    if not re.match(r"^[A-Za-z0-9&\-.,\s]+$", search_term):
        raise ValueError(
            "Invalid search term: only alphanumeric and a few special characters allowed."
        )

    # Sanitize the input by removing unsafe characters, Allow only alphanumeric, &, -, ., ,, and spaces
    sanitized_term = re.sub(r"[^A-Za-z0-9&\-., ]", "", search_term)

    # Normalize multiple spaces to a single space
    sanitized_term = re.sub(r"\s+", " ", sanitized_term)

    # escape for HTML contexts to prevent XSS
    sanitized_term = html.escape(sanitized_term)

    return sanitized_term


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
