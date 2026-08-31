// =====================================
// RENTACAR - CAR DETAILS PAGE
// =====================================

// =====================================
// GET URL PARAMETERS
// =====================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const carId =
    urlParams.get("id");

const locationParam =
    urlParams.get("location");

const pickupDateParam =
    urlParams.get("pickupDate");

const returnDateParam =
    urlParams.get("returnDate");

// =====================================
// GET HTML ELEMENTS
// =====================================

const loading =
    document.getElementById("loading");

const carDetails =
    document.getElementById("carDetails");

const errorMessage =
    document.getElementById("errorMessage");

const carImage =
    document.getElementById("carImage");

const carType =
    document.getElementById("carType");

const carName =
    document.getElementById("carName");

const carRating =
    document.getElementById("carRating");

const carDescription =
    document.getElementById("carDescription");

const specType =
    document.getElementById("specType");

const specFuel =
    document.getElementById("specFuel");

const specTransmission =
    document.getElementById("specTransmission");

const specSeats =
    document.getElementById("specSeats");

const carPrice =
    document.getElementById("carPrice");

const bookNowBtn =
    document.getElementById("bookNowBtn");

// =====================================
// LOAD CAR
// =====================================

async function loadCar() {

    if (!carId) {

        showError();

        return;
    }

    try {

        const response =
            await fetch(
                `/api/cars/${encodeURIComponent(carId)}`
            );

        if (!response.ok) {

            throw new Error(
                "Car not found."
            );
        }

        const car =
            await response.json();

        if (!car || !car.id) {

            throw new Error(
                "Invalid car data."
            );
        }

        displayCar(car);

    } catch (error) {

        console.error(
            "Error loading car:",
            error
        );

        showError();
    }
}

// =====================================
// DISPLAY CAR
// =====================================

function displayCar(car) {

    // Hide loading

    loading.classList.add(
        "hidden"
    );

    // Show details

    carDetails.classList.remove(
        "hidden"
    );

    // =================================
    // NAME
    // =================================

    carName.textContent =
        `${car.brand || ""} ${car.model || ""}`.trim();

    // =================================
    // TYPE
    // =================================

    carType.textContent =
        car.type || "Car";

    // =================================
    // RATING
    // =================================

    carRating.textContent =
        `⭐ ${Number(car.rating || 0).toFixed(1)} / 5`;

    // =================================
    // DESCRIPTION
    // =================================

    carDescription.textContent =
        car.description ||
        "Reliable and comfortable rental car.";

    // =================================
    // SPECIFICATIONS
    // =================================

    specType.textContent =
        car.type || "-";

    specFuel.textContent =
        car.fuel || "-";

    specTransmission.textContent =
        car.transmission || "-";

    specSeats.textContent =
        car.seats
            ? `${car.seats} Seats`
            : "-";

    // =================================
    // PRICE
    // =================================

    carPrice.textContent =
        `$${Number(car.price || 0).toFixed(2)}/day`;

    // =================================
    // IMAGE
    // =================================

    if (car.image) {

        carImage.style.display =
            "block";

        carImage.src =
            car.image;

        carImage.alt =
            `${car.brand || ""} ${car.model || ""}`.trim();

        carImage.onerror =
            function () {

                this.style.display =
                    "none";

                this.parentElement.textContent =
                    "🚗";
            };

    } else {

        carImage.style.display =
            "none";

        carImage.parentElement.textContent =
            "🚗";
    }

    // =================================
    // BOOK NOW
    // =================================

    bookNowBtn.onclick =
        function () {

            const bookingParams =
                new URLSearchParams();

            bookingParams.set(
                "carId",
                car.id
            );

            if (locationParam) {

                bookingParams.set(
                    "location",
                    locationParam
                );
            }

            if (pickupDateParam) {

                bookingParams.set(
                    "pickupDate",
                    pickupDateParam
                );
            }

            if (returnDateParam) {

                bookingParams.set(
                    "returnDate",
                    returnDateParam
                );
            }

            window.location.href =
                `/booking.html?${bookingParams.toString()}`;
        };
}

// =====================================
// SHOW ERROR
// =====================================

function showError() {

    loading.classList.add(
        "hidden"
    );

    carDetails.classList.add(
        "hidden"
    );

    errorMessage.classList.remove(
        "hidden"
    );
}

// =====================================
// START
// =====================================

loadCar();