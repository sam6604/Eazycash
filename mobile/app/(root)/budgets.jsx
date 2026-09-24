import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../assets/styles/budgets.styles";
import { COLORS } from "../../constants/colors";
import { CATEGORIES } from "../../constants/categories";
import { useBudgets } from "../../hooks/useBudgets";
import { formatCurrency, getMonthKey } from "../../lib/utils";
import PageLoader from "../../components/PageLoader";

function progressColor(percent) {
  if (percent >= 100) return COLORS.expense;
  if (percent >= 80) return COLORS.warning;
  return COLORS.income;
}

function BudgetRow({ category, budget, onSave }) {
  const [value, setValue] = useState(budget ? String(budget.amount) : "");
  const [isSaving, setIsSaving] = useState(false);

  const spent = budget ? parseFloat(budget.spent) : 0;
  const amount = budget ? parseFloat(budget.amount) : 0;
  const percent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
  const rawPercent = amount > 0 ? Math.round((spent / amount) * 100) : 0;

  const parsedValue = parseFloat(value);
  const isValid = value.length > 0 && !isNaN(parsedValue) && parsedValue > 0;
  const isDirty = isValid && (!budget || parsedValue !== parseFloat(budget.amount));

  const commit = async () => {
    if (!isDirty) return;
    Keyboard.dismiss();
    setIsSaving(true);
    await onSave(category.name, parsedValue);
    setIsSaving(false);
  };

  const handleBlur = () => {
    if (!isValid) {
      setValue(budget ? String(budget.amount) : "");
      return;
    }
    commit();
  };

  return (
    <View style={styles.budgetCard}>
      <View style={styles.budgetCardHeader}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name={category.icon} size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          placeholder="Set budget"
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={setValue}
          onBlur={handleBlur}
          returnKeyType="done"
          onSubmitEditing={commit}
        />
        <TouchableOpacity
          style={styles.saveIconButton}
          onPress={commit}
          disabled={!isDirty || isSaving}
        >
          <Ionicons
            name={isSaving ? "hourglass-outline" : "checkmark-circle"}
            size={26}
            color={isDirty ? COLORS.primary : COLORS.border}
          />
        </TouchableOpacity>
      </View>

      {budget ? (
        <>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${percent}%`, backgroundColor: progressColor(rawPercent) },
              ]}
            />
          </View>
          <View style={styles.budgetFooterRow}>
            <Text style={styles.spentText}>
              {formatCurrency(spent)} of {formatCurrency(amount)}
            </Text>
            <Text style={[styles.percentText, { color: progressColor(rawPercent) }]}>
              {rawPercent}%
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.saveHint}>No budget set yet — enter an amount and tap ✓ to save</Text>
      )}
    </View>
  );
}

export default function BudgetsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const month = useMemo(() => getMonthKey(), []);
  const { budgets, isLoading, error, fetchBudgets, saveBudget } = useBudgets(user.id, month);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const budgetsByCategory = useMemo(() => {
    const map = {};
    budgets.forEach((b) => {
      map[b.category] = b;
    });
    return map;
  }, [budgets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Budgets</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.monthLabel}>{monthLabel}</Text>

        {CATEGORIES.map((category) => {
          const budget = budgetsByCategory[category.name];
          return (
            <BudgetRow
              key={`${category.id}-${budget ? budget.amount : "unset"}`}
              category={category}
              budget={budget}
              onSave={saveBudget}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
