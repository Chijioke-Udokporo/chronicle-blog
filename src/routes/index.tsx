import { createSignal, onSettled, For, Show, createMemo } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { client, type PostsPopulated } from "../lib/api";
import { PostCard } from "../components/PostCard";
import { isAuthenticated } from "../lib/auth";

const CATEGORIES = ["All", "Technology", "Engineering", "Design", "Architecture", "Culture"] as const;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [posts, setPosts] = createSignal<PostsPopulated[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isSeeding, setIsSeeding] = createSignal(false);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await client.posts.get({
        query: { depth: 1 },
      });
      if (res.data && Array.isArray(res.data.docs)) {
        setPosts(res.data.docs);
      }
    } catch (err) {
      console.error("Network error loading posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  onSettled(() => {
    loadPosts();
  });

  const activeCategory = () => (searchParams.category as string) || "All";

  const filteredPosts = createMemo(() => {
    const all = posts();
    const cat = activeCategory();
    const query = searchQuery().toLowerCase().trim();

    return all.filter((post: PostsPopulated) => {
      const matchesCat = cat === "All" || post.category === cat;
      const authorName = typeof post.author === "object" && post.author ? post.author.name : "";
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        (post.summary && post.summary.toLowerCase().includes(query)) ||
        authorName.toLowerCase().includes(query);

      return matchesCat && matchesSearch;
    });
  });

  const featuredPost = createMemo(() => {
    const items = filteredPosts();
    return items.length > 0 ? items[0] : null;
  });

  const regularPosts = createMemo(() => {
    const items = filteredPosts();
    return items.length > 1 ? items.slice(1) : [];
  });

  // Helper to seed sample editorial essays if the database has zero posts
  const handleSeedSampleStories = async () => {
    setIsSeeding(true);
    try {
      // 1. Ensure a demo author user exists
      const userRes = await client.users.get({
        query: {
          where: { email: { eq: "editorial@chronicle.journal" } },
        },
      });

      let authorId: string;
      if (userRes.data?.docs && userRes.data.docs.length > 0) {
        authorId = userRes.data.docs[0].id;
      } else {
        const createRes = await client.auth.register({
          name: "Elena Vance",
          email: "editorial@chronicle.journal",
          password: "EditorialPassword123!",
          role: "user",
          bio: "Principal Systems Architect & Editor-at-Large",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
        });
        if (createRes.data?.user?.id) {
          authorId = createRes.data.user.id;
        } else {
          authorId = "system";
        }
      }

      // Sample articles
      const samplePosts = [
        {
          title: "The Architecture of Calm Software Systems",
          slug: "the-architecture-of-calm-software-systems",
          summary:
            "Why modern engineering teams are pivoting from bloated microservice sprawl toward cohesive, deterministic architectures that respect cognitive bandwidth.",
          content: `Software development in the early 2020s was characterized by hyper-fragmentation. Teams split simple monoliths into dozens of distributed services, introducing network latency, cascading failures, and distributed transaction headaches.\n\n## Returning to First Principles\n\nWhen we step back and evaluate our core operational objectives, software reliability and human ergonomics outweigh arbitrary technical complexity. A calm system provides deterministic execution paths, type-safe boundaries, and zero-runtime-overhead abstractions.\n\n> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra\n\n### The Three Pillars of Calm Engineering\n\n1. **Unified Schema Contracts**: Generating client SDKs directly from backend DSL definitions.\n2. **Fine-Grained Reactivity**: Updating only the DOM nodes that actually changed instead of diffing a virtual tree.\n3. **Row-Level Security at the Boundary**: Protecting every read and write where data lives.\n\nBy uniting SolidJS 2's reactive primitives with Cequre's native client SDK, developers gain end-to-end type safety without external package overhead.`,
          category: "Architecture" as const,
          readingTime: 4,
          published: true,
          coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
          author: authorId,
        },
        {
          title: "Fine-Grained Reactivity: SolidJS 2 and the Death of the Virtual DOM",
          slug: "fine-grained-reactivity-solidjs-2",
          summary:
            "An in-depth analysis of compiler-driven signals, lazy route execution, and how SolidJS achieves peak web performance without virtual DOM reconciliation.",
          content: `For almost a decade, frontend frameworks taught developers that rendering is a cycle of calculating full UI state trees and diffing them against memory representations.\n\nSolidJS dismantled that paradigm. In SolidJS 2, components run exactly once at mount time. They are not components in the re-rendering sense—they are factory functions that construct an enduring reactive graph.\n\n## Direct DOM Binding\n\nWhen a signal changes, Solid does not walk an element tree. It calls the exact update expression wired directly to that specific DOM text node or attribute.\n\n\`\`\`typescript\nconst [count, setCount] = createSignal(0);\n// Under the hood, this compiles to node.data = count()\n<div>{count()}</div>\n\`\`\`\n\nThis guarantees minimal memory allocations, immediate frame dispatch, and effortless 60fps animations even on budget mobile processors.`,
          category: "Technology" as const,
          readingTime: 5,
          published: true,
          coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
          author: authorId,
        },
        {
          title: "Crafting Timeless Digital Typography in Modern Web Design",
          slug: "crafting-timeless-digital-typography",
          summary:
            "Moving beyond generic fonts: pairing serif headlines with high-contrast geometric sans to evoke editorial gravitas and enduring legibility.",
          content: `Design is how it works, but typography is how it speaks. Most digital applications today feel interchangeable because they rely on the same sterile neo-grotesque sans-serif fonts.\n\n## The Power of Serif in Technical Prose\n\nSerif display typefaces carry historical authority and cadence. They slow the reader's eye just enough to savor complex ideas, while crisp sans-serif body typography provides optimal reading speed and vertical rhythm.\n\nWhen designing Chronicle, we prioritized:\n- Proportional line heights (1.85 for narrative text)\n- Optical margins on blockquotes\n- Distinctive terracotta accents instead of generic AI purple gradients\n\nThe result is a reading environment that feels akin to holding a physical journal.`,
          category: "Design" as const,
          readingTime: 3,
          published: true,
          coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
          author: authorId,
        },
      ];

      for (const p of samplePosts) {
        await client.posts.post(p);
      }

      await loadPosts();
    } catch (err) {
      console.error("Error seeding:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header & Masthead */}
      <section class="border-b border-stone-200 pb-12 mb-10 text-center sm:text-left">
        <div class="sm:flex sm:items-end sm:justify-between">
          <div>
            <span class="text-xs font-mono tracking-widest text-amber-800 uppercase font-semibold">
              Volume IV • Issue 09
            </span>
            <h1 class="font-serif text-4xl sm:text-6xl font-black text-stone-900 tracking-tight mt-2 mb-4 leading-none">
              Dispatches on Code & Craft
            </h1>
            <p class="text-stone-600 text-lg sm:text-xl max-w-2xl font-normal leading-relaxed">
              Curated long-form essays, architecture patterns, and technical reflections from independent builders.
            </p>
          </div>

          <div class="mt-6 sm:mt-0 flex items-center justify-center gap-3">
            <Show when={isAuthenticated()}>
              <a
                href="/write"
                class="px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-all shadow"
              >
                Write an Article
              </a>
            </Show>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div class="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-stone-200/60">
          {/* Category Tabs */}
          <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <For each={CATEGORIES}>
              {(category) => (
                <button
                  onClick={() => setSearchParams({ category: category === "All" ? undefined : category })}
                  class={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory() === category
                      ? "bg-stone-900 text-white shadow-sm font-semibold"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {category}
                </button>
              )}
            </For>
          </div>

          {/* Search Bar */}
          <div class="relative w-full md:w-72">
            <input
              type="search"
              placeholder="Search stories & authors..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full px-4 py-2 pl-9 bg-white border border-stone-200 rounded-full text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors shadow-sm"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <Show
        when={!isLoading()}
        fallback={
          <div class="py-24 text-center">
            <div class="inline-block w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            <p class="mt-4 text-sm font-mono text-stone-500">Retrieving articles from Cequre backend...</p>
          </div>
        }
      >
        <Show
          when={filteredPosts().length > 0}
          fallback={
            <div class="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
              <div class="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
              </div>
              <h2 class="font-serif text-2xl font-bold text-stone-900 mb-2">No Articles Found</h2>
              <p class="text-stone-600 max-w-md mx-auto text-sm mb-6 leading-relaxed">
                {searchQuery() || activeCategory() !== "All"
                  ? "No published stories match your search criteria. Try a different term or category filter."
                  : "The journal database is currently empty. You can write your own story or seed initial curated editorial essays."}
              </p>

              <div class="flex items-center justify-center gap-3">
                <Show when={isAuthenticated()}>
                  <a
                    href="/write"
                    class="px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
                  >
                    Write the First Story
                  </a>
                </Show>
                <button
                  onClick={handleSeedSampleStories}
                  disabled={isSeeding()}
                  class="px-5 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-full text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSeeding() ? "Publishing Stories..." : "Seed Curated Editorial Articles"}
                </button>
              </div>
            </div>
          }
        >
          {/* Featured Hero Story */}
          <Show when={featuredPost()}>
            {(hero) => (
              <div class="mb-14">
                <PostCard post={hero()} featured={true} />
              </div>
            )}
          </Show>

          {/* Regular Article Grid */}
          <Show when={regularPosts().length > 0}>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <For each={regularPosts()}>{(post) => <PostCard post={post} />}</For>
            </div>
          </Show>
        </Show>
      </Show>
    </div>
  );
}
