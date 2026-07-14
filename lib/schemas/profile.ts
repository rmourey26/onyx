import { z } from "zod"

// Helper for preprocessing optional string fields that should be null if empty or only whitespace
const preprocessOptionalString = (val: unknown) => {
  if (val === null) return null // Pass null through
  if (typeof val === "string" && val.trim() === "") {
    return null
  }
  return val
}

// Specific preprocessor for datetime strings to handle nulls before validation
const preprocessDateTimeString = (val: unknown) => {
  if (val === null) return null // Pass null through, Zod's .nullable() will handle it
  if (typeof val === "string" && val.trim() === "") {
    return null // Convert empty string to null, Zod's .nullable() will handle it
  }
  return val // Pass other strings to the datetime validator
}

export const CardStyleSchema = z
  .object({
    backgroundColor: z.preprocess(
      preprocessOptionalString,
      z
        .string()
        .regex(/^#([0-9a-f]{3,6})$/i, "Invalid hex color")
        .nullable()
        .optional(),
    ),
    textColor: z.preprocess(
      preprocessOptionalString,
      z
        .string()
        .regex(/^#([0-9a-f]{3,6})$/i, "Invalid hex color")
        .nullable()
        .optional(),
    ),
    primaryColor: z.preprocess(
      preprocessOptionalString,
      z
        .string()
        .regex(/^#([0-9a-f]{3,6})$/i, "Invalid hex color")
        .nullable()
        .optional(),
    ),
  })
  .nullable()
  .optional()

export const UserProfileSchema = z.object({
  id: z.string().uuid("Profile ID must be a valid UUID."),
  user_id: z.string().uuid("User ID must be a valid UUID."),
  full_name: z.string().min(1, "Full name is required.").nullable().optional(),
  username: z.string().nullable().optional(),
  email: z.string().email("Invalid email format.").nullable().optional(),
  company:  z.string().min(1, "Company name is required.").nullable().optional(),
  job_title:  z.string().nullable().optional(),
  website:  z.string().url("Invalid URL for website.").nullable().optional(),
  linkedin_url: z.string().url("Invalid URL for LinkedIn profile.").nullable().optional(),
  avatar_url:  z.string().url("Invalid URL for avatar.").nullable().optional(),
  company_logo_url: z.string().url("Invalid URL for company logo.").nullable().optional(),
  waddress:  z.string().nullable().optional(),
  xhandle:  z.string().nullable().optional(),
  public_id:  z.string().nullable().optional(),
  public_access: z.boolean().nullable().optional().default(true),
  card_style: CardStyleSchema,
  created_at: z.string().datetime({ message: "Invalid ISO 8601 date format for created_at" }).nullable().optional(),
  updated_at: z.string().datetime({ message: "Invalid ISO 8601 date format for updated_at" }).nullable().optional(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>
export type CardStyle = z.infer<typeof CardStyleSchema>
