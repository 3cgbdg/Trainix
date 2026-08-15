import { api } from "@/api/axiosInstance";
import type { IUser } from "@/types/types";

export async function updateProfile(payload: object) {
  const response = await api.patch<{ user: IUser }>("/api/auth/profile", payload);
  return response.data.user;
}
