import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

const isLightColor = (hex: string) => {
  const color = hex.replace("#", "");
  if (color.length !== 6) return false;

  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
};

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  const isSmall = width < 500 || height < 720;

  const textColor = theme.dark ? "#F9FAFB" : "#111827";
  const mutedColor = theme.dark ? "#CBD5E1" : "#6B7280";
  const cardBg = theme.dark ? "#111827" : "#FFFFFF";
  const inputBg = theme.dark ? "#1F2937" : "#F9FAFB";
  const borderColor = theme.dark ? "#374151" : "#D1D5DB";
  const accentColor = theme.colors.primary;
  const accentTextColor = isLightColor(accentColor) ? "#111827" : "#FFFFFF";

  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarCodigo = async () => {
    const email = correo.trim().toLowerCase();

    if (!email) {
      Toast.show({
        type: "error",
        text1: "Correo requerido",
        text2: "Ingresa tu correo electrónico.",
      });
      return;
    }

    try {
      setLoading(true);

      await httpClient.post("/api/password/forgot-email", {
        correo: email,
      });

      Toast.show({
        type: "success",
        text1: "Código enviado",
        text2: "Revisa tu correo electrónico.",
      });

      router.push({
        pathname: "/verify-code",
        params: { correo: email },
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo enviar el código",
        text2: error?.message || "Intenta nuevamente.",
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
            backgroundColor: cardBg,
            borderColor,
          }}
        >
          <View className="items-center">
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: isSmall ? 76 : 90,
                height: isSmall ? 76 : 90,
                backgroundColor: accentColor,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={isSmall ? 34 : 40}
                color={accentTextColor}
              />
            </View>

            <ThemedText
              className="mt-5 text-center font-extrabold"
              style={{ fontSize: isSmall ? 28 : 34, color: textColor }}
            >
              Recuperar contraseña
            </ThemedText>

            <ThemedText
              className="mt-3 text-center"
              style={{
                fontSize: isSmall ? 15 : 17,
                lineHeight: 24,
                color: mutedColor,
              }}
            >
              Ingresa tu correo electrónico y te enviaremos un código de
              verificación.
            </ThemedText>
          </View>

          <View className="mt-7">
            <ThemedText
              className="mb-2 font-extrabold"
              style={{ color: textColor }}
            >
              Correo electrónico
            </ThemedText>

            <View
              className="flex-row items-center rounded-2xl border px-4"
              style={{
                borderColor,
                backgroundColor: inputBg,
              }}
            >
              <Ionicons name="mail-outline" size={22} color={mutedColor} />

              <TextInput
                value={correo}
                onChangeText={setCorreo}
                placeholder="correo@gmail.com"
                placeholderTextColor={mutedColor}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                className="ml-3 flex-1 py-4 text-base"
                style={
                  {
                    color: textColor,
                    borderWidth: 0,
                    backgroundColor: "transparent",
                    outlineWidth: 0,
                    outlineColor: "transparent",
                    boxShadow: "none",
                  } as any
                }
              />
            </View>
          </View>

          <Pressable
            onPress={enviarCodigo}
            disabled={loading}
            className="mt-6 items-center rounded-2xl py-4 active:opacity-80"
            style={{
              backgroundColor: loading ? "#64748B" : accentColor,
            }}
          >
            {loading ? (
              <ActivityIndicator color={accentTextColor} />
            ) : (
              <ThemedText
                className="font-extrabold"
                style={{ color: accentTextColor }}
              >
                Enviar código
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.replace("/login")}
            className="mt-5 items-center rounded-xl py-2"
          >
            <ThemedText
              className="font-extrabold"
              style={{ color: accentColor }}
            >
              Volver al login
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
