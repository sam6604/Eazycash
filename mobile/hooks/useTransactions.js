// react custom hook file

import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";

const DAY_MS = 24 * 60 * 60 * 1000;

function isWithinRange(dateString, from, to) {
  if (!from && !to) return true;
  const time = new Date(dateString).getTime();
  if (from && time < from.getTime()) return false;
  if (to && time > to.getTime() + DAY_MS - 1) return false;
  return true;
}

export const DEFAULT_FILTERS = {
  search: "",
  category: null, // null = all categories
  type: "all", // "all" | "income" | "expense"
  datePreset: "all", // "all" | "week" | "month" | "custom"
  customFrom: null,
  customTo: null,
};

// const API_URL = "https://wallet-api-cxqp.onrender.com/api";
// const API_URL = "http://localhost:5001/api";

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // useCallback is used for performance reasons, it will memoize the function
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch transactions (${response.status})`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Couldn't load your transactions. Pull down to try again.");
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch summary (${response.status})`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError("Couldn't load your balance. Pull down to try again.");
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      // can be run in parallel
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete transaction");

      // Refresh data after deletion
      loadData();
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Alert.alert("Error", error.message);
    }
  };

  const updateFilter = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const filteredTransactions = useMemo(() => {
    const { search, category, type, datePreset, customFrom, customTo } = filters;

    let from = null;
    let to = null;
    const now = new Date();
    if (datePreset === "week") {
      from = new Date(now);
      from.setDate(now.getDate() - 7);
    } else if (datePreset === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (datePreset === "custom") {
      from = customFrom;
      to = customTo;
    }

    const query = search.trim().toLowerCase();

    return transactions.filter((t) => {
      if (query && !t.title.toLowerCase().includes(query)) return false;
      if (category && t.category !== category) return false;
      if (type === "income" && parseFloat(t.amount) <= 0) return false;
      if (type === "expense" && parseFloat(t.amount) >= 0) return false;
      if (!isWithinRange(t.created_at, from, to)) return false;
      return true;
    });
  }, [transactions, filters]);

  return {
    transactions,
    filteredTransactions,
    filters,
    updateFilter,
    resetFilters,
    summary,
    isLoading,
    error,
    loadData,
    deleteTransaction,
  };
};
