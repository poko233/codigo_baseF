// screens/auth/components/RoleSelector.tsx
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAuth } from "@/store/authStore";
import { useTheme } from "../../../../theme/useTheme";

interface RoleSelectorProps {
  selected: string[]; // nombres de rol, ej: ["Administrador"]
  onChange: (roles: string[]) => void;
  error?: string;
}

export const RoleSelector = ({
  selected,
  onChange,
  error,
}: RoleSelectorProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const allowedRoles = getAssignableRoles(user?.roles || []);

  const toggleRole = (roleName: string) => {
    if (selected.includes(roleName)) {
      onChange(selected.filter((r) => r !== roleName));
    } else {
      onChange([...selected, roleName]);
    }
  };

  if (!allowedRoles.length) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{ color: theme.colors.text, marginBottom: 8, marginLeft: 4 }}
        className="text-sm font-medium"
      >
        Roles
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {allowedRoles.map((roleName, i) => (
          <Animated.View key={roleName} entering={FadeIn.delay(i * 50)}>
            <TouchableOpacity
              onPress={() => toggleRole(roleName)}
              className={`py-2 px-4 rounded-full border ${
                selected.includes(roleName)
                  ? "bg-primary border-primary"
                  : "bg-background-secondary border-border"
              }`}
              style={{
                backgroundColor: selected.includes(roleName)
                  ? theme.colors.primary
                  : theme.colors.backgroundSecondary,
                borderColor: selected.includes(roleName)
                  ? theme.colors.primary
                  : theme.colors.border,
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: selected.includes(roleName)
                    ? theme.colors.primaryForeground
                    : theme.colors.text,
                }}
              >
                {roleName}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      {error ? (
        <Text
          style={{
            color: theme.colors.destructive,
            fontSize: 12,
            marginTop: 4,
            marginLeft: 8,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

// Devuelve un array de strings con los nombres de rol que el usuario actual puede asignar
function getAssignableRoles(currentRoles: string[]): string[] {
  const allowedNames: string[] = [];
  for (const r of currentRoles) {
    switch (r) {
      case "Administrador":
        allowedNames.push("Personal");
        break;
      case "Rector":
        allowedNames.push("Administrador", "Personal");
        break;
      case "Director Administrativo":
        allowedNames.push("Rector", "Administrador", "Personal");
        break;
      case "Director Academico":
        allowedNames.push(
          "Rector",
          "Administrador",
          "Personal",
          "Director Administrativo",
        );
        break;
      case "Fundador":
        allowedNames.push(
          "Rector",
          "Administrador",
          "Personal",
          "Director Administrativo",
          "Director Academico",
        );
        break;
    }
  }
  return [...new Set(allowedNames)];
}
