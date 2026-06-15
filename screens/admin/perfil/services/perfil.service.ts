import { httpClient } from "@/http/httpClient";

export const perfilService = {
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    return httpClient.putAuth<{ message: string }>("/api/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    });
  },
};
