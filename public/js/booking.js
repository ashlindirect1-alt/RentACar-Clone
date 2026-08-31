// =====================================
// RENTACAR - BOOKING PAGE
// =====================================

// =====================================
// GET HTML ELEMENTS
// =====================================

const bookingForm =
    document.getElementById("bookingForm");

const customerName =
    document.getElementById("customerName");

const email =
    document.getElementById("email");

const phone =
    document.getElementById("phone");

const pickupLocation =
    document.getElementById("pickupLocation");

const pickupDate =
    document.getElementById("pickupDate");

const returnDate =
    document.getElementById("returnDate");

const formError =
    document.getElementById("formError");

const summaryImage =
    document.getElementById("summaryImage");

const summaryCar =
    document.getElementById("summaryCar");

const summaryType =
    document.getElementById("summaryType");

const summaryPrice =
    document.getElementById("summaryPrice");

const summaryDays =
    document.getElementById("summaryDays");

const summaryTotal =
    document.getElementById("summaryTotal");

const confirmation =
    document.getElementById("confirmation");

const confirmationId =
    document.getElementById("confirmationId");

const confirmationCar =
    document.getElementById("confirmationCar");

const confirmationDays =
    document.getElementById("confirmationDays");

const confirmationTotal =
    document.getElementById("confirmationTotal");

// =====================================
// GET URL PARAMETERS
// =====================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const carId =
    urlParams.get("carId");

const locationParam =
    urlParams.get("location");

const pickupDateParam =
    urlParams.get("pickupDate");

const returnDateParam =
    urlParams.get("returnDate");

// =====================================
// SELECTED CAR
// =====================================

let selectedCar = null;

// =====================================
// GET TODAY
// =====================================

function getTodayString() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const todayString =
    getTodayString();

// =====================================
// SET DATE MINIMUMS
// =====================================

pickupDate.min =
    todayString;

returnDate.min =
    todayString;

// =====================================
// FILL URL INFORMATION
// =====================================

if (locationParam) {

    pickupLocation.value =
        locationParam;
}

if (pickupDateParam) {

    pickupDate.value =
        pickupDateParam;
}

if (returnDateParam) {

    returnDate.value =
        returnDateParam;
}

// =====================================
// UPDATE RETURN DATE MINIMUM
// =====================================

function updateReturnDateMinimum() {

    if (!pickupDate.value) {

        returnDate.min =
            todayString;

        return;
    }

    const pickup =
        new Date(
            pickupDate.value +
            "T00:00:00"
        );

    pickup.setDate(
        pickup.getDate() + 1
    );

    const year =
        pickup.getFullYear();

    const month =
        String(
            pickup.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            pickup.getDate()
        ).padStart(2, "0");

    const minimumReturn =
        `${year}-${month}-${day}`;

    returnDate.min =
        minimumReturn;

    if (
        returnDate.value &&
        returnDate.value < minimumReturn
    ) {

        returnDate.value =
            minimumReturn;
    }
}

// =====================================
// INITIAL DATE SETUP
// =====================================

updateReturnDateMinimum();

// =====================================
// PICKUP DATE CHANGE
// =====================================

pickupDate.addEventListener(
    "change",
    function () {

        updateReturnDateMinimum();

        calculateBookingTotal();
    }
);

// =====================================
// RETURN DATE CHANGE
// =====================================

returnDate.addEventListener(
    "change",
    function () {

        calculateBookingTotal();
    }
);

// =====================================
// LOAD SELECTED CAR
// =====================================

async function loadSelectedCar() {

    if (!carId) {

        showError(
            "No car was selected. Please return to the cars page."
        );

        summaryCar.textContent =
            "No car selected";

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

        selectedCar =
            await response.json();

        if (
            !selectedCar ||
            !selectedCar.id
        ) {

            throw new Error(
                "Invalid car data."
            );
        }

        displayCar();

        calculateBookingTotal();

    } catch (error) {

        console.error(
            "Error loading car:",
            error
        );

        showError(
            "Unable to load the selected car."
        );
    }
}

// =====================================
// DISPLAY SELECTED CAR
// =====================================

function displayCar() {

    if (!selectedCar) {
        return;
    }

    summaryCar.textContent =
        `${selectedCar.brand || ""} ${selectedCar.model || ""}`.trim();

    summaryType.textContent =
        `${selectedCar.type || "Car"} • ${selectedCar.fuel || "N/A"} • ${selectedCar.transmission || "N/A"}`;

    summaryPrice.textContent =
        `$${Number(
            selectedCar.price || 0
        ).toFixed(2)}`;

    // =================================
    // IMAGE
    // =================================

    if (selectedCar.image) {

        summaryImage.innerHTML = `
            <img
                src="${selectedCar.image}"
                alt="${selectedCar.brand || ""} ${selectedCar.model || ""}"
                onerror="
                    this.style.display='none';
                    this.parentElement.textContent='🚗';
                "
            >
        `;

    } else {

        summaryImage.textContent =
            "🚗";
    }
}

// =====================================
// GET RENTAL DAYS
// =====================================

function getRentalDays() {

    if (
        !pickupDate.value ||
        !returnDate.value
    ) {

        return 0;
    }

    const pickup =
        new Date(
            pickupDate.value +
            "T00:00:00"
        );

    const returnDay =
        new Date(
            returnDate.value +
            "T00:00:00"
        );

    const difference =
        returnDay.getTime() -
        pickup.getTime();

    const millisecondsPerDay =
        1000 *
        60 *
        60 *
        24;

    const days =
        Math.round(
            difference /
            millisecondsPerDay
        );

    return days > 0
        ? days
        : 0;
}

