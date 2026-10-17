document.addEventListener('DOMContentLoaded', () => {
    const wasteForm = document.getElementById('wasteForm');
    const historyTableBody = document.querySelector('#historyTable tbody');

    wasteForm.addEventListener('submit', (event) => {
    
        event.preventDefault();

        
        const wasteType = document.getElementById('waste_type').value;
        const weight = document.getElementById('weight').value;
        const location = document.getElementById('location').value;

        const today = new Date();
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${formattedDate}</td>
            <td>${wasteType}</td>
            <td>${parseFloat(weight).toFixed(1)} kg</td>
            <td><span class="status status-pending">Pending</span></td>
        `;

        historyTableBody.insertBefore(newRow, historyTableBody.firstChild);

        wasteForm.reset();
        
        console.log(`Successfully logged request for ${location}`);
    });
});