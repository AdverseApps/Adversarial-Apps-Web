import requests
from bs4 import BeautifulSoup
from urllib.robotparser import RobotFileParser
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from typing import List

def obtain_related_urls(term: str) -> List[str]:
    '''
    Uses selenium to conduct google search based on the term given and pull urls found on front page
    :param term: Term want to search for
    :returns: Returns list of urls that it found from search if any
    '''
    # Set up headless Firefox
    options = Options()
    options.headless = True
    driver = webdriver.Firefox(options=options)

    try:
        # Go to Google
        driver.get("https://www.google.com")

        # Locate the search bar, enter the search term, and submit
        search_bar = driver.find_element(By.NAME, "q")
        search_bar.send_keys(term)
        search_bar.send_keys(Keys.RETURN)
        
        # Wait for the results to load and be displayed
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'h3'))
        )
        
        # Retrieve URLs from search results
        results = driver.find_elements(By.CSS_SELECTOR, 'h3')
        urls = [result.find_element(By.XPATH, '..').get_attribute('href') for result in results]

        return urls
    finally:
        driver.quit()

def is_allowed_to_scrape(url: str) -> bool:
    '''
    Checks if the url is scrapple or if owner of website doesn't want it based on robots.txt
    :param url: URL to test if allowed to scrape
    :returns: True or False if able to scrape or not
    '''

    # creates the path to robots.txt file based on url provided
    robots_url = f"{url.split('/')[0]}//{url.split('/')[2]}/robots.txt"
    rp = RobotFileParser()
    
    try:
        rp.set_url(robots_url)
        rp.read()
        # Check if crawling the URL is allowed
        return rp.can_fetch("*", url)
    except Exception as e:
        print(f"Could not fetch robots.txt from {robots_url}: {e}")
        return True  # Default to allow if robots.txt cannot be fetched

def scrape_url(url: str) -> None:
    '''
    Scapes the website provided and gets relevant information
    :param url: URL to scrape.
    '''
    # Check if the URL is allowed to be scraped
    if not is_allowed_to_scrape(url):
        print(f"Scraping not allowed for {url}")
        return None

    try:
        response = requests.get(url)
        if response.status_code == 200:

            # stores the pages contents into page
            page_html = BeautifulSoup(response.content, 'html.parser')

            # Example: extract the title of the page
            title = page_html.title.string if page_html.title else 'No title found'
            return title
        else:
            print(f"Failed to retrieve {url}: {response.status_code}")
            return None
    except Exception as error:
        print(f"Error scraping {url}: {error}")
        return None

# Example usage
search_term = "selenium webdriver tutorial"
urls = obtain_related_urls(search_term)

# Scrape each URL
for url in urls:
    title = scrape_url(url)
    if title:
        print(f"Title of {url}: {title}")
