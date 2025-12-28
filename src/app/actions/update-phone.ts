"use server";
import { eq } from "drizzle-orm";
import { parsePhoneNumber } from "libphonenumber-js";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { user } from "@/db/schema/auth";

export async function updatePhoneNumber(phone: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error("Unauthorized");

	// Validate E.164 format
	const parsed = parsePhoneNumber(phone);
	if (!parsed?.isValid()) throw new Error("Invalid phone number");

	await db
		.update(user)
		.set({
			phone: parsed.format("E.164"),
			whatsappOptIn: true, // Default to opted-in
		})
		.where(eq(user.id, session.user.id));
}
