from flask import Flask, request, jsonify
import yfinance as yf
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from flask_cors import CORS
from statsmodels.tsa.arima.model import ARIMA
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/forecast', methods=['POST'])
def forecast():
    try:
        data = request.json
        stock_symbol = data.get('stock_symbol')

        if not stock_symbol:
            return jsonify({'error': 'Stock symbol required'}), 400

        # Fetch 3 years of historical data
        stock_data = yf.Ticker(stock_symbol).history(period='3y')
        
        if stock_data.empty or 'Close' not in stock_data.columns:
            return jsonify({'error': 'Invalid symbol or no data'}), 400

        # Prepare data
        closes = stock_data['Close'].ffill().values
        
        # Scale data
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(closes.reshape(-1, 1))

        # ARIMA model
        model = ARIMA(scaled_data, order=(5, 1, 0))
        model_fit = model.fit()

        # Generate forecast
        forecast_steps = 15
        forecast = scaler.inverse_transform(
            model_fit.forecast(steps=forecast_steps).reshape(-1, 1)
        )

        # Create dates
        last_date = stock_data.index.max().to_pydatetime()
        dates = [(last_date + timedelta(days=i)).strftime('%Y-%m-%d') 
                for i in range(1, forecast_steps+1)]

        return jsonify({
            'dates': dates,
            'prices': forecast.flatten().round(2).tolist()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/historic', methods=['GET'])
def historic():
    try:
        symbol = request.args.get('symbol')
        if not symbol:
            return jsonify({'error': 'Symbol required'}), 400

        # Get data
        data = yf.Ticker(symbol).history(period='1mo')
        
        if data.empty:
            return jsonify({'error': 'No data found'}), 404

        # Format response
        dates = data.index.strftime('%Y-%m-%d').tolist()
        prices = data['Close'].ffill().round(2).tolist()

        return jsonify({'dates': dates, 'prices': prices})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
