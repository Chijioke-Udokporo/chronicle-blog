import { createSignal, createMemo, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createPostServer } from "../lib/api";
import { user, isAuthenticated } from "../lib/auth";
import { Markdown } from "../components/Markdown";

export default function WritePost() {
  const navigate = useNavigate();

  const [title, setTitle] = createSignal("");
  const [category, setCategory] = createSignal<"Technology" | "Design" | "Engineering" | "Architecture" | "Culture">(
    "Technology",
  );
  const [coverImage, setCoverImage] = createSignal("");
  const [summary, setSummary] = createSignal("");
  const [content, setContent] = createSignal("");
  const [activeTab, setActiveTab] = createSignal<"edit" | "preview">("edit");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  // Real-time calculation of reading time
  const readingTime = createMemo(() => {
    const text = content().trim();
    if (!text) return 1;
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 180));
  });

  const wordCount = createMemo(() => {
    const text = content().trim();
    return text ? text.split(/\s+/).length : 0;
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title().trim()) {
      setErrorMessage("Please enter a story title.");
      return;
    }
    if (!content().trim()) {
      setErrorMessage("Please write some article content.");
      return;
    }

    const currentUser = user();
    if (!currentUser) {
      setErrorMessage("You must be logged in to publish an article.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPostServer({
        title: title().trim(),
        category: category(),
        coverImage: coverImage().trim() || undefined,
        summary: summary().trim() || undefined,
        content: content().trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to publish article.");
        setIsSubmitting(false);
        return;
      }

      if (res.post?.id) {
        navigate(`/post/${res.post.id}`);
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const setSampleCover = (url: string) => {
    setCoverImage(url);
  };

  return (
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Protected View Check */}
      <Show
        when={isAuthenticated()}
        fallback={
          <div class="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
            <div class="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 class="font-serif text-3xl font-bold text-stone-900 mb-2">Author Authentication Required</h2>
            <p class="text-stone-600 max-w-md mx-auto text-sm mb-6 leading-relaxed">
              Chronicle maintains a secure publishing standard. Please sign in or create an author account to publish
              your work.
            </p>
            <div class="flex items-center justify-center gap-4">
              <a
                href="/login"
                class="px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors inline-block"
              >
                Sign In
              </a>
              <a
                href="/register"
                class="px-6 py-2.5 bg-white border border-stone-300 text-stone-900 rounded-full text-sm font-medium hover:bg-stone-50 transition-colors inline-block"
              >
                Create Account
              </a>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} class="space-y-8">
          {/* Top Bar with Title and Publish Button */}
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <span class="text-xs font-mono text-stone-500 uppercase tracking-wider">Publishing Studio</span>
              <h1 class="font-serif text-3xl font-black text-stone-900">Draft a New Story</h1>
            </div>

            <div class="flex items-center gap-3">
              {/* Tab Toggles */}
              <div class="flex bg-stone-100 p-1 rounded-full text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  class={[
                    "px-3 py-1.5 rounded-full transition-all cursor-pointer",
                    activeTab() === "edit" ? "bg-white text-stone-900 shadow-sm font-semibold" : "text-stone-600",
                  ]}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  class={[
                    "px-3 py-1.5 rounded-full transition-all cursor-pointer",
                    activeTab() === "preview" ? "bg-white text-stone-900 shadow-sm font-semibold" : "text-stone-600",
                  ]}
                >
                  Live Preview
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting()}
                class="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-full transition-all shadow active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting() ? "Publishing..." : "Publish Story"}
              </button>
            </div>
          </div>

          <Show when={errorMessage()}>
            <div class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{errorMessage()}</div>
          </Show>

          {/* Edit Mode vs Preview Mode */}
          <Show
            when={activeTab() === "edit"}
            fallback={
              <div class="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm min-h-125">
                <div class="border-b border-stone-100 pb-6 mb-8">
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wide bg-stone-100 text-stone-800 mb-4">
                    {category()}
                  </span>
                  <h1 class="font-serif text-3xl sm:text-5xl font-bold text-stone-950 mb-4">
                    {title() || "Untitled Story"}
                  </h1>
                  <p class="text-lg text-stone-600 font-light">{summary() || "No excerpt specified."}</p>
                </div>
                <Show when={coverImage()}>
                  <img src={coverImage()} alt="Cover" class="w-full max-h-96 object-cover rounded-xl mb-8" />
                </Show>
                <Show
                  when={content()}
                  fallback={
                    <div class="article-prose text-stone-400 font-light italic">
                      Start writing in the Editor tab to preview your formatted story here...
                    </div>
                  }
                >
                  <Markdown content={content()} class="article-prose max-w-none" />
                </Show>
              </div>
            }
          >
            <div class="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Story Title */}
              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Architecture of Calm Software Systems"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  required
                  class="w-full font-serif text-2xl sm:text-3xl font-bold px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-900 transition-all placeholder:text-stone-300"
                />
              </div>

              {/* Metadata Row: Category & Reading Stats */}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                    Section Category *
                  </label>
                  <select
                    value={category()}
                    onChange={(e) => setCategory(e.currentTarget.value as any)}
                    class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Culture">Culture</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                    Estimated Reading Cadence
                  </label>
                  <div class="flex items-center gap-3 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono text-stone-600">
                    <span>{readingTime()} min read</span>
                    <span>•</span>
                    <span>{wordCount()} words</span>
                  </div>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverImage()}
                  onInput={(e) => setCoverImage(e.currentTarget.value)}
                  class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400"
                />
                <div class="mt-2 flex items-center gap-2 text-xs text-stone-500 font-mono">
                  <span>Quick Curated Covers:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSampleCover(
                        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
                      )
                    }
                    class="underline hover:text-stone-900 cursor-pointer"
                  >
                    Circuit
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSampleCover(
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
                      )
                    }
                    class="underline hover:text-stone-900 cursor-pointer"
                  >
                    Architecture
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSampleCover(
                        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
                      )
                    }
                    class="underline hover:text-stone-900 cursor-pointer"
                  >
                    Studio
                  </button>
                </div>
              </div>

              {/* Brief Summary */}
              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                  Brief Summary / Standfirst
                </label>
                <textarea
                  rows={2}
                  placeholder="One or two sentences summarizing the core thesis of your essay..."
                  value={summary()}
                  onInput={(e) => setSummary(e.currentTarget.value)}
                  class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400"
                />
              </div>

              {/* Main Article Content */}
              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                  Article Body (Markdown Supported) *
                </label>
                <textarea
                  rows={14}
                  placeholder="Draft your long-form article here. Use ## for Section Headers, > for Pull Quotes, and ``` for code blocks..."
                  value={content()}
                  onInput={(e) => setContent(e.currentTarget.value)}
                  required
                  class="w-full font-mono text-sm px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400 leading-relaxed"
                />
              </div>
            </div>
          </Show>
        </form>
      </Show>
    </div>
  );
}
