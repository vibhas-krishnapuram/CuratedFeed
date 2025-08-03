from re import search
import requests
import os

def call_google(query="how to start a startup", APIkey=None):

    searchKey = "64df3736c1ba449e9"

    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={APIkey}&cx={searchKey}"
    response = requests.get(url)
    data = response.json()

    sites = []

    for item in data.get("items", []):
        info = {
            "title": item["title"],
            "url": item['link']
        }
        sites.append(info)

    return sites

#print(call_google(query="how to start a startup", APIkey="AIzaSyBo2Z5qACZXPvOp0guTyZZ5E5cEqBTUzFo"))
