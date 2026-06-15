import { ProtectedRoute } from "@/components/ProtectedRoute";
import RegisterScreen from "../../screens/admin/auth/RegisterScreen";

export default function Register() {
  return (
    <ProtectedRoute>
      <RegisterScreen />
    </ProtectedRoute>
  );
}
