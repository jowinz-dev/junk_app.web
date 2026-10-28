
   let totalPoints = 0;
let pendingCount = 0;
let confirmedCount = 0;

const form = document.getElementById("wasteForm");
const message = document.getElementById("message");
const historyBody = document.getElementById("historyBody");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const selected = document.querySelectorAll('input[name="trash"]:checked');
    
    // Captures the quantity amount
    const quantity = Number(document.getElementById("quantity").value);

    // Validation check
    if (selected.length === 0) {
        message.textContent = "Please select at least one waste category.";
        return;
    }

    const categories = Array.from(selected).map(function(item) {
        return item.value;
    }).join(", ");

    pendingCount++;
    document.getElementById("pending").textContent = pendingCount;

    if (historyBody.textContent.includes("No collection requests yet.")) {
        historyBody.innerHTML = "";
    }

    const row = historyBody.insertRow();

    // Row 1: Date
    row.insertCell().textContent = new Date().toLocaleDateString();

    // Row 2: Categories
    row.insertCell().textContent = categories;

    // Row 3: Quantity (CORRECTION: Added this so the quantity isn't lost!)
    row.insertCell().textContent = quantity;

    // Row 4: Status
    const statusCell = row.insertCell();
    statusCell.textContent = "Awaiting confirmation";
    statusCell.className = "pending";

    // Row 5: Points.
    row.insertCell().textContent = "Pending verification";

    message.textContent = "Request recorded! Your points will be awarded after the collector confirms your waste.";

    form.reset();
});