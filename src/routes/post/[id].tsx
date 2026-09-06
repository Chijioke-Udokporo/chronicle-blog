import { createSignal, onSettled, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { client, type PostsPopulated } from "../../lib/api";
import { user } from "../../lib/auth";
import dayjs from "dayjs";

export default function PostDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [post, setPost] = createSignal<PostsPopulated | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);

  const loadPost = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await client.posts.get({
        id,
        query: { depth: 1 },
      });
      if (res.data) {
        setPost(res.data as any);
      }
    } catch (err) {
      console.error("Failed to load post:", err);
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

  const formattedDate = () => {
    if (!post()?.createdAt) return "";
    return dayjs(post()!.createdAt).format("MMMM D, YYYY");
  };

  const handleDelete = async () => {
    if (!post()) return;
    setIsDeleting(true);
    try {
      const res = await client.posts.delete(post()!.id);
      if (res.error) {
        alert("Failed to delete story: " + res.error.message);
        setIsDeleting(false);
        return;
      }
      navigate("/");
    } catch (err: any) {
      alert("Error deleting story: " + err.message);
      setIsDeleting(false);
    }
  };

  // Convert text into formatted paragraphs and headings
  const renderFormattedContent = (content: string) => {
    if (!content) return "";
    const paragraphs = content.split(/\n\s*\n/);
    return paragraphs
      .map((p) => {
        p = p.trim();
        if (p.startsWith("### ")) {
          return `<h3>${p.replace(/^###\s+/, "")}</h3>`;
        }
        if (p.startsWith("## ")) {
          return `<h2>${p.replace(/^##\s+/, "")}</h2>`;
        }
        if (p.startsWith("> ")) {
          return `<blockquote>${p.replace(/^>\s+/, "")}</blockquote>`;
        }
        if (p.startsWith("```")) {
          const code = p.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
          return `<pre><code>${code}</code></pre>`;
        }
        return `<p>${p.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("");
  };

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back to feed */}
      <div class="mb-8">
        <a
          href="/"
          class="inline-flex items-center gap-2 text-sm font-mono text-stone-500 hover:text-stone-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Journal
        </a>
      </div>

      <Show
        when={!isLoading()}
        fallback={
          <div class="py-24 text-center">
            <div class="inline-block w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            <p class="mt-4 text-sm font-mono text-stone-500">Opening story...</p>
          </div>
        }
      >
        <Show
          when={post()}
          fallback={
            <div class="py-20 text-center bg-white rounded-2xl border border-stone-200 p-8">
              <h2 class="font-serif text-2xl font-bold text-stone-900 mb-2">Story Not Found</h2>
              <p class="text-stone-600 text-sm mb-6">This article may have been removed or the link is incorrect.</p>
              <a href="/" class="px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium inline-block">
                Return to Front Page
              </a>
            </div>
          }
        >
          <article>
            {/* Header Meta */}
            <div class="border-b border-stone-200 pb-8 mb-10">
              <div class="flex items-center gap-3 mb-4">
                <span class="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-semibold tracking-wider text-amber-900 uppercase">
                  {post()!.category}
                </span>
                <span class="text-xs font-mono text-stone-500">{post()!.readingTime || 3} min read</span>
              </div>

              <h1 class="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight leading-tight mb-6">
                {post()!.title}
              </h1>

              <Show when={post()!.summary}>
                <p class="text-lg sm:text-xl text-stone-600 font-light leading-relaxed mb-8">{post()!.summary}</p>
              </Show>

              {/* Author Strip & Action Toolbar */}
              <div class="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-stone-100">
                <div class="flex items-center gap-4">
                  <img
                    src={
                      authorObj()?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorObj()?.name || "Author")}`
                    }
                    alt={authorObj()?.name || "Author"}
                    class="w-12 h-12 rounded-full border border-stone-200 object-cover bg-stone-100"
                  />
                  <div>
                    <p class="font-medium text-stone-900 leading-none">{authorObj()?.name || "Chronicle Writer"}</p>
                    <p class="text-xs font-mono text-stone-500 mt-1">Published on {formattedDate()}</p>
                  </div>
                </div>

                {/* Author controls (Owner only) */}
                <Show when={isOwner()}>
                  <div class="flex items-center gap-2">
                    <a
                      href={`/edit/${post()!.id}`}
                      class="px-4 py-1.5 text-xs font-mono font-medium text-stone-700 bg-white border border-stone-300 rounded-full hover:bg-stone-50 transition-colors"
                    >
                      Edit Story
                    </a>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      class="px-4 py-1.5 text-xs font-mono font-medium text-red-700 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </Show>
              </div>
            </div>

            {/* Cover Image */}
            <Show when={post()!.coverImage}>
              <div class="mb-12 rounded-2xl overflow-hidden border border-stone-200 shadow-sm max-h-[500px]">
                <img src={post()!.coverImage} alt={post()!.title} class="w-full h-full object-cover object-center" />
              </div>
            </Show>

            {/* Article Prose */}
            <div class="article-prose max-w-none mb-16" innerHTML={renderFormattedContent(post()!.content)} />

            {/* Author Biography Footer Card */}
            <div class="bg-white rounded-2xl border border-stone-200 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
              <img
                src={
                  authorObj()?.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorObj()?.name || "Author")}`
                }
                alt={authorObj()?.name || "Author"}
                class="w-16 h-16 rounded-full border border-stone-200 object-cover bg-stone-100 shrink-0"
              />
              <div class="text-center sm:text-left">
                <span class="text-xs font-mono text-stone-500 uppercase tracking-wider">Written by</span>
                <h3 class="font-serif text-xl font-bold text-stone-900 mt-0.5 mb-2">
                  {authorObj()?.name || "Chronicle Writer"}
                </h3>
                <p class="text-stone-600 text-sm leading-relaxed max-w-xl">
                  {authorObj()?.bio ||
                    "Author and contributor to Chronicle Journal, exploring the intersection of modern software systems and architecture."}
                </p>
              </div>
            </div>
          </article>
        </Show>
      </Show>

      {/* Delete Confirmation Modal */}
      <Show when={showDeleteModal()}>
        <div class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 shadow-2xl">
            <h3 class="font-serif text-xl font-bold text-stone-900 mb-2">Delete this story?</h3>
            <p class="text-stone-600 text-sm mb-6">
              Are you sure you want to remove "<span class="font-medium text-stone-900">{post()?.title}</span>"? This
              action is irreversible.
            </p>
            <div class="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting()}
                class="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting()}
                class="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting() ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
