async function loadExpenses() {
    try {
        const response = await fetch("/api/expenses");
        const data = await response.json();

        if (response.ok) {
            const tableBody = document.querySelector("tbody");
            tableBody.innerHTML = "";

            data.forEach(expense => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${expense.date}</td>
                    <td>${expense.category}</td>
                    <td>${expense.amount}</td>
                    <td>${expense.description}</td>
                    <td>
                        <a href="edit_expense.html?expense_id=${expense.id}">Edit</a>
                        <a href="#" onclick="deleteExpense(${expense.id})">Delete</a>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert("An error occurred while loading expenses.");
    }
}

async function deleteExpense(id) {
    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Expense deleted successfully!");
            loadExpenses();
        } else {
            alert("Failed to delete expense.");
        }
    } catch (error) {
        alert("An error occurred while deleting the expense.");
    }
}

document.addEventListener("DOMContentLoaded", loadExpenses);
