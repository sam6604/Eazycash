import { sql } from "../config/db.js";

function clampDay(year, monthIndex, day) {
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(day, lastDayOfMonth);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Finds recurring transactions with no occurrence yet in their due month(s)
// and inserts them, catching up one month at a time (capped) so a user who
// hasn't opened the app in a while still gets every missed occurrence.
async function processDueRecurringTransactions(userId) {
  const latestRows = await sql`
    SELECT DISTINCT ON (title, category, recurring_day) title, amount, category, recurring_day, created_at
    FROM transactions
    WHERE user_id = ${userId} AND is_recurring = true
    ORDER BY title, category, recurring_day, created_at DESC
  `;

  const currentMonth = monthKey(new Date());

  for (const row of latestRows) {
    let cursor = new Date(row.created_at);
    let guard = 0;

    while (guard < 24) {
      const nextMonthDate = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const nextMonth = monthKey(nextMonthDate);
      if (nextMonth > currentMonth) break;

      const day = clampDay(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), row.recurring_day);
      const occurrenceDate = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), day);
      const dateStr = occurrenceDate.toISOString().slice(0, 10);

      const existing = await sql`
        SELECT 1 FROM transactions
        WHERE user_id = ${userId} AND title = ${row.title} AND category = ${row.category}
          AND recurring_day = ${row.recurring_day}
          AND to_char(created_at, 'YYYY-MM') = ${nextMonth}
        LIMIT 1
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO transactions(user_id, title, amount, category, created_at, is_recurring, recurring_day)
          VALUES (${userId}, ${row.title}, ${row.amount}, ${row.category}, ${dateStr}, true, ${row.recurring_day})
        `;
      }

      cursor = occurrenceDate;
      guard++;
    }
  }
}

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;

    await processDueRecurringTransactions(userId);

    const transactions = await sql`
        SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
      `;

    res.status(200).json(transactions);
  } catch (error) {
    console.log("Error getting the transactions", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id, is_recurring } = req.body;

    if (!title || !user_id || !category || amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const recurringDay = is_recurring ? new Date().getDate() : null;

    const transaction = await sql`
      INSERT INTO transactions(user_id,title,amount,category,is_recurring,recurring_day)
      VALUES (${user_id},${title},${amount},${category},${Boolean(is_recurring)},${recurringDay})
      RETURNING *
    `;

    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("Error creating the transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const result = await sql`
      DELETE FROM transactions WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("Error deleting the transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCategoryBreakdown(req, res) {
  try {
    const { userId } = req.params;
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const breakdown = await sql`
      SELECT category, SUM(ABS(amount)) AS total
      FROM transactions
      WHERE user_id = ${userId}
        AND amount < 0
        AND to_char(created_at, 'YYYY-MM') = ${month}
      GROUP BY category
      ORDER BY total DESC
    `;

    res.status(200).json(breakdown);
  } catch (error) {
    console.log("Error getting the category breakdown", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMonthlyTrend(req, res) {
  try {
    const { userId } = req.params;

    const trend = await sql`
      SELECT
        to_char(created_at, 'YYYY-MM') AS month,
        COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0) AS income,
        COALESCE(SUM(ABS(amount)) FILTER (WHERE amount < 0), 0) AS expenses
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= (CURRENT_DATE - INTERVAL '6 months')
      GROUP BY month
      ORDER BY month
    `;

    res.status(200).json(trend);
  } catch (error) {
    console.log("Error getting the monthly trend", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;

    await processDueRecurringTransactions(userId);

    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as income FROM transactions
      WHERE user_id = ${userId} AND amount > 0
    `;

    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as expenses FROM transactions
      WHERE user_id = ${userId} AND amount < 0
    `;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    });
  } catch (error) {
    console.log("Error gettin the summary", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
