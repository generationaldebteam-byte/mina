import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CalendarLoading() {
  return (
    <div className="space-y-4 md:space-y-6 animate-pulse">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-muted" />
        <div>
          <div className="h-6 md:h-7 w-24 bg-muted rounded-lg" />
          <div className="h-3 w-32 bg-muted rounded mt-1" />
        </div>
      </div>
      <div className="rounded-xl border-2 p-4">
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg" />
          ))}
        </div>
      </div>
      <Card className="border-2">
        <CardHeader className="border-b-2"><div className="h-5 w-28 bg-muted rounded" /></CardHeader>
        <CardContent className="pt-6 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border-2 p-3">
              <div className="h-2.5 w-2.5 rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/3 bg-muted rounded" />
              </div>
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
