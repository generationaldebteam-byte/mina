export default function ClientDetailLoading() {
  return (
    <div className="space-y-4 md:space-y-6 animate-pulse">
      <div className="sticky top-0 z-40 bg-background/95 border-b-2 pb-3 pt-2 -mx-4 px-4 md:-mx-6 md:px-6 -mt-1 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-muted shrink-0" />
            <div className="min-w-0 space-y-2">
              <div className="h-5 md:h-7 w-44 bg-muted rounded-lg" />
              <div className="h-3 md:h-4 w-28 bg-muted rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-muted rounded-lg" />
            <div className="h-8 w-8 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-muted rounded-lg shrink-0" />
        ))}
      </div>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="rounded-xl border-2 p-4 space-y-3">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-4 w-28 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border-2 p-4 space-y-3">
            <div className="h-5 w-24 bg-muted rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-4 w-4 rounded-full bg-muted mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 md:space-y-6">
          <div className="rounded-xl border-2 p-4 space-y-3">
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-8 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
