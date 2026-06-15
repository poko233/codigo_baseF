// screens/auth/components/GenderSelector.tsx
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme } from "../../../../theme/useTheme";
import { errorShakeAnimation } from "../animations/auth.animations";

interface Option {
  label: string;
  value: "MASCULINO" | "FEMENINO";
}

const options: Option[] = [
  { label: "Masculino", value: "MASCULINO" },
  { label: "Femenino", value: "FEMENINO" },
];

interface GenderSelectorProps {
  value: string;
  onSelect: (val: "MASCULINO" | "FEMENINO") => void;
  error?: string;
}

export const GenderSelector = ({
  value,
  onSelect,
  error,
}: GenderSelectorProps) => {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (error) {
      errorShakeAnimation(translateX);
    }
  }, [error, translateX]);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="mb-4">
      <Text
        style={{ color: theme.colors.text }}
        className="text-sm font-medium mb-2"
      >
        Género
      </Text>
      <Animated.View style={[animatedContainer, { flexDirection: "row" }]}>
        {options.map((opt, index) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
              className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                isSelected
                  ? "bg-primary border-primary"
                  : "bg-background-secondary border-border"
              } ${index === 0 ? "mr-3" : ""}`} // espacio entre los dos botones
              style={{
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.backgroundSecondary,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.border,
              }}
            >
              <Text
                style={{
                  color: isSelected
                    ? theme.colors.primaryForeground
                    : theme.colors.text,
                }}
                className="font-semibold"
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
      {error ? (
        <Text
          style={{ color: theme.colors.destructive }}
          className="text-xs mt-1 ml-2"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};
