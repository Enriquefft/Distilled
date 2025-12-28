"use client";

import { useEffect, useId, useRef } from "react";

export function GrainOverlay() {
	const rectRef = useRef<SVGRectElement>(null);
	const filterId = useId();

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!rectRef.current) return;
			const x = e.clientX / window.innerWidth;
			const y = e.clientY / window.innerHeight;
			rectRef.current.setAttribute("x", String(x * 10));
			rectRef.current.setAttribute("y", String(y * 10));
		};

		document.addEventListener("mousemove", handleMouseMove);
		return () => document.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<svg
			className="fixed inset-0 w-full h-full pointer-events-none z-[9999] opacity-[var(--grain-opacity)] contrast-[150%]"
			aria-hidden="true"
		>
			<title>Decorative grain texture overlay</title>
			<filter id={filterId}>
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.65"
					numOctaves={3}
					stitchTiles="stitch"
				/>
				<feColorMatrix type="saturate" values="0" />
			</filter>
			<rect
				ref={rectRef}
				width="100%"
				height="100%"
				filter={`url(#${filterId})`}
			/>
		</svg>
	);
}
