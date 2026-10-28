import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { colors, radius } from '../constants/theme';

type Props = {
  label: string;
  disabled?: boolean;
  onConfirm: () => Promise<void>;
};

const KNOB_SIZE = 58;

export function SwipeToSave({ label, disabled = false, onConfirm }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const max = Math.max(0, width - KNOB_SIZE - 8);
  const maxRef = useRef(max);
  const disabledRef = useRef(disabled);
  const submittingRef = useRef(submitting);
  const confirmRef = useRef(onConfirm);
  maxRef.current = max;
  disabledRef.current = disabled;
  submittingRef.current = submitting;
  confirmRef.current = onConfirm;

  const reset = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
  };

  const confirm = async () => {
    if (submittingRef.current || disabledRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await confirmRef.current();
    } catch {
      reset();
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4,
      onPanResponderMove: (_, gesture) => {
        const currentMax = maxRef.current;
        translateX.setValue(Math.max(0, Math.min(gesture.dx, currentMax)));
      },
      onPanResponderRelease: (_, gesture) => {
        const currentMax = maxRef.current;
        if (currentMax > 0 && gesture.dx >= currentMax * 0.68 && !disabledRef.current) {
          Animated.timing(translateX, { toValue: currentMax, duration: 140, useNativeDriver: true }).start(confirm);
        } else {
          reset();
        }
      },
      onPanResponderTerminate: reset,
    }),
  ).current;

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || submitting }}
      onAccessibilityTap={confirm}
      onLayout={onLayout}
      style={[styles.track, (disabled || submitting) && styles.disabled]}
    >
      <Text style={styles.label}>{submitting ? 'đang lưu...' : label}</Text>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.knob, { transform: [{ translateX }] }]}
      >
        <Ionicons name="chevron-forward" size={19} color={colors.text} />
        <Ionicons name="chevron-forward" size={19} color={colors.text} style={styles.secondChevron} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 66,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  disabled: { opacity: 0.5 },
  label: { color: colors.textMuted, textAlign: 'center', fontSize: 13, fontWeight: '600' },
  knob: {
    position: 'absolute',
    left: 4,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondChevron: { marginLeft: -12, opacity: 0.55 },
});
