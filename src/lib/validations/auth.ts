import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;

export const authCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
