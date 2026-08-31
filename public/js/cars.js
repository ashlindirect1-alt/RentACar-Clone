// =====================================
// RENTACAR - CARS PAGE
// =====================================

let allCars = [];
let filteredCars = [];

// =====================================
// GET HTML ELEMENTS
// =====================================

const carsContainer =
    document.getElementById("carsContainer");

const resultsCount =
    document.getElementById("resultsCount");

const searchLocation =
    document.getElementById("searchLocation");

const searchPickup =
    document.getElementById("searchPickup");

const searchReturn =
    document.getElementById("searchReturn");

const sortCars =
    document.getElementById("sortCars");

const priceFilter =
    document.getElementById("priceFilter");

const clearFilters =
    document.getElementById("clearFilters");

// =====================================
// GET URL PARAMETERS
// =====================================

const urlParams =
    new URLSearchParams(window.location.search);

const locationParam =
    urlParams.get("location");

const pickupDateParam =
    urlParams.get("pickupDate");

const returnDateParam =
    urlParams.get("returnDate");

// =====================================
// FORMAT DATE
// =====================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}

// =====================================
// DISPLAY SEARCH INFORMATION
// =====================================

if (searchLocation) {
    searchLocation.textContent =
        locationParam || "All locations";
}

if (searchPickup) {
    searchPickup.textContent =
        formatDate(pickupDateParam);
}

if (searchReturn) {
    searchReturn.textContent =
        formatDate(returnDateParam);
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
// LOAD CARS
// =====================================

async function loadCars() {

    try {

        carsContainer.innerHTML = `
            <p class="loading-message">
                Loading available cars...
            </p>
        `;

        const response =
            await fetch("/api/cars");

        if (!response.ok) {
            throw new Error(
                "Failed to load cars."
            );
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "Invalid cars data received from server."
            );
        }

        allCars = data;

        filteredCars = [...allCars];

        applyFilters();

    } catch (error) {

        console.error(
            "Error loading cars:",
            error
        );

        carsContainer.innerHTML = `
            <div class="error-message">
                <h3>
                    Unable to load cars
                </h3>

                <p>
                    Please make sure the server
                    is running and try again.
                </p>
            </div>
        `;

        if (resultsCount) {
            resultsCount.textContent =
                "Unable to load cars.";
        }
    }
}

// =====================================
// DISPLAY CARS
// =====================================

function displayCars(cars) {

    carsContainer.innerHTML = "";

    if (
        !Array.isArray(cars) ||
        cars.length === 0
    ) {

        carsContainer.innerHTML = `
            <div class="no-results">

                <div class="no-results-icon">
                    🚗
                </div>

                <h3>
                    No cars found
                </h3>

                <p>
                    Try changing your filters.
                </p>

            </div>
        `;

        if (resultsCount) {
            resultsCount.textContent =
                "0 cars found";
        }

        return;
    }

    if (resultsCount) {
        resultsCount.textContent =
            `${cars.length} car${cars.length !== 1 ? "s" : ""} found`;
    }

    cars.forEach(car => {

        const card =
            createCarCard(car);

        carsContainer.appendChild(card);

    });
}

// =====================================
// CREATE CAR CARD
// =====================================

function createCarCard(car) {

    const card =
        document.createElement("div");

    card.className = "car-card";

    const imageHTML =
        car.image
            ? `
                <img
                    src="${escapeHTML(car.image)}"
                    alt="${escapeHTML(car.brand)} ${escapeHTML(car.model)}"
                    onerror="
                        this.style.display='none';
                        this.parentElement.textContent='🚗';
                    "
                >
            `
            : "🚗";

    card.innerHTML = `

        <div class="car-image">
            ${imageHTML}
        </div>

        <div class="car-info">

            <h3>
                ${escapeHTML(car.brand)}
                ${escapeHTML(car.model)}
            </h3>

            <p>
                ${escapeHTML(
                    car.description ||
                    "Reliable rental car."
                )}
            </p>

            <div class="car-specs">

                <span>
                    🚘 ${escapeHTML(car.type)}
                </span>

                <span>
                    ⛽ ${escapeHTML(car.fuel)}
                </span>

                <span>
                    ⚙️ ${escapeHTML(car.transmission)}
                </span>

                <span>
                    👥 ${escapeHTML(car.seats)} Seats
                </span>

            </div>

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
                type="button"
            >
                View Details & Book
            </button>

        </div>
    `;

    const button =
        card.querySelector(".details-btn");

    button.addEventListener(
        "click",
        function () {

            goToDetails(car.id);

        }
    );

    return card;
}

