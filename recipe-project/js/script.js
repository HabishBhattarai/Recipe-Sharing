"use strict";

// Initialize user session on page load
document.addEventListener("DOMContentLoaded", () => {
	initializeUserSession();
	setupFormValidation();
});

function initializeUserSession() {
	const currentUser = JSON.parse(localStorage.getItem("currentUser"));
	updateNavbar(currentUser);
}

function updateNavbar(currentUser) {
	const navLinks = document.querySelector("#mainNav .navbar-nav");
	const authActions = document.querySelector("#mainNav .d-flex.gap-2");
	if (!navLinks) return;

	// Remove existing login/register/dashboard links
	const existingLinks = navLinks.querySelectorAll("[data-nav-auth]");
	existingLinks.forEach((link) => link.remove());

	if (currentUser) {
		if (authActions) {
			authActions.innerHTML = `
				<a class="btn btn-outline-success btn-sm" href="dashboard.html">Dashboard</a>
				<button class="btn btn-outline-danger btn-sm" onclick="logout()">Logout</button>
			`;
		}
	} else {
		if (authActions) {
			authActions.innerHTML = `
				<a class="btn btn-outline-success btn-sm" href="login.html">Login</a>
				<a class="btn btn-success btn-sm" href="register.html">Register</a>
			`;
		}
	}
}

function logout() {
	localStorage.removeItem("currentUser");
	window.location.href = "index.html";
}

function setupFormValidation() {
	const forms = document.querySelectorAll("form[data-validate]");

	forms.forEach((form) => {
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			clearErrors(form);
			let isValid = true;

			const requiredFields = form.querySelectorAll("[data-required='true']");
			requiredFields.forEach((field) => {
				if (!field.value.trim()) {
					isValid = false;
					setError(field, "This field is required.");
				}
			});

			const emailField = form.querySelector("[data-email='true']");
			if (emailField && emailField.value.trim()) {
				if (!isValidEmail(emailField.value.trim())) {
					isValid = false;
					setError(emailField, "Enter a valid email address.");
				}
			}

			const passwordField = form.querySelector("[data-password='true']");
			if (passwordField && passwordField.value.trim()) {
				if (passwordField.value.trim().length < 8) {
					isValid = false;
					setError(passwordField, "Password must be at least 8 characters.");
				}
			}

			const confirmField = form.querySelector("[data-confirm='true']");
			if (confirmField && passwordField && confirmField.value.trim()) {
				if (confirmField.value.trim() !== passwordField.value.trim()) {
					isValid = false;
					setError(confirmField, "Passwords do not match.");
				}
			}

			if (!isValid) {
				return;
			}

			// Handle registration
			if (form.querySelector("#fullName")) {
				handleRegister(form);
			}
			// Handle login
			else if (form.querySelector("#loginEmail")) {
				handleLogin(form);
			}
			// Handle other forms
			else {
				form.reset();
			}
		});
	});
}

function handleRegister(form) {
	const fullName = form.querySelector("#fullName").value.trim();
	const email = form.querySelector("#registerEmail").value.trim();
	const password = form.querySelector("#registerPassword").value.trim();

	// Check if user already exists
	const users = JSON.parse(localStorage.getItem("users")) || [];
	if (users.some((user) => user.email === email)) {
		setError(form.querySelector("#registerEmail"), "This email is already registered.");
		return;
	}

	// Save new user
	const newUser = {
		id: Date.now(),
		name: fullName,
		email: email,
		password: password,
	};
	users.push(newUser);
	localStorage.setItem("users", JSON.stringify(users));

	// Redirect to login
	window.location.href = "login.html";
}

function handleLogin(form) {
	const email = form.querySelector("#loginEmail").value.trim();
	const password = form.querySelector("#loginPassword").value.trim();

	// Get users from localStorage
	const users = JSON.parse(localStorage.getItem("users")) || [];
	const user = users.find((u) => u.email === email && u.password === password);

	if (!user) {
		setError(form.querySelector("#loginEmail"), "Invalid email or password.");
		return;
	}

	// Save current user session
	localStorage.setItem("currentUser", JSON.stringify(user));
	window.location.href = "dashboard.html";
}

function setError(field, message) {
	const group = field.closest(".mb-3") || field.parentElement;
	if (!group) {
		return;
	}

	const error = group.querySelector(".error-msg");
	if (error) {
		error.textContent = message;
	}
}

function clearErrors(form) {
	const errors = form.querySelectorAll(".error-msg");
	errors.forEach((error) => {
		error.textContent = "";
	});
}

function isValidEmail(email) {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
}
