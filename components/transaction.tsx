"use client"

import { useContext } from "react"
// @ts-ignore
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { AppContext } from "@/app/index"

const TransactionsPage = () => {
  const { cctxs } = useContext(AppContext)

  const inProgress = (status: string): boolean => {
    return !(status === "mined-success" || status === "mined-fail")
  }

  const success = (status: string): boolean => {
    return status === "mined-success"
  }

  const fail = (status: string): boolean => {
    return status === "mined-fail"
  }

  return (
    <div>
      {cctxs.length > 0 ? (
        <Card>
          <Table className="break-all">
            <TableBody>
              {cctxs.map((c: any, index: any) => (
                <TableRow key={c.inboundHash}>
                  <TableCell className="w-[75px] align-top">
                    <div className="flex justify-center p-2">
                      {inProgress(c.status) && (
                        <Loader2 className="animate-spin" />
                      )}
                      {success(c.status) && (
                        <CheckCircle2 className="text-green-500" />
                      )}
                      {fail(c.status) && (
                        <AlertTriangle className="text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="pl-0">
                    <div>{c.desc}</div>
                    <small className="text-muted-foreground">
                      {c.progress}
                    </small>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Alert>
          <AlertTitle>No recent transactions</AlertTitle>
          <AlertDescription>
            There are no recent cross-chain transactions to show.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default TransactionsPage