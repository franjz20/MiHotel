"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { post } from "@/lib/api";

function ConfirmarContenido() {
  const params = useSearchParams();
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setEstado("error");
      setMensaje("El enlace no contiene un token válido.");
      return;
    }
    post("/auth/confirmar-email", { token })
      .then(() => setEstado("ok"))
      .catch((e) => {
        setEstado("error");
        setMensaje(e instanceof Error ? e.message : "Error al confirmar");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card p-10 text-center max-w-md mx-auto">
      {estado === "cargando" && <p className="text-gray-500">Confirmando...</p>}
      {estado === "ok" && (
        <>
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Email confirmado
          </h1>
          <p className="text-gray-600 mb-6">
            Tu cuenta quedó verificada correctamente.
          </p>
        </>
      )}
      {estado === "error" && (
        <>
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            No se pudo confirmar
          </h1>
          <p className="text-gray-600 mb-6">{mensaje}</p>
        </>
      )}
      {estado !== "cargando" && (
        <Link href="/" className="btn-primary inline-block text-sm">
          Volver al inicio
        </Link>
      )}
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Suspense
        fallback={<p className="text-gray-500 text-center">Cargando...</p>}
      >
        <ConfirmarContenido />
      </Suspense>
    </div>
  );
}
