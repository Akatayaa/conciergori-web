interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function TenantLayout({ children }: TenantLayoutProps) {
  return <>{children}</>
}
