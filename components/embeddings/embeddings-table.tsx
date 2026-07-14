"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { deleteEmbedding, updateEmbedding } from "@/app/actions/embedding-actions"
import { formatDistanceToNow } from "date-fns"
import {
  MoreHorizontal,
  Trash,
  Edit,
  Eye,
  FileText,
  Database,
  Code,
  BarChart,
  Download,
  Copy,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import type { DataEmbedding } from "@/lib/types/database"

interface EmbeddingsTableProps {
  embeddings: DataEmbedding[]
  userId: string
  refreshData: () => void
}

export function EmbeddingsTable({ embeddings, userId, refreshData }: EmbeddingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmbedding, setSelectedEmbedding] = useState<DataEmbedding | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  })
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredEmbeddings = embeddings.filter((embedding) => {
    // Apply search filter
    const matchesSearch =
      embedding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (embedding.description && embedding.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      embedding.source_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      embedding.embedding_model.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply type filter
    const matchesTypeFilter = !activeFilter || embedding.source_type.toLowerCase() === activeFilter.toLowerCase()

    return matchesSearch && matchesTypeFilter
  })

  const sourceTypes = Array.from(new Set(embeddings.map((e) => e.source_type)))

  const handleEdit = (embedding: DataEmbedding) => {
    setSelectedEmbedding(embedding)
    setEditForm({
      name: embedding.name,
      description: embedding.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleView = (embedding: DataEmbedding) => {
    setSelectedEmbedding(embedding)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (embedding: DataEmbedding) => {
    setSelectedEmbedding(embedding)
    setIsDeleteDialogOpen(true)
  }

  const handleUpdateEmbedding = async () => {
    if (!selectedEmbedding) return

    try {
      await updateEmbedding(selectedEmbedding.id, userId, {
        name: editForm.name,
        description: editForm.description,
      })

      toast.success("Your embedding has been updated successfully.")

      setIsEditDialogOpen(false)
      refreshData()
    } catch (error) {
      console.error("Error updating embedding:", error)
      toast.error("Failed to update embedding. Please try again.")
    }
  }

  const handleDeleteEmbedding = async () => {
    if (!selectedEmbedding) return

    try {
      await deleteEmbedding(selectedEmbedding.id, userId)

      toast.success("Your embedding has been deleted successfully.")

      setIsDeleteDialogOpen(false)
      refreshData()
    } catch (error) {
      console.error("Error deleting embedding:", error)
      toast.error("Failed to delete embedding. Please try again.")
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case "document":
        return <FileText className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">My Embeddings</h2>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search embeddings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveFilter(null)} className={!activeFilter ? "bg-muted" : ""}>
                All Types
              </DropdownMenuItem>
              {sourceTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={activeFilter === type ? "bg-muted" : ""}
                >
                  <div className="flex items-center gap-2">
                    {getSourceTypeIcon(type)}
                    <span className="capitalize">{type}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredEmbeddings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm || activeFilter
                ? "No embeddings match your search criteria"
                : "You don't have any embeddings yet"}
            </p>
            {(searchTerm || activeFilter) && (
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setActiveFilter(null)
                }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmbeddings.map((embedding) => (
                  <TableRow key={embedding.id}>
                    <TableCell className="font-medium">{embedding.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSourceTypeIcon(embedding.source_type)}
                        <span className="capitalize">{embedding.source_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{embedding.embedding_model}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(embedding.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(embedding)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(embedding)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(embedding)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Embedding</DialogTitle>
            <DialogDescription>Update the details of your embedding.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmbedding}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Embedding Details</DialogTitle>
          </DialogHeader>
          {selectedEmbedding && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg">{selectedEmbedding.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Source Type</p>
                    <div className="flex items-center gap-2">
                      {getSourceTypeIcon(selectedEmbedding.source_type)}
                      <p className="text-lg capitalize">{selectedEmbedding.source_type}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p>{selectedEmbedding.description || "No description provided"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Model</p>
                    <Badge variant="outline">{selectedEmbedding.embedding_model}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vector Dimensions</p>
                    <p>{selectedEmbedding.vector_data?.length || 1536}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p>{formatDate(selectedEmbedding.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Updated</p>
                    <p>{formatDate(selectedEmbedding.updated_at)}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Copy className="h-4 w-4" />
                    <span>Copy ID</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="py-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[300px]">
                    {JSON.stringify(selectedEmbedding.metadata, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="py-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">Usage analytics will be available soon</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Embedding</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this embedding? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEmbedding && (
            <div className="py-4">
              <p>
                <strong>Name:</strong> {selectedEmbedding.name}
              </p>
              <p>
                <strong>Type:</strong> {selectedEmbedding.source_type}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmbedding}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
