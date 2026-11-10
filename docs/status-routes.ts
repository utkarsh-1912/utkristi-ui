import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin, PreviewServer, ViteDevServer } from 'vite';

function statusRoutes(server: ViteDevServer | PreviewServer, directory: string) {
  function serve(status: 404 | 500, request: IncomingMessage, response: ServerResponse, next: Connect.NextFunction) {
    void readFile(resolve(directory, `${status}.html`)).then((html) => {
      response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : html);
    }, next);
  }

  server.middlewares.use((request, response, next) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') return next();
    const path = request.url?.split('?')[0];
    if (path === '/404' || path === '/404/') return serve(404, request, response, next);
    if (path && /^\/(?:error(?:\.html)?|500)\/?$/.test(path)) return serve(500, request, response, next);
    next();
  });

  // Let Vite serve the app entry and existing files before handling missing document URLs.
  return () => server.middlewares.use((request, response, next) => {
    if ((request.method !== 'GET' && request.method !== 'HEAD') ||
      !request.headers.accept?.includes('text/html')) return next();
    const path = request.url?.split('?')[0];
    if (path === '/' || path === '/index.html') return next();
    serve(404, request, response, next);
  });
}

export const docsStatusRoutes: Plugin = {
  name: 'utkristi-docs-status-routes',
  configureServer: (server) => statusRoutes(server, server.config.publicDir),
  configurePreviewServer: (server) => statusRoutes(server, resolve(server.config.root, server.config.build.outDir)),
};
