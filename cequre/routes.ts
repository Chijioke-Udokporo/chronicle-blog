import { CequreModule } from "cequre-ts";
import type { Collections } from "./_generated/server";

export const routesModule = new CequreModule<Collections>();

routesModule.hooks("posts", {
  beforeCreate: async (ctx) => {
    // Pin author to authenticated user's ID
    if (ctx.user) {
      ctx.data.author = ctx.user.id;
    }
    // Auto-generate URL-friendly unique slug if not explicitly supplied
    if (!ctx.data.slug || ctx.data.slug.trim() === "") {
      const base = (ctx.data.title || "post")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      ctx.data.slug = `${base}-${Math.random().toString(36).substring(2, 7)}`;
    }
    // Calculate reading time based on 180 wpm
    if (ctx.data.content) {
      const words = ctx.data.content.trim().split(/\s+/).length;
      ctx.data.readingTime = Math.max(1, Math.ceil(words / 180));
    }
    return ctx.data;
  },
  beforeUpdate: async (ctx) => {
    if (ctx.data.content) {
      const words = ctx.data.content.trim().split(/\s+/).length;
      ctx.data.readingTime = Math.max(1, Math.ceil(words / 180));
    }
    return ctx.data;
  },
});

routesModule.access("posts", {
  read: () => true,
  create: (ctx) => ctx.user !== null,
  update: (ctx) => {
    if (!ctx.user) return false;
    if (ctx.user.role === "admin") return true;
    return { author: { eq: ctx.user.id } };
  },
  delete: (ctx) => {
    if (!ctx.user) return false;
    if (ctx.user.role === "admin") return true;
    return { author: { eq: ctx.user.id } };
  },
});

routesModule.access("users", {
  register: () => true,
  login: () => true,
  read: () => true,
  create: () => true,
  update: (ctx) => {
    if (!ctx.user) return false;
    if (ctx.user.role === "admin") return true;
    return { id: { eq: ctx.user.id } };
  },
  delete: (ctx) => ctx.user?.role === "admin",
});

