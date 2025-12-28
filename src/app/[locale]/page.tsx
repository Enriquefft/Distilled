"use client";
import { useId, useState } from "react";
import { updatePhoneNumber } from "@/app/actions/update-phone";
import { SignIn } from "@/components/sign-in";
import { PhoneInput } from "@/components/ui/phone-input";

export default function SettingsPage() {
	const phoneInputId = useId();
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		try {
			await updatePhoneNumber(phone);
			setMessage("Phone number saved successfully!");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Failed to save");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Settings</h1>

			<SignIn />

			<form onSubmit={handleSubmit}>
				<label
					htmlFor={phoneInputId}
					className="block mb-2 text-sm font-medium"
				>
					WhatsApp Phone Number
				</label>
				<PhoneInput id={phoneInputId} value={phone} onChange={setPhone} />
				<button
					type="submit"
					disabled={loading}
					className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? "Saving..." : "Save"}
				</button>
				{message && (
					<p
						className={`mt-2 text-sm ${
							message.includes("success") ? "text-green-600" : "text-red-600"
						}`}
					>
						{message}
					</p>
				)}
			</form>
		</div>
	);
}
