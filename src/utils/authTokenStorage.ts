const TOKEN_KEY = "auth_token";
const EXPIRY_KEY = "auth_token_expires_at";
const REMEMBER_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export const getStoredAuthToken = (): string | null => {
	const persistentToken = localStorage.getItem(TOKEN_KEY);
	if (persistentToken) {
		const expiresAt = Number(localStorage.getItem(EXPIRY_KEY));
		if (expiresAt && Date.now() >= expiresAt) {
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(EXPIRY_KEY);
		} else {
			return persistentToken;
		}
	}
	return sessionStorage.getItem(TOKEN_KEY);
};

export const storeAuthToken = (token: string, rememberForThirtyDays = false) => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(EXPIRY_KEY);
	sessionStorage.removeItem(TOKEN_KEY);

	if (rememberForThirtyDays) {
		localStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(EXPIRY_KEY, String(Date.now() + REMEMBER_DURATION_MS));
	} else {
		sessionStorage.setItem(TOKEN_KEY, token);
	}
};

export const clearStoredAuthToken = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(EXPIRY_KEY);
	sessionStorage.removeItem(TOKEN_KEY);
};
