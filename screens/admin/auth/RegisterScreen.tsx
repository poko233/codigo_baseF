// screens/auth/RegisterScreen.tsx
import { router } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuth } from "../../../contexts/AuthContext";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import { AuthInput } from "./components/AuthInput";
import { DatePickerField } from "./components/DatePickerField";
import { GenderSelector } from "./components/GenderSelector";
import { RoleSelector } from "./components/RoleSelector";
import { SubmitButton } from "./components/SubmitButton";
import { useRegisterForm } from "./hooks/useRegisterForm";
import type { RegisterRequest } from "./types/auth.types";

const textFields: {
  field: Exclude<keyof RegisterRequest, "roles" | "fecha_nac">;
  label: string;
  autoCapitalize?: "none" | "sentences" | "words";
  maxLength?: number;
  keyboardType?: "default" | "email-address" | "numeric";
  secureTextEntry?: boolean;
}[] = [
  { field: "usuario", label: "Usuario", autoCapitalize: "none", maxLength: 40 },
  { field: "password", label: "Contraseña", secureTextEntry: true },
  { field: "ci", label: "CI", autoCapitalize: "none", maxLength: 12 },
  {
    field: "nombres",
    label: "Nombres",
    autoCapitalize: "words",
    maxLength: 40,
  },
  {
    field: "apellidos",
    label: "Apellidos",
    autoCapitalize: "words",
    maxLength: 40,
  },
  {
    field: "email",
    label: "Email (opcional)",
    autoCapitalize: "none",
    maxLength: 80,
    keyboardType: "email-address",
  },
  {
    field: "telefono",
    label: "Teléfono (opcional)",
    keyboardType: "numeric",
    maxLength: 10,
  },
  {
    field: "celular",
    label: "Celular (opcional)",
    keyboardType: "numeric",
    maxLength: 10,
  },
];

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { hasAnyRole } = useAuth();
  const { isDesktop } = useResponsive();
  const isTwoColumns = isDesktop;

  const {
    form,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    serverError,
    canSubmit,
  } = useRegisterForm();
  /*
  // Verificación de permisos: solo quienes pueden asignar roles
  if (
    !hasAnyRole([
      "Administrador",
      "Rector",
      "Director Academico",
      "Director Administrativo",
      "Fundador",
    ])
  ) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text
          style={{ color: theme.colors.text, fontSize: 18, fontWeight: "600" }}
        >
          No tienes permiso para registrar usuarios.
        </Text>
      </View>
    );
  }
*/
  const handleGenderSelect = (val: "MASCULINO" | "FEMENINO") => {
    handleChange("genero")(val);
  };

  // Separar campos para columnas
  const leftFields = isTwoColumns
    ? textFields.slice(0, Math.ceil(textFields.length / 2))
    : textFields;
  const rightFields = isTwoColumns
    ? textFields.slice(Math.ceil(textFields.length / 2))
    : [];

  const renderTextField = (
    item: (typeof textFields)[number],
    index: number,
    columnOffset = 0,
  ) => (
    <Animated.View
      key={item.field}
      entering={FadeInUp.delay(150 + (index + columnOffset) * 50)
        .duration(400)
        .springify()}
    >
      <AuthInput
        label={item.label}
        value={form[item.field] as string}
        onChangeText={handleChange(item.field) as (text: string) => void}
        onBlur={handleBlur(item.field)}
        error={errors[item.field] as string | undefined}
        secureTextEntry={item.secureTextEntry}
        keyboardType={item.keyboardType ?? "default"}
        autoCapitalize={item.autoCapitalize ?? "sentences"}
        maxLength={item.maxLength}
      />
    </Animated.View>
  );

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === "ios" ? 40 : 60}
    >
      <View
        style={{ backgroundColor: theme.colors.background }}
        className="flex-1 justify-center items-center px-6 py-10"
      >
        <View
          className={`w-full ${isTwoColumns ? "max-w-3xl" : "max-w-md"} bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700`}
          style={{
            backgroundColor: theme.dark
              ? "rgba(31,41,55,0.9)"
              : "rgba(255,255,255,0.9)",
          }}
        >
          <Animated.View entering={FadeInDown.duration(400).springify()}>
            <Text
              style={{ color: theme.colors.text }}
              className="text-3xl font-extrabold mb-2 text-center"
            >
              Crear cuenta
            </Text>
            <Text
              style={{ color: theme.colors.muted }}
              className="text-sm mb-8 text-center"
            >
              Completa todos los campos para registrar un nuevo usuario.
            </Text>
          </Animated.View>

          {/* Campos de texto */}
          {isTwoColumns ? (
            <View className="flex-row gap-4">
              <View className="flex-1">
                {leftFields.map((item, i) => renderTextField(item, i, 0))}
              </View>
              <View className="flex-1">
                {rightFields.map((item, i) =>
                  renderTextField(item, i, leftFields.length),
                )}
              </View>
            </View>
          ) : (
            leftFields.map((item, i) => renderTextField(item, i, 0))
          )}

          {/* Fecha de nacimiento */}
          <Animated.View
            entering={FadeInUp.delay(150 + textFields.length * 50)
              .duration(400)
              .springify()}
          >
            <DatePickerField
              label="Fecha de nacimiento"
              value={form.fecha_nac || null}
              onChange={(isoDate) => handleChange("fecha_nac")(isoDate)}
              error={errors.fecha_nac as string | undefined}
            />
          </Animated.View>

          {/* Género */}
          <Animated.View
            entering={FadeInUp.delay(200 + textFields.length * 50)
              .duration(400)
              .springify()}
          >
            <GenderSelector
              value={form.genero}
              onSelect={handleGenderSelect}
              error={errors.genero as string | undefined}
            />
          </Animated.View>

          {/* Roles */}
          <Animated.View
            entering={FadeInUp.delay(250 + textFields.length * 50)
              .duration(400)
              .springify()}
          >
            <RoleSelector
              selected={form.roles}
              onChange={(roles) => handleChange("roles")(roles as any)}
              error={errors.roles as string | undefined}
            />
          </Animated.View>

          {serverError && (
            <Animated.View entering={FadeInUp.duration(200)}>
              <Text
                style={{ color: theme.colors.destructive }}
                className="text-sm mb-4 text-center"
              >
                {serverError}
              </Text>
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInUp.delay(300 + textFields.length * 50)
              .duration(400)
              .springify()}
          >
            <SubmitButton
              title="Registrar usuario"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!canSubmit}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(350 + textFields.length * 50)
              .duration(400)
              .springify()}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ color: theme.colors.muted }}>
              ¿Ya tienes cuenta?{" "}
            </Text>
            <Text
              style={{ color: theme.colors.primary, fontWeight: "bold" }}
              onPress={() => router.back()}
            >
              Inicia sesión
            </Text>
          </Animated.View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
