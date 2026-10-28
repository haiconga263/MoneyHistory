import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import type { Transaction } from '../types';
import { formatDate, formatMoney } from '../utils/format';

type Props = {
  transaction: Transaction;
  compact?: boolean;
  onPress?: () => void;
};

export function TransactionCard({ transaction, compact = false, onPress }: Props) {
  const income = transaction.type === 'INCOME';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: `${transaction.category.color}22` }]}>
          <Ionicons
            name={transaction.category.icon as React.ComponentProps<typeof Ionicons>['name']}
            size={compact ? 16 : 19}
            color={transaction.category.color}
          />
        </View>
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>{transaction.category.name}</Text>
          <Text style={styles.date}>{formatDate(transaction.occurredAt)}</Text>
        </View>
      </View>
      {!compact && transaction.note ? (
        <Text numberOfLines={1} style={styles.note}>{transaction.note}</Text>
      ) : null}
      <Text style={[styles.amount, income ? styles.income : styles.expense]}>
        {income ? '+' : '-'}{formatMoney(transaction.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    padding: spacing.md,
    minHeight: 128,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: { width: '48.5%', minHeight: 142 },
  pressed: { opacity: 0.74 },
  top: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, marginLeft: spacing.sm },
  title: { color: colors.text, fontSize: 13, fontWeight: '700' },
  date: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  note: { color: colors.textMuted, fontSize: 12, marginVertical: spacing.sm },
  amount: { color: colors.text, fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  income: { color: colors.income },
  expense: { color: colors.text },
});
