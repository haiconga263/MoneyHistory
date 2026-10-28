import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionCard } from '../../src/components/TransactionCard';
import { colors, radius, spacing } from '../../src/constants/theme';
import { api } from '../../src/lib/api';
import type { Transaction, TransactionType } from '../../src/types';

type Filter = 'ALL' | TransactionType;

const filters: Array<{ label: string; value: Filter }> = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Khoản thu', value: 'INCOME' },
  { label: 'Khoản chi', value: 'EXPENSE' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (activeFilter = filter, query = search, refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const result = await api.getTransactions(activeFilter === 'ALL' ? undefined : activeFilter, query);
      setTransactions(result.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải lịch sử.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const chooseFilter = (value: Filter) => {
    setFilter(value);
    void load(value, search);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(filter, search, true)} tintColor={colors.primaryLight} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.eyebrow}>giao dịch</Text>
                <Text style={styles.title}>lịch sử</Text>
              </View>
              <Pressable style={styles.addButton} onPress={() => router.push('/add?type=EXPENSE')}>
                <Ionicons name="add" size={25} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={19} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => void load(filter, search)}
                placeholder="Tìm ghi chú hoặc danh mục"
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                style={styles.input}
              />
              {search ? (
                <Pressable onPress={() => { setSearch(''); void load(filter, ''); }}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.filters}>
              {filters.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => chooseFilter(item.value)}
                  style={[styles.filter, filter === item.value && styles.filterActive]}
                >
                  <Text style={[styles.filterText, filter === item.value && styles.filterTextActive]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <TransactionCard transaction={item} onPress={() => router.push(`/transaction/${item.id}`)} />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primaryLight} style={styles.loader} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Không có giao dịch</Text>
              <Text style={styles.emptyText}>Hãy thêm khoản thu hoặc khoản chi đầu tiên.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: spacing.md, paddingBottom: 115 },
  headerContent: { gap: spacing.lg, marginBottom: spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  eyebrow: { color: colors.primaryLight, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 36, fontWeight: '800', letterSpacing: -1.5 },
  addButton: { width: 48, height: 48, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchBox: { height: 52, borderRadius: radius.medium, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm },
  input: { flex: 1, color: colors.text, fontSize: 14 },
  filters: { flexDirection: 'row', gap: spacing.sm },
  filter: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: colors.black },
  error: { color: colors.danger, fontSize: 12 },
  loader: { marginTop: spacing.xl },
  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
});
