import { Archivo_Black, Inter, Space_Mono } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
export const archivoBlack = Archivo_Black({
	subsets: ["latin"],
	variable: "--font-archivo",
	weight: "400",
});
export const spaceMono = Space_Mono({
	subsets: ["latin"],
	variable: "--font-space",
	weight: ["400", "700"],
});
