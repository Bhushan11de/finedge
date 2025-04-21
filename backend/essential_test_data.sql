-- Insert admin user
INSERT INTO Users (name, email, password, role) 
VALUES ('Admin User', 'admin@example.com', '$2b$10$X7Q8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z', 'admin');

-- Insert test stocks
INSERT INTO Stocks (symbol, name, currentPrice) VALUES
('AAPL', 'Apple Inc.', 175.50),
('GOOGL', 'Alphabet Inc.', 135.25),
('MSFT', 'Microsoft Corporation', 310.75);

-- Get the admin user ID
SET @admin_id = (SELECT id FROM Users WHERE email = 'admin@example.com');

-- Add stocks to watchlist for admin
INSERT INTO Watchlists (userId, stockId) 
SELECT @admin_id, id 
FROM Stocks;

-- Create some stock transactions for admin
INSERT INTO StockTransactions (userId, stockId, type, quantity, price, totalAmount) 
SELECT 
    @admin_id,
    (SELECT id FROM Stocks WHERE symbol = 'AAPL'),
    'buy',
    10,
    170.00,
    1700.00;

INSERT INTO StockTransactions (userId, stockId, type, quantity, price, totalAmount) 
SELECT 
    @admin_id,
    (SELECT id FROM Stocks WHERE symbol = 'GOOGL'),
    'buy',
    5,
    130.00,
    650.00; 