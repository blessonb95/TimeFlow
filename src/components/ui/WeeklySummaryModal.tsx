import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { aiApi, type WeeklySummaryEntryPayload } from "../../api/ai";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
import { LoadingSpinner } from "./LoadingSpinner";

interface WeeklySummaryModalProps {
	weekStart: string;
	weekEnd: string;
	weekLabel: string;
	entries: WeeklySummaryEntryPayload[];
	isOnline: boolean;
	onClose: () => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
	weekStart,
	weekEnd,
	weekLabel,
	entries,
	isOnline,
	onClose,
}) => {
	const dialogRef = useRef<HTMLDivElement>(null);
	useDialogAccessibility(dialogRef, onClose);

	const [draftText, setDraftText] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);
	const [hasGenerated, setHasGenerated] = useState(false);

	const unsyncedCount = entries.filter((e) => e.isOfflineQueued).length;
	const hasUnsyncedEntries = unsyncedCount > 0;
	const totalHours = entries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);

	const handleGenerateSummary = async () => {
		if (!isOnline) {
			setError(
				"Weekly summary drafting is unavailable while offline. Reconnect to generate an AI summary draft.",
			);
			return;
		}
		if (entries.length === 0) {
			setError("No work logs found for this week to summarize.");
			return;
		}
		setError("");
		setIsGenerating(true);
		setCopied(false);

		try {
			const res = await aiApi.draftWeeklySummary({
				weekStart,
				weekEnd,
				weekLabel,
				hasUnsyncedEntries,
				entries,
			});
			setDraftText(res.summary);
			setHasGenerated(true);
		} catch (err: any) {
			const msg =
				err?.response?.data?.error ||
				err?.response?.data?.message ||
				"Unable to generate weekly summary draft right now. Please try again.";
			setError(msg);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCopy = async () => {
		if (!draftText.trim()) return;
		try {
			await navigator.clipboard.writeText(draftText);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		} catch {
			// Fallback copy
			const textarea = document.createElement("textarea");
			textarea.value = draftText;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		}
	};

	const handleDownloadTxt = () => {
		if (!draftText.trim()) return;
		const blob = new Blob([draftText], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `timeflow-weekly-summary-${weekStart}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return createPortal(
		<div className="modal-overlay" onClick={onClose}>
			<div
				ref={dialogRef}
				className="modal weekly-summary-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="weekly-summary-modal-title"
				tabIndex={-1}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal__header">
					<div>
						<h2 id="weekly-summary-modal-title" className="modal__title">
							Draft Weekly Summary
						</h2>
						<p className="weekly-summary-modal__subtitle">
							{weekLabel} · {entries.length} {entries.length === 1 ? "entry" : "entries"} ({totalHours.toFixed(1)}h)
						</p>
					</div>
					<button
						type="button"
						className="modal__close"
						onClick={onClose}
						aria-label="Close weekly summary dialog"
					>
						✕
					</button>
				</div>

				<div className="modal__body weekly-summary-modal__body">
					<div className="weekly-summary-modal__privacy">
						<svg
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							width="16"
							height="16"
							aria-hidden="true"
						>
							<path d="M8 1.75L2.75 4v3.8c0 3.35 2.24 6.38 5.25 7.2 3.01-.82 5.25-3.85 5.25-7.2V4L8 1.75z" />
							<path d="M6 8l1.4 1.4L10.25 6.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						<div>
							<strong>Data-sharing &amp; review notice:</strong> Generating a summary sends only your task titles, descriptions, project names, dates, and hours for <strong>{weekLabel}</strong> to the secure TimeFlow AI backend. This creates an editable draft for your review — it never submits your timesheet or changes approval status.
						</div>
					</div>

					{hasUnsyncedEntries && (
						<div className="weekly-summary-modal__warning" role="alert">
							<svg
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.6"
								width="16"
								height="16"
								aria-hidden="true"
							>
								<path d="M8 2L1.5 13.5h13L8 2z" strokeLinejoin="round" />
								<path d="M8 6.5v3.2M8 11.6h.01" strokeLinecap="round" />
							</svg>
							<div>
								<strong>Partial / Unsynced Offline Data:</strong> {unsyncedCount} offline{" "}
								{unsyncedCount === 1 ? "entry has" : "entries have"} not synced with the server yet. Any summary generated right now will include a partial-data notice until all queued entries finish syncing.
							</div>
						</div>
					)}

					{!isOnline && (
						<div className="weekly-summary-modal__offline" role="status">
							You are currently offline. Connect to the internet to generate a new AI weekly summary draft.
						</div>
					)}

					{error && (
						<div className="weekly-summary-modal__error" role="alert">
							<span>{error}</span>
						</div>
					)}

					{entries.length === 0 ? (
						<div className="weekly-summary-modal__empty">
							<p>
								No work logs are recorded for <strong>{weekLabel}</strong> yet. Log tasks for this week first to generate a weekly summary draft.
							</p>
						</div>
					) : !hasGenerated ? (
						<div className="weekly-summary-modal__prompt-card">
							<p>
								Ready to summarize <strong>{entries.length}</strong> logged{" "}
								{entries.length === 1 ? "task" : "tasks"} ({totalHours.toFixed(1)}h total) across your projects for{" "}
								<strong>{weekLabel}</strong>.
							</p>
							<button
								type="button"
								className="btn btn--primary"
								onClick={handleGenerateSummary}
								disabled={isGenerating || !isOnline}
							>
								{isGenerating ? (
									<>
										<LoadingSpinner inline size="sm" />
										Generating Weekly Draft…
									</>
								) : (
									<>
										<svg
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											width="15"
											height="15"
											aria-hidden="true"
										>
											<path
												d="M8 1.5l1.6 3.9L13.5 7l-3.9 1.6L8 12.5 6.4 8.6 2.5 7l3.9-1.6L8 1.5z"
												strokeLinejoin="round"
											/>
										</svg>
										Generate Draft Summary
									</>
								)}
							</button>
						</div>
					) : (
						<div className="weekly-summary-modal__editor">
							<div className="weekly-summary-modal__editor-header">
								<label htmlFor="weekly-summary-textarea" className="form-group__label">
									Editable Summary Draft
								</label>
								<button
									type="button"
									className="btn btn--ghost btn--sm"
									onClick={handleGenerateSummary}
									disabled={isGenerating || !isOnline}
								>
									{isGenerating ? "Regenerating…" : "Regenerate"}
								</button>
							</div>
							<textarea
								id="weekly-summary-textarea"
								className="form-group__input weekly-summary-modal__textarea"
								rows={12}
								value={draftText}
								onChange={(e) => setDraftText(e.target.value)}
								aria-label="Editable weekly summary draft"
							/>
						</div>
					)}
				</div>

				<div className="modal__footer weekly-summary-modal__footer">
					<button type="button" className="btn btn--ghost" onClick={onClose}>
						Close
					</button>
					{hasGenerated && (
						<div className="weekly-summary-modal__footer-actions">
							<button
								type="button"
								className="btn btn--secondary"
								onClick={handleDownloadTxt}
								disabled={!draftText.trim()}
							>
								Download .txt
							</button>
							<button
								type="button"
								className="btn btn--primary"
								onClick={handleCopy}
								disabled={!draftText.trim()}
							>
								{copied ? "✓ Copied to Clipboard" : "Copy Summary"}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>,
		document.body,
	);
};

