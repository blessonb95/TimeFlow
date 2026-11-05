const ALLOWED_TAGS = new Set([
	"B", "BR", "DIV", "EM", "I", "LI", "OL", "P", "STRONG", "U", "UL",
]);

/** Keep the editor's basic formatting while removing executable markup and attributes. */
export function sanitizeRichText(html: string): string {
	if (!html || typeof DOMParser === "undefined") return "";

	const parsed = new DOMParser().parseFromString(html, "text/html");
	const sanitizeNode = (node: Node): Node | null => {
		if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || "");
		if (!(node instanceof Element)) return null;
		if (!ALLOWED_TAGS.has(node.tagName)) {
			if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "SVG", "MATH", "TEMPLATE"].includes(node.tagName)) return null;
			const fragment = document.createDocumentFragment();
			node.childNodes.forEach((child) => {
				const safeChild = sanitizeNode(child);
				if (safeChild) fragment.appendChild(safeChild);
			});
			return fragment;
		}

		const safeElement = document.createElement(node.tagName.toLowerCase());
		node.childNodes.forEach((child) => {
			const safeChild = sanitizeNode(child);
			if (safeChild) safeElement.appendChild(safeChild);
		});
		return safeElement;
	};

	const output = document.createElement("div");
	parsed.body.childNodes.forEach((child) => {
		const safeChild = sanitizeNode(child);
		if (safeChild) output.appendChild(safeChild);
	});
	return output.innerHTML;
}
