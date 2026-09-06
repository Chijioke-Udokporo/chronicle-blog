import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { register } from "../lib/auth";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  const handleRegister = async (e: Event) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name() || !email() || !password()) {
      setErrorMessage("Please fill out name, email, and password.");
      return;
    }

    if (password().length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const result = await register(name().trim(), email().trim(), password(), bio().trim() || undefined);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Registration failed. Please check your details.");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div class="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-sm">
        <div class="text-center mb-8">
          <span class="text-xs font-mono tracking-widest text-amber-800 uppercase font-semibold">Join the Guild</span>
          <h1 class="font-serif text-3xl font-black text-stone-900 mt-1">Create Author Account</h1>
          <p class="text-stone-500 text-sm mt-2">Publish thoughtful essays and architecture critiques on Chronicle.</p>
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

        <form onSubmit={handleRegister} class="space-y-4">
          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">Full Name *</label>
            <input
              type="text"
              autocomplete="name"
              required
              placeholder="Elena Vance"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">Email Address *</label>
            <input
              type="email"
              autocomplete="email"
              required
              placeholder="elena@chronicle.journal"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
              Password (min 6 characters) *
            </label>
            <input
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              placeholder="••••••••••••"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
              Author Bio (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Staff Software Engineer, writing about distributed protocols..."
              value={bio()}
              onInput={(e) => setBio(e.currentTarget.value)}
              class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading()}
            class="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-full transition-all shadow active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isLoading() ? "Creating Profile on Cequre..." : "Create Chronicle Account"}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          Already an author?{" "}
          <a href="/login" class="font-medium text-stone-900 hover:text-amber-800 underline transition-colors">
            Sign in to existing account
          </a>
        </div>
      </div>
    </div>
  );
}
