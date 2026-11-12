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

    let users = JSON.parse(localStorage.getItem("usersList")) || [];
    let existingUser = users.find(user => user.email === googleEmail);

    let assignedRole = "collector"; // default fallback

    if (existingUser) {
        assignedRole = existingUser.role || "collector";
        localStorage.setItem("currentUser", existingUser.name);
        localStorage.setItem("userRole", assignedRole);
    } else {
        const roleSelect = document.getElementById('user-role-select');
        if (roleSelect && roleSelect.value) {
            assignedRole = roleSelect.value;
        }

        users.push({ name: googleName, email: googleEmail, password: "GOOGLE_OAUTH_USER", role: assignedRole });
        localStorage.setItem("usersList", JSON.stringify(users));
        localStorage.setItem("currentUser", googleName);
        localStorage.setItem("userRole", assignedRole);
    }

    localStorage.setItem("isLoggedIn", "true");
    
    alert(`Successfully signed in with Google as ${googleName} ^_^`);

    if (assignedRole === "producer") {
        window.location.href = "waste.html";
    } else {
        window.location.href = "collector.html";
    }
}

// ==========================================
// HANDLE SECURE LOGIN FORM SUBMISSION
// ==========================================
const loginForm = document.querySelector('.form-box.login form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailInput = loginForm.querySelector('input[type="email"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');

        const enteredEmail = emailInput ? emailInput.value.trim() : "";
        const enteredPassword = passwordInput ? passwordInput.value : "";

        let users = JSON.parse(localStorage.getItem("usersList")) || [];
        const targetUser = users.find(user => user.email === enteredEmail);

        if (!targetUser) {
            alert("No account found with this email. Please register first!");
            return;
        }

        if (targetUser.password !== enteredPassword) {
            alert("Incorrect password! Please try again.");
            return;
        }

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", targetUser.name);
        localStorage.setItem("userRole", targetUser.role || "collector");

        alert(`Welcome back, ${targetUser.name}! ^_^`);

        if (targetUser.role === "producer") {
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
    window.location.href = "signin.html";
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
                        authLink.href = "signin.html";
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
                            window.location.href = "signin.html";
                        }
                    });
                }

                // 3. SEARCH BAR LOGIC
                const searchInput = document.getElementById('search-input');
                const itemList = document.getElementById('item-list');
                
                if (searchInput && itemList) {
                    const listItems = itemList.querySelectorAll('li');

                    searchInput.addEventListener('input', function(event) {
                        const query = event.target.value.toLowerCase().trim();

                        if (query === '') {
                            itemList.style.display = 'none';
                            return;
                        }

                        itemList.style.display = 'block';

                        listItems.forEach(item => {
                            const text = item.textContent.toLowerCase();
                            if (text.includes(query)) {
                                item.style.display = 'block';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                    });
                }
            }
        })
        .catch(error => console.error("Error loading navbar:", error));

    // Fetch and Load Footer
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

// ==========================================
// PASSWORD STRENGTH VALIDATION FUNCTION
// ==========================================
function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); 

    if (password.length < minLength) {
        return "Password must be at least " + minLength + " characters long.";
    }
    if (!hasUpperCase) {
        return "Password must contain at least one uppercase letter (A-Z).";
    }
    if (!hasNumber) {
        return "Password must contain at least one number (0-9).";
    }
    if (!hasSpecialChar) {
        return "Password must contain at least one special character (e.g., @, #, !, $).";
    }

    return "valid"; 
}

// ==========================================
// HANDLE SIGN UP FORM SUBMISSION WITH VALIDATION
// ==========================================
const registerForm = document.querySelector('.form-box.register form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = registerForm.querySelector('input[type="text"]');
        const emailInput = registerForm.querySelector('input[type="email"]');
        const passwordInput = registerForm.querySelector('input[type="password"]');
        const roleSelect = document.getElementById('user-role-select');
        
        const name = nameInput ? nameInput.value : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";
        const selectedRole = roleSelect ? roleSelect.value : "collector";

        // Validate password rules before creating user
        const passwordCheck = validatePasswordStrength(password);
        if (passwordCheck !== "valid") {
            alert(passwordCheck);
            return;
        }

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

// ==========================================
// PASSWORD VISIBILITY TOGGLE (EYE ICON)
// ==========================================
const togglePasswordIcons = document.querySelectorAll('.toggle-password');

togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);

        if (passwordInput) {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Switch icon state between open eye and closed eye
            this.classList.toggle('bx-show');
            this.classList.toggle('bx-hide');
        }
    });
});