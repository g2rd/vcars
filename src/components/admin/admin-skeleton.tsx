/** Szkielet ładowania panelu (pokazywany, dopóki serwer czyta sesję i dane). */
export function AdminSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-8 md:px-8" aria-hidden="true">
      <div className="h-8 w-48 rounded-ui bg-paper" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="h-28 rounded-ui bg-paper" />
        <div className="h-28 rounded-ui bg-paper" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-20 rounded-ui bg-paper" />
        <div className="h-20 rounded-ui bg-paper" />
        <div className="h-20 rounded-ui bg-paper" />
      </div>
    </div>
  );
}