// =====================================
// APPLY FILTERS
// =====================================

function applyFilters() {

    let cars = [...allCars];

    // =================================
    // CAR TYPE
    // =================================

    const selectedTypes =
        Array.from(
            document.querySelectorAll(
                'input[name="carType"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );

    if (selectedTypes.length > 0) {

        cars = cars.filter(
            car =>
                selectedTypes.includes(
                    String(car.type)
                )
        );
    }

    // =================================
    // FUEL
    // =================================

    const selectedFuelTypes =
        Array.from(
            document.querySelectorAll(
                'input[name="fuelType"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );

    if (selectedFuelTypes.length > 0) {

        cars = cars.filter(
            car =>
                selectedFuelTypes.includes(
                    String(car.fuel)
                )
        );
    }

    // =================================
    // BRAND
    // =================================

    const selectedBrands =
        Array.from(
            document.querySelectorAll(
                'input[name="brand"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );

    if (selectedBrands.length > 0) {

        cars = cars.filter(
            car =>
                selectedBrands.includes(
                    String(car.brand)
                )
        );
    }

    // =================================
    // PRICE
    // =================================

    const maxPrice =
        priceFilter
            ? priceFilter.value
            : "all";

    if (maxPrice !== "all") {

        cars = cars.filter(
            car =>
                Number(car.price) <=
                Number(maxPrice)
        );
    }

    // =================================
    // SORT
    // =================================

    const sortValue =
        sortCars
            ? sortCars.value
            : "default";

    if (sortValue === "price-low") {

        cars.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    } else if (sortValue === "price-high") {

        cars.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    } else if (sortValue === "rating") {

        cars.sort(
            (a, b) =>
                Number(b.rating) -
                Number(a.rating)
        );
    }

    filteredCars = cars;

    displayCars(filteredCars);
}

// =====================================
// FILTER CHECKBOXES
// =====================================

const filterCheckboxes =
    document.querySelectorAll(
        'input[name="carType"], input[name="fuelType"], input[name="brand"]'
    );

filterCheckboxes.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            applyFilters
        );

    }
);

// =====================================
// PRICE FILTER
// =====================================

if (priceFilter) {

    priceFilter.addEventListener(
        "change",
        applyFilters
    );
}

// =====================================
// SORT
// =====================================

if (sortCars) {

    sortCars.addEventListener(
        "change",
        applyFilters
    );
}

// =====================================
// CLEAR FILTERS
// =====================================

if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        function () {

            filterCheckboxes.forEach(
                checkbox => {
                    checkbox.checked = false;
                }
            );

            if (priceFilter) {
                priceFilter.value = "all";
            }

            if (sortCars) {
                sortCars.value = "default";
            }

            applyFilters();

        }
    );
}

// =====================================
// GO TO DETAILS PAGE
// =====================================

function goToDetails(carId) {

    const params =
        new URLSearchParams();

    params.set(
        "id",
        carId
    );

    if (locationParam) {

        params.set(
            "location",
            locationParam
        );

    }

    if (pickupDateParam) {

        params.set(
            "pickupDate",
            pickupDateParam
        );

    }

    if (returnDateParam) {

        params.set(
            "returnDate",
            returnDateParam
        );

    }

    window.location.href =
        `/details.html?${params.toString()}`;
}

// =====================================
// START
// =====================================

loadCars();