interface DashboardProps {
  params: Promise<{ tenant: string }>
}

export default async function DashboardPage({ params }: DashboardProps) {
  const { tenant } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard — {tenant}</h1>
      {/* TODO: Stats, réservations récentes, revenus */}
    </div>
  )
}
