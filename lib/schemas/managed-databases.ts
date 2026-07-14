import { z } from "zod"

const regionValues = [
  "us-east-1",
  "us-west-1",
  "us-west-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ca-central-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "sa-east-1",
] as const

export const createSupabaseProjectFormSchema = z.object({
  displayName: z.string().min(3, "Display name must be at least 3 characters").max(50),
  supabaseProjectName: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Project name can only contain lowercase letters, numbers, and hyphens."),
  region: z.enum(regionValues, { errorMap: () => ({ message: "Invalid region selected." }) }),
  dbPass: z.string().min(8, "Password must be at least 8 characters").max(64),
})
