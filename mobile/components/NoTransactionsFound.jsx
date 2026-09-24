import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { useRouter } from "expo-router";

const NoTransactionsFound = ({ filtered = false }) => {
  const router = useRouter();

  if (filtered) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="search-outline"
          size={60}
          color={COLORS.textLight}
          style={styles.emptyStateIcon}
        />
        <Text style={styles.emptyStateTitle}>No matching transactions</Text>
        <Text style={styles.emptyStateText}>
          Try adjusting your search or filters to find what you&apos;re looking for
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="receipt-outline"
        size={60}
        color={COLORS.textLight}
        style={styles.emptyStateIcon}
      />
      <Text style={styles.emptyStateTitle}>No transactions yet</Text>
      <Text style={styles.emptyStateText}>
        Start tracking your finances by adding your first transaction
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push("/create")}>
        <Ionicons name="add-circle" size={18} color={COLORS.white} />
        <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};
export default NoTransactionsFound;
