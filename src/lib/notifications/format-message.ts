export function formatDigestMessage(data: {
	title: string;
	content: string;
	post_link: string;
	post_votes: number;
}): string {
	return `🚀 *Daily Tech Digest*

📌 *${data.title}*
${data.content}

👍 ${data.post_votes} votes

🔗 ${data.post_link}

---
Powered by Distilled`;
}
