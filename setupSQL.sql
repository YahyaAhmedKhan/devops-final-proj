CREATE TABLE accounts (
    account_id serial PRIMARY KEY,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL CHECK (length(password) >= 8),
    balance numeric(10,2) NOT NULL DEFAULT 10000.00,
    CONSTRAINT UQ_email UNIQUE (email)
);

CREATE TABLE planes (
    plane_id int PRIMARY KEY,
    capacity int NOT NULL,
    CONSTRAINT CK_plane_id CHECK (plane_id >= 100 AND plane_id <= 999)
);

CREATE TABLE flights (
    flight_id varchar(5) NOT NULL,
    dep_time time NOT NULL,
    arrival_time time NOT NULL,
    origin varchar(40) NOT NULL,
    destination varchar(40) NOT NULL,
    base_price numeric(10,2) NOT NULL,
    plane_id int NOT NULL,
    CONSTRAINT PK_flight_id PRIMARY KEY (flight_id),
    CONSTRAINT CK_flight_id_format CHECK (
        flight_id ~ '^[A-Z][A-Z][0-9]{3}$'
    ),
    CONSTRAINT CK_plane_id_range CHECK (plane_id >= 100 and plane_id <= 999),
    FOREIGN KEY (plane_id) REFERENCES planes (plane_id)
);

CREATE TABLE flight_records (
    flight_record_id serial PRIMARY KEY,
    seats_left integer NOT NULL,
    flight_id varchar(5) NOT NULL,
    date date NOT NULL,
    CONSTRAINT CK_flight_id_format CHECK (
        flight_id ~ '^[A-Z][A-Z][0-9]{3}$'
    ),
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id)
);

CREATE TABLE flight_bookings (
    flight_booking_id serial PRIMARY KEY,
    total_seats INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    account_id INT NOT NULL,
    flight_record_id INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts (account_id),
    FOREIGN KEY (flight_record_id) REFERENCES flight_records(flight_record_id)
);

CREATE TABLE seat_bookings (
    flight_booking_id INT NOT NULL,
    seat_booking_number INT NOT NULL,
    seat_number CHAR(3) NOT NULL CHECK (seat_number ~ '^[A-Z]\d{2}$'), 
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F', 'O', 'X')),
    passport_number CHAR(8) NOT NULL CHECK (passport_number ~ '^[A-Z]{2}\d{6}$'),
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(255) NOT NULL,
    seat_class VARCHAR(20) NOT NULL CHECK (seat_class IN ('business', 'economy', 'first class')),
    special_needs BOOLEAN NOT NULL,
    extra_baggage BOOLEAN NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (flight_booking_id, seat_number),
    FOREIGN KEY (flight_booking_id) REFERENCES flight_bookings (flight_booking_id)
);

CREATE OR REPLACE FUNCTION update_flight_booking_and_records()
RETURNS TRIGGER AS $$
BEGIN
    
    UPDATE flight_bookings
    SET total_price = total_price + NEW.price,
        total_seats = total_seats + 1
    WHERE flight_booking_id = NEW.flight_booking_id;

    
    UPDATE flight_records
    SET seats_left = seats_left - 1
    WHERE flight_record_id = (
        SELECT flight_record_id
        FROM flight_bookings
        WHERE flight_booking_id = NEW.flight_booking_id
    );

    
    UPDATE accounts
    SET balance = balance - NEW.price
    WHERE account_id = (
        SELECT account_id
        FROM flight_bookings
        WHERE flight_booking_id = NEW.flight_booking_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to execute the function after an insertion in seat_bookings
CREATE TRIGGER update_flight_booking_trigger
AFTER INSERT ON seat_bookings
FOR EACH ROW
EXECUTE FUNCTION update_flight_booking_and_records();

ALTER TABLE accounts
ADD CONSTRAINT CHK_balance_non_negative CHECK (balance >= 0);

-- Necessary insertions before making flight bookings

-- Plane 102
INSERT INTO planes (plane_id, capacity)
VALUES (102, 200);

-- Flight EK606
INSERT INTO flights (flight_id, dep_time, arrival_time, origin, destination, base_price, plane_id)
VALUES ('EK616', '09:00:00', '10:15:00', 'Karachi', 'Dubai', 250, 102);

-- Flight EK607
INSERT INTO flights (flight_id, dep_time, arrival_time, origin, destination, base_price, plane_id)
VALUES ('EK617', '14:00:00', '15:15:00', 'Karachi', 'Dubai', 250, 102);

-- Flight EK608
INSERT INTO flights (flight_id, dep_time, arrival_time, origin, destination, base_price, plane_id)
VALUES ('EK618', '21:00:00', '22:15:00', 'Karachi', 'Dubai', 250, 102);

-- Flight Record 1
INSERT INTO flight_records (seats_left, flight_id, date)
VALUES (200, 'EK616', '2023-11-16');

-- Flight Record 2
INSERT INTO flight_records (seats_left, flight_id, date)
VALUES (200, 'EK617', '2023-11-16');

-- Flight Record 3
INSERT INTO flight_records (seats_left, flight_id, date)
VALUES (200, 'EK618', '2023-11-16');

-- Flight Record 4
INSERT INTO flight_records (seats_left, flight_id, date)
VALUES (200, 'EK617', '2023-11-17');

-- Flight Record 5
INSERT INTO flight_records (seats_left, flight_id, date)
VALUES (200, 'EK618', '2023-11-17');

