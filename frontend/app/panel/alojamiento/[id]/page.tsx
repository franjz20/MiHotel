import PanelAlojamiento from "@/components/PanelAlojamiento";

export default async function PanelAlojamientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PanelAlojamiento id={Number(id)} />;
}
