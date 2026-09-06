import { createSignal } from "solid-js";
import { client, type Users } from "./api";

// Reactive auth state signals
const [user, setUser] = createSignal<Users | null>(null);
const [token, setToken] = createSignal<string | null>(null);
const [isAuthLoading, setIsAuthLoading] = createSignal(true);

// Initialize auth state from browser storage
export function initAuth() {
  if (typeof window === "undefined") {
    setIsAuthLoading(false);
    return;
  }

  try {
    const savedToken = localStorage.getItem("cequre_token");
    const savedUser = localStorage.getItem("cequre_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  } catch (err) {
    console.warn("Failed to load saved auth session:", err);
  } finally {
    setIsAuthLoading(false);
  }
}

// User login
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await client.auth.login({ email, password });
    if (res.error) {
      return { success: false, error: res.error.message || "Invalid credentials" };
    }

    if (res.data && res.data.accessToken) {
      const accessToken = res.data.accessToken;
      const currentUser = res.data.user || null;

      localStorage.setItem("cequre_token", accessToken);
      if (currentUser) {
        localStorage.setItem("cequre_user", JSON.stringify(currentUser));
      }

      setToken(accessToken);
      setUser(currentUser);
      return { success: true };
    }

    return { success: false, error: "Authentication failed. No access token returned." };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred during login." };
  }
}

// User registration
export async function register(
  name: string,
  email: string,
  password: string,
  bio?: string,
  avatar?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await client.auth.register({
      name,
      email,
      password,
      role: "user",
      bio: bio || "",
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    if (res.error) {
      return { success: false, error: res.error.message || "Registration failed" };
    }

    // Auto-login if token was returned on register, otherwise login explicitly
    if (res.data?.accessToken) {
      const accessToken = res.data.accessToken;
      const currentUser = res.data.user || null;

      localStorage.setItem("cequre_token", accessToken);
      if (currentUser) {
        localStorage.setItem("cequre_user", JSON.stringify(currentUser));
      }

      setToken(accessToken);
      setUser(currentUser);
      return { success: true };
    }

    // Fallback: log in with the new credentials
    return await login(email, password);
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred during registration." };
  }
}

// User logout
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cequre_token");
    localStorage.removeItem("cequre_user");
  }
  setToken(null);
  setUser(null);
}

export { user, token, isAuthLoading };
export const isAuthenticated = () => !!user();
