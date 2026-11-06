document.addEventListener("DOMContentLoaded", () => {
    // === ONE-TIME CLEAN UP SYSTEM ===
    // This clears out your old +5 test records from localStorage once and for all
    if (!localStorage.getItem("historyCleanedV2")) {
        localStorage.removeItem("globalCollectionHistory");
        localStorage.setItem("historyCleanedV2", "true");
    }   
    // === 1. NAVIGATION & EXTERNAL PAGE ROUTING ===
    const sidebarDropdown = document.querySelector(".sidebar-dropdown");
    if (sidebarDropdown) {
        sidebarDropdown.addEventListener("change", (e) => {
            const selectedValue = e.target.value;
            if (selectedValue) {
                window.location.href = selectedValue;
            }
        });
    }
    // === 2. WASTE LOGGING & CATEGORY SELECTION ===
    const wasteSelect = document.querySelector(".log-waste-box select") || document.querySelector("select[name='waste_category']"); 
    const unsortedRadio = document.querySelector("input[type='radio']"); // Targets your single radio button element

    // Auto-toggle dropdown visibility when clicking the Unsorted radio button
    if (unsortedRadio) {
        unsortedRadio.addEventListener("change", () => {
            if (unsortedRadio.checked && wasteSelect) {
                wasteSelect.disabled = true;
                wasteSelect.style.opacity = "0.5";
            }
        });
        // If user clicks on the dropdown list, automatically uncheck the Unsorted radio option
        if (wasteSelect) {
            wasteSelect.addEventListener("click", () => {
                unsortedRadio.checked = false;
                wasteSelect.disabled = false;
                wasteSelect.style.opacity = "1";
            });
        }
    }
    // === 3. PERSISTING DATA ACROSS PAGES ===
    const submitBtn = document.querySelector(".submit-btn");

    if (submitBtn) {
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault(); 

            let selectedCategory = "Unsorted Waste";
            
            // FIX: If the Unsorted radio button is NOT checked, it means Sorted is active!
            const isSortedActive = unsortedRadio ? !unsortedRadio.checked : true;

            if (isSortedActive && wasteSelect) {
                selectedCategory = "Sorted: " + wasteSelect.options[wasteSelect.selectedIndex].text;
            }
            // Fetch current selected scheduled day text safely
            let pickupDay = "Not Scheduled";
            const daySelector = document.querySelector(".schedule-box select") || document.querySelector("select");
            if (daySelector) {
                pickupDay = daySelector.options[daySelector.selectedIndex].text;
            }
            // Build request item structure
            const collectionRequest = {
                id: "REQ-" + Date.now(), 
                date: new Date().toLocaleDateString(),
                category: selectedCategory,
                status: "Pending",
                points: 0, // Stays 0 until collector verification
                scheduledDay: pickupDay,
                potentialPoints: isSortedActive ? 50 : 0
            };
            // Save entry to localStorage array matrix
            let requestHistory = JSON.parse(localStorage.getItem("globalCollectionHistory")) || [];
            requestHistory.unshift(collectionRequest); 

            localStorage.setItem("globalCollectionHistory", JSON.stringify(requestHistory));

            alert(`Request Logged for ${pickupDay}!\nCategory: ${selectedCategory}\nStatus: Pending Collector Confirmation.`);
            
            // Refresh table view interface
            updateDashboardUI();
        });
    }
    // === 4. DYNAMIC INTERFACE SYNCHRONIZATION ===
    function updateDashboardUI() {
        const pointsDisplay = document.querySelector(".points-display") || document.querySelector(".sidebar p"); 
        const noDataText = document.querySelector(".no-data");
        const historyTable = document.querySelector(".history-table");

        const totalPoints = localStorage.getItem("totalUserPoints") || "0";
        if (pointsDisplay) pointsDisplay.textContent = `${totalPoints} Pts`;

        const savedHistory = JSON.parse(localStorage.getItem("globalCollectionHistory")) || [];
        
        if (historyTable) {
            // Completely flush out old table elements rows
            const cleanRows = historyTable.querySelectorAll("tr:not(:first-child)");
            cleanRows.forEach(row => row.remove());

            if (savedHistory.length > 0) {
                if (noDataText) noDataText.classList.add("hidden");
                
                     savedHistory.forEach(item => {
                const tr = document.createElement("tr");
                
                // Color code statuses dynamically (Orange for Pending, Green for Confirmed)
                const statusColor = item.status === "Pending" ? "#f59e0b" : "#10b981";
                
                // FIXED LAYOUT: Added extensive right padding, line-height, and vertical alignment
                tr.innerHTML = `
                    <td style="padding: 12px 15px 12px 0; color: #cbd5e1; border-bottom: 1px solid #3f4756; vertical-align: top; white-space: nowrap;">${item.date}</td>
                    <td style="padding: 12px 25px 12px 0; color: #ffffff; border-bottom: 1px solid #3f4756; vertical-align: top; line-height: 1.4;">${item.category}</td>
                    <td style="padding: 12px 20px 12px 0; color: ${statusColor}; font-weight: bold; border-bottom: 1px solid #3f4756; vertical-align: top;">${item.status}</td>
                    <td style="padding: 12px 0; color: #cbd5e1; border-bottom: 1px solid #3f4756; vertical-align: top; text-align: right;">+${item.points}</td>
                `;
                historyTable.appendChild(tr);
            });
            } else {
                if (noDataText) noDataText.classList.remove("hidden");
            }
        }
    }
function toggleDropdownList() {
    const list = document.getElementById("sidebarContent");
    list.classList.toggle("hidden");
}
// Updates the text inside the selector box and tracks active status
function selectOption(val, event) {
    if (event) event.preventDefault(); // Prevents page reload jump
    
    document.getElementById("selected-text").innerText = val;
    
    // Updates which item gets the blue highlight treatment
    document.querySelectorAll(".menu-item").forEach(el => {
        el.classList.remove("active");
        if(el.innerText === val) el.classList.add("active");
    });
    // Smoothly closes the menu list after selection
    toggleDropdownList();
}
// Closes the menu automatically if the user clicks anywhere outside of it
window.addEventListener('click', function(e) {   
    const wrapper = document.querySelector('.dropdown-wrapper');
    const toggleBtn = document.querySelector('.toggle-btn');
    if (wrapper && !wrapper.contains(e.target) && !toggleBtn.contains(e.target)) {
        document.getElementById("sidebarContent").classList.add("hidden");
    }
});
    // === 5. DYNAMIC POPUP / MODAL LOGIC ===
    const closeBtn = document.querySelector(".close-btn");
    const dynamicPanel = document.querySelector(".dynamic-panel");

    if (closeBtn && dynamicPanel) {
        closeBtn.addEventListener("click", () => {
            dynamicPanel.classList.add("hidden");
        });
    }
    // Initial load setup sync execution
    updateDashboardUI();
});
   const toggleBtn = document.getElementById('sidebar-toggle');                          
   const menu = document.getElementById('sidebar-menu');
        
      toggleBtn.addEventListener('click', () => {
      menu.classList.toggle('collapsed');
    });
