document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;

    try {
        const response = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, category, amount, description })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Expense added successfully!");
            window.location.href = "view_expense.html";
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert("An error occurred while adding the expense.");
    }
});
