import { api } from "./client";

export interface UserResponse {
  id: string;
  walletAddress: string;
  phoneNumber: string | null;
  email: string | null;
  firstName: string | null;
  createdAt: string;
}

export const usersApi = {
  register: (data: {
    walletAddress: string;
    phoneNumber?: string;
    email?: string;
    firstName?: string;
    ci?: string;
  }) => api.post<UserResponse>("/users/register", data, { skipAuth: true }),

  me: () => api.get<UserResponse>("/users/me"),
};
