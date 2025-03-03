import requests

def call_reddit(topic):
    headers  = {"User-Agent": "CuratedFeedApp"}
    url = f"https://www.reddit.com/r/{topic}/top.json?t=week&limit=10"

    response = requests.get(url, headers=headers)

    data = response.json()

    posts = []
    for post in data["data"]["children"]:
        post_data = post["data"]
        posts.append({
            "title": post_data["title"],
            "url": "https://reddit.com" + post_data["permalink"],
            "upvotes": post_data["ups"]
            })

    return posts

