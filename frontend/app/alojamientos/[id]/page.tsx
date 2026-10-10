import DetalleAlojamiento from "@/components/DetalleAlojamiento";

export default async function AlojamientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetalleAlojamiento id={Number(id)} />;
}
