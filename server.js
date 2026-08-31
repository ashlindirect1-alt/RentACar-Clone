// =====================================
// RENTACAR - SERVER
// =====================================

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;


// =====================================
// DATABASE FOLDER
// =====================================

const databaseFolder = path.join(
    __dirname,
    "database"
);

if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, {
        recursive: true
    });
}


// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// =====================================
// SERVE PUBLIC FOLDER
// =====================================

app.use(express.static(
    path.join(__dirname, "public")
));


// =====================================
// DATABASE
// =====================================

const dbPath = path.join(
    databaseFolder,
    "rental.db"
);

const db = new sqlite3.Database(
    dbPath,
    (err) => {

        if (err) {

            console.error(
                "Database connection error:",
                err.message
            );

        } else {

            console.log(
                "Connected to SQLite database."
            );

        }

    }
);


// =====================================
// ENABLE FOREIGN KEYS
// =====================================

db.run("PRAGMA foreign_keys = ON");


// =====================================
// CREATE TABLES + INSERT CARS
// =====================================

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS cars (

            id INTEGER PRIMARY KEY,

            brand TEXT NOT NULL,

            model TEXT NOT NULL,

            type TEXT NOT NULL,

            fuel TEXT NOT NULL,

            transmission TEXT NOT NULL,

            seats INTEGER NOT NULL,

            price REAL NOT NULL,

            rating REAL NOT NULL,

            description TEXT NOT NULL,

            image TEXT

        )
    `);


    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            car_id INTEGER NOT NULL,

            customer_name TEXT NOT NULL,

            email TEXT NOT NULL,

            phone TEXT NOT NULL,

            pickup_location TEXT NOT NULL,

            pickup_date TEXT NOT NULL,

            return_date TEXT NOT NULL,

            total_price REAL NOT NULL,

            created_at TEXT DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (car_id)
                REFERENCES cars(id)

        )
    `);


    // =================================
    // INSERT SAMPLE CARS
    // =================================

    const insertCar = db.prepare(`
        INSERT OR IGNORE INTO cars
        (
            id,
            brand,
            model,
            type,
            fuel,
            transmission,
            seats,
            price,
            rating,
            description,
            image
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);


    const cars = [

        [
            1,
            "Toyota",
            "Corolla",
            "Sedan",
            "Petrol",
            "Automatic",
            5,
            45,
            4.8,
            "Comfortable and reliable sedan for everyday travel.",
            "/images/toyota-corolla.jpg"
        ],

        [
            2,
            "Honda",
            "Civic",
            "Sedan",
            "Petrol",
            "Automatic",
            5,
            50,
            4.7,
            "Modern sedan with excellent comfort and performance.",
            "/images/honda-civic.jpg"
        ],

        [
            3,
            "Kia",
            "Sportage",
            "SUV",
            "Petrol",
            "Automatic",
            5,
            65,
            4.9,
            "Spacious SUV perfect for families and long journeys.",
            "/images/kia-sportage.jpg"
        ],

        [
            4,
            "BMW",
            "3 Series",
            "Luxury",
            "Petrol",
            "Automatic",
            5,
            90,
            4.9,
            "Premium luxury car with excellent driving experience.",
            "/images/bmw-3-series.jpg"
        ],

        [
            5,
            "Mercedes",
            "C-Class",
            "Luxury",
            "Petrol",
            "Automatic",
            5,
            110,
            4.9,
            "Elegant luxury sedan with advanced features.",
            "/images/mercedes-c-class.jpg"
        ],

        [
            6,
            "Hyundai",
            "Elantra",
            "Sedan",
            "Hybrid",
            "Automatic",
            5,
            48,
            4.6,
            "Fuel-efficient sedan for comfortable city driving.",
            "/images/hyundai-elantra.jpg"
        ],

        [
            7,
            "Toyota",
            "Fortuner",
            "SUV",
            "Diesel",
            "Automatic",
            7,
            80,
            4.8,
            "Powerful SUV suitable for families and road trips.",
            "/images/toyota-fortuner.jpg"
        ],

        [
            8,
            "Kia",
            "Picanto",
            "Hatchback",
            "Petrol",
            "Automatic",
            5,
            30,
            4.5,
            "Small and economical car for city travel.",
            "/images/kia-picanto.jpg"
        ]

    ];


    cars.forEach((car) => {

        insertCar.run(car, (err) => {

            if (err) {
                console.error(
                    "Error inserting car:",
                    err.message
                );
            }

        });

    });


    insertCar.finalize();

});


// =====================================
// TEST API
// =====================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "RentACar server is working!"
    });

});


// =====================================
// GET ALL CARS
// =====================================

app.get("/api/cars", (req, res) => {

    db.all(
        `
        SELECT *
        FROM cars
        ORDER BY id ASC
        `,
        [],
        (err, rows) => {

            if (err) {

                console.error(
                    "GET /api/cars:",
                    err.message
                );

                return res.status(500).json({
                    error: "Failed to retrieve cars."
                });

            }

            res.json(rows);

        }
    );

});


// =====================================
// GET ONE CAR
// =====================================

app.get("/api/cars/:id", (req, res) => {

    const carId =
        Number(req.params.id);


    if (!Number.isInteger(carId)) {

        return res.status(400).json({
            error: "Invalid car ID."
        });

    }


    db.get(
        `
        SELECT *
        FROM cars
        WHERE id = ?
        `,
        [carId],
        (err, row) => {

            if (err) {

                console.error(
                    "GET /api/cars/:id:",
                    err.message
                );

                return res.status(500).json({
                    error: "Failed to retrieve car."
                });

            }


            if (!row) {

                return res.status(404).json({
                    error: "Car not found."
                });

            }


            res.json(row);

        }
    );

});


// =====================================
// GET ALL BOOKINGS
// =====================================

app.get("/api/bookings", (req, res) => {

    db.all(
        `
        SELECT
            bookings.*,
            cars.brand,
            cars.model,
            cars.price
        FROM bookings
        INNER JOIN cars
            ON bookings.car_id = cars.id
        ORDER BY bookings.id DESC
        `,
        [],
        (err, rows) => {

            if (err) {

                console.error(
                    "GET /api/bookings:",
                    err.message
                );

                return res.status(500).json({
                    error: "Failed to retrieve bookings."
                });

            }

            res.json(rows);

        }
    );

});


// =====================================
// CREATE BOOKING
// =====================================

app.post("/api/bookings", (req, res) => {

    const {
        car_id,
        customer_name,
        email,
        phone,
        pickup_location,
        pickup_date,
        return_date
    } = req.body;


    if (
        !car_id ||
        !customer_name ||
        !email ||
        !phone ||
        !pickup_location ||
        !pickup_date ||
        !return_date
    ) {

        return res.status(400).json({
            error: "Please fill in all required fields."
        });

    }


    const carId =
        Number(car_id);


    if (!Number.isInteger(carId)) {

        return res.status(400).json({
            error: "Invalid car ID."
        });

    }


    // =================================
    // EMAIL VALIDATION
    // =================================

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        return res.status(400).json({
            error: "Please enter a valid email address."
        });

    }


    // =================================
    // DATE VALIDATION
    // =================================

    const pickup =
        new Date(
            `${pickup_date}T00:00:00`
        );

    const returnDay =
        new Date(
            `${return_date}T00:00:00`
        );


    if (
        Number.isNaN(pickup.getTime()) ||
        Number.isNaN(returnDay.getTime())
    ) {

        return res.status(400).json({
            error: "Invalid rental dates."
        });

    }


    if (returnDay <= pickup) {

        return res.status(400).json({
            error: "Return date must be after pickup date."
        });

    }


    // =================================
    // CALCULATE RENTAL DAYS
    // =================================

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;


    const rentalDays =
        Math.round(
            (returnDay - pickup) /
            millisecondsPerDay
        );


    if (rentalDays <= 0) {

        return res.status(400).json({
            error: "Rental period must be at least 1 day."
        });

    }


    // =================================
    // FIND CAR
    // =================================

    db.get(
        `
        SELECT *
        FROM cars
        WHERE id = ?
        `,
        [carId],
        (err, car) => {

            if (err) {

                console.error(
                    "Find car error:",
                    err.message
                );

                return res.status(500).json({
                    error: "Database error."
                });

            }


            if (!car) {

                return res.status(404).json({
                    error: "Car not found."
                });

            }


            const totalPrice =
                rentalDays *
                Number(car.price);


            const sql = `
                INSERT INTO bookings
                (
                    car_id,
                    customer_name,
                    email,
                    phone,
                    pickup_location,
                    pickup_date,
                    return_date,
                    total_price
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;


            const values = [
                carId,
                customer_name.trim(),
                email.trim(),
                phone.trim(),
                pickup_location.trim(),
                pickup_date,
                return_date,
                totalPrice
            ];


            db.run(
                sql,
                values,
                function (err) {

                    if (err) {

                        console.error(
                            "Insert booking error:",
                            err.message
                        );

                        return res.status(500).json({
                            error: "Failed to create booking."
                        });

                    }


                    res.status(201).json({

                        success: true,

                        message:
                            "Booking created successfully.",

                        bookingId:
                            this.lastID,

                        car: {

                            id:
                                car.id,

                            brand:
                                car.brand,

                            model:
                                car.model

                        },

                        rentalDays:
                            rentalDays,

                        pricePerDay:
                            Number(car.price),

                        totalPrice:
                            totalPrice

                    });

                }
            );

        }
    );

});


// =====================================
// 404 API HANDLER
// =====================================

app.use("/api", (req, res) => {

    res.status(404).json({
        error: "API endpoint not found."
    });

});


// =====================================
// START SERVER
// =====================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log("=====================================");
        console.log("🚗 RentACar Server Started");
        console.log("=====================================");
        console.log(
            `🌐 http://localhost:${PORT}`
        );
        console.log(
            `🧪 http://localhost:${PORT}/api/test`
        );
        console.log(
            `🚗 http://localhost:${PORT}/api/cars`
        );
        console.log(
            `📁 Database: ${dbPath}`
        );
        console.log("=====================================");
        console.log("");

    }
);