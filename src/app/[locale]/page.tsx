"use client";

import { GrainOverlay } from "@/components/pulp/grain-overlay";
import { SubscriptionBox } from "@/components/pulp/subscription-box";

export default function HomePage() {
	return (
		<>
			<GrainOverlay />

			<div
				className="max-w-[800px] mx-auto px-5 py-10 relative animate-[flicker_0.5s_infinite_alternate]"
				style={{
					animationTimingFunction: "ease-in-out",
				}}
			>
				<header className="border-b-8 border-[var(--ink)] pb-5 mb-10 flex flex-col items-start">
					<div className="font-[family-name:var(--font-archivo)] text-[clamp(4rem,15vw,10rem)] leading-[0.8] tracking-[-0.05em] uppercase mb-2.5 mix-blend-multiply">
						Distilled
					</div>
					<div className="text-xl font-bold bg-[var(--ink)] text-[var(--paper)] px-2.5 py-1 uppercase font-[family-name:var(--font-space)]">
						La red, comprimida para humanos.
					</div>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-[60px]">
					<div className="col">
						<h3 className="font-[family-name:var(--font-archivo)] border-b-[3px] border-[var(--ink)] mb-4 pb-1 uppercase">
							01. Los Orígenes
						</h3>
						<div className="mb-5 p-2.5 border border-dashed border-[var(--ink)] transition-all hover:bg-[var(--ink)] hover:text-[var(--paper)]">
							<strong className="font-[family-name:var(--font-space)]">
								HackerNews
							</strong>
							<p className="font-[family-name:var(--font-space)] text-sm">
								Las discusiones que definen la industria, sin el ruido.
							</p>
						</div>
						<div className="mb-5 p-2.5 border border-dashed border-[var(--ink)] transition-all hover:bg-[var(--ink)] hover:text-[var(--paper)]">
							<strong className="font-[family-name:var(--font-space)]">
								Github
							</strong>
							<p className="font-[family-name:var(--font-space)] text-sm">
								Top 10 repositorios que están construyendo el mañana.
							</p>
						</div>
						<div className="mb-5 p-2.5 border border-dashed border-[var(--ink)] transition-all hover:bg-[var(--ink)] hover:text-[var(--paper)]">
							<strong className="font-[family-name:var(--font-space)]">
								ProductHunt
							</strong>
							<p className="font-[family-name:var(--font-space)] text-sm">
								Los lanzamientos más votados del día.
							</p>
						</div>
					</div>
					<div className="col flex flex-col justify-end">
						<p className="text-sm mb-5 text-justify font-[family-name:var(--font-space)]">
							No es una newsletter para tu correo. Es un golpe de realidad vía
							SMS. Lo más relevante, comprimido por algoritmos y curado por
							impacto. Directo a tu terminal de bolsillo.
						</p>
						<div className="border-2 border-[var(--ink)] p-2.5 text-center text-xs font-[family-name:var(--font-space)] font-bold">
							EDICIÓN DIARIA: 08:00 AM EST
						</div>
					</div>
				</div>

				<SubscriptionBox />

				<div className="overflow-hidden whitespace-nowrap bg-[var(--ink)] text-[var(--paper)] py-2.5 my-10 font-bold uppercase font-[family-name:var(--font-space)] text-sm">
					<div className="inline-block animate-[marquee_20s_linear_infinite]">
						GITHUB TRENDS / HACKERNEWS TOP / PRODUCTHUNT DAILY / GITHUB TRENDS /
						HACKERNEWS TOP / PRODUCTHUNT DAILY / GITHUB TRENDS / HACKERNEWS TOP
						/ PRODUCTHUNT DAILY /
					</div>
				</div>

				<footer className="mt-[100px] text-[0.7rem] flex justify-between opacity-60 font-[family-name:var(--font-space)] flex-wrap gap-4">
					<div>DISTILLED © 2024</div>
					<div>SISTEMA DE COMPRESIÓN PULP V.1.0</div>
					<div>SIN SPAM. SOLO DATOS.</div>
				</footer>
			</div>

			<style jsx global>{`
				@keyframes flicker {
					0% {
						opacity: 0.97;
					}
					5% {
						opacity: 0.95;
					}
					10% {
						opacity: 0.9;
					}
					15% {
						opacity: 0.98;
					}
					100% {
						opacity: 1;
					}
				}

				@keyframes marquee {
					0% {
						transform: translateX(0);
					}
					100% {
						transform: translateX(-50%);
					}
				}
			`}</style>
		</>
	);
}
