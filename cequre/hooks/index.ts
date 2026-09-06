import type { CequreModule } from "cequre-ts";
import type { Collections } from "../_generated/server";
import { registerPostsHooks } from "./posts";

export function registerHooks(module: CequreModule<Collections>) {
  registerPostsHooks(module);
}
