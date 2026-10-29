import { create } from "zustand";
import type { Role } from "../types";
import { clearStoredAuthToken, getStoredAuthToken, storeAuthToken } from "../utils/authTokenStorage";
import { GUEST_USER as DEMO_USER } from "../api/mockData";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: Role;
	department: string;
	designation: string;
	initials: string;
	color: string;
	avatar: string;
	status: string;
}

interface AppState {
	role: Role;
	currentUser: AuthUser;
	authToken: string | null;
	isSidebarCollapsed: boolean;
	notifications: number;
	isGuest: boolean;

	setRole: (role: Role) => void;
	setUser: (user: any) => void;
	setAuthUser: (user: AuthUser, token: string) => void;
	setGuestMode: () => void;
	updateCurrentUser: (updates: Partial<AuthUser>) => void;
	clearAuth: () => void;
	toggleSidebar: () => void;
}

const DEFAULT_GUEST_USER: AuthUser = {
	id: "",
	name: "Guest",
	email: "",
	role: "employee",
	department: "",
	designation: "",
	initials: "GU",
	color: "#6b7280",
	avatar: "",
	status: "Active",
};

const storedToken = getStoredAuthToken();
const initialIsGuest = storedToken === "demo-guest-token" || localStorage.getItem("is_guest") === "true";

/** Read the cached user from localStorage (set on every login / auth sync) */
const getCachedUser = (): AuthUser | null => {
	try {
		const raw = localStorage.getItem("cached_user");
		if (raw) return JSON.parse(raw) as AuthUser;
	} catch { /* corrupt JSON – ignore */ }
	return null;
};

/** Persist the full user object so reloads don't flash */
const cacheUser = (user: AuthUser) => {
	localStorage.setItem("cached_user", JSON.stringify(user));
	localStorage.setItem("active_role", user.role);
	localStorage.setItem("active_user_id", user.id);
};

const cachedUser = getCachedUser();
const initialUser: AuthUser = initialIsGuest
	? DEMO_USER
	: cachedUser && storedToken
		? cachedUser
		: DEFAULT_GUEST_USER;
const initialRole: Role = initialUser.role;

export const useAppStore = create<AppState>((set) => ({
	role: initialRole,
	currentUser: initialUser,
	authToken: storedToken,
	isSidebarCollapsed: false,
	notifications: 3,
	isGuest: initialIsGuest,

	setRole: (role) => {
		localStorage.setItem("active_role", role);
		set((state) => {
			const updatedUser = { ...state.currentUser, role };
			cacheUser(updatedUser);
			return { role, currentUser: updatedUser };
		});
	},

	setUser: (user) => {
		const authUser = { ...user, status: user.status || 'Active' } as AuthUser;
		cacheUser(authUser);
		set({ role: user.role, currentUser: authUser });
	},

	setAuthUser: (user, token) => {
		const authUser = { ...user, status: user.status || 'Active' } as AuthUser;
		cacheUser(authUser);
		localStorage.removeItem("is_guest");
		set({
			currentUser: authUser,
			role: user.role,
			authToken: token,
			isGuest: false,
		});
	},

	setGuestMode: () => {
		const token = "demo-guest-token";
		storeAuthToken(token, false);
		localStorage.setItem("is_guest", "true");
		cacheUser(DEMO_USER);
		set({
			currentUser: DEMO_USER,
			role: DEMO_USER.role,
			authToken: token,
			isGuest: true,
		});
	},

	updateCurrentUser: (updates) =>
		set((state) => {
			const updatedUser = { ...state.currentUser, ...updates };
			cacheUser(updatedUser);
			return { currentUser: updatedUser };
		}),

	clearAuth: () => {
		clearStoredAuthToken();
		localStorage.removeItem("active_role");
		localStorage.removeItem("active_user_id");
		localStorage.removeItem("cached_user");
		localStorage.removeItem("is_guest");
		set({
			currentUser: DEFAULT_GUEST_USER,
			role: "employee",
			authToken: null,
			isGuest: false,
		});
	},

	toggleSidebar: () =>
		set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
