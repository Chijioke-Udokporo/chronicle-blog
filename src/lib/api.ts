import {
  createCequreClient,
  type Posts,
  type PostsPopulated,
  type PostsCreateInput,
  type PostsUpdateInput,
  type Users,
} from "../../cequre/_generated/client";

// Base URL: In browser, use relative origin which is proxied to :3000 by Vite, or direct fallback
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // If running on Vite dev server (e.g. 5173), Vite proxies /api to port 3000
    return window.location.origin;
  }
  return "http://localhost:3000";
};

export const client = createCequreClient({
  baseUrl: getBaseUrl(),
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cequre_token");
    }
    return null;
  },
  credentials: "include",
});

export type { Posts, PostsPopulated, PostsCreateInput, PostsUpdateInput, Users };
