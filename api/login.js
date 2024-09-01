document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Login successful!");
            window.location.href = "view_expense.html";
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert("An error occurred during login.");
    }
});
