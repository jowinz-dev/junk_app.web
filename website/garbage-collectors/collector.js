
const container = document.getElementById("requests-container");

const requests = [
    {
        resident: "Emmanuel",
        location: "Mukono",
        wasteType: "Plastic",
        status: "Pending"
    },
    {
        resident: "Julius",
        location: "Mukono",
        wasteType: "Organic waste",
        status: "Available"
    },
    {
        resident: "Lazarus",
        location: "Seeta",
        wasteType: "Inorganic waste",
        status: "Pending"
    }
];

document.getElementById("request-count").textContent =
    requests.length + " Requests";
requests.forEach(function(request) {
    let symbol = "◷";

    if (request.status === "Available") {
        symbol = "✓";
    } else if (request.status === "Accepted") {
        symbol = "🤝";
    } else if (request.status === "In Progress") {
        symbol = "↻";
    } else if (request.status === "Completed") {
        symbol = "✓";
    } else if (request.status === "Cancelled") {
        symbol = "✕";
    }

    container.innerHTML += `
        <div class="request-card">
            <h3>${request.resident}</h3>
            <p>Location: ${request.location}</p>
            <p>Waste type: ${request.wasteType}</p>
            <p>Status:
                <span class="status ${request.status.toLowerCase().replaceAll(" ", "-")}">
                    ${symbol} ${request.status}
                </span>
            </p>
        </div>
    `;
});
