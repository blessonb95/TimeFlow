import React, { useState } from "react";
import { useLogin } from "../hooks/useAuth";

// ─── Feature bullets shown in the left panel ─────────────────────────────────
interface FeatureItem {
	icon: React.ReactNode;
	text: string;
}

const FEATURES: FeatureItem[] = [
	{
		icon: (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<circle cx="8" cy="8" r="6" />
				<path d="M8 5v3l2 2" />
			</svg>
		),
		text: "Effortless daily time logging",
	},
	{
		icon: (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<path d="M2 4.5A1.5 1.5 0 013.5 3h3l1.5 1.5h4.5A1.5 1.5 0 0114 6v5.5A1.5 1.5 0 0112.5 13h-9A1.5 1.5 0 012 11.5v-7z" />
			</svg>
		),
		text: "Real-time project visibility",
	},
	{
		icon: (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<path d="M9 2.5H4a1.5 1.5 0 00-1.5 1.5v8A1.5 1.5 0 004 13.5h8a1.5 1.5 0 001.5-1.5V7" />
				<path d="M6 8l2 2 4.5-4.5" />
			</svg>
		),
		text: "Automated timesheet approvals",
	},
	{
		icon: (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<path d="M3 13v-5M8 13V5M13 13v-3" />
			</svg>
		),
		text: "Resource utilization insights",
	},
];

export const Login: React.FC = () => {
	const loginMutation = useLogin();

	// ── Sign-in fields ──────────────────────────────────────────────────────────
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const [showPwd, setShowPwd] = useState(false);
	const [loginError, setLoginError] = useState("");
	const [passwordResetNotice, setPasswordResetNotice] = useState("");

	// ── Handler ───────────────────────────────────────────────────────────────────
	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		setLoginError("");
		setPasswordResetNotice("");
		loginMutation.mutate(
			{ email, password, remember },
			{
				onError: (err: any) => {
					if (!err.response) {
						setLoginError("Unable to connect. Please try again later.");
					} else {
						const msg =
							err.response?.data?.message || "Invalid email or password";
						setLoginError(msg);
					}
				},
			},
		);
	};

	const handleForgotPassword = () => {
		setLoginError("");
		setPasswordResetNotice("For a password reset, contact your workspace administrator.");
	};

	// ─────────────────────────────────────────────────────────────────────────────
	return (
		<div className="auth-page">
			{/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
			<div className="auth-page__left">
				<div className="auth-page__left-body">
					<h2 className="auth-page__left-headline">
						Time tracked.
						<br />
						Teams aligned.
					</h2>
					<p className="auth-page__left-desc">
						The workforce management platform built for software teams that
						prioritize clarity and accountability.
					</p>
					<ul className="auth-page__features">
						{FEATURES.map((f, i) => (
							<li key={i} className="auth-page__feature">
								<span className="auth-page__feature-icon">{f.icon}</span>
								{f.text}
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
			<div className="auth-page__right" role="main">
				<div className="auth-page__form-wrap">
					<div className="auth-page__form-header">
						<img
							src={`${import.meta.env.BASE_URL}logo-with-name.png`}
							alt="TimeFlow"
							className="auth-page__form-logo"
						/>
						<h1 className="auth-page__title">Log in to your account</h1>
					</div>

					<div className="auth-page__form-body">
					<form onSubmit={handleSignIn} className="auth-page__form">
						<div className="form-group">
							<label className="form-group__label" htmlFor="login-username">Email or Username</label>
							<input
								className="form-group__input"
								id="login-username"
								type="text"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setPasswordResetNotice("");
									if (!e.target.value) setLoginError("");
								}}
								placeholder="you@timeflow.com or username"
								autoComplete="username"
							/>
						</div>

						<div className="form-group">
							<div className="auth-page__pwd-row">
								<label className="form-group__label" htmlFor="login-password">Password</label>
							</div>
							<div className="auth-page__pwd-wrap">
								<input
									className="form-group__input auth-page__pwd-input"
									id="login-password"
									type={showPwd ? "text" : "password"}
									value={password}
									onChange={(e) => {
									setPassword(e.target.value);
									setPasswordResetNotice("");
									if (!e.target.value) setLoginError("");
								}}
									placeholder="••••••••"
									autoComplete="current-password"
								/>
								<button
									type="button"
									className="auth-page__eye"
									onClick={() => setShowPwd((v) => !v)}
									aria-label={showPwd ? "Hide password" : "Show password"}
								>
									{showPwd ? (
										<svg
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
										>
											<path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
											<circle cx="8" cy="8" r="2" />
											<line x1="2" y1="2" x2="14" y2="14" />
										</svg>
									) : (
										<svg
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
										>
											<path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
											<circle cx="8" cy="8" r="2" />
										</svg>
									)}
								</button>
							</div>
							<button type="button" className="auth-page__forgot" onClick={handleForgotPassword}>
								Forgot your password?
							</button>
						</div>

						<div className="auth-page__remember-row">
							<label className="auth-page__remember">
								<input
									type="checkbox"
									checked={remember}
									onChange={(e) => setRemember(e.target.checked)}
								/>
								<span>
									Keep me signed in{" "}
									<span className="auth-page__remember-days">
										for 30 days
									</span>
								</span>
							</label>
						</div>

						{(loginError || passwordResetNotice) && (
							<div className="auth-page__feedback-slot" aria-live="polite">
								{loginError && <p className="auth-page__feedback auth-page__feedback--error" role="alert">{loginError}</p>}
								{passwordResetNotice && <p className="auth-page__feedback">{passwordResetNotice}</p>}
							</div>
						)}
						<button
							type="submit"
							className="auth-page__submit-btn"
							disabled={loginMutation.isPending}
						>
							{loginMutation.isPending ? "Signing in…" : "Continue"}
						</button>
					</form>

					{/* Invite hint */}
					<p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6}}>
						Don't have an account?{' '}
						<span style={{ color: '#6366f1', fontWeight: 600 }}>
							Ask your admin for an invite link.
						</span>
					</p>
					</div>
				</div>
			</div>
		</div>
	);
};
