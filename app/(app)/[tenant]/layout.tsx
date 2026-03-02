import { notFound } from 'next/navigation'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = await params
  // TODO: Vérifier que le tenant existe en DB + que l'utilisateur y a accès
  if (!tenant) notFound()
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <p className="font-bold text-lg mb-8">{tenant}</p>
        {/* TODO: Nav items */}
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
