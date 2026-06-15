import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "../../../../theme/useTheme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function RolSearchBar({ value, onChangeText }: Props) {
  const { theme } = useTheme();
  const colors: any = theme.colors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.secondary,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: colors.background || colors.secondary,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.text} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Buscar por nombre o descripción..."
          placeholderTextColor={`${colors.text}99`}
          style={[styles.input, { color: colors.text }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputBox: {
    maxWidth: 520,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    outlineStyle: "none" as any,
  },
});
