// screens/admin/auth/LoginScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { PanResponder, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSharedValue } from "react-native-reanimated";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AuthInput } from "./components/AuthInput";
import { GlassCard } from "./components/GlassCard";
import { Mascot } from "./components/Mascot";
import { SubmitButton } from "./components/SubmitButton";
import { useLoginForm } from "./hooks/useLoginForm";

export default function LoginScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ empresa: string }>();
  const empresa = params.empresa ?? "";

  const {
    form,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    serverError,
    canSubmit,
  } = useLoginForm({ empresa });

  const usernameFocused = useSharedValue(false);
  const passwordFocused = useSharedValue(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const eyeOffsetX = useSharedValue(0);
  const eyeOffsetY = useSharedValue(0);

  const mascotRef = useRef<View>(null);

  const updateEyeOffset = (pageX: number, pageY: number) => {
    if (mascotRef.current) {
      mascotRef.current.measureInWindow((x, y, width, height) => {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const moveX = (pageX - centerX) / 12;
        const moveY = (pageY - centerY) / 12;
        eyeOffsetX.value = Math.min(Math.max(moveX, -21), 21);
        eyeOffsetY.value = Math.min(Math.max(moveY, -19), 19);
      });
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleMouseMove = (e: MouseEvent) => {
        updateEyeOffset(e.clientX, e.clientY);
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const panResponder = useMemo(
    () =>
      Platform.OS !== "web"
        ? PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt) => {
              updateEyeOffset(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
            },
            onPanResponderRelease: () => {
              eyeOffsetX.value = 0;
              eyeOffsetY.value = 0;
            },
          })
        : { panHandlers: {} },
    [eyeOffsetX, eyeOffsetY],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 40 : 60}
      >
        <View
          className="flex-1 justify-center items-center px-4"
          style={{ backgroundColor: theme.colors.background }}
          {...panResponder.panHandlers}
        >
          {/* Elementos decorativos detrás del cristal */}
          <View
            style={{
              position: "absolute",
              top: "20%",
              left: "-10%",
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: theme.colors.primary,
              opacity: 0.3,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: "10%",
              right: "-10%",
              width: 250,
              height: 250,
              borderRadius: 125,
              backgroundColor: theme.colors.info,
              opacity: 0.3,
            }}
          />

          {/* Mascota */}
          <View ref={mascotRef} style={styles.mascotWrapper}>
            <Mascot
              isPasswordVisible={isPasswordVisible}
              usernameFocused={usernameFocused}
              passwordFocused={passwordFocused}
              eyeOffsetX={eyeOffsetX}
              eyeOffsetY={eyeOffsetY}
            />
          </View>

          <GlassCard>
            <View className="w-full max-w-md flex flex-col gap-8">
              {/* Título */}
              <View style={{ alignItems: "center" }}>
                <ThemedText
                  style={[styles.title, { color: theme.colors.text }]}
                >
                  Bienvenido de nuevo
                </ThemedText>
                <ThemedText
                  style={[styles.subtitle, { color: theme.colors.muted }]}
                >
                  {empresa
                    ? `Accediendo a ${empresa}`
                    : "Ingresa tus credenciales para acceder"}
                </ThemedText>
              </View>

              {/* Formulario */}
              <View className="flex flex-col gap-6">
                <AuthInput
                  label="USUARIO"
                  value={form.usuario}
                  onChangeText={handleChange("usuario")}
                  onBlur={(e) => {
                    handleBlur("usuario")();
                    usernameFocused.value = false;
                  }}
                  onFocus={() => {
                    usernameFocused.value = true;
                  }}
                  error={errors.usuario}
                  autoCapitalize="none"
                  maxLength={40}
                  placeholder="Usuario, CI o correo"
                  onSubmitEditing={handleSubmit}
                />

                <AuthInput
                  label="CONTRASEÑA"
                  value={form.password}
                  onChangeText={handleChange("password")}
                  onBlur={(e) => {
                    handleBlur("password")();
                    passwordFocused.value = false;
                  }}
                  onFocus={() => {
                    passwordFocused.value = true;
                  }}
                  error={errors.password}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="••••••••"
                  passwordVisible={isPasswordVisible}
                  onTogglePasswordVisibility={() =>
                    setIsPasswordVisible(!isPasswordVisible)
                  }
                  rightLabel={
                    <ThemedText
                      style={{
                        color: theme.colors.primary,
                        fontWeight: "600",
                        fontSize: 11,
                      }}
                      onPress={() => router.push("/forgot-password")}
                    >
                      ¿Olvidaste tu contraseña?
                    </ThemedText>
                  }
                  onSubmitEditing={handleSubmit}
                />

                {serverError && (
                  <ThemedText
                    style={{
                      color: theme.colors.destructive,
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    {serverError}
                  </ThemedText>
                )}

                <SubmitButton
                  title="Iniciar Sesión"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={!canSubmit}
                />
              </View>
            </View>
          </GlassCard>
        </View>
      </KeyboardAwareScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mascotWrapper: {
    width: 256,
    height: 256,
    alignSelf: "center",
    marginBottom: -20,
    zIndex: 10,
    overflow: "visible",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
});
