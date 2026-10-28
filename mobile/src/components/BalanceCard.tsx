import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing } from '../constants/theme';
import { formatMoney, greeting } from '../utils/format';

type Props = {
  balance: number;
};

export function BalanceCard({ balance }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  return (
    <LinearGradient
      colors={['#299B83', '#16725F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.greetingRow}>
          <Ionicons name="menu" size={20} color="rgba(255,255,255,0.85)" />
          <View>
            <Text style={styles.eyebrow}>{greeting()},</Text>
            <Text style={styles.name}>Minh</Text>
          </View>
        </View>
        <Ionicons name="notifications" size={18} color={colors.text} />
      </View>

      <View style={styles.balanceRow}>
        <View>
          <Text style={styles.label}>Số dư hiện tại</Text>
          <Text style={styles.balance}>{visible ? formatMoney(balance) : '••••••••'}</Text>
        </View>
        <Pressable
          accessibilityLabel={visible ? 'Ẩn số dư' : 'Hiện số dư'}
          onPress={() => setVisible((value) => !value)}
          hitSlop={12}
        >
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color="rgba(255,255,255,0.65)" />
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.action, styles.actionDark]} onPress={() => router.push('/add?type=INCOME')}>
          <Text style={styles.actionDarkText}>thêm khoản thu</Text>
        </Pressable>
        <Pressable style={[styles.action, styles.actionLight]} onPress={() => router.push('/add?type=EXPENSE')}>
          <Text style={styles.actionLightText}>thêm khoản chi</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.large,
    minHeight: 250,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  eyebrow: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  name: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 2 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  label: { color: 'rgba(255,255,255,0.68)', fontSize: 13, marginBottom: 5 },
  balance: { color: colors.text, fontSize: 31, fontWeight: '800', letterSpacing: -1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1, height: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  actionDark: { backgroundColor: colors.black },
  actionLight: { backgroundColor: colors.lavender },
  actionDarkText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  actionLightText: { color: colors.black, fontSize: 12, fontWeight: '700' },
});
