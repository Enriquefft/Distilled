"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { PhoneInput } from "@/components/ui/phone-input";
import { updatePhoneNumber } from "@/app/actions/update-phone";

function GoogleLogo() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
			<path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.03,19.27 6.59,17.38 6.59,13.28C6.59,9.18 9.03,7.29 12.19,7.29C14.16,7.29 15.6,8.25 15.6,8.25L17.4,6.24C17.4,6.24 15.22,4.5 12.13,4.5C7.2,4.5 3.74,8.25 3.74,13.28C3.74,18.31 7.2,22.06 12.13,22.06C18.42,22.06 21.6,17.5 21.6,12.23C21.6,11.4 21.35,11.1 21.35,11.1V11.1Z" />
		</svg>
	);
}

export function SubscriptionBox() {
	const [step, setStep] = useState(1);
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [completed, setCompleted] = useState(false);

	const handleGoogleAuth = async () => {
		try {
			await signIn.social({
				provider: "google",
			});
			setStep(2);
		} catch (error) {
			console.error("Authentication failed:", error);
		}
	};

	const handleSubmit = async () => {
		if (phone.length < 6) {
			alert("Ingresa un número válido");
			return;
		}

		setLoading(true);
		try {
			await updatePhoneNumber(phone);
			setCompleted(true);
		} catch (error) {
			alert(error instanceof Error ? error.message : "Error al guardar");
		} finally {
			setLoading(false);
		}
	};

	if (completed) {
		return (
			<div className="bg-[var(--paper)] border-4 border-[var(--ink)] p-10 shadow-[12px_12px_0px_var(--ink)] relative overflow-hidden">
				<div className="text-center py-10">
					<h2 className="font-[family-name:var(--font-archivo)] text-5xl mb-5 uppercase">
						LISTO.
					</h2>
					<p className="font-[family-name:var(--font-space)]">
						Mañana a las 08:00 recibirás tu primer dosis de información.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-[var(--paper)] border-4 border-[var(--ink)] p-10 shadow-[12px_12px_0px_var(--ink)] relative overflow-hidden">
			<div className="absolute top-5 right-5 border-4 border-double border-[var(--pulp-accent)] text-[var(--pulp-accent)] px-2.5 py-1.5 font-black rotate-[15deg] text-xs uppercase mix-blend-multiply">
				SOLO INVITADOS
			</div>

			<div
				className="flex flex-col gap-5 transition-opacity duration-500"
				style={{
					opacity: step === 1 ? 1 : 0.3,
					pointerEvents: step === 1 ? "auto" : "none",
				}}
			>
				<p className="font-bold font-[family-name:var(--font-space)] uppercase text-sm">
					PASO 1: VERIFICA TU IDENTIDAD
				</p>
				<button
					type="button"
					onClick={handleGoogleAuth}
					className="bg-[var(--paper)] border-2 border-[var(--ink)] px-6 py-4 font-[family-name:var(--font-space)] font-bold uppercase flex items-center justify-center gap-4 transition-all hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--pulp-accent)]"
				>
					{step === 1 ? (
						<>
							<GoogleLogo />
							Continuar con Google
						</>
					) : (
						"✓ AUTENTICADO"
					)}
				</button>
			</div>

			<div
				className="mt-8 transition-opacity duration-500"
				style={{
					opacity: step === 2 ? 1 : 0.3,
					pointerEvents: step === 2 ? "auto" : "none",
				}}
			>
				<p className="font-bold font-[family-name:var(--font-space)] uppercase text-sm mb-4">
					PASO 2: COORDENADAS MÓVILES
				</p>
				<div className="flex items-baseline gap-2.5">
					<span className="text-2xl font-[family-name:var(--font-space)]">+</span>
					<PhoneInput
						value={phone}
						onChange={setPhone}
						className="w-full bg-transparent border-none border-b-4 border-[var(--ink)] px-0 py-2.5 font-[family-name:var(--font-space)] text-3xl text-[var(--ink)] outline-none"
						placeholder="34 000 000 000"
					/>
				</div>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={loading}
					className="mt-5 bg-[var(--pulp-accent)] text-white border-none px-5 py-5 w-full font-[family-name:var(--font-archivo)] text-2xl uppercase hover:brightness-110 hover:scale-[1.01] transition-all disabled:opacity-50"
				>
					{loading ? "PROCESANDO..." : "RECIBIR DESTILADO"}
				</button>
			</div>
		</div>
	);
}
