import React from "react";

export type EmptyStateIconType =
	| "projects"
	| "timesheets"
	| "activity"
	| "users"
	| "search"
	| "error"
	| "generic";

export interface EmptyStateProps {
	icon?: React.ReactNode | EmptyStateIconType;
	title: string;
	subtitle?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	compact?: boolean;
	padding?: string | number;
}

const renderIcon = (icon?: React.ReactNode | EmptyStateIconType, compact = false) => {
	if (React.isValidElement(icon)) return icon;

	const size = compact ? 18 : 20;

	switch (icon) {
		case "projects":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
				</svg>
			);
		case "timesheets":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<polyline points="12 6 12 12 16 14" />
				</svg>
			);
		case "activity":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<polyline points="14 2 14 8 20 8" />
					<line x1="16" y1="13" x2="8" y2="13" />
					<line x1="16" y1="17" x2="8" y2="17" />
				</svg>
			);
		case "users":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
					<circle cx="9" cy="7" r="4" />
					<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
					<path d="M16 3.13a4 4 0 0 1 0 7.75" />
				</svg>
			);
		case "search":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
			);
		case "error":
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
					<line x1="12" y1="9" x2="12" y2="13" />
					<line x1="12" y1="17" x2="12.01" y2="17" />
				</svg>
			);
		default:
			return (
				<svg
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
			);
	}
};

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon = "generic",
	title,
	subtitle,
	action,
	compact = false,
	padding,
}) => {
	const isError = icon === "error";
	return (
		<div
			role={isError ? "alert" : undefined}
			className={`empty-state${compact ? " empty-state--compact" : ""}`}
			style={padding !== undefined ? { padding } : undefined}
		>
			<div
				className={`empty-state__icon${compact ? " empty-state__icon--compact" : ""}${isError ? " empty-state__icon--error" : ""}`}
			>
				{renderIcon(icon, compact)}
			</div>
			<div>
				<div className={`empty-state__title${compact ? " empty-state__title--compact" : ""}`}>
					{title}
				</div>
				{subtitle && (
					<div className={`empty-state__subtitle${compact ? " empty-state__subtitle--compact" : ""}`}>
						{subtitle}
					</div>
				)}
				{action && (
					<button
						type="button"
						className="btn btn--secondary btn--sm empty-state__action"
						onClick={action.onClick}
					>
						{action.label}
					</button>
				)}
			</div>
		</div>
	);
};

export const ErrorState: React.FC<{
	title?: string;
	subtitle?: string;
	onRetry?: () => void;
	isRetrying?: boolean;
	compact?: boolean;
}> = ({
	title = "Something went wrong",
	subtitle = "We couldn't load this data. Please check your connection and try again.",
	onRetry,
	isRetrying = false,
	compact = false,
}) => (
	<EmptyState
		icon="error"
		title={title}
		subtitle={subtitle}
		compact={compact}
		action={
			onRetry
				? {
						label: isRetrying ? "Retrying…" : "Try again",
						onClick: onRetry,
					}
				: undefined
		}
	/>
);
