// src/app/(admin)/layout.tsx

// This is now a simple layout, as auth checks will be handled client-side.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
