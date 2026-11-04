
let requests = [
    {
        producerName: "Emmanuel",
        wasteType: "Organic Waste",
        status: "Pending",
        message: "",
        points: 0
    }
];
let collectionHistory = [];
// UPDATE DASHBOARD STATISTICS
function updateStatistics() {
    let pendingRequests = requests.filter(request => request.status === "Pending").length;

    document.getElementById("pending-count").textContent = pendingRequests + " Requests";
    document.getElementById("request-number").textContent = pendingRequests + " Requests";

    let totalPoints = collectionHistory.reduce((total, request) => {
        return total + request.points;
    }, 0);

    document.getElementById("total-points").textContent = totalPoints + " Points";
}
// DISPLAY PICKUP REQUESTS
function displayRequests() {
    let requestsContainer = document.getElementById("requests-container");
    requestsContainer.innerHTML = "";

    requests.forEach((request, index) => {
        if (request.status === "Pending") {
            requestsContainer.innerHTML += `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5>${request.producerName}</h5>
                        <p>Waste Type: ${request.wasteType}</p>
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
        }
    });
}

// ACCEPT PICKUP REQUEST
function acceptRequest(index) {
    requests[index].status = "Accepted";

    updateStatistics();
    displayRequests();
    displayAcceptedRequests();
}

// DECLINE PICKUP REQUEST
function declineRequest(index) {
    requests[index].status = "Declined";

    updateStatistics();
    displayRequests();
}

// DISPLAY DASHBOARD WHEN PAGE LOADS
updateStatistics();
displayRequests();
// DISPLAY ACCEPTED REQUESTS
function displayAcceptedRequests() {
    let pickupSelect = document.getElementById("pickup");

    pickupSelect.innerHTML = '<option value="">Select a pickup</option>';

    requests.forEach((request, index) => {
        if (request.status === "Accepted") {
            pickupSelect.innerHTML += `
                <option value="${index}">
                    ${request.producerName} - ${request.wasteType}
                </option>
            `;
        }
    });
}
// AUTOMATIC POINTS CALCULATION
function updatePointsPreview() {
    let sortingStatus = document.getElementById("quality").value;
    let points = 0;

    if (sortingStatus === "Sorted") {
        points = 50;
    }

    document.getElementById("points-preview").textContent = points + " JunkPts";
}
// CONFIRM COLLECTION
function confirmCollection() {
    let pickupIndex = document.getElementById("pickup").value;
    let sortingStatus = document.getElementById("quality").value;
    let points = sortingStatus === "Sorted" ? 50 : 0;

    if (pickupIndex === "" || sortingStatus === "") {
        alert("Please select a pickup and sorting status.");
        return;
    }

    let request = requests[pickupIndex];
    request.status = "Collected";
    request.points = points;
    request.sortingStatus = sortingStatus;

    collectionHistory.push(request);

    updateStatistics();
    displayAcceptedRequests();
    displayHistory();

    alert("Collection confirmed successfully!");
}
document.getElementById("confirm-collection").addEventListener("click", confirmCollection);
// DISPLAY COLLECTION HISTORY
function displayHistory() {
    let historyBody = document.getElementById("history-body");
    let historyEmpty = document.getElementById("history-empty");

    historyBody.innerHTML = "";

    collectionHistory.forEach(request => {
        historyBody.innerHTML += `
            <tr>
                <td>${request.producerName}</td>
                <td>${request.wasteType}</td>
                <td>${request.points}</td>
                <td>${new Date().toLocaleDateString()}</td>
            </tr>
        `;
    });

    if (collectionHistory.length === 0) {
        historyEmpty.style.display = "block";
    } else {
        historyEmpty.style.display = "none";
    }
}
updateStatistics();
displayRequests();
displayAcceptedRequests();
displayHistory();
document.getElementById("confirm-collection").addEventListener("click", confirmCollection);
document.getElementById("quality").addEventListener("change", updatePointsPreview);