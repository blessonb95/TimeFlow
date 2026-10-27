import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
const activeDialogs: HTMLElement[] = [];

export function useDialogAccessibility(
	dialogRef: RefObject<HTMLElement | null>,
	onClose: () => void,
	isOpen = true,
	focusFirstElement = true,
) {
	const onCloseRef = useRef(onClose);

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!isOpen) return;
		const dialog = dialogRef.current;
		if (!dialog) return;

		const previousFocus = document.activeElement instanceof HTMLElement
			? document.activeElement
			: null;
		activeDialogs.push(dialog);
		const focusable = () => Array.from(
			dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
		).filter((element) => element.getAttribute("aria-hidden") !== "true");
		// Preserve an element that already received autofocus inside the dialog.
		// Moving focus immediately would blur it and can trigger untouched-field validation.
		if (!dialog.contains(document.activeElement)) {
			((focusFirstElement ? focusable()[0] : null) ?? dialog).focus();
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (activeDialogs[activeDialogs.length - 1] !== dialog) return;
			if (event.key === "Escape") {
				event.preventDefault();
				onCloseRef.current();
				return;
			}
			if (event.key !== "Tab") return;

			const elements = focusable();
			if (elements.length === 0) {
				event.preventDefault();
				dialog.focus();
				return;
			}
			const first = elements[0];
			const last = elements[elements.length - 1];
			if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog || !dialog.contains(document.activeElement))) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog || !dialog.contains(document.activeElement))) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			const dialogIndex = activeDialogs.lastIndexOf(dialog);
			if (dialogIndex !== -1) activeDialogs.splice(dialogIndex, 1);
			previousFocus?.focus();
		};
	}, [dialogRef, isOpen]);
}
