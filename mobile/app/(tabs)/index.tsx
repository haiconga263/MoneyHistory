import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCard } from '../../src/components/BalanceCard';
import { SectionHeader } from '../../src/components/SectionHeader';
import { TransactionCard } from '../../src/components/TransactionCard';
import { colors, radius, spacing } from '../../src/constants/theme';
import { api } from '../../src/lib/api';
import type { Category, DashboardData } from '../../src/types';
import { formatMoney } from '../../src/utils/format';

export default function DashboardScreen() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [data, expenseCategories] = await Promise.all([
        api.getDashboard(),
        api.getCategories('EXPENSE'),
      ]);
      setDashboard(data);
      setCategories(expenseCategories);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading && !dashboard) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primaryLight} />
        <Text style={styles.loadingText}>Đang tải sổ thu chi...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primaryLight} />}
        contentContainerStyle={styles.content}
      >
        {error ? (
          <Pressable style={styles.errorBanner} onPress={() => void load()}>
            <Ionicons name="cloud-offline-outline" color={colors.danger} size={19} />
            <Text style={styles.errorText}>{error} Chạm để thử lại.</Text>
          </Pressable>
        ) : null}

        <BalanceCard balance={dashboard?.balance ?? 0} />

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#74E3C11A' }]}>
              <Ionicons name="arrow-down" size={17} color={colors.income} />
            </View>
            <Text style={styles.summaryLabel}>Thu tháng này</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>{formatMoney(dashboard?.monthIncome ?? 0)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FF8E7C1A' }]}>
              <Ionicons name="arrow-up" size={17} color={colors.expense} />
            </View>
            <Text style={styles.summaryLabel}>Chi tháng này</Text>
            <Text style={styles.summaryValue}>{formatMoney(dashboard?.monthExpense ?? 0)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="thêm nhanh" actionLabel="tất cả" onAction={() => router.push('/add?type=EXPENSE')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickList}>
            <Pressable style={styles.quickItem} onPress={() => router.push('/add?type=EXPENSE')}>
              <View style={[styles.quickIcon, styles.addIcon]}>
                <Ionicons name="add" size={23} color={colors.text} />
              </View>
              <Text style={styles.quickLabel}>Thêm</Text>
            </Pressable>
            {categories.slice(0, 6).map((category) => (
              <Pressable
                key={category.id}
                style={styles.quickItem}
                onPress={() => router.push(`/add?type=EXPENSE&categoryId=${category.id}`)}
              >
                <View style={[styles.quickIcon, { backgroundColor: `${category.color}22` }]}>
                  <Ionicons
                    name={category.icon as React.ComponentProps<typeof Ionicons>['name']}
                    size={22}
                    color={category.color}
                  />
                </View>
                <Text numberOfLines={1} style={styles.quickLabel}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {dashboard?.expenseBreakdown.length ? (
          <View style={styles.section}>
            <SectionHeader title="chi tiêu tháng này" />
            <View style={styles.breakdownCard}>
              {dashboard.expenseBreakdown.map((item) => {
                const total = dashboard.monthExpense || 1;
                const percent = Math.max(5, Math.round((item.amount / total) * 100));
                return (
                  <View key={item.category.id} style={styles.breakdownItem}>
                    <View style={styles.breakdownTop}>
                      <Text style={styles.breakdownName}>{item.category.name}</Text>
                      <Text style={styles.breakdownAmount}>{formatMoney(item.amount)}</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${percent}%`, backgroundColor: item.category.color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="gần đây" actionLabel="xem tất cả" onAction={() => router.push('/history')} />
          {dashboard?.recentTransactions.length ? (
            <View style={styles.transactionGrid}>
              {dashboard.recentTransactions.slice(0, 4).map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  compact
                  transaction={transaction}
                  onPress={() => router.push(`/transaction/${transaction.id}`)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Chưa có giao dịch nào.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: spacing.sm },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: spacing.md, paddingBottom: 115 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: '#FF796F12', borderRadius: radius.medium, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: 12, flex: 1 },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  summaryIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  summaryLabel: { color: colors.textMuted, fontSize: 11 },
  summaryValue: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 5 },
  section: { marginTop: spacing.xl, gap: spacing.md },
  quickList: { gap: spacing.md, paddingRight: spacing.md },
  quickItem: { width: 64, alignItems: 'center', gap: 7 },
  quickIcon: { width: 54, height: 54, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  addIcon: { borderWidth: 1, borderColor: colors.border },
  quickLabel: { color: colors.textMuted, fontSize: 10, width: 68, textAlign: 'center' },
  breakdownCard: { backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  breakdownItem: { gap: 8 },
  breakdownTop: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownName: { color: colors.text, fontSize: 12, fontWeight: '600' },
  breakdownAmount: { color: colors.textMuted, fontSize: 11 },
  track: { height: 5, backgroundColor: colors.border, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: 5, borderRadius: radius.pill },
  transactionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm },
  emptyText: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});
