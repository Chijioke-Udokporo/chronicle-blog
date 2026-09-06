import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { login } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email() || !password()) {
      setErrorMessage("Please fill out both email and password.");
      return;
    }

    setIsLoading(true);
    const result = await login(email().trim(), password());
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Authentication failed. Please verify your credentials.");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div class="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-sm">
        <div class="text-center mb-8">
          <span class="text-xs font-mono tracking-widest text-amber-800 uppercase font-semibold">Member Access</span>
          <h1 class="font-serif text-3xl font-black text-stone-900 mt-1">Sign in to Chronicle</h1>
          <p class="text-stone-500 text-sm mt-2">Enter your credentials to manage your stories and draft new essays.</p>
        </div>

        <Show when={errorMessage()}>
          <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 shrink-0 text-red-500 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" y2="12" />
              <line x1="12" y1="16" y2="16" />
            </svg>
            <div>{errorMessage()}</div>
          </div>
        </Show>

        <form onSubmit={handleLogin} class="space-y-5">
          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">Email Address</label>
            <input
              type="email"
              autocomplete="email"
              required
              placeholder="writer@example.com"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-mono uppercase tracking-wider text-stone-600">Password</label>
            </div>
            <input
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••••••"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading()}
            class="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-full transition-all shadow active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isLoading() ? "Authenticating with Cequre..." : "Sign In to Your Journal"}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          New to Chronicle?{" "}
          <a href="/register" class="font-medium text-stone-900 hover:text-amber-800 underline transition-colors">
            Create an author account
          </a>
        </div>
      </div>
    </div>
  );
}
