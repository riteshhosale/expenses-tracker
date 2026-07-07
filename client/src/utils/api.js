const envApiBase = import.meta.env.VITE_API_BASE?.trim();

// In production, default to same-origin so one-domain deployments work without extra config.
// For split deployments (frontend/backend on different domains), set VITE_API_BASE explicitly.
const fallbackApiBase = import.meta.env.DEV
	? "http://localhost:5000"
	: window.location.origin;

export const API_BASE = (envApiBase || fallbackApiBase).replace(/\/$/, "");
	