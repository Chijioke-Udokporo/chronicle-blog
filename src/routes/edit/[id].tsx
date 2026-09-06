import { createSignal, onSettled, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { getPostByIdServer, updatePostServer, type PostsPopulated } from "../../lib/api";
import { user } from "../../lib/auth";

export default function EditPost() {
  const params = useParams();
  const navigate = useNavigate();
  const [post, setPost] = createSignal<PostsPopulated | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  const [title, setTitle] = createSignal("");
  const [category, setCategory] = createSignal<"Technology" | "Design" | "Engineering" | "Architecture" | "Culture">(
    "Technology",
  );
  const [coverImage, setCoverImage] = createSignal("");
  const [summary, setSummary] = createSignal("");
  const [content, setContent] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  const loadPost = async (id: string) => {
    setIsLoading(true);
    try {
      const p = await getPostByIdServer(id);
      if (p) {
        setPost(p);
        setTitle(p.title || "");
        setCategory(p.category || "Technology");
        setCoverImage(p.coverImage || "");
        setSummary(p.summary || "");
        setContent(p.content || "");
      }
    } catch (err) {
      console.error("Failed to load post for editing via server function:", err);
    } finally {
      setIsLoading(false);
    }
  };

  onSettled(() => {
    if (params.id) {
      loadPost(params.id);
    }
  });

  const authorObj = () => (post() && typeof post()!.author === "object" ? (post()!.author as any) : null);
  const authorId = () => {
    const a = authorObj();
    if (a) return a.id;
    return (post()?.author as unknown as string) || "";
  };

  const isOwner = () => {
    const current = user();
    if (!current) return false;
    if (current.role === "admin") return true;
    return current.id === authorId();
  };

  const handleUpdate = async (e: Event) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title().trim()) {
      setErrorMessage("Please enter a title.");
      return;
    }
    if (!content().trim()) {
      setErrorMessage("Article content cannot be empty.");
      return;
    }

    if (!params.id) {
      setErrorMessage("Missing article ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePostServer(params.id, {
        title: title().trim(),
        category: category(),
        coverImage: coverImage().trim() || undefined,
        summary: summary().trim() || undefined,
        content: content().trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update article.");
        setIsSubmitting(false);
        return;
      }

      navigate(`/post/${params.id}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Show
        when={!isLoading()}
        fallback={
          <div class="py-24 text-center">
            <div class="inline-block w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            <p class="mt-4 text-sm font-mono text-stone-500">Loading story editor...</p>
          </div>
        }
      >
        <Show
          when={isOwner()}
          fallback={
            <div class="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
              <h2 class="font-serif text-2xl font-bold text-stone-900 mb-2">Access Denied</h2>
              <p class="text-stone-600 text-sm mb-6">
                You do not have authorization to modify this article. Only the original author or system administrators
                can make edits.
              </p>
              <a href="/" class="px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium inline-block">
                Return to Front Page
              </a>
            </div>
          }
        >
          <form onSubmit={handleUpdate} class="space-y-8">
            <div class="flex items-center justify-between pb-6 border-b border-stone-200">
              <div>
                <span class="text-xs font-mono text-stone-500 uppercase tracking-wider">Authoring Studio</span>
                <h1 class="font-serif text-3xl font-black text-stone-900">Edit Story</h1>
              </div>

              <div class="flex items-center gap-3">
                <a
                  href={`/post/${params.id}`}
                  class="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={isSubmitting()}
                  class="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-full transition-all shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting() ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <Show when={errorMessage()}>
              <div class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{errorMessage()}</div>
            </Show>

            <div class="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  required
                  class="w-full font-serif text-2xl sm:text-3xl font-bold px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-900 transition-all"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                    Section Category *
                  </label>
                  <select
                    value={category()}
                    onChange={(e) => setCategory(e.currentTarget.value as any)}
                    class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
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
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={coverImage()}
                    onInput={(e) => setCoverImage(e.currentTarget.value)}
                    class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={summary()}
                  onInput={(e) => setSummary(e.currentTarget.value)}
                  class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-2">
                  Article Body (Markdown) *
                </label>
                <textarea
                  rows={14}
                  value={content()}
                  onInput={(e) => setContent(e.currentTarget.value)}
                  required
                  class="w-full font-mono text-sm px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>
            </div>
          </form>
        </Show>
      </Show>
    </div>
  );
}
