import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { perfilService } from "../services/perfil.service";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function useChangePassword(onSuccess: () => void) {
  const [form, setForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Valida un campo individual
  const validateField = useCallback(
    (field: keyof ChangePasswordForm) => {
      const newErrors = { ...errors };

      switch (field) {
        case "currentPassword":
          if (!form.currentPassword.trim()) {
            newErrors.currentPassword = "Ingrese su contraseña actual.";
          } else {
            delete newErrors.currentPassword;
          }
          break;

        case "newPassword":
          if (!form.newPassword) {
            newErrors.newPassword = "Ingrese la nueva contraseña.";
          } else {
            if (form.newPassword.length < 6) {
              newErrors.newPassword = "Mínimo 6 caracteres.";
            } else if (/\s/.test(form.newPassword)) {
              newErrors.newPassword = "No puede contener espacios.";
            } else {
              delete newErrors.newPassword;
            }
          }
          // Validar coincidencia si confirmPassword ya tiene algo
          if (
            form.confirmPassword &&
            form.newPassword !== form.confirmPassword
          ) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
          } else if (
            form.confirmPassword &&
            form.newPassword === form.confirmPassword
          ) {
            delete newErrors.confirmPassword;
          }
          break;

        case "confirmPassword":
          if (!form.confirmPassword) {
            newErrors.confirmPassword = "Repita la nueva contraseña.";
          } else if (
            form.newPassword &&
            form.confirmPassword !== form.newPassword
          ) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
          } else {
            delete newErrors.confirmPassword;
          }
          break;
      }

      setErrors(newErrors);
    },
    [form, errors],
  );

  // Validación completa (para el submit)
  const validate = useCallback(() => {
    const newErrors: ChangePasswordErrors = {};

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = "Ingrese su contraseña actual.";
    }

    if (!form.newPassword) {
      newErrors.newPassword = "Ingrese la nueva contraseña.";
    } else {
      if (form.newPassword.length < 6) {
        newErrors.newPassword = "Mínimo 6 caracteres.";
      }
      if (/\s/.test(form.newPassword)) {
        newErrors.newPassword = "No puede contener espacios.";
      }
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Repita la nueva contraseña.";
    } else if (form.newPassword && form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = useCallback(
    (field: keyof ChangePasswordForm) => (text: string) => {
      setForm((prev) => ({ ...prev, [field]: text }));
      // Al escribir, limpiamos el error del campo
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      setServerError(null);
    },
    [errors],
  );

  const handleBlur = useCallback(
    (field: keyof ChangePasswordForm) => () => {
      validateField(field);
    },
    [validateField],
  );

  const handleSubmit = useCallback(async () => {
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await perfilService.changePassword(
        form.currentPassword,
        form.newPassword,
        form.confirmPassword,
      );
      Toast.show({
        type: "success",
        text1: "Contraseña actualizada",
        text2: response.message || "Tu contraseña ha sido cambiada con éxito.",
        visibilityTime: 3000,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      onSuccess();
    } catch (err: any) {
      const message =
        err?.message || "Error al cambiar la contraseña. Intenta de nuevo.";
      setServerError(message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
        visibilityTime: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  }, [form, validate, onSuccess]);

  const canSubmit =
    !submitting &&
    form.currentPassword.trim().length > 0 &&
    form.newPassword.length >= 6 &&
    form.newPassword === form.confirmPassword;

  return {
    form,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    serverError,
    canSubmit,
  };
}
