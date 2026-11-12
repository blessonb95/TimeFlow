import React, { useState, useRef, useEffect } from "react";
import { useNotifications, useMarkRead, useMarkAllRead } from "../../hooks/useNotifications";
import { useLogout } from "../../hooks/useAuth";
import { useAppStore } from "../../store/useAppStore";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { Link } from "react-router-dom";
import { SearchModal } from "../ui/SearchModal";

export const Topbar: React.FC = () => {
	const logout = useLogout();
	const { isSidebarCollapsed, toggleSidebar, currentUser } = useAppStore();
	const { data: notificationsList = [] } = useNotifications();
	const markReadMutation = useMarkRead();
	const markAllReadMutation = useMarkAllRead();
	const {
		isOnline,
		simulatedOffline,
		toggleSimulatedOffline,
		waitingCount,
		failedCount,
		totalUnsyncedCount,
		isSyncing,
		syncNow,
	} = useOfflineSync();

	const [showNotif, setShowNotif] = useState(false);
	const [showSyncMenu, setShowSyncMenu] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const notifRef = useRef<HTMLDivElement>(null);
	const syncRef = useRef<HTMLDivElement>(null);

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

	// Close sync popup on outside click
	useEffect(() => {
		if (!showSyncMenu) return;
		const handler = (e: MouseEvent) => {
			if (syncRef.current && !syncRef.current.contains(e.target as Node)) {
				setShowSyncMenu(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [showSyncMenu]);

	const isMac =
		typeof window !== "undefined" &&
		/mac/i.test(navigator.userAgent || navigator.platform);
	const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

	const syncStateVariant = !isOnline
		? "offline"
		: failedCount > 0
		? "error"
		: isSyncing || waitingCount > 0
		? "pending"
		: "online";

	const syncLabel = !isOnline
		? totalUnsyncedCount > 0
			? `Offline · ${totalUnsyncedCount} queued`
			: "Offline"
		: isSyncing
		? "Syncing…"
		: failedCount > 0
		? `${failedCount} sync failed`
		: waitingCount > 0
		? `${waitingCount} waiting to sync`
		: "Online";

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
				{/* Connection & Offline Sync Status Pill */}
				<div ref={syncRef} className="topbar__sync-wrap">
					<button
						type="button"
						className={`topbar__sync-pill topbar__sync-pill--${syncStateVariant}`}
						onClick={() => setShowSyncMenu((v) => !v)}
						aria-label={`Connection and sync status: ${syncLabel}`}
						aria-expanded={showSyncMenu}
						aria-controls="topbar-sync-popover"
						title="Connection & offline sync status"
					>
						<span className="topbar__sync-dot" aria-hidden="true" />
						<span className="topbar__sync-text">{syncLabel}</span>
					</button>

					{showSyncMenu && (
						<div
							id="topbar-sync-popover"
							role="region"
							aria-label="Connection and offline sync details"
							className="topbar__sync-dropdown"
						>
							<div className="topbar__sync-dropdown-header">
								<div>
									<div className="topbar__sync-dropdown-title">
										{isOnline ? "Connected to TimeFlow" : "Working Offline"}
									</div>
									<div className="topbar__sync-dropdown-subtitle">
										{isOnline
											? "Queued work logs sync automatically."
											: "New task logs are saved locally and will sync when back online."}
									</div>
								</div>
							</div>

							<div className="topbar__sync-stats">
								<div className="topbar__sync-stat-row">
									<span>Waiting to sync</span>
									<strong>{waitingCount}</strong>
								</div>
								<div className="topbar__sync-stat-row">
									<span>Needs attention</span>
									<strong className={failedCount > 0 ? "topbar__sync-stat-error" : ""}>
										{failedCount}
									</strong>
								</div>
								<div className="topbar__sync-stat-row">
									<span>Scoped account</span>
									<span className="topbar__sync-user">
										{currentUser?.email || currentUser?.name || "Signed-in user"}
									</span>
								</div>
							</div>

							<div className="topbar__sync-actions">
								{isOnline && totalUnsyncedCount > 0 && (
									<button
										type="button"
										className="btn btn--primary btn--sm"
										onClick={() => syncNow()}
										disabled={isSyncing}
									>
										{isSyncing ? "Syncing…" : "Sync queued logs now"}
									</button>
								)}
								{totalUnsyncedCount > 0 && (
									<Link
										to="/work-logs"
										className="btn btn--secondary btn--sm"
										onClick={() => setShowSyncMenu(false)}
									>
										View in Work Logs
									</Link>
								)}
								<label className="topbar__offline-toggle">
									<input
										type="checkbox"
										checked={simulatedOffline}
										onChange={(e) => toggleSimulatedOffline(e.target.checked)}
									/>
									<span>Work offline mode (simulate offline)</span>
								</label>
							</div>
						</div>
					)}
				</div>

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
