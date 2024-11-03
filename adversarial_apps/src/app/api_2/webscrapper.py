from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def obtain_urls(term):
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

# Example usage, change term as needed
term = "selenium webdriver tutorial"
urls = obtain_urls(term)


print(urls)
