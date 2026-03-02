interface Props { params: Promise<{ tenant: string }> }
export default async function Page({ params }: Props) {
  const { tenant } = await params
  return <div><h1>settings — {tenant}</h1></div>
}
