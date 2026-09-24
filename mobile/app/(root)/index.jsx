import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useTransactions } from "../../hooks/useTransactions";
import { useBudgets } from "../../hooks/useBudgets";
import { useEffect, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "../../components/BalanceCard";
import { BudgetsSummaryCard } from "../../components/BudgetsSummaryCard";
import { TransactionItem } from "../../components/TransactionItem";
import NoTransactionsFound from "../../components/NoTransactionsFound";
import { CATEGORIES } from "../../constants/categories";
import { COLORS } from "../../constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";

const TYPE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
];

const DATE_OPTIONS = [
  { id: "all", label: "All time" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom" },
];

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState(null); // "from" | "to" | null
  const [draftDate, setDraftDate] = useState(new Date());

  const {
    filteredTransactions,
    filters,
    updateFilter,
    summary,
    isLoading,
    error,
    loadData,
    deleteTransaction,
  } = useTransactions(user.id);

  const { budgets, error: budgetsError, fetchBudgets } = useBudgets(user.id);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), fetchBudgets()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  const isFiltering =
    filters.search.trim().length > 0 ||
    filters.category !== null ||
    filters.type !== "all" ||
    filters.datePreset !== "all";

  const openDatePicker = (field) => {
    const current = field === "from" ? filters.customFrom : filters.customTo;
    setDraftDate(current || new Date());
    setActiveDatePicker(field);
  };

  const handleDatePickerChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setActiveDatePicker(null);
      if (event.type === "set" && selectedDate) {
        updateFilter(
          activeDatePicker === "from" ? { customFrom: selectedDate } : { customTo: selectedDate }
        );
      }
      return;
    }
    if (selectedDate) setDraftDate(selectedDate);
  };

  const confirmDatePicker = () => {
    updateFilter(
      activeDatePicker === "from" ? { customFrom: draftDate } : { customTo: draftDate }
    );
    setActiveDatePicker(null);
  };

  if (isLoading && !refreshing) return <PageLoader />;

  const ListHeader = (
    <View style={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* LEFT */}
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.usernameText}>
              {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
            </Text>
          </View>
        </View>
        {/* RIGHT */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <SignOutButton />
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      <BalanceCard summary={summary} />

      {/* QUICK ACTIONS */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/budgets")}>
          <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Budgets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push("/insights")}
        >
          <Ionicons name="stats-chart-outline" size={18} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Insights</Text>
        </TouchableOpacity>
      </View>

      <BudgetsSummaryCard budgets={budgets} error={budgetsError} />

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions"
          placeholderTextColor={COLORS.textLight}
          value={filters.search}
          onChangeText={(text) => updateFilter({ search: text })}
        />
        {filters.search.length > 0 && (
          <TouchableOpacity onPress={() => updateFilter({ search: "" })}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* TYPE + DATE FILTERS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {TYPE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.filterChip, filters.type === option.id && styles.filterChipActive]}
              onPress={() => updateFilter({ type: option.id })}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filters.type === option.id && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          {DATE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterChip,
                filters.datePreset === option.id && styles.filterChipActive,
              ]}
              onPress={() => updateFilter({ datePreset: option.id })}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filters.datePreset === option.id && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {filters.datePreset === "custom" && (
        <View style={styles.customDateRow}>
          <TouchableOpacity style={styles.customDateButton} onPress={() => openDatePicker("from")}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.text} />
            <Text style={styles.customDateButtonText}>
              {filters.customFrom ? filters.customFrom.toLocaleDateString() : "From"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.customDateButton} onPress={() => openDatePicker("to")}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.text} />
            <Text style={styles.customDateButtonText}>
              {filters.customTo ? filters.customTo.toLocaleDateString() : "To"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CATEGORY FILTERS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filters.category === null && styles.filterChipActive]}
            onPress={() => updateFilter({ category: null })}
          >
            <Text
              style={[
                styles.filterChipText,
                filters.category === null && styles.filterChipTextActive,
              ]}
            >
              All categories
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, filters.category === cat.name && styles.filterChipActive]}
              onPress={() => updateFilter({ category: cat.name })}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={filters.category === cat.name ? COLORS.white : COLORS.text}
                style={styles.filterChipIcon}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filters.category === cat.name && styles.filterChipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.transactionsHeaderContainer}>
        <Text style={styles.sectionTitle}>
          {isFiltering ? "Filtered Transactions" : "Recent Transactions"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* FlatList is a performant way to render long lists in React Native. */}
      {/* it renders items lazily — only those on the screen. Everything above */}
      {/* the list lives in ListHeaderComponent so the whole screen scrolls together. */}
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={filteredTransactions}
        renderItem={({ item }) => <TransactionItem item={item} onDelete={handleDelete} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<NoTransactionsFound filtered={isFiltering} />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {Platform.OS === "android" && activeDatePicker && (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          onChange={handleDatePickerChange}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal
          visible={!!activeDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setActiveDatePicker(null)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalCard}>
              <View style={styles.pickerModalHeader}>
                <TouchableOpacity onPress={() => setActiveDatePicker(null)}>
                  <Text style={styles.pickerModalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerModalTitle}>
                  {activeDatePicker === "from" ? "From date" : "To date"}
                </Text>
                <TouchableOpacity onPress={confirmDatePicker}>
                  <Text style={styles.pickerModalAction}>Done</Text>
                </TouchableOpacity>
              </View>
              {activeDatePicker && (
                <DateTimePicker
                  value={draftDate}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  accentColor={COLORS.primary}
                  style={styles.pickerModalPicker}
                  onChange={handleDatePickerChange}
                />
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
