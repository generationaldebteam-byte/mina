export default function PrintLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-9 w-24 bg-muted rounded-lg" />
      </div>
      <div className="border-2 rounded-xl p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-1/4 bg-muted rounded" />
            <div className="h-5 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
