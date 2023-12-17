import * as z from "zod";

export const userValidation = z.object({
  name: z.string().min(3, { message: "Minimum 3 characters" }).max(30),
  profile_photo: z.string().url().nonempty(),
  username: z.string().min(3).max(30),
  bio: z.string().min(3).max(1000),
});
