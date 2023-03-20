#!/usr/bin/env python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support.expected_conditions import presence_of_element_located
from bs4 import BeautifulSoup
import csv
import time
from datetime import date
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary

def start_selenium():
    options = Options()
    # options.add_argument('-headless')
    driver = webdriver.Firefox(options=options)
    start = time.time()
    driver.get('https://1.country')
    WebDriverWait(driver, 10).until(presence_of_element_located((By.XPATH, '/html/body/div/div/div[1]/div/div/div[1]/div[2]/div/div/input')))
    end = time.time()
    print(end-start)
    

    test_domains = [
        '1',
        'hello',
        'openconsensus',
        '!@',
        '!@#$%^&*()_+',
        'd-d',
        ]
    for domain in test_domains:
        # sleep(5)
        domain_input = driver.find_element(By.XPATH, '/html/body/div/div/div[1]/div/div/div[1]/div[2]/div/div/input')
        domain_input.send_keys(domain)
        time.sleep(3) 
        response = driver.find_element(By.XPATH, '/html/body/div/div/div[1]/div/div/div[2]/span')
        print(response.text)
        domain_input.send_keys(Keys.COMMAND + 'a', Keys.BACKSPACE)
   
    driver.close()

start_selenium()