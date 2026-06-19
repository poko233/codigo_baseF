// screens/auth/hooks/useRegisterForm.ts
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "@/store/authStore";
import { registerUser } from "../services/auth.service";
import type { RegisterRequest, ValidationErrors } from "../types/auth.types";

const HOME_ROUTE = "/" as const;
const MAX_40 = 40;
const MAX_10 = 10;
const MAX_12 = 12;

const validateField = (
  name: keyof RegisterRequest,
  value: string | number[],
): string => {
  if (name === "roles") {
    if (!value || (Array.isArray(value) && value.length === 0))
      return "Seleccione al menos un rol";
    return "";
  }
  const val = value as string;
  switch (name) {
    case "usuario":
      if (!val.trim()) return "Obligatorio";
      if (val.trim().length > MAX_40) return `Máx ${MAX_40} caracteres`;
      return "";
    case "password":
      if (!val) return "Obligatorio";
      if (val.length < 6) return "Mínimo 6 caracteres";
      return "";
    case "ci":
      if (!val.trim()) return "Obligatorio";
      if (val.trim().length > MAX_12) return `Máx ${MAX_12} caracteres`;
      return "";
    case "nombres":
      if (!val.trim()) return "Obligatorio";
      if (val.trim().length > MAX_40) return `Máx ${MAX_40} caracteres`;
      return "";
    case "apellidos":
      if (!val.trim()) return "Obligatorio";
      if (val.trim().length > MAX_40) return `Máx ${MAX_40} caracteres`;
      return "";
    case "genero":
      if (!val) return "Selecciona un género";
      if (val !== "MASCULINO" && val !== "FEMENINO") return "Valor inválido";
      return "";
    case "fecha_nac":
      if (!val) return "Obligatorio";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return "Formato YYYY-MM-DD";
      return "";
    case "email":
      if (val && val.length > 80) return "Máx 80 caracteres";
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        return "Email inválido";
      return "";
    case "telefono":
    case "celular":
      if (val && val.length > MAX_10) return `Máx ${MAX_10} caracteres`;
      return "";
    default:
      return "";
  }
};

export function useRegisterForm() {
  const { login } = useAuth();
  const [form, setForm] = useState<RegisterRequest>({
    usuario: "",
    password: "",
    ci: "",
    nombres: "",
    apellidos: "",
    genero: "" as "MASCULINO" | "FEMENINO",
    fecha_nac: "",
    email: "",
    telefono: "",
    celular: "",
    roles: [] as string[],
  });
  const [errors, setErrors] = useState<ValidationErrors<RegisterRequest>>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegisterRequest, boolean>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = useCallback(
    (field: keyof RegisterRequest) => (value: string | number[]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
      if (serverError) setServerError(null);
    },
    [touched, serverError],
  );

  const handleBlur = useCallback(
    (field: keyof RegisterRequest) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, form[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [form],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors<RegisterRequest> = {};
    (Object.keys(form) as (keyof RegisterRequest)[]).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);

    const allTouched: Partial<Record<keyof RegisterRequest, boolean>> = {};
    (Object.keys(form) as (keyof RegisterRequest)[]).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched((prev) => ({ ...prev, ...allTouched }));
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await registerUser(form);

      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: `Usuario ${response.user.nombres} creado correctamente. Ya puede iniciar sesión.`,
        visibilityTime: 2500,
      });

      router.replace(HOME_ROUTE);
    } catch (err: any) {
      const message = err?.message || "Error inesperado";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  }, [form, validateForm, login]);

  const canSubmit = useMemo(() => {
    return (
      Object.values(errors).every((e) => !e) &&
      form.usuario.trim() &&
      form.password &&
      form.ci.trim() &&
      form.nombres.trim() &&
      form.apellidos.trim() &&
      form.genero &&
      form.fecha_nac &&
      form.roles.length > 0
    );
  }, [errors, form]);

  return {
    form,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    serverError,
    canSubmit,
  };
}
