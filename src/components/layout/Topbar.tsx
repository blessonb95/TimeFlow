import React, { useState, useRef, useEffect } from "react";
import { useNotifications, useMarkRead, useMarkAllRead } from "../../hooks/useNotifications";
import { useLogout } from "../../hooks/useAuth";
import { useAppStore } from "../../store/useAppStore";
import { Link } from "react-router-dom";
import { SearchModal } from "../ui/SearchModal";
import { SparkleButton } from "../ui/SparkleButton";

export const Topbar: React.FC = () => {
	const logout = useLogout();
	const { isSidebarCollapsed, toggleSidebar } = useAppStore();
	const { data: notificationsList = [] } = useNotifications();
	const markReadMutation = useMarkRead();
	const markAllReadMutation = useMarkAllRead();
	const [showNotif, setShowNotif] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const notifRef = useRef<HTMLDivElement>(null);

	const unreadCount = notificationsList.filter(
		(n: { read?: boolean }) => !n.read,
	).length;

	// Keyboard shortcut listener for Ctrl+K / Cmd+K / Slash
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (showSearch) return;
			const activeEl = document.activeElement;
			const isTextEntryActive = activeEl instanceof HTMLElement && (
				["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName) ||
				activeEl.isContentEditable
			);

			if (
				((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") ||
				(!isTextEntryActive && e.key === "/")
			) {
				e.preventDefault();
				setShowSearch((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [showSearch]);

	// Close notification popup on outside click
	useEffect(() => {
		if (!showNotif) return;
		const handler = (e: MouseEvent) => {
			if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
				setShowNotif(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [showNotif]);

	const isMac =
		typeof window !== "undefined" &&
		/mac/i.test(navigator.userAgent || navigator.platform);
	const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

	return (
		<header className="topbar">
			<div className="topbar__left">
				<Link className="topbar__brand" to="/dashboard" aria-label="TimeFlow home">
					<img src={`${import.meta.env.BASE_URL}logo-with-name.png`} alt="" />
				</Link>
				<button
					type="button"
					className="topbar__mobile-toggle"
					onClick={toggleSidebar}
					title="Toggle Navigation Menu"
					aria-label={isSidebarCollapsed ? "Open navigation menu" : "Close navigation menu"}
					aria-expanded={!isSidebarCollapsed}
					aria-controls="primary-navigation"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						width="20"
						height="20"
					>
						<path d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
				<button
					type="button"
					className="topbar__search"
					onClick={() => setShowSearch(true)}
					aria-label={`Search app (${shortcutLabel})`}
					title={`Search app (${shortcutLabel} or /)`}
				>
					<svg
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<circle cx="6.5" cy="6.5" r="4.5" />
						<path d="M10.5 10.5L14 14" />
					</svg>
					<span>Search...</span>
					<span className="topbar__search-shortcut">{shortcutLabel}</span>
				</button>
			</div>
			<div className="topbar__right">
				<div ref={notifRef} className="topbar__notif-wrap">
					<button
						type="button"
						className="topbar__notif"
						onClick={() => setShowNotif((v) => !v)}
						aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
						aria-expanded={showNotif}
						aria-controls="topbar-notifications"
					>
						<svg
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path d="M8 1.5a5 5 0 015 5v2.5l1 2H2l1-2V6.5a5 5 0 015-5z" />
							<path d="M6.5 13.5a1.5 1.5 0 003 0" />
						</svg>
						{unreadCount > 0 && (
							<span className="topbar__notif-badge">
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						)}
					</button>

					{showNotif && (
						<div
							id="topbar-notifications"
							aria-label="Notifications"
							role="region"
							className="topbar__notif-dropdown"
						>
							<div className="topbar__notif-header">
								<span>Notifications</span>
								{unreadCount > 0 && (
									<button
										type="button"
										className="btn btn--ghost btn--sm"
										onClick={() => markAllReadMutation.mutate()}
										disabled={markAllReadMutation.isPending}
									>
										Mark all read
									</button>
								)}
							</div>
							{notificationsList.length === 0 ? (
								<div className="topbar__notif-empty">
									No notifications
								</div>
							) : (
								notificationsList.map(
									(n: {
										id: string;
										message: string;
										time: string;
										read?: boolean;
									}) => (
										<button
											type="button"
											key={n.id}
											className={`topbar__notification-item${n.read ? " topbar__notification-item--read" : ""}`}
											onClick={() => !n.read && markReadMutation.mutate(n.id)}
											aria-label={`${n.message}${n.read ? ", read" : ", mark as read"}`}
											disabled={n.read}
										>
											{!n.read && <span className="topbar__notif-dot" />}
											<div className="topbar__notif-body">
												<div>{n.message}</div>
												<div className="topbar__notif-time">
													{n.time}
												</div>
											</div>
										</button>
									),
								)
							)}
						</div>
					)}
				</div>

				<button
					type="button"
					className="topbar__notif"
					onClick={logout}
					aria-label="Sign out"
					title="Sign out"
				>
					<svg
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						width="16"
						height="16"
					>
						<path d="M6 14H3a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 013 2h3" />
						<path d="M10.5 11l3.5-3-3.5-3M14 8H6" />
					</svg>
				</button>
			</div>
			{showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
		</header>
	);
};
