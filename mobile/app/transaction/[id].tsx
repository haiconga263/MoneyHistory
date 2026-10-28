import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../src/constants/theme';
import { api } from '../../src/lib/api';
import type { Transaction } from '../../src/types';
import { formatDate, formatMoney } from '../../src/utils/format';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      setTransaction(await api.getTransaction(id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải giao dịch.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const remove = () => {
    Alert.alert('Xóa giao dịch?', 'Thao tác này không thể hoàn tác.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          try {
            await api.deleteTransaction(id);
            router.back();
          } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Không thể xóa giao dịch.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primaryLight} />
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error || 'Không tìm thấy giao dịch.'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backTextButton}>
          <Text style={styles.backText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const income = transaction.type === 'INCOME';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết giao dịch</Text>
          <Pressable onPress={remove} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={[styles.categoryIcon, { backgroundColor: `${transaction.category.color}22` }]}>
            <Ionicons
              name={transaction.category.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={30}
              color={transaction.category.color}
            />
          </View>
          <Text style={styles.categoryName}>{transaction.category.name}</Text>
          <Text style={[styles.amount, income && { color: colors.income }]}>
            {income ? '+' : '-'}{formatMoney(transaction.amount)}
          </Text>
          <View style={[styles.badge, income ? styles.incomeBadge : styles.expenseBadge]}>
            <Text style={[styles.badgeText, income ? { color: colors.income } : { color: colors.expense }]}>
              {income ? 'Khoản thu' : 'Khoản chi'}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày giao dịch</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.occurredAt)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ghi chú</Text>
            <Text style={[styles.detailValue, styles.note]}>{transaction.note || 'Không có ghi chú'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã giao dịch</Text>
            <Text numberOfLines={1} style={[styles.detailValue, styles.id]}>{transaction.id}</Text>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.editButton} onPress={() => router.push(`/add?id=${transaction.id}`)}>
          <Ionicons name="create-outline" size={19} color={colors.black} />
          <Text style={styles.editText}>Chỉnh sửa giao dịch</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  content: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', padding: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  iconButton: { width: 42, height: 42, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingVertical: 48 },
  categoryIcon: { width: 68, height: 68, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  categoryName: { color: colors.textMuted, fontSize: 13, marginTop: spacing.md },
  amount: { color: colors.text, fontSize: 38, fontWeight: '800', letterSpacing: -1.2, marginTop: spacing.xs },
  badge: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.pill, marginTop: spacing.md },
  incomeBadge: { backgroundColor: '#74E3C11A' },
  expenseBadge: { backgroundColor: '#FF8E7C1A' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  details: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.large, padding: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.lg },
  detailLabel: { color: colors.textMuted, fontSize: 12 },
  detailValue: { color: colors.text, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  note: { flex: 1 },
  id: { maxWidth: 180, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  error: { color: colors.danger, textAlign: 'center', marginVertical: spacing.md },
  backTextButton: { marginTop: spacing.md, padding: spacing.md },
  backText: { color: colors.primaryLight, fontWeight: '700' },
  editButton: { height: 56, borderRadius: radius.pill, backgroundColor: colors.lavender, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', marginTop: 'auto', marginBottom: spacing.sm },
  editText: { color: colors.black, fontSize: 13, fontWeight: '800' },
});
