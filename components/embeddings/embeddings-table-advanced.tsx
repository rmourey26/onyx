"use client"

import { useState, useMemo } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ArrowUpDown,
  Package,
  Wrench,
} from "lucide-react"
import type { DataEmbedding } from "@/lib/types/database"
import { DatasetExportDialog } from "./dataset-export-dialog"

interface EmbeddingsTableAdvancedProps {
  embeddings: DataEmbedding[]
  userId: string
  refreshData: () => void
}

export function EmbeddingsTableAdvanced({ embeddings, userId, refreshData }: EmbeddingsTableAdvancedProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedEmbedding, setSelectedEmbedding] = useState<DataEmbedding | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const sourceTypes = useMemo(() => {
    return Array.from(new Set(embeddings.map((e) => e.source_type)))
  }, [embeddings])

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case "document":
        return <FileText className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "shipping":
        return <Package className="h-4 w-4" />
      case "asset":
        return <Wrench className="h-4 w-4" />
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

      toast.success("Embedding updated successfully")
      setIsEditDialogOpen(false)
      refreshData()
    } catch (error) {
      console.error("Error updating embedding:", error)
      toast.error("Failed to update embedding")
    }
  }

  const handleDeleteEmbedding = async () => {
    if (!selectedEmbedding) return

    try {
      await deleteEmbedding(selectedEmbedding.id, userId)
      toast.success("Embedding deleted successfully")
      setIsDeleteDialogOpen(false)
      refreshData()
    } catch (error) {
      console.error("Error deleting embedding:", error)
      toast.error("Failed to delete embedding")
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const columns: ColumnDef<DataEmbedding>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "source_type",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const sourceType = row.getValue("source_type") as string
          return (
            <div className="flex items-center gap-2">
              {getSourceTypeIcon(sourceType)}
              <span className="capitalize">{sourceType}</span>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: "embedding_model",
        header: "Model",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("embedding_model")}</Badge>,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => formatDate(row.getValue("created_at")),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const embedding = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleView(embedding)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(embedding)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(embedding)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data: embeddings,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Embeddings</h2>
          <Badge variant="secondary">{embeddings.length}</Badge>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DatasetExportDialog
            datasetType="embeddings"
            totalRecords={embeddings.length}
            availableFilters={{ sourceTypes }}
          />

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search embeddings..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="pl-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["document", "code", "database", "shipping", "asset"].map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={(table.getColumn("source_type")?.getFilterValue() as string[])?.includes(type)}
                  onCheckedChange={(checked) => {
                    const currentFilter = (table.getColumn("source_type")?.getFilterValue() as string[]) || []
                    if (checked) {
                      table.getColumn("source_type")?.setFilterValue([...currentFilter, type])
                    } else {
                      table.getColumn("source_type")?.setFilterValue(currentFilter.filter((v) => v !== type))
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getSourceTypeIcon(type)}
                    <span className="capitalize">{type}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                Columns
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Database className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No embeddings found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Embedding</DialogTitle>
            <DialogDescription>Update the details of your embedding</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmbedding}>Save Changes</Button>
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
                  <p className="text-muted-foreground text-center">Usage analytics coming soon</p>
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
