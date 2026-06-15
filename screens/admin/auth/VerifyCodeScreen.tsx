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

export default function VerifyCodeScreen() {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams();

  const isSmall = width < 500 || height < 720;
  const correo = String(params.correo || "");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const verificarCodigo = async () => {
    if (code.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Código inválido",
        text2: "El código debe tener 6 dígitos.",
      });
      return;
    }

    try {
      setLoading(true);

      await httpClient.post("/api/password/verify-code", {
        correo,
        code,
      });

      router.push({
        pathname: "/reset-password",
        params: { correo, code },
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Código incorrecto",
        text2: error?.message || "El código expiró o no es válido.",
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
                name="shield-checkmark-outline"
                size={isSmall ? 34 : 40}
                color="#fff"
              />
            </View>

            <ThemedText
              className="mt-5 text-center font-extrabold"
              style={{ fontSize: isSmall ? 28 : 34 }}
            >
              Verificar código
            </ThemedText>

            <ThemedText className="mt-3 text-center text-base opacity-60">
              Ingresa el código enviado a:
            </ThemedText>

            <ThemedText
              className="mt-1 text-center font-extrabold"
              style={{ color: theme.colors.primary }}
            >
              {correo}
            </ThemedText>
          </View>

          <View className="mt-7">
            <ThemedText className="mb-2 font-extrabold">Código</ThemedText>

            <View
              className="flex-row items-center rounded-2xl border px-4"
              style={{
                borderColor: theme.dark ? "#4b5563" : "#d1d5db",
                backgroundColor: theme.dark ? "#1f2937" : "#f9fafb",
              }}
            >
              <Ionicons
                name="keypad-outline"
                size={22}
                color={theme.colors.muted}
              />

              <TextInput
                value={code}
                onChangeText={(text) =>
                  setCode(text.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                placeholderTextColor={theme.colors.muted}
                keyboardType="number-pad"
                className="ml-3 flex-1 py-4 text-center text-2xl font-extrabold tracking-widest"
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
            </View>
          </View>

          <Pressable
            onPress={verificarCodigo}
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
                Verificar código
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
