export type UserRole = "admin" | "user";
export type UserStatus = "pending" | "approved" | "rejected";

/** Database row for `users` (includes secret hash — server only). */
export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date | string;
};

/** Safe user shape for APIs/clients that still use SQL column names. */
export type PublicUser = Omit<UserRow, "password_hash">;

/** CamelCase public user DTO for JSON API responses. */
export type UserDto = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};
