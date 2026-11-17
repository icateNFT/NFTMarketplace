/* Lets `npm test` run the TypeScript tests on Node's own type stripping, with no
   extra package: resolves imports the way tsconfig.json and Next.js do —
   the "@/…" alias for src/, and specifiers written without an extension. */

import { registerHooks } from "node:module";

const SRC = new URL("../src/", import.meta.url);

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) specifier = new URL(specifier.slice(2), SRC).href;
    try {
      return next(specifier, context);
    } catch (e) {
      for (const ext of [".ts", ".tsx", ".js"]) {
        try {
          return next(specifier + ext, context);
        } catch {
          /* try the next extension */
        }
      }
      throw e;
    }
  },
});
