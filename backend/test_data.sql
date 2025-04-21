-- Create admin user
INSERT INTO Users (name, email, password, role) 
VALUES ('Admin User', 'admin@example.com', '$2b$10$X7Q8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z', 'admin');

-- Create regular user
INSERT INTO Users (name, email, password, role) 
VALUES ('Test User', 'user@example.com', '$2b$10$X7Q8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z', 'user');

-- Create some stocks
INSERT INTO Stocks (symbol, name, currentPrice) VALUES
('AAPL', 'Apple Inc.', 175.50),
('GOOGL', 'Alphabet Inc.', 135.25),
('MSFT', 'Microsoft Corporation', 310.75),
('AMZN', 'Amazon.com Inc.', 180.00),
('TSLA', 'Tesla Inc.', 170.25);

-- Add stocks to watchlist for the regular user
INSERT INTO Watchlists (userId, stockId) 
SELECT 
    (SELECT id FROM Users WHERE email = 'user@example.com'),
    id 
FROM Stocks 
WHERE symbol IN ('AAPL', 'GOOGL', 'MSFT');

-- Create some stock transactions for the regular user
INSERT INTO StockTransactions (userId, stockId, type, quantity, price, totalAmount) 
SELECT 
    (SELECT id FROM Users WHERE email = 'user@example.com'),
    (SELECT id FROM Stocks WHERE symbol = 'AAPL'),
    'buy',
    10,
    170.00,
    1700.00;

INSERT INTO StockTransactions (userId, stockId, type, quantity, price, totalAmount) 
SELECT 
    (SELECT id FROM Users WHERE email = 'user@example.com'),
    (SELECT id FROM Stocks WHERE symbol = 'GOOGL'),
    'buy',
    5,
    130.00,
    650.00;

INSERT INTO StockTransactions (userId, stockId, type, quantity, price, totalAmount) 
SELECT 
    (SELECT id FROM Users WHERE email = 'user@example.com'),
    (SELECT id FROM Stocks WHERE symbol = 'AAPL'),
    'sell',
    5,
    175.50,
    877.50; 