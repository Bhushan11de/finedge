import requests

# NewsAPI से फाइनेंशियल न्यूज प्राप्त करें
api_key = "1cbd1610651546c4a89490a383e4f4f2"  # अपनी खुद की API key डालें
url = f"https://newsapi.org/v2/everything?q=stock+market&apiKey={api_key}"

response = requests.get(url)
news_data = response.json()

# सेंटीमेंट एनालिसिस (सरल उदाहरण)
positive_keywords = ['bullish', 'growth', 'profit']
negative_keywords = ['bearish', 'loss', 'crash']

for article in news_data['articles']:
    title = article['title']
    sentiment = "neutral"
    
    if any(word in title.lower() for word in positive_keywords):
        sentiment = "positive"
    elif any(word in title.lower() for word in negative_keywords):
        sentiment = "negative"
    
    print(f"Title: {title} | Sentiment: {sentiment}")
