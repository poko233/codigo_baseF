// screens/auth/services/auth.service.ts
import { httpClient } from "../../../../http/httpClient";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  return httpClient.post<LoginResponse>(
    "/api/login",
    data,
    "Error al iniciar sesión",
  );
};

export const registerUser = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  return httpClient.postAuth<RegisterResponse>(
    "/api/register",
    data,
    "Error al registrar usuario",
  );
};
