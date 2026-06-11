/**
 * SSR replacement for client-only heavy modules (see vite.config.ts).
 *
 * The Oxygen worker is a single file, so Rollup inlines every dynamic
 * import — `React.lazy` keeps a module off the critical path at runtime
 * but NOT out of the server bundle. react-player v3 alone drags in
 * hls.js, dashjs, media-chrome and the Mux/Vimeo players (~3MB of
 * source), all of which can only ever run in a browser; that parse/
 * compile cost is paid on every cold start.
 *
 * Safe because the player renders only behind `useInView` (hero-video),
 * which is always false during SSR — this stub is never actually
 * rendered on the server, it only satisfies the import.
 */
export default function ClientOnlyStub(): null {
  return null;
}
