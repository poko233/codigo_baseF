import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams();

  const isSmall = width < 500 || height < 720;

  const correo = String(params.correo || "");
  const code = String(params.code || "");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Contraseña muy corta",
        text2: "Debe tener al menos 8 caracteres.",
      });
      return;
    }

    if (password !== passwordConfirmation) {
      Toast.show({
        type: "error",
        text1: "No coinciden",
        text2: "Las contraseñas deben ser iguales.",
      });
      return;
    }

    try {
      setLoading(true);

      await httpClient.post("/api/password/reset", {
        correo,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });

      Toast.show({
        type: "success",
        text1: "Contraseña actualizada",
        text2: "Ya puedes iniciar sesión.",
      });

      router.replace("/login");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudo cambiar la contraseña.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        className="flex-1 items-center justify-center px-4 py-6"
        style={{ backgroundColor: theme.colors.background }}
      >
        <View
          className="w-full max-w-md rounded-[28px] border shadow-2xl"
          style={{
            padding: isSmall ? 22 : 28,
            backgroundColor: theme.dark ? "#111827" : "#ffffff",
            borderColor: theme.dark ? "#374151" : "#e5e7eb",
          }}
        >
          <View className="items-center">
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: isSmall ? 76 : 90,
                height: isSmall ? 76 : 90,
                backgroundColor: theme.colors.primary,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={isSmall ? 34 : 40}
                color="#fff"
              />
            </View>

            <ThemedText
              className="mt-5 text-center font-extrabold"
              style={{ fontSize: isSmall ? 28 : 34 }}
            >
              Nueva contraseña
            </ThemedText>

            <ThemedText className="mt-3 text-center text-base opacity-60">
              Crea una nueva contraseña segura para tu cuenta.
            </ThemedText>
          </View>

          <View className="mt-7">
            <ThemedText className="mb-2 font-extrabold">
              Nueva contraseña
            </ThemedText>

            <View
              className="flex-row items-center rounded-2xl border px-4"
              style={{
                borderColor: theme.dark ? "#4b5563" : "#d1d5db",
                backgroundColor: theme.dark ? "#1f2937" : "#f9fafb",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={theme.colors.muted}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry={!showPassword}
                className="ml-3 flex-1 py-4 text-base"
                style={
                  Platform.OS === "web"
                    ? ({
                        color: theme.colors.text,
                        outlineWidth: 0,
                        borderWidth: 0,
                        backgroundColor: "transparent",
                      } as any)
                    : {
                        color: theme.colors.text,
                        borderWidth: 0,
                        backgroundColor: "transparent",
                      }
                }
              />

              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={theme.colors.muted}
                />
              </Pressable>
            </View>
          </View>

          <View className="mt-5">
            <ThemedText className="mb-2 font-extrabold">
              Confirmar contraseña
            </ThemedText>

            <View
              className="flex-row items-center rounded-2xl border px-4"
              style={{
                borderColor: theme.dark ? "#4b5563" : "#d1d5db",
                backgroundColor: theme.dark ? "#1f2937" : "#f9fafb",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={theme.colors.muted}
              />

              <TextInput
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="Repite la contraseña"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry={!showConfirm}
                className="ml-3 flex-1 py-4 text-base"
                style={
                  Platform.OS === "web"
                    ? ({
                        color: theme.colors.text,
                        outlineWidth: 0,
                        borderWidth: 0,
                        backgroundColor: "transparent",
                      } as any)
                    : {
                        color: theme.colors.text,
                        borderWidth: 0,
                        backgroundColor: "transparent",
                      }
                }
              />

              <Pressable onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={theme.colors.muted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={resetPassword}
            disabled={loading}
            className="mt-6 items-center rounded-2xl py-4 active:opacity-80"
            style={{
              backgroundColor: loading ? "#64748b" : theme.colors.primary,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText className="font-extrabold text-white">
                Cambiar contraseña
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.replace("/login")}
            className="mt-5 items-center rounded-xl py-2"
          >
            <ThemedText
              className="font-extrabold"
              style={{ color: theme.colors.primary }}
            >
              Volver al login
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
