import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";
import { getMonthKey } from "../lib/utils";

export const useBudgets = (userId, month = getMonthKey()) => {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/budgets/${userId}/${month}`);
      if (!response.ok) throw new Error(`Failed to fetch budgets (${response.status})`);
      const data = await response.json();
      setBudgets(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setError("Couldn't load your budgets. Pull down to try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, month]);

  const saveBudget = async (category, amount) => {
    try {
      const response = await fetch(`${API_URL}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, category, amount, month }),
      });
      if (!response.ok) throw new Error("Failed to save budget");
      await fetchBudgets();
    } catch (err) {
      console.error("Error saving budget:", err);
      Alert.alert("Error", "Couldn't save that budget. Please try again.");
    }
  };

  const removeBudget = async (id) => {
    try {
      const response = await fetch(`${API_URL}/budgets/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete budget");
      await fetchBudgets();
    } catch (err) {
      console.error("Error deleting budget:", err);
      Alert.alert("Error", "Couldn't remove that budget. Please try again.");
    }
  };

  return { budgets, isLoading, error, fetchBudgets, saveBudget, removeBudget };
};
