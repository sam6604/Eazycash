import { useCallback, useMemo, useState } from "react";
import { API_URL } from "../constants/api";
import { getMonthKey } from "../lib/utils";

function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(getMonthKey(d));
  }
  return months;
}

function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export const useInsights = (userId) => {
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [trend, setTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const month = getMonthKey();
      const [categoryRes, trendRes] = await Promise.all([
        fetch(`${API_URL}/transactions/insights/category/${userId}?month=${month}`),
        fetch(`${API_URL}/transactions/insights/trend/${userId}`),
      ]);

      if (!categoryRes.ok) throw new Error(`Failed to fetch category breakdown (${categoryRes.status})`);
      if (!trendRes.ok) throw new Error(`Failed to fetch monthly trend (${trendRes.status})`);

      setCategoryBreakdown(await categoryRes.json());
      setTrend(await trendRes.json());
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Couldn't load your insights. Pull down to try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const trendByMonth = useMemo(() => {
    const map = {};
    trend.forEach((row) => {
      map[row.month] = row;
    });
    return map;
  }, [trend]);

  const monthlyTrend = useMemo(() => {
    return lastNMonths(6).map((key) => {
      const row = trendByMonth[key];
      return {
        month: key,
        label: monthLabel(key),
        income: row ? parseFloat(row.income) : 0,
        expenses: row ? parseFloat(row.expenses) : 0,
      };
    });
  }, [trendByMonth]);

  const insightMessages = useMemo(() => {
    const messages = [];
    if (categoryBreakdown.length > 0) {
      const top = categoryBreakdown[0];
      messages.push(`Your biggest spend this month is ${top.category} at ${parseFloat(top.total).toFixed(0)} rupees.`);
    }

    if (monthlyTrend.length >= 2) {
      const current = monthlyTrend[monthlyTrend.length - 1];
      const previous = monthlyTrend[monthlyTrend.length - 2];
      if (previous.expenses > 0) {
        const change = ((current.expenses - previous.expenses) / previous.expenses) * 100;
        if (Math.abs(change) >= 1) {
          messages.push(
            `You spent ${Math.abs(change).toFixed(0)}% ${change > 0 ? "more" : "less"} this month than last month.`
          );
        }
      }
      if (current.income > current.expenses) {
        messages.push("You're spending less than you earn this month — nice work.");
      } else if (current.expenses > current.income && current.income > 0) {
        messages.push("Your expenses have overtaken your income this month.");
      }
    }

    return messages.slice(0, 3);
  }, [categoryBreakdown, monthlyTrend]);

  return { categoryBreakdown, monthlyTrend, insightMessages, isLoading, error, fetchInsights };
};
