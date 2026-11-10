interface ExampleFile { name: string; code: string }

export interface FrameworkRecipe {
  id: string;
  name: string;
  group: 'React components' | 'Browser integrations' | 'Server templates' | 'Embedded UI';
  description: string;
  source: string;
  files: ExampleFile[];
}

const cssImport = "import '@utkristi/ui/utkristi-ui.css';";
const mountDocument = `${cssImport}
import { initUI } from '@utkristi/ui/dom';

initUI(document);`;
const bootScript = "document.addEventListener('DOMContentLoaded', () => {\n  UtkristiDOM.initUI(document);\n}, { once: true });";

function staticDocument(css: string, script: string, markup: string, boot = bootScript) {
  return `<!doctype html>
<html lang="en" data-theme="glass">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Workspace details</title>
  <link rel="stylesheet" href="${css}">
  <script src="${script}" defer></script>
  <script>
${boot}
  </script>
</head>
<body>
${markup}
</body>
</html>`;
}

export function frameworkRecipes({ markup, react, vue, svelte, angular }: Record<'markup' | 'react' | 'vue' | 'svelte' | 'angular', string>): FrameworkRecipe[] {
  const reactPage = react.replace(cssImport + '\n', '') + '\n\nexport default WorkspaceDetails;';
  const reactDefault = react + '\n\nexport default WorkspaceDetails;';
  const angularApp = angular.replace("import { initDialogs }", "import { initUI }").replace('initDialogs(this.host.nativeElement)', 'initUI(this.host.nativeElement)');
  const vueApp = vue.replaceAll('initDialogs', 'initUI');
  const svelteApp = svelte.replaceAll('initDialogs', 'initUI');
  const asset = '/utkristi/';
  const staticFiles = (name: string) => asset + name;
  const staticTemplate = staticDocument(staticFiles('utkristi-ui.css'), staticFiles('utkristi-dom.js'), markup);

  return [
    { id: 'react', name: 'React', group: 'React components',
      description: 'Import the stylesheet and render the interactive dialog from your app entry.',
      source: 'https://react.dev/reference/react-dom/client/createRoot',
      files: [{ name: 'src/App.tsx', code: reactDefault }] },
    { id: 'nextjs', name: 'Next.js', group: 'React components',
      description: 'Add the stylesheet import to the App Router root layout. The interactive page declares a client boundary.',
      source: 'https://nextjs.org/docs/app/getting-started/css',
      files: [{ name: 'app/layout.tsx · add this import', code: cssImport },
        { name: 'app/workspace/page.tsx', code: "'use client';\n\n" + reactPage }] },
    { id: 'remix', name: 'Remix', group: 'React components',
      description: 'For Remix with Vite, use the route links export to load the kit stylesheet when the route is active.',
      source: 'https://v2.remix.run/docs/guides/styling/',
      files: [{ name: 'app/routes/workspace.tsx', code: `import stylesheet from '@utkristi/ui/utkristi-ui.css?url';
${reactPage}

export const links = () => [{ rel: 'stylesheet', href: stylesheet }];` }] },
    { id: 'gatsby', name: 'Gatsby', group: 'React components',
      description: 'Load the stylesheet globally and add a workspace page with the React dialog.',
      source: 'https://www.gatsbyjs.com/docs/how-to/styling/global-css/',
      files: [{ name: 'gatsby-browser.js · add this import', code: cssImport },
        { name: 'src/pages/workspace.tsx', code: "import * as React from 'react';\n" + reactPage }] },
    { id: 'vue', name: 'Vue', group: 'Browser integrations',
      description: 'Attach the DOM runtime when the component mounts and clean up its listeners before unmounting.',
      source: 'https://vuejs.org/api/composition-api-lifecycle.html',
      files: [{ name: 'src/App.vue', code: vueApp }] },
    { id: 'nuxt', name: 'Nuxt', group: 'Browser integrations',
      description: 'Add the stylesheet to your Nuxt configuration. The page initializes its dialog in the browser after hydration.',
      source: 'https://nuxt.com/docs/4.x/getting-started/styling',
      files: [{ name: 'nuxt.config.ts · merge this option', code: "export default defineNuxtConfig({\n  css: ['@utkristi/ui/utkristi-ui.css'],\n});" },
        { name: 'app/pages/workspace.vue', code: vueApp.replace(cssImport + '\n', '') }] },
    { id: 'svelte', name: 'Svelte', group: 'Browser integrations',
      description: 'Use onMount for the native markup and runtime. In SvelteKit, place the same example in a route page.',
      source: 'https://svelte.dev/docs/svelte/lifecycle-hooks',
      files: [{ name: 'src/App.svelte', code: svelteApp }] },
    { id: 'angular', name: 'Angular', group: 'Browser integrations',
      description: 'Add the stylesheet to your global styles and mount the standalone component. The view hook initializes its host element.',
      source: 'https://angular.dev/guide/components/lifecycle',
      files: [{ name: 'src/styles.css · add this import', code: "@import '@utkristi/ui/utkristi-ui.css';" },
        { name: 'src/app/workspace-details.ts', code: angularApp }] },
    { id: 'meteor', name: 'Meteor.js', group: 'Browser integrations',
      description: 'Initialize the client runtime with Meteor.startup and put the component markup in a Blaze template.',
      source: 'https://docs.meteor.com/api/meteor.html',
      files: [{ name: 'client/main.js', code: `import { Meteor } from 'meteor/meteor';
import './main.html';
${cssImport}
import { initUI } from '@utkristi/ui/dom';

Meteor.startup(() => initUI(document));` },
        { name: 'client/main.html', code: `<body>
  {{> workspaceDetails}}
</body>
<template name="workspaceDetails">
${markup}
</template>` }] },
    { id: 'solidjs', name: 'SolidJS', group: 'Browser integrations',
      description: 'Initialize a local DOM scope with Solid’s mount and cleanup hooks.',
      source: 'https://docs.solidjs.com/reference/lifecycle/on-mount',
      files: [{ name: 'src/App.tsx', code: `import { onCleanup, onMount } from 'solid-js';
import { initUI } from '@utkristi/ui/dom';
${cssImport}

export default function App() {
  let root!: HTMLElement;
  onMount(() => {
    const dispose = initUI(root);
    onCleanup(dispose);
  });

  return (
${markup.replace('<section ', '<section ref={root} ').split('\n').map((line) => '    ' + line).join('\n')}
  );
}` }] },
    { id: 'laravel', name: 'Laravel', group: 'Server templates',
      description: 'Add the runtime to the Laravel Vite entry and render the markup in a Blade view.',
      source: 'https://laravel.com/docs/vite',
      files: [{ name: 'resources/js/app.js · add these lines', code: mountDocument },
        { name: 'resources/views/workspace.blade.php', code: `<!doctype html>
<html lang="en" data-theme="glass">
<head>
  <meta charset="utf-8">
  <title>Workspace</title>
  @vite('resources/js/app.js')
</head>
<body>
${markup}
</body>
</html>` },
        { name: 'routes/web.php · add this route', code: "Route::view('/workspace', 'workspace');" }] },
    { id: 'symfony', name: 'Symfony', group: 'Server templates',
      description: 'Put the downloadable assets in public/utkristi and use Twig’s asset helper in your template.',
      source: 'https://symfony.com/doc/current/frontend/asset_mapper.html',
      files: [{ name: 'templates/workspace/index.html.twig', code: staticDocument(
        "{{ asset('utkristi/utkristi-ui.css') }}", "{{ asset('utkristi/utkristi-dom.js') }}", markup) },
        { name: 'src/Controller/WorkspaceController.php', code: String.raw`<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class WorkspaceController extends AbstractController
{
    #[Route('/workspace', name: 'workspace')]
    public function show(): Response
    {
        return $this->render('workspace/index.html.twig');
    }
}` }] },
    { id: 'rails', name: 'Rails', group: 'Server templates',
      description: 'Put the downloadable assets in public/utkristi. The initializer handles Turbo visits and releases listeners before caching.',
      source: 'https://guides.rubyonrails.org/asset_pipeline.html',
      files: [{ name: 'app/views/layouts/application.html.erb · add to the head', code: `<%= stylesheet_link_tag "/utkristi/utkristi-ui.css" %>
<%= javascript_include_tag "/utkristi/utkristi-dom.js", defer: true %>
<%= javascript_include_tag "/utkristi/boot.js", defer: true %>` },
        { name: 'public/utkristi/boot.js', code: `let dispose;

function mount() {
  dispose?.();
  dispose = UtkristiDOM.initUI(document);
}

document.addEventListener('DOMContentLoaded', mount, { once: true });
document.addEventListener('turbo:load', mount);
document.addEventListener('turbo:before-cache', () => {
  dispose?.();
  dispose = undefined;
});` },
        { name: 'app/views/workspace/show.html.erb', code: markup },
        { name: 'app/controllers/workspace_controller.rb', code: "class WorkspaceController < ApplicationController\n  def show; end\nend" },
        { name: 'config/routes.rb · add inside routes.draw', code: 'get "workspace", to: "workspace#show"' }] },
    { id: 'django', name: 'Django', group: 'Server templates',
      description: 'Put the assets in an app’s static/utkristi folder and render the template with the static tag.',
      source: 'https://docs.djangoproject.com/en/stable/howto/static-files/',
      files: [{ name: 'templates/workspace.html', code: '{% load static %}\n' + staticDocument(
        "{% static 'utkristi/utkristi-ui.css' %}", "{% static 'utkristi/utkristi-dom.js' %}", markup) },
        { name: 'urls.py · add this route', code: `from django.urls import path
from django.views.generic import TemplateView

urlpatterns = [
    path("workspace/", TemplateView.as_view(template_name="workspace.html")),
]` }] },
    { id: 'flask', name: 'Flask', group: 'Server templates',
      description: 'Put the assets in static/utkristi and use the static endpoint to build their URLs.',
      source: 'https://flask.palletsprojects.com/en/stable/quickstart/#static-files',
      files: [{ name: 'templates/workspace.html', code: staticDocument(
        "{{ url_for('static', filename='utkristi/utkristi-ui.css') }}", "{{ url_for('static', filename='utkristi/utkristi-dom.js') }}", markup) },
        { name: 'app.py', code: `from flask import Flask, render_template

app = Flask(__name__)

@app.get("/workspace")
def workspace():
    return render_template("workspace.html")` }] },
    { id: 'mcp-ui', name: 'MCP UI server', group: 'Embedded UI',
      description: 'Place both downloadable assets beside server.mjs. The server registers a tool and inlines those files into one MCP Apps UI resource.',
      source: 'https://github.com/MCP-UI-Org/mcp-ui#core-concepts',
      files: [{ name: 'Shell', code: 'npm install @mcp-ui/server @modelcontextprotocol/sdk @modelcontextprotocol/ext-apps' },
        { name: 'workspace-view.html', code: staticTemplate },
        { name: 'server.mjs', code: `import { readFile } from 'node:fs/promises';
import { createUIResource } from '@mcp-ui/server';
import { registerAppResource, registerAppTool } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const local = (file) => readFile(new URL(file, import.meta.url), 'utf8');
const [view, css, runtime] = await Promise.all([
  local('./workspace-view.html'),
  local('./utkristi-ui.css'),
  local('./utkristi-dom.js'),
]);
const html = view
  .replace('<link rel="stylesheet" href="/utkristi/utkristi-ui.css">', () => '<style>' + css + '</style>')
  .replace('<script src="/utkristi/utkristi-dom.js" defer></script>', () => '<script>' + runtime + '</script>');
const server = new McpServer({ name: 'utkristi-workspace', version: '1.0.0' });
const uri = 'ui://utkristi/workspace.html';
const viewResource = await createUIResource({ uri, content: { type: 'rawHtml', htmlString: html }, encoding: 'text' });

registerAppResource(server, 'Workspace view', uri, {}, async () => ({ contents: [viewResource.resource] }));
registerAppTool(server, 'show_workspace', {
  description: 'Show the workspace details panel.',
  inputSchema: {},
  _meta: { ui: { resourceUri: uri } },
}, async () => ({ content: [{ type: 'text', text: 'Workspace details are ready.' }] }));

await server.connect(new StdioServerTransport());` }] },
  ];
}
