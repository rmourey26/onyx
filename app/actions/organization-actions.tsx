"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createOrganization(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const industry = formData.get("industry") as string
    const company_size = formData.get("company_size") as string
    const website_url = formData.get("website_url") as string

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name,
        slug,
        description,
        industry,
        company_size,
        website_url,
        created_by: user.id,
      })
      .select()
      .single()

    if (orgError) {
      return { success: false, error: orgError.message }
    }

    // Add creator as owner
    const { error: memberError } = await supabase.from("organization_members").insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
      joined_at: new Date().toISOString(),
    })

    if (memberError) {
      return { success: false, error: memberError.message }
    }

    revalidatePath("/ai-suite/teams")
    return { success: true }
  } catch (error) {
    console.error("Error creating organization:", error)
    return { success: false, error: "Failed to create organization" }
  }
}

export async function updateOrganization(organizationId: string, formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is admin or owner
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single()

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      return { success: false, error: "Not authorized" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const industry = formData.get("industry") as string
    const company_size = formData.get("company_size") as string
    const website_url = formData.get("website_url") as string

    const { error } = await supabase
      .from("organizations")
      .update({
        name,
        description,
        industry,
        company_size,
        website_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/ai-suite/teams")
    return { success: true }
  } catch (error) {
    console.error("Error updating organization:", error)
    return { success: false, error: "Failed to update organization" }
  }
}

export async function inviteMember(organizationId: string, formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is admin or owner
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      return { success: false, error: "Not authorized" }
    }

    const email = formData.get("email") as string
    const role = formData.get("role") as string

    const { data: organization } = await supabase.from("organizations").select("name").eq("id", organizationId).single()

    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle()

    const { data: invitedUser } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle()

    if (!invitedUser) {
      await sendInvitationEmail(
        email,
        organization?.name || "the organization",
        inviterProfile?.full_name || inviterProfile?.email || "A team member",
        role,
      )
      return {
        success: true,
        message: "Invitation email sent! The user will need to sign up first.",
      }
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", invitedUser.id)
      .maybeSingle()

    if (existingMember) {
      return { success: false, error: "User is already a member" }
    }

    // Add member
    const { error } = await supabase.from("organization_members").insert({
      organization_id: organizationId,
      user_id: invitedUser.id,
      role,
      invited_by: user.id,
      joined_at: new Date().toISOString(),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/ai-suite/teams")
    return { success: true }
  } catch (error) {
    console.error("Error inviting member:", error)
    return { success: false, error: "Failed to invite member" }
  }
}

export async function updateMemberRole(memberId: string, newRole: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the member's organization
    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("id", memberId)
      .single()

    if (!member) {
      return { success: false, error: "Member not found" }
    }

    // Check if user is admin or owner
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", member.organization_id)
      .eq("user_id", user.id)
      .single()

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      return { success: false, error: "Not authorized" }
    }

    const { error } = await supabase.from("organization_members").update({ role: newRole }).eq("id", memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/ai-suite/teams")
    return { success: true }
  } catch (error) {
    console.error("Error updating member role:", error)
    return { success: false, error: "Failed to update member role" }
  }
}

export async function removeMember(memberId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the member's organization
    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id, user_id")
      .eq("id", memberId)
      .single()

    if (!member) {
      return { success: false, error: "Member not found" }
    }

    // Check if user is admin or owner
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", member.organization_id)
      .eq("user_id", user.id)
      .single()

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      return { success: false, error: "Not authorized" }
    }

    // Prevent removing yourself
    if (member.user_id === user.id) {
      return { success: false, error: "Cannot remove yourself" }
    }

    const { error } = await supabase.from("organization_members").delete().eq("id", memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/ai-suite/teams")
    return { success: true }
  } catch (error) {
    console.error("Error removing member:", error)
    return { success: false, error: "Failed to remove member" }
  }
}

async function sendInvitationEmail(email: string, organizationName: string, inviterName: string, role: string) {
  try {
    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://app.resend-it.com"}/signup?email=${encodeURIComponent(email)}&referrer=org-invite`

    await resend.emails.send({
      from: "team@resendit.com",
      to: email,
      subject: `You've been invited to join ${organizationName} on Resend-It`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0e7490; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">You're Invited!</h1>
            <p style="color: #e0f2fe;">Join ${organizationName} on Resend-It</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #334155;">Hi there!</p>
            
            <p style="font-size: 16px; color: #334155;">
              <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> 
              as a <strong>${role}</strong> on the Resend-It platform.
            </p>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0e7490; margin-top: 0;">What is Resend-It?</h3>
              <p style="color: #334155; margin-bottom: 0;">
                Resend-It is an enterprise AI platform that helps organizations manage assets, workflows, 
                and team collaboration with powerful AI-driven insights and automation.
              </p>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${signupUrl}" style="background-color: #0e7490; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                Sign Up & Join Team
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Note:</strong> You'll need to create an account first before you can join the organization. 
                Click the button above to get started!
              </p>
            </div>
            
            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
              If you have any questions, feel free to reach out to ${inviterName} or visit our 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.resend-it.com"}/about" style="color: #0e7490; text-decoration: none;">help center</a>.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Resend-It. All rights reserved.</p>
            <p>This invitation was sent to ${email}</p>
            <p style="margin-top: 10px;">
              <a href="${signupUrl}" style="color: #0e7490; text-decoration: none;">Sign Up Now</a>
            </p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending invitation email:", error)
    throw error
  }
}
