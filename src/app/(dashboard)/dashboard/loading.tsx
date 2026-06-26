import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden">
      <div>
        <div className="h-8 w-40 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-60 bg-muted rounded-lg mt-2 animate-pulse" />
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-28 bg-muted rounded mt-2 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="min-w-0">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="h-5 w-28 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-8 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="h-5 w-36 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="min-w-0">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="h-5 w-28 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
