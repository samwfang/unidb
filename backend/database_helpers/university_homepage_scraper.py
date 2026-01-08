# Scrape University Home Pages to Find Directories For University Faculty

import requests
from bs4 import BeautifulSoup
import openai
import time
from urllib.parse import urljoin, urlparse, urlunparse

def normalize_url(url):
    parsed_url = urlparse(url)
    return urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, '', '', ''))


# Recursively Scrape University Pages Up To A Certain Depth To Find Promising URLs
def collect_links_and_context(url, visited, depth = 0, max_depth = 1):
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    if depth > max_depth or url in visited:
        return []
    
    url = normalize_url(url)
    visited.add(url)
    links_with_context = []
    
    try:
        response = requests.get(url,  timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            full_url = urljoin(url, href)
            
            if full_url.startswith('http') and 'umich.edu' in full_url and full_url not in visited:
                links_with_context.append((full_url, text))
        
        for next_url, _ in links_with_context:
            links_with_context.extend(collect_links_and_context(next_url, visited, depth + 1, max_depth))
    
        
    except requests.exceptions.RequestException as e:
        print("Error Accessing " + str(url) + " " + str(e))
    
   
    time.sleep(1)
    
    return links_with_context

# Step 1: Download the HTML content of the homepage
root = 'https://umich.edu'
visited = set()
links_with_context = collect_links_and_context(root, visited)

links_data = ""

for url, text in links_with_context:
    links_data += "\n"
    links_data += str(text) + ": " + str(url)
    

print(links_data)

# # Step 3: Use a language model to identify major subsections
# # You will need to set up OpenAI API with your secret key
# openai.api_key = 'your-openai-api-key'

# def identify_major_sections(urls):
#     prompt = (
#         "Given the following list of URLs from a university homepage, identify "
#         "which ones are likely major subsections, such as the College of Engineering: "
#         f"\n\n{urls}\n\nReturn the list of major subsection URLs."
#     )
    
#     response = openai.Completion.create(
#         engine="text-davinci-003",
#         prompt=prompt,
#         max_tokens=150
#     )

#     return response.choices[0].text.strip()

# # Step 4: Output the URLs of these subsections
# major_sections = identify_major_sections(list(unique_urls))
# print("Major Subsections:")
# print(major_sections)
