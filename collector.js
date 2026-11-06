
document.addEventListener("DOMContentLoaded", () => {

    // 1. CHECK COLLECTOR LOGIN
    if (localStorage.getItem("isLoggedIn") !== "true") {
        alert("Please sign in first!");
        window.location.href = "index.html";
        return;
    }

    // 2. GET PAGE ELEMENTS
    const container = document.getElementById("requests-container");
    const pickupSelect = document.getElementById("pickup");
    const qualitySelect = document.getElementById("quality");

    // 3. GET LOGGED-IN COLLECTOR NAME
    const collectorName =
        localStorage.getItem("currentUser") || "Collector";

    const accountName = document.querySelector(
        ".stats-section .card .card-text"
    );

    if (accountName) {
        accountName.textContent = `${collectorName} | COL-8820`;
    }

    const profileName = document.querySelector(
        ".profile-section .list-group-item"
    );

    if (profileName) {
        profileName.textContent = `Full Name: ${collectorName}`;
    }

    // 4. GET REAL PRODUCER REQUESTS
    let requests = JSON.parse(
        localStorage.getItem("globalCollectionHistory")
    ) || [];

    // SAVE REQUESTS
    function saveRequests() {
        localStorage.setItem(
            "globalCollectionHistory",
            JSON.stringify(requests)
        );
    }

    // 5. UPDATE DASHBOARD STATISTICS
    function updateStatistics() {

        const pendingRequests = requests.filter(
            request => request.status === "Pending"
        ).length;

        const pendingCount = document.getElementById("pending-count");
        const requestNumber = document.getElementById("request-number");

        if (pendingCount) {
            pendingCount.textContent = pendingRequests + " Requests";
        }

        if (requestNumber) {
            requestNumber.textContent = pendingRequests + " Requests";
        }

        const totalPoints = requests.reduce((total, request) => {
            if (request.status === "Collected") {
                return total + (Number(request.points) || 0);
            }

            return total;
        }, 0);

        const pointsDisplay = document.getElementById("total-points");

        if (pointsDisplay) {
            pointsDisplay.textContent = totalPoints + " Points";
        }
    }

    // 6. DISPLAY PENDING PICKUP REQUESTS
    function displayRequests() {

        if (!container) return;

        container.innerHTML = "";

        const pendingRequests = requests
            .map((request, index) => ({ request, index }))
            .filter(item => item.request.status === "Pending");

        if (pendingRequests.length === 0) {
            container.innerHTML = "<p>No pending pickup requests.</p>";
            return;
        }

        pendingRequests.forEach(({ request, index }) => {

            container.innerHTML += `
                <div class="card mb-3">
                    <div class="card-body">

                        <h5>${request.producerName || "Producer"}</h5>

                        <p>
                            Waste Type:
                            ${request.category || request.wasteType || "Not specified"}
                        </p>

                        <p>
                            Pickup Day:
                            ${request.scheduledDay || "Not specified"}
                        </p>

                        <p>Status: ${request.status}</p>

                        <button class="btn btn-success me-2"
                            onclick="acceptRequest(${index})">
                            Accept
                        </button>

                        <button class="btn btn-danger"
                            onclick="declineRequest(${index})">
                            Decline
                        </button>

                    </div>
                </div>
            `;
        });
    }

    // 7. ACCEPT PICKUP REQUEST
    window.acceptRequest = function(index) {

        if (!requests[index] || requests[index].status !== "Pending") {
            return;
        }

        requests[index].status = "Accepted";

        saveRequests();
        updateStatistics();
        displayRequests();
        displayAcceptedRequests();
    };

    // 8. DECLINE PICKUP REQUEST
    window.declineRequest = function(index) {

        if (!requests[index] || requests[index].status !== "Pending") {
            return;
        }

        requests[index].status = "Declined";

        saveRequests();
        updateStatistics();
        displayRequests();
        displayAcceptedRequests();
    };

    // 9. DISPLAY ACCEPTED REQUESTS
    function displayAcceptedRequests() {

        if (!pickupSelect) return;

        pickupSelect.innerHTML =
            '<option value="">Select a pickup</option>';

        requests.forEach((request, index) => {

            if (request.status === "Accepted") {

                pickupSelect.innerHTML += `
                    <option value="${index}">
                        ${request.producerName || "Producer"} -
                        ${request.category || request.wasteType || "Waste"}
                    </option>
                `;
            }
        });
    }

    // 10. AUTOMATIC POINTS CALCULATION
    function updatePointsPreview() {

        if (!qualitySelect) return;

        const sortingStatus = qualitySelect.value;

        const points = sortingStatus === "Sorted" ? 50 : 0;

        const pointsPreview =
            document.getElementById("points-preview");

        if (pointsPreview) {
            pointsPreview.textContent = points + " JunkPts";
        }
    }

    // 11. CONFIRM COLLECTION
    function confirmCollection() {

        const pickupIndex = pickupSelect.value;
        const sortingStatus = qualitySelect.value;

        if (pickupIndex === "" || sortingStatus === "") {
            alert("Please select a pickup and sorting status.");
            return;
        }

        const request = requests[Number(pickupIndex)];

        if (!request || request.status !== "Accepted") {
            alert("Please select a valid accepted pickup.");
            return;
        }

        request.status = "Collected";
        request.sortingStatus = sortingStatus;
        request.points = sortingStatus === "Sorted" ? 50 : 0;

        saveRequests();

        updateStatistics();
        displayRequests();
        displayAcceptedRequests();
        displayHistory();
        updatePointsPreview();

        alert("Collection confirmed successfully!");
    }

    // 12. DISPLAY COLLECTION HISTORY
    function displayHistory() {

        const historyBody = document.getElementById("history-body");
        const historyEmpty = document.getElementById("history-empty");

        if (!historyBody || !historyEmpty) return;

        historyBody.innerHTML = "";

        const collectedRequests = requests.filter(
            request => request.status === "Collected"
        );

        collectedRequests.forEach(request => {

            historyBody.innerHTML += `
                <tr>
                    <td>${request.producerName || "Producer"}</td>
                    <td>${request.category || request.wasteType || "Waste"}</td>
                    <td>${Number(request.points) || 0}</td>
                    <td>${request.date || "Not available"}</td>
                </tr>
            `;
        });

        historyEmpty.style.display =
            collectedRequests.length === 0 ? "block" : "none";
    }

    // 13. EVENT LISTENERS
    const confirmButton =
        document.getElementById("confirm-collection");

    if (confirmButton) {
        confirmButton.addEventListener("click", confirmCollection);
    }

    if (qualitySelect) {
        qualitySelect.addEventListener(
            "change",
            updatePointsPreview
        );
    }

    // 14. INITIALIZE DASHBOARD
    updateStatistics();
    displayRequests();
    displayAcceptedRequests();
    displayHistory();
    updatePointsPreview();

});
