import { Archivo_Black, Inter, Space_Mono } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
export const archivoBlack = Archivo_Black({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-archivo",
});
export const spaceMono = Space_Mono({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-space",
});
