# -*- coding: utf-8 -*-
"""
Stock Market Prediction Web Application
Updated Version with Fixes and Improvements
"""
from flask import Flask, render_template, request, flash, redirect, url_for
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
plt.style.use('ggplot')
import math, random
from datetime import datetime
import datetime as dt
import yfinance as yf
import warnings
import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Ignore Warnings
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default-secret-key')

# Cache control
@app.after_request
def add_header(response):
    response.headers['Pragma'] = 'no-cache'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    symbol = request.form['symbol'].upper()
    
    try:
        # Get historical data
        def get_historical(symbol):
            end = datetime.now()
            start = datetime(end.year-2, end.month, end.day)
            data = yf.download(symbol, start=start, end=end)
            
            if data.empty:
                # Fallback to Alpha Vantage if Yahoo Finance fails
                ts = TimeSeries(key=os.getenv('ALPHAVANTAGE_KEY'), output_format='pandas')
                data, _ = ts.get_daily_adjusted(symbol=symbol, outputsize='full')
                data = data.head(503).iloc[::-1]
                data = data.reset_index()
                
                df = pd.DataFrame()
                df['Date'] = data['date']
                df['Open'] = data['1. open']
                df['High'] = data['2. high']
                df['Low'] = data['3. low']
                df['Close'] = data['4. close']
                df['Adj Close'] = data['5. adjusted close']
                df['Volume'] = data['6. volume']
                return df
            
            return data

        # ARIMA Model
        def arima_model(df):
            df = df.dropna()
            quantity = df[['Close']].values
            size = int(len(quantity) * 0.8)
            train, test = quantity[0:size], quantity[size:len(quantity)]
            
            history = [x for x in train]
            predictions = []
            
            for t in range(len(test)):
                model = ARIMA(history, order=(5,1,0))
                model_fit = model.fit()
                output = model_fit.forecast()
                yhat = output[0]
                predictions.append(yhat)
                obs = test[t]
                history.append(obs)
            
            # Plotting
            fig = plt.figure(figsize=(12,6))
            plt.plot(test, label='Actual Price')
            plt.plot(predictions, color='red', label='Predicted Price')
            plt.title(f'ARIMA Model - {symbol}')
            plt.legend()
            plt.savefig('static/ARIMA.png')
            plt.close()
            
            rmse = math.sqrt(mean_squared_error(test, predictions))
            return predictions[-1], rmse

        # Main execution
        df = get_historical(symbol)
        today_stock = df.iloc[-1:].round(2)
        
        # Run models
        arima_pred, arima_rmse = arima_model(df)
        
        # Prepare results
        results = {
            'symbol': symbol,
            'today': {
                'open': today_stock['Open'].values[0],
                'high': today_stock['High'].values[0],
                'low': today_stock['Low'].values[0],
                'close': today_stock['Close'].values[0],
                'volume': today_stock['Volume'].values[0]
            },
            'predictions': {
                'arima': round(arima_pred[0], 2),
                'arima_rmse': round(arima_rmse, 2)
            }
        }

        return render_template('results.html', **results)

    except Exception as e:
        print(f"Error: {str(e)}")
        return render_template('index.html', error=True, message=str(e))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
