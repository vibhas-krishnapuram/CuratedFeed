import requests
import os

key1 = os.getenv('YOUTUBE_API_KEY')

def call_videos(query="Beginning entrepuenership", max_result=10, APIkey=None):
    # set the params
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&maxResults={max_result}&videoDuration=medium&key={APIkey}"
    
    response = requests.get(url)
    data = response.json()
    
    videos = []

    for item in data.get("items", []):
        video_info = {
            "title": item["snippet"]["title"],
            "video_id": item["id"]["videoId"],
            "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
            "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
        }
        videos.append(video_info)

    return videos

print(key1)

print(call_videos("Beginning entrepuenership", 10, key1))
