const logregBox = document.querySelector('.logreg-box');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');

if (registerLink && logregBox) {
    registerLink.addEventListener('click', () => {
        logregBox.classList.add('active');
    });
}
if (loginLink && logregBox) {
    loginLink.addEventListener('click', () => {
        logregBox.classList.remove('active');
    });
}

function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    
    // Optional: Decode the Google JWT payload to get email/name if needed
    // For simplicity, we parse the base64 payload from the JWT token:
    let responsePayload = {};
    try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        responsePayload = JSON.parse(jsonPayload);
    } catch (err) {
        console.error("Failed to parse Google JWT", err);
    }

    const googleEmail = responsePayload.email || "google_user@ucu.ac.ug";
    const googleName = responsePayload.name || "Google User";

    // Check if user already exists in usersList
    let users = JSON.parse(localStorage.getItem("usersList")) || [];
    let existingUser = users.find(user => user.email === googleEmail);

    let assignedRole = "collector"; // default fallback

    if (existingUser) {
        // If user exists, use their saved role
        assignedRole = existingUser.role || "collector";
        localStorage.setItem("currentUser", existingUser.name);
        localStorage.setItem("userRole", assignedRole);
    } else {
        // If it's a new user via Google, check if they selected a role on your register dropdown, or default to collector
        const roleSelect = document.getElementById('user-role-select');
        if (roleSelect && roleSelect.value) {
            assignedRole = roleSelect.value;
        }

        // Push into usersList so it matches your local DB structure
        users.push({ name: googleName, email: googleEmail, password: "GOOGLE_OAUTH_USER", role: assignedRole });
        localStorage.setItem("usersList", JSON.stringify(users));
        localStorage.setItem("currentUser", googleName);
        localStorage.setItem("userRole", assignedRole);
    }

    // Set login flag
    localStorage.setItem("isLoggedIn", "true");
    
    alert(`Successfully signed in with Google as ${googleName} ^_^`);

    // Route based on role
    if (assignedRole === "producer") {
        window.location.href = "waste.html";
    } else {
        window.location.href = "collector.html";
    }
}

// Handle Login Form Submission
const loginForm = document.querySelector('.form-box.login form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        localStorage.setItem("isLoggedIn", "true");
        
        const savedRole = localStorage.getItem("userRole") || "collector";
        if (savedRole === "producer") {
            window.location.href = "waste.html";
        } else {
            window.location.href = "collector.html";
        }
    });
}

function logoutUser() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// Dynamic Navbar & Services Link Binding
document.addEventListener("DOMContentLoaded", function () {
    fetch("navbar.html")
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById("sitenav");
            if (placeholder) {
                placeholder.innerHTML = data;
                
                // 1. Auth Link Setup
                const authLink = document.getElementById("auth-nav-link");
                if (authLink) {
                    if (localStorage.getItem("isLoggedIn") === "true") {
                        authLink.textContent = "Logout";
                        authLink.href = "#";
                        authLink.addEventListener("click", function(e) {
                            e.preventDefault();
                            logoutUser();
                        });
                    } else {
                        authLink.textContent = "Sign In";
                        authLink.href = "index.html";
                    }
                }

                // 2. Services Link Dynamic Redirection
                const servicesLink = document.getElementById("services-link");
                if (servicesLink) {
                    servicesLink.addEventListener("click", function(e) {
                        e.preventDefault();
                        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                        const currentRole = localStorage.getItem("userRole");

                        if (isLoggedIn) {
                            if (currentRole === "producer") {
                                window.location.href = "waste.html";
                            } else {
                                window.location.href = "collector.html";
                            }
                        } else {
                            alert("Please sign in first to access your services dashboard.");
                            window.location.href = "index.html";
                        }
                    });
                }
            }
        })
        .catch(error => console.error("Error loading navbar:", error));
// 2. Fetch and Load Footer (NEW)
    fetch("footer.html")
        .then(response => {
            if (!response.ok) throw new Error("Footer network response was not ok");
            return response.text();
        })
        .then(data => {
            const footerPlaceholder = document.getElementById("sitefoot");
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
            }
        })
        .catch(error => console.error("Error loading footer:", error));
});
// Handle Sign Up Form Submission
const registerForm = document.querySelector('.form-box.register form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = registerForm.querySelector('input[type="text"]');
        const emailInput = registerForm.querySelector('input[type="email"]');
        const passwordInput = registerForm.querySelector('input[type="password"]');
        const roleSelect = document.getElementById('user-role-select');
        
        const name = nameInput ? nameInput.value : "";
        const email = emailInput ? emailInput.value : "";
        const password = passwordInput ? passwordInput.value : "";
        const selectedRole = roleSelect ? roleSelect.value : "collector";

        let users = JSON.parse(localStorage.getItem("usersList")) || [];
        const userExists = users.some(user => user.email === email);
        
        if (userExists) {
            alert("An account with this email already exists! Please sign in instead.");
            return;
        }

        users.push({ name, email, password, role: selectedRole });
        localStorage.setItem("usersList", JSON.stringify(users));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", name);
        localStorage.setItem("userRole", selectedRole);
        
        alert("Account creation successful! >_< Welcome to JUNK APP!");

        if (selectedRole === "producer") {
            window.location.href = "waste.html";
        } else {
            window.location.href = "collector.html";
        }
    });
}