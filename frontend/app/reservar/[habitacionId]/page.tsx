import { Suspense } from "react";
import FormReserva from "@/components/FormReserva";

export default async function ReservarPage({
  params,
  searchParams,
}: {
  params: Promise<{ habitacionId: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
}) {
  const { habitacionId } = await params;
  const sp = await searchParams;
  return (
    <Suspense fallback={<p className="p-8 text-gray-500">Cargando...</p>}>
      <FormReserva
        habitacionId={Number(habitacionId)}
        checkInInicial={sp.checkIn ?? ""}
        checkOutInicial={sp.checkOut ?? ""}
      />
    </Suspense>
  );
}
