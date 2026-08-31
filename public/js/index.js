// =====================================
// RENTACAR - HOMEPAGE
// =====================================


// =====================================
// GET HTML ELEMENTS
// =====================================

const pickupLocation =
    document.getElementById("pickupLocation");

const pickupDate =
    document.getElementById("pickupDate");

const returnDate =
    document.getElementById("returnDate");

const searchBtn =
    document.getElementById("searchBtn");

const featuredCars =
    document.getElementById("featuredCars");


// =====================================
// GET TODAY'S DATE
// =====================================

function getTodayString() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =====================================
// SET MINIMUM DATE
// =====================================

const todayString =
    getTodayString();


if (pickupDate) {

    pickupDate.min =
        todayString;

}


if (returnDate) {

    returnDate.min =
        todayString;

}


// =====================================
// UPDATE RETURN DATE
// =====================================

function updateReturnDateMinimum() {

    if (!pickupDate || !returnDate) {
        return;
    }


    if (!pickupDate.value) {

        returnDate.min =
            todayString;

        return;

    }


    const pickup =
        new Date(
            pickupDate.value + "T00:00:00"
        );


    pickup.setDate(
        pickup.getDate() + 1
    );


    const year =
        pickup.getFullYear();

    const month =
        String(pickup.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(pickup.getDate())
            .padStart(2, "0");


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
// PICKUP DATE CHANGE
// =====================================

if (pickupDate) {

    pickupDate.addEventListener(
        "change",
        updateReturnDateMinimum
    );

}


// =====================================
// SEARCH BUTTON
// =====================================

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        function () {

            const location =
                pickupLocation.value.trim();

            const pickup =
                pickupDate.value;

            const returnDateValue =
                returnDate.value;


            // =============================
            // VALIDATION
            // =============================

            if (!location) {

                alert(
                    "Please enter a pickup location."
                );

                pickupLocation.focus();

                return;

            }


            if (!pickup) {

                alert(
                    "Please select a pickup date."
                );

                pickupDate.focus();

                return;

            }


            if (!returnDateValue) {

                alert(
                    "Please select a return date."
                );

                returnDate.focus();

                return;

            }


            if (
                returnDateValue <= pickup
            ) {

                alert(
                    "Return date must be after pickup date."
                );

                returnDate.focus();

                return;

            }


            // =============================
            // CREATE SEARCH URL
            // =============================

            const params =
                new URLSearchParams();


            params.set(
                "location",
                location
            );


            params.set(
                "pickupDate",
                pickup
            );


            params.set(
                "returnDate",
                returnDateValue
            );


            // =============================
            // GO TO CARS PAGE
            // =============================

            window.location.href =
                `/cars.html?${params.toString()}`;

        }
    );

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================
// LOAD FEATURED CARS
// =====================================

async function loadFeaturedCars() {

    if (!featuredCars) {
        return;
    }


    featuredCars.innerHTML = `
        <p>Loading cars...</p>
    `;


    try {

        const response =
            await fetch("/api/cars");


        if (!response.ok) {

            throw new Error(
                "Failed to load cars."
            );

        }


        const cars =
            await response.json();


        if (
            !Array.isArray(cars) ||
            cars.length === 0
        ) {

            featuredCars.innerHTML = `
                <p>No cars available.</p>
            `;

            return;

        }


        // Show first 4 cars

        const featuredCarsList =
            cars.slice(0, 4);


        featuredCars.innerHTML =
            featuredCarsList
                .map(
                    car => createCarCard(car)
                )
                .join("");


    } catch (error) {

        console.error(
            "Error loading featured cars:",
            error
        );


        featuredCars.innerHTML = `
            <p>
                Unable to load cars.
                Please make sure the server is running.
            </p>
        `;

    }

}


// =====================================
// CREATE FEATURED CAR CARD
// =====================================

function createCarCard(car) {

    const imageHTML =
        car.image
            ? `
                <img
                    src="${escapeHTML(car.image)}"
                    alt="${escapeHTML(car.brand)} ${escapeHTML(car.model)}"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                    "
                    onerror="
                        this.style.display='none';
                        this.parentElement.innerHTML='🚗';
                    "
                >
            `
            : "🚗";


    return `

        <div class="car-card">

            <div class="car-image">

                ${imageHTML}

            </div>


            <div class="car-info">

                <h3>
                    ${escapeHTML(car.brand)}
                    ${escapeHTML(car.model)}
                </h3>


                <p>
                    ${escapeHTML(car.type)}
                    •
                    ${escapeHTML(car.transmission)}
                    •
                    ${escapeHTML(car.seats)} Seats
                </p>


                <div class="car-bottom">

                    <span class="rating">
                        ⭐ ${escapeHTML(car.rating)}
                    </span>


                    <span class="price">
                        $${Number(car.price || 0).toFixed(2)}
                        <small>/day</small>
                    </span>

                </div>


                <button
                    class="details-btn"
                    onclick="viewCar(${Number(car.id)})"
                >
                    View Details
                </button>

            </div>

        </div>

    `;

}


// =====================================
// VIEW CAR DETAILS
// =====================================

function viewCar(id) {

    const params =
        new URLSearchParams();


    params.set(
        "id",
        id
    );


    // Preserve search information

    if (
        pickupLocation &&
        pickupLocation.value.trim()
    ) {

        params.set(
            "location",
            pickupLocation.value.trim()
        );

    }


    if (
        pickupDate &&
        pickupDate.value
    ) {

        params.set(
            "pickupDate",
            pickupDate.value
        );

    }


    if (
        returnDate &&
        returnDate.value
    ) {

        params.set(
            "returnDate",
            returnDate.value
        );

    }


    window.location.href =
        `/details.html?${params.toString()}`;

}


// =====================================
// START HOMEPAGE
// =====================================

loadFeaturedCars();