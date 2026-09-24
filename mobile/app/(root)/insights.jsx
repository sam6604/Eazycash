import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { styles } from "../../assets/styles/insights.styles";
import { COLORS } from "../../constants/colors";
import { getCategoryColor, getCategoryIcon } from "../../constants/categories";
import { useInsights } from "../../hooks/useInsights";
import { formatCurrency } from "../../lib/utils";
import PageLoader from "../../components/PageLoader";

export default function InsightsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const { categoryBreakdown, monthlyTrend, insightMessages, isLoading, error, fetchInsights } =
    useInsights(user.id);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const totalSpent = categoryBreakdown.reduce((sum, c) => sum + parseFloat(c.total), 0);

  const pieData = categoryBreakdown.map((c) => ({
    value: parseFloat(c.total),
    color: getCategoryColor(c.category),
    text: c.category,
  }));

  const barData = monthlyTrend.flatMap((m, idx) => [
    { value: m.income, label: m.label, frontColor: COLORS.income, spacing: 2 },
    {
      value: m.expenses,
      frontColor: COLORS.expense,
      spacing: idx === monthlyTrend.length - 1 ? 2 : 18,
    },
  ]);

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending by category (this month)</Text>
          {pieData.length > 0 ? (
            <>
              <View style={styles.chartWrapper}>
                <PieChart
                  data={pieData}
                  donut
                  radius={90}
                  innerRadius={60}
                  innerCircleColor={COLORS.card}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.centerLabelValue}>{formatCurrency(totalSpent)}</Text>
                      <Text style={styles.centerLabelText}>Total spent</Text>
                    </View>
                  )}
                />
              </View>
              <View style={styles.legendRow}>
                {categoryBreakdown.map((c) => (
                  <View key={c.category} style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: getCategoryColor(c.category) }]}
                    />
                    <Ionicons
                      name={getCategoryIcon(c.category)}
                      size={12}
                      color={COLORS.textLight}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.legendText}>{c.category}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="pie-chart-outline"
                size={48}
                color={COLORS.textLight}
                style={styles.emptyStateIcon}
              />
              <Text style={styles.emptyStateTitle}>No spending yet</Text>
              <Text style={styles.emptyStateText}>
                Add some expenses this month to see your category breakdown
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Income vs expenses (last 6 months)</Text>
          {monthlyTrend.some((m) => m.income > 0 || m.expenses > 0) ? (
            <>
              <View style={styles.chartWrapper}>
                <BarChart
                  data={barData}
                  barWidth={14}
                  spacing={18}
                  roundedTop
                  noOfSections={4}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={COLORS.border}
                  yAxisTextStyle={{ color: COLORS.textLight, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: COLORS.textLight, fontSize: 11 }}
                  height={180}
                  formatYLabel={(label) => formatCurrency(Number(label))}
                />
              </View>
              <View style={styles.legendKeyRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.income }]} />
                  <Text style={styles.legendText}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.expense }]} />
                  <Text style={styles.legendText}>Expenses</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="bar-chart-outline"
                size={48}
                color={COLORS.textLight}
                style={styles.emptyStateIcon}
              />
              <Text style={styles.emptyStateTitle}>Nothing to show yet</Text>
              <Text style={styles.emptyStateText}>
                Your income and expense trend will appear here once you add transactions
              </Text>
            </View>
          )}
        </View>

        {insightMessages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Highlights</Text>
            {insightMessages.map((message, idx) => (
              <View key={idx} style={styles.insightRow}>
                <Ionicons
                  name="bulb-outline"
                  size={18}
                  color={COLORS.primary}
                  style={styles.insightIcon}
                />
                <Text style={styles.insightText}>{message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
