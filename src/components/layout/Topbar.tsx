import React, { useState, useRef, useEffect } from "react";
import { useNotifications, useMarkRead } from "../../hooks/useNotifications";
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
			const isInputActive =
				activeEl && ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName);

			if (
				((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") ||
				(!isInputActive && e.key === "/")
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
					aria-label="Toggle Navigation Menu"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						style={{ width: 20, height: 20 }}
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
				<div ref={notifRef} style={{ position: "relative" }}>
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
							style={{
								position: "absolute",
								top: "calc(100% + 10px)",
								right: 0,
								width: 320,
								background: "#fff",
								border: "1px solid #e5e7eb",
								borderRadius: 12,
								boxShadow: "0 10px 24px rgba(0,0,0,.08)",
								zIndex: 200,
							}}
						>
							<div
								style={{
									padding: "0.875rem 1rem",
									borderBottom: "1px solid #f0f0f0",
									fontWeight: 600,
									fontSize: '0.8125rem',
								}}
							>
								Notifications
							</div>
							{notificationsList.length === 0 ? (
								<div
									style={{
										padding: "1rem",
										fontSize: '0.75rem',
										color: "#6b7280",
										textAlign: "center",
									}}
								>
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
											className="topbar__notification-item"
											onClick={() => !n.read && markReadMutation.mutate(n.id)}
											disabled={n.read}
											aria-label={`${n.message}${n.read ? ', read' : ', mark as read'}`}
											style={{
												padding: "0.625rem 1rem",
												borderBottom: "1px solid #f9fafb",
												fontSize: '0.75rem',
												color: n.read ? "#6b7280" : "#111827",
												background: n.read ? "#fff" : "#f9fafb",
												display: "flex",
												gap: '0.5rem',
												alignItems: "flex-start",
												cursor: n.read ? "default" : "pointer",
											}}
										>
											{!n.read && (
												<span
													style={{
														width: 6,
														height: 6,
														borderRadius: "50%",
														background: "#3b82f6",
														marginTop: '0.25rem',
														flexShrink: 0,
													}}
												/>
											)}
											<div style={{ flex: 1 }}>
												<div>{n.message}</div>
												<div
													style={{
														color: "#6b7280",
														fontSize: '0.6875rem',
														marginTop: '0.125rem',
													}}
												>
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
						style={{ width: 16, height: 16 }}
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
