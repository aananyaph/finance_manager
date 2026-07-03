import { useEffect, useState } from "react";
import api from "../services/api";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
};

function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/api/transactions", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Could not load transactions");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await api.post(
        "/api/transactions",
        {
          type,
          amount: Number(amount),
          category,
          description,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setMessage("Transaction added successfully!");

      setAmount("");
      setCategory("");
      setDescription("");

      await fetchTransactions();
    } catch (error) {
      console.error(error);
      setMessage("Could not add transaction");
    }
  };

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div style={{ padding: "40px" }}>
      <h1>Finance Manager Dashboard</h1>

      <h2>Current Balance: ₹{balance}</h2>
      <p>Total Income: ₹{totalIncome}</p>
      <p>Total Expenses: ₹{totalExpense}</p>

      <hr />

      <h2>Add Transaction</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Type: </label>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "income" | "expense")
            }
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <br />

        <div>
          <label>Amount: </label>

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Category: </label>

          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Food, Salary, Shopping..."
            required
          />
        </div>

        <br />

        <div>
          <label>Description: </label>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <br />

        <div>
          <label>Payment Method: </label>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <br />

        <button type="submit">Add Transaction</button>
      </form>

      {message && <p>{message}</p>}

      <hr />

      <h2>Recent Transactions</h2>

      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        transactions.map((transaction) => (
          <div key={transaction._id}>
            <h3>
              {transaction.category} — ₹{transaction.amount}
            </h3>

            <p>
              {transaction.type} | {transaction.paymentMethod}
            </p>

            <p>{transaction.description}</p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;