// =====================================
// CALCULATE TOTAL
// =====================================

function calculateBookingTotal() {

    if (!selectedCar) {
        return;
    }

    const rentalDays =
        getRentalDays();

    const price =
        Number(
            selectedCar.price || 0
        );

    const total =
        rentalDays * price;

    summaryDays.textContent =
        rentalDays;

    summaryTotal.textContent =
        `$${total.toFixed(2)}`;
}

// =====================================
// SHOW ERROR
// =====================================

function showError(message) {

    formError.textContent =
        message;

    formError.classList.remove(
        "hidden"
    );
}

// =====================================
// HIDE ERROR
// =====================================

function hideError() {

    formError.textContent =
        "";

    formError.classList.add(
        "hidden"
    );
}

// =====================================
// FORM SUBMIT
// =====================================

bookingForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideError();

        // =================================
        // CHECK CAR
        // =================================

        if (!selectedCar) {

            showError(
                "Please select a car first."
            );

            return;
        }

        // =================================
        // NAME
        // =================================

        if (
            !customerName.value.trim()
        ) {

            showError(
                "Please enter your full name."
            );

            customerName.focus();

            return;
        }

        // =================================
        // EMAIL
        // =================================

        if (
            !email.value.trim()
        ) {

            showError(
                "Please enter your email address."
            );

            email.focus();

            return;
        }

        // =================================
        // PHONE
        // =================================

        if (
            !phone.value.trim()
        ) {

            showError(
                "Please enter your phone number."
            );

            phone.focus();

            return;
        }

        // =================================
        // LOCATION
        // =================================

        if (
            !pickupLocation.value.trim()
        ) {

            showError(
                "Please enter a pickup location."
            );

            pickupLocation.focus();

            return;
        }

        // =================================
        // PICKUP DATE
        // =================================

        if (!pickupDate.value) {

            showError(
                "Please select a pickup date."
            );

            pickupDate.focus();

            return;
        }

        // =================================
        // RETURN DATE
        // =================================

        if (!returnDate.value) {

            showError(
                "Please select a return date."
            );

            returnDate.focus();

            return;
        }

        // =================================
        // DATE VALIDATION
        // =================================

        if (
            returnDate.value <=
            pickupDate.value
        ) {

            showError(
                "Return date must be after pickup date."
            );

            returnDate.focus();

            return;
        }

        const rentalDays =
            getRentalDays();

        if (rentalDays <= 0) {

            showError(
                "Please select valid rental dates."
            );

            return;
        }

        // =================================
        // SUBMIT BUTTON
        // =================================

        const submitButton =
            bookingForm.querySelector(
                ".confirm-btn"
            );

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Processing...";

        // =================================
        // SEND BOOKING
        // =================================

        try {

            const response =
                await fetch(
                    "/api/bookings",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                car_id:
                                    selectedCar.id,

                                customer_name:
                                    customerName.value.trim(),

                                email:
                                    email.value.trim(),

                                phone:
                                    phone.value.trim(),

                                pickup_location:
                                    pickupLocation.value.trim(),

                                pickup_date:
                                    pickupDate.value,

                                return_date:
                                    returnDate.value
                            })
                    }
                );

            // =================================
            // READ RESPONSE
            // =================================

            let data = {};

            try {

                data =
                    await response.json();

            } catch {

                data = {};
            }

            // =================================
            // SERVER ERROR
            // =================================

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to create booking."
                );
            }

            // =================================
            // SUCCESS
            // =================================

            showConfirmation(data);

        } catch (error) {

            console.error(
                "Booking error:",
                error
            );

            showError(
                error.message ||
                "Something went wrong. Please try again."
            );

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Confirm Booking";
        }
    }
);

// =====================================
// SHOW CONFIRMATION
// =====================================

function showConfirmation(data) {

    const rentalDays =
        data.rentalDays ||
        data.rental_days ||
        getRentalDays();

    const calculatedTotal =
        rentalDays *
        Number(
            selectedCar.price || 0
        );

    const serverTotal =
        data.totalPrice !== undefined
            ? Number(data.totalPrice)
            : data.total_price !== undefined
                ? Number(data.total_price)
                : calculatedTotal;

    // =================================
    // BOOKING ID
    // =================================

    confirmationId.textContent =
        data.bookingId ||
        data.booking_id ||
        data.id ||
        "-";

    // =================================
    // CAR
    // =================================

    confirmationCar.textContent =
        `${selectedCar.brand || ""} ${selectedCar.model || ""}`.trim();

    // =================================
    // DAYS
    // =================================

    confirmationDays.textContent =
        rentalDays;

    // =================================
    // TOTAL
    // =================================

    confirmationTotal.textContent =
        `$${serverTotal.toFixed(2)}`;

    // =================================
    // SHOW CONFIRMATION
    // =================================

    confirmation.classList.remove(
        "hidden"
    );

    // Hide booking layout

    const bookingLayout =
        document.querySelector(
            ".booking-layout"
        );

    if (bookingLayout) {

        bookingLayout.style.display =
            "none";
    }

    // Hide subtitle

    const pageSubtitle =
        document.querySelector(
            ".page-subtitle"
        );

    if (pageSubtitle) {

        pageSubtitle.style.display =
            "none";
    }

    // Scroll to confirmation

    confirmation.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// =====================================
// START
// =====================================

loadSelectedCar();