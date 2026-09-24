import { sql } from "../config/db.js";

export async function getBudgetsByUserAndMonth(req, res) {
  try {
    const { userId, month } = req.params;

    const budgets = await sql`
      SELECT
        b.id,
        b.user_id,
        b.category,
        b.amount,
        b.month,
        COALESCE(t.spent, 0) AS spent
      FROM budgets b
      LEFT JOIN (
        SELECT category, SUM(ABS(amount)) AS spent
        FROM transactions
        WHERE user_id = ${userId}
          AND amount < 0
          AND to_char(created_at, 'YYYY-MM') = ${month}
        GROUP BY category
      ) t ON t.category = b.category
      WHERE b.user_id = ${userId} AND b.month = ${month}
      ORDER BY b.category
    `;

    res.status(200).json(budgets);
  } catch (error) {
    console.log("Error getting the budgets", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function upsertBudget(req, res) {
  try {
    const { user_id, category, amount, month } = req.body;

    if (!user_id || !category || amount === undefined || !month) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const budget = await sql`
      INSERT INTO budgets(user_id, category, amount, month)
      VALUES (${user_id}, ${category}, ${amount}, ${month})
      ON CONFLICT (user_id, category, month)
      DO UPDATE SET amount = EXCLUDED.amount
      RETURNING *
    `;

    res.status(200).json(budget[0]);
  } catch (error) {
    console.log("Error saving the budget", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteBudget(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid budget ID" });
    }

    const result = await sql`
      DELETE FROM budgets WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.log("Error deleting the budget", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
