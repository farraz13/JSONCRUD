CREATE TABLE data(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    string VARCHAR(100) NOT NULL,
    integer INTEGER NOT NULL,
    float REAL NOT NULL,
    date DATE NOT NULL,
    boolean boolean
);

INSERT INTO data(string, integer, float, date, boolean) VALUES 
('asep', 38, 5.5, '1984-09-04', true),
('ujang', 24, 2.4, '1998-08-10', false),
('jajang', 28, 3.3, z'1992-07-23', false),
('cecep', 26, 6.4, '1994-06-12', true);

INSERT INTO data(string, integer, float, date, boolean) VALUES
('farraz',19, 2.8, '2003-09-13', false)
