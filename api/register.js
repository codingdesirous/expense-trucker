document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registration successful!");
            window.location.href = "login.html";
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert("An error occurred during registration.");
    }
});
