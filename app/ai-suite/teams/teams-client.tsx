"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { motion } from "framer-motion"
import {
  Users,
  UserPlus,
  Settings,
  Crown,
  Shield,
  UserIcon,
  Mail,
  MoreVertical,
  Trash2,
  Building2,
  Calendar,
  Globe,
  Briefcase,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  createOrganization,
  updateOrganization,
  inviteMember,
  updateMemberRole,
  removeMember,
} from "@/app/actions/organization-actions"

interface TeamsClientProps {
  user: User
  organization: any
  organizations: any[] // Added organizations array
  currentMembership: any
  members: any[]
  userProfile: {
    company: string | null
    full_name: string | null
    email: string | null
  } | null
}

export function TeamsClient({
  user,
  organization,
  organizations,
  currentMembership,
  members,
  userProfile,
}: TeamsClientProps) {
  const { toast } = useToast()
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isEditOrgOpen, setIsEditOrgOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [useProfileCompany, setUseProfileCompany] = useState(false)

  const isAdmin = currentMembership?.role === "admin" || currentMembership?.role === "owner"
  const isOwner = currentMembership?.role === "owner"

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <UserIcon className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-yellow-500">Owner</Badge>
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>
      default:
        return <Badge variant="secondary">Member</Badge>
    }
  }

  const handleCreateOrganization = async (formData: FormData) => {
    setIsLoading(true)
    try {
      if (useProfileCompany && userProfile?.company) {
        formData.set("name", userProfile.company)
        const slug = userProfile.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        formData.set("slug", slug)
      }

      const result = await createOrganization(formData)
      if (result.success) {
        toast({
          title: "Organization created",
          description: "Your organization has been created successfully.",
        })
        setIsCreateOrgOpen(false)
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create organization",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateOrganization = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await updateOrganization(organization.id, formData)
      if (result.success) {
        toast({
          title: "Organization updated",
          description: "Organization details have been updated successfully.",
        })
        setIsEditOrgOpen(false)
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update organization",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await inviteMember(organization.id, formData)
      if (result.success) {
        toast({
          title: "Invitation sent",
          description: "Team member has been invited successfully.",
        })
        setIsInviteOpen(false)
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to invite member",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setIsLoading(true)
    try {
      const result = await updateMemberRole(memberId, newRole)
      if (result.success) {
        toast({
          title: "Role updated",
          description: "Member role has been updated successfully.",
        })
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update role",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    setIsLoading(true)
    try {
      const result = await removeMember(memberId)
      if (result.success) {
        toast({
          title: "Member removed",
          description: "Team member has been removed successfully.",
        })
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove member",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!organization) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">No Organization</h2>
            <p className="text-muted-foreground max-w-md">
              {organizations.length > 0
                ? `You have ${organizations.length} organization${organizations.length === 1 ? "" : "s"} but none are currently active.`
                : "You're not part of any organization yet. Create one to start collaborating with your team."}
            </p>
          </div>
          <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Building2 className="w-4 h-4" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
              <form action={handleCreateOrganization}>
                <DialogHeader>
                  <DialogTitle>Create Organization</DialogTitle>
                  <DialogDescription>Set up your organization to start collaborating with your team.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {userProfile?.company && (
                    <div className="flex items-start space-x-3 p-3 bg-accent/50 rounded-md">
                      <input
                        type="checkbox"
                        id="use-profile-company"
                        checked={useProfileCompany}
                        onChange={(e) => setUseProfileCompany(e.target.checked)}
                        className="rounded border-gray-300 mt-1 flex-shrink-0"
                      />
                      <Label
                        htmlFor="use-profile-company"
                        className="text-sm font-normal cursor-pointer leading-relaxed"
                      >
                        Use my company name from profile:{" "}
                        <strong className="block sm:inline mt-1 sm:mt-0">{userProfile.company}</strong>
                      </Label>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Acme Inc."
                      required={!useProfileCompany}
                      disabled={useProfileCompany}
                      defaultValue={useProfileCompany ? userProfile?.company || "" : ""}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input id="slug" name="slug" placeholder="acme-inc" required className="w-full" />
                    <p className="text-xs text-muted-foreground">This will be used in your organization's URL</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="What does your organization do?"
                      className="w-full min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input id="industry" name="industry" placeholder="Technology" className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_size">Company Size</Label>
                      <Select name="company_size">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501+">501+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      name="website_url"
                      type="url"
                      placeholder="https://example.com"
                      className="w-full"
                    />
                  </div>
                </div>
                <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-2">
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? "Creating..." : "Create Organization"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your organization and team members</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={isEditOrgOpen} onOpenChange={setIsEditOrgOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <form action={handleUpdateOrganization}>
                  <DialogHeader>
                    <DialogTitle>Organization Settings</DialogTitle>
                    <DialogDescription>Update your organization details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Organization Name</Label>
                      <Input id="edit-name" name="name" defaultValue={organization.name} required className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        name="description"
                        defaultValue={organization.description || ""}
                        className="w-full min-h-[80px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-industry">Industry</Label>
                        <Input
                          id="edit-industry"
                          name="industry"
                          defaultValue={organization.industry || ""}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-company_size">Company Size</Label>
                        <Select name="company_size" defaultValue={organization.company_size || ""}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501+">501+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-website_url">Website URL</Label>
                      <Input
                        id="edit-website_url"
                        name="website_url"
                        type="url"
                        defaultValue={organization.website_url || ""}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-2">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? "Updating..." : "Update Organization"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form action={handleInviteMember}>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>Send an invitation to join your organization</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" placeholder="colleague@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" defaultValue="member">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send Invitation"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                {organization.name}
              </CardTitle>
              <CardDescription>{organization.description || "No description provided"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {organization.industry && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Industry:</span>
                <span className="font-medium">{organization.industry}</span>
              </div>
            )}
            {organization.company_size && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{organization.company_size}</span>
              </div>
            )}
            {organization.website_url && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a
                  href={organization.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({members.length})
          </CardTitle>
          <CardDescription>Manage your organization's team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {member.profiles?.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{member.profiles?.full_name || member.profiles?.email}</p>
                      {getRoleBadge(member.role)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {member.profiles?.email}
                    </div>
                    {member.joined_at && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                {isAdmin && member.user_id !== user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "member")}>
                        Change to Member
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "admin")}>
                        Change to Admin
                      </DropdownMenuItem>
                      {isOwner && (
                        <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "owner")}>
                          Change to Owner
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
