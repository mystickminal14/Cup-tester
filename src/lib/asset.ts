/**
 * Path to a file in `public/`, prefixed with the site's base path, so the site
 * works at the domain root (`/`) and in a subfolder such as `/cuptester/`.
 * The base comes from `BASE_PATH` at build time (see vite.config.ts).
 */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')
