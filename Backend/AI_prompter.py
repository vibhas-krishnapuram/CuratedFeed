from openai import OpenAI
from flask import jsonify

key = "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"

def AI_Search():
    client = OpenAI(api_key=key)

    topic = 'Entrepreneurship'
    subtopics = ['Starting', 'Funding', 'Equity', 'Finding Co-founder']

    ai_prompt = f"""
    Generate a curated list of the best online resources (blogs, articles, videos, papers, interview videos) for someone interested in {topic}.
    The user is curious about these specific topics: {', '.join(subtopics)}.
    Provide a diverse mix of resources with links and titles and pictures if possible.
    """

    i_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a mentor bot that suggests helpful and useful resources for ones who are interested about a certain topic or profession"},
            {"role": "user", "content": ai_prompt}
        ]
    )

    ai_response = i_response.choices[0].message.content  
    return ai_response

#    resources = []
#    for line in ai_response.split("\n"):
#        if "http" in line:
#            parts = line.split(" - ")
#            if len(parts) == 2:
#                resources.append({"title": parts[0].strip(), "url": parts[1].strip()})

#    return jsonify({
#        "topic": topic,
#        "subtopics": subtopics,
#        "resources": resources
#    })

print(AI_Search()) 
