/**
 * LEGACY FILE - Resend-It Proprietary AI Tools
 * 
 * This file has been deprecated and now re-exports from kronova-proprietary-tools.ts
 * for backward compatibility. All new code should import from kronova-proprietary-tools.ts
 * 
 * @deprecated Import from './kronova-proprietary-tools' instead. Resend-It has been rebranded to Kronova.
 */

// Re-export everything from the new Kronova file
export * from "./kronova-proprietary-tools"

// Explicit legacy function alias for backward compatibility
import { registerKronovaProprietaryTools } from "./kronova-proprietary-tools"

/**
 * @deprecated Use registerKronovaProprietaryTools instead. Resend-It has been rebranded to Kronova.
 */
export function registerResendItProprietaryTools(supabase: any) {
  return registerKronovaProprietaryTools(supabase)
}
