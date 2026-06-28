import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import StaffActions from "@/components/staff-actions";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await requireAdmin();

  const { users: staff } = await auth.api.listUsers({
    query: {
      filterField: "role",
      filterValue: "gate_staff",
      filterOperator: "eq",
      sortBy: "createdAt",
      sortDirection: "asc",
      limit: 100,
    },
    headers: await headers(),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gate Staff</h1>
          <p className="text-muted-foreground">
            Manage staff accounts for gate check-in
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/staff/new">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {staff.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No staff account yet</p>
              <p className="text-sm mt-1">
                Add gate staff so they can check in guests
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Gate Staff</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(member.createdAt), "dd MM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <StaffActions
                        staffId={member.id}
                        staffName={member.name}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
