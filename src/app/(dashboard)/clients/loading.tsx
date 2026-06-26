export default function ClientsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-muted" />
        <div>
          <div className="h-6 md:h-7 w-20 bg-muted rounded-lg" />
          <div className="h-3 w-36 bg-muted rounded mt-1" />
        </div>
      </div>
      <div className="rounded-xl border-2 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-9 flex-1 bg-muted rounded-lg" />
          <div className="h-9 w-full sm:w-[200px] bg-muted rounded-lg" />
          <div className="h-9 w-9 bg-muted rounded-lg" />
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
