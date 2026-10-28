import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeToSave } from '../src/components/SwipeToSave';
import { colors, radius, spacing } from '../src/constants/theme';
import { api } from '../src/lib/api';
import type { Category, TransactionType } from '../src/types';
import { formatMoney } from '../src/utils/format';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'backspace'];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; type?: string; categoryId?: string }>();
  const id = firstParam(params.id);
  const initialType: TransactionType = firstParam(params.type) === 'INCOME' ? 'INCOME' : 'EXPENSE';
  const initialCategoryId = Number(firstParam(params.categoryId));

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(
    Number.isFinite(initialCategoryId) ? initialCategoryId : null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        if (id) {
          const transaction = await api.getTransaction(id);
          if (!active) return;
          const available = await api.getCategories(transaction.type);
          if (!active) return;
          setType(transaction.type);
          setAmount(String(transaction.amount));
          setNote(transaction.note ?? '');
          setCategoryId(transaction.categoryId);
          setCategories(available);
        } else {
          const available = await api.getCategories(initialType);
          if (!active) return;
          setCategories(available);
          setCategoryId((current) => current ?? available[0]?.id ?? null);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [id, initialType]);

  const changeType = async (nextType: TransactionType) => {
    if (nextType === type) return;
    setType(nextType);
    setError('');
    try {
      const available = await api.getCategories(nextType);
      setCategories(available);
      setCategoryId(available[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh mục.');
    }
  };

  const pressKey = (key: string) => {
    if (key === 'backspace') {
      setAmount((value) => value.slice(0, -1));
      return;
    }
    setAmount((value) => {
      const next = `${value}${key}`.replace(/^0+/, '');
      return next.slice(0, 12);
    });
  };

  const save = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || !categoryId) {
      setError('Vui lòng nhập số tiền và chọn danh mục.');
      throw new Error('Invalid form');
    }

    setSaving(true);
    setError('');
    try {
      const input = { amount: numericAmount, type, categoryId, note: note.trim() || null };
      if (id) {
        await api.updateTransaction(id, input);
      } else {
        await api.createTransaction(input);
      }
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error && saveError.message !== 'Invalid form' ? saveError.message : 'Không thể lưu giao dịch.');
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primaryLight} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{id ? 'Sửa giao dịch' : 'Giao dịch mới'}</Text>
          <View style={styles.iconPlaceholder} />
        </View>

        <View style={styles.typeSwitch}>
          <Pressable onPress={() => void changeType('EXPENSE')} style={[styles.typeOption, type === 'EXPENSE' && styles.typeActive]}>
            <Text style={[styles.typeText, type === 'EXPENSE' && styles.typeActiveText]}>Khoản chi</Text>
          </Pressable>
          <Pressable onPress={() => void changeType('INCOME')} style={[styles.typeOption, type === 'INCOME' && styles.typeActive]}>
            <Text style={[styles.typeText, type === 'INCOME' && styles.typeActiveText]}>Khoản thu</Text>
          </Pressable>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>{type === 'EXPENSE' ? 'Số tiền đã chi' : 'Số tiền đã thu'}</Text>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.amount}>{formatMoney(Number(amount || 0))}</Text>
          <Text style={styles.tax}>đơn vị VND</Text>
        </View>

        <View style={styles.keypad}>
          {keys.map((key) => (
            <Pressable key={key} onPress={() => pressKey(key)} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
              {key === 'backspace' ? (
                <Ionicons name="backspace" size={22} color={colors.text} />
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Danh mục</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {categories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  style={[styles.category, selected && { borderColor: category.color, backgroundColor: `${category.color}18` }]}
                >
                  <Ionicons name={category.icon as React.ComponentProps<typeof Ionicons>['name']} size={18} color={category.color} />
                  <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Ghi chú</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            maxLength={120}
            placeholder="Ví dụ: Ăn trưa cùng đồng nghiệp"
            placeholderTextColor={colors.textMuted}
            style={styles.noteInput}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <SwipeToSave
          disabled={saving || !amount || !categoryId}
          label={id ? 'vuốt để cập nhật' : 'vuốt để lưu'}
          onConfirm={save}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: spacing.md, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 42, height: 42, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  iconPlaceholder: { width: 42 },
  headerTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  typeSwitch: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginTop: spacing.lg },
  typeOption: { flex: 1, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  typeActive: { backgroundColor: colors.lavender },
  typeText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  typeActiveText: { color: colors.black },
  amountBlock: { alignItems: 'center', paddingVertical: spacing.xl },
  amountLabel: { color: colors.textMuted, fontSize: 12 },
  amount: { color: colors.text, fontSize: 43, fontWeight: '800', letterSpacing: -1.5, marginVertical: spacing.xs, maxWidth: '100%' },
  tax: { color: '#59605E', fontSize: 10 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  key: { width: '33.333%', height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium },
  keyPressed: { backgroundColor: colors.surface },
  keyText: { color: colors.text, fontSize: 20, fontWeight: '600' },
  formSection: { gap: spacing.sm, marginBottom: spacing.lg },
  sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  categoryList: { gap: spacing.sm, paddingRight: spacing.md },
  category: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 42, backgroundColor: colors.surface },
  categoryText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  categoryTextSelected: { color: colors.text },
  noteInput: { height: 52, backgroundColor: colors.surface, borderRadius: radius.medium, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, color: colors.text, fontSize: 13 },
  error: { color: colors.danger, fontSize: 12, marginBottom: spacing.md, textAlign: 'center' },
});
