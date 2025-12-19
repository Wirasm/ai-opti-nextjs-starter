import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/core/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="font-medium">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">User ID</dt>
                <dd className="font-mono text-sm">{user?.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Last Sign In</dt>
                <dd className="text-sm">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communities</CardTitle>
            <CardDescription>Your communities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No communities yet.</p>
            <a
              href="/dashboard/communities"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Browse communities &rarr;
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
