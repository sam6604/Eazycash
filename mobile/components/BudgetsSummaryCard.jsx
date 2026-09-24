import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/home.styles";
import { styles as budgetStyles } from "../assets/styles/budgets.styles";
import { COLORS } from "../constants/colors";
import { formatCurrency } from "../lib/utils";

function progressColor(percent) {
  if (percent >= 100) return COLORS.expense;
  if (percent >= 80) return COLORS.warning;
  return COLORS.income;
}

export function BudgetsSummaryCard({ budgets, error }) {
  const router = useRouter();

  if (error) {
    return (
      <TouchableOpacity style={styles.balanceCard} onPress={() => router.push("/budgets")}>
        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.balanceTitle}>Budgets</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </View>
        <Text style={budgetStyles.saveHint}>{error}</Text>
      </TouchableOpacity>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <TouchableOpacity style={styles.balanceCard} onPress={() => router.push("/budgets")}>
        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.balanceTitle}>Budgets</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </View>
        <Text style={budgetStyles.saveHint}>
          Set a monthly budget per category to track your spending
        </Text>
      </TouchableOpacity>
    );
  }

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0);
  const percent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const rawPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <TouchableOpacity style={styles.balanceCard} onPress={() => router.push("/budgets")}>
      <View style={styles.transactionsHeaderContainer}>
        <Text style={styles.balanceTitle}>Budgets this month</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      </View>
      <View style={budgetStyles.progressTrack}>
        <View
          style={[
            budgetStyles.progressFill,
            { width: `${percent}%`, backgroundColor: progressColor(rawPercent) },
          ]}
        />
      </View>
      <View style={styles.balanceStats}>
        <Text style={budgetStyles.spentText}>
          {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)} spent
        </Text>
        <Text style={[budgetStyles.percentText, { color: progressColor(rawPercent) }]}>
          {rawPercent}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}
