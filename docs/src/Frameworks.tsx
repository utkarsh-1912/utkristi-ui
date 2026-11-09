import { useEffect, useId, useRef } from 'react';
import { Tabs } from '@utkristi/ui';
import { initUI } from '../../src/react/dom';
import { CopyCode } from './CopyCode';

const markup = `<section data-theme="dark" data-ut-preset="ledger">
  <button type="button" class="btn btn-solid"
    data-ut-open-dialog="workspace-details">Workspace details</button>
  <dialog class="modal ut-native-dialog" id="workspace-details"
    aria-labelledby="workspace-title">
    <header class="modal-head">
      <h2 class="modal-title" id="workspace-title">Workspace details</h2>
    </header>
    <div class="modal-body">Shared release and review settings.</div>
    <form method="dialog" class="modal-foot">
      <button class="btn btn-solid" autofocus>Done</button>
    </form>
  </dialog>
</section>`;

const vanilla = `import '@utkristi/ui/utkristi-ui.css';
import { initDialogs } from '@utkristi/ui/dom';

const dispose = initDialogs(document);
// Call dispose() when unmounting this page in a client-side router.`;

const nativeTabs = `<div role="tablist" class="tabs" aria-label="Workspace views" data-ut-tabs>
  <button type="button" class="tab" role="tab" id="summary-tab"
    aria-controls="summary-panel" aria-selected="true">Summary</button>
  <button type="button" class="tab" role="tab" id="history-tab"
    aria-controls="history-panel" aria-selected="false" tabindex="-1">History</button>
</div>
<div class="tab-panel" role="tabpanel" id="summary-panel" aria-labelledby="summary-tab" tabindex="0">
  Current release and review settings.
</div>
<div class="tab-panel" role="tabpanel" id="history-panel" aria-labelledby="history-tab" tabindex="0" hidden>
  Previously completed reviews.
</div>`;

const vue = `<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { initDialogs } from '@utkristi/ui/dom';
import '@utkristi/ui/utkristi-ui.css';

const root = ref(null);
let dispose;
onMounted(() => { dispose = initDialogs(root.value); });
onBeforeUnmount(() => dispose?.());
</script>

<template>
${markup.replace('<section ', '<section ref="root" ')}
</template>`;

const svelte = `<script>
  import { onMount } from 'svelte';
  import { initDialogs } from '@utkristi/ui/dom';
  import '@utkristi/ui/utkristi-ui.css';

  let root;
  onMount(() => initDialogs(root));
</script>

${markup.replace('<section ', '<section bind:this={root} ').replace(' autofocus', '')}`;

const angular = [
  "import { AfterViewInit, Component, DestroyRef, ElementRef, inject } from '@angular/core';",
  "import { initDialogs } from '@utkristi/ui/dom';",
  '',
  '@Component({',
  "  selector: 'app-workspace-details',",
  '  standalone: true,',
  '  template: `' + markup + '`,',
  '})',
  'export class WorkspaceDetails implements AfterViewInit {',
  '  private readonly host = inject(ElementRef<HTMLElement>);',
  '  private readonly destroy = inject(DestroyRef);',
  '',
  '  ngAfterViewInit() {',
  "    if (typeof document === 'undefined') return;",
  '    this.destroy.onDestroy(initDialogs(this.host.nativeElement));',
  '  }',
  '}',
].join('\n');

const react = `import { useState } from 'react';
import { Button, Dialog } from '@utkristi/ui';
import '@utkristi/ui/utkristi-ui.css';

export function WorkspaceDetails() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Workspace details</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Workspace details"
        footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
        Shared release and review settings.
      </Dialog>
    </>
  );
}`;

export default function Frameworks() {
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (root.current) return initUI(root.current);
  }, []);

  return <article className="doc-article">
    <header className="doc-title"><span className="label">Integration guide</span>
      <h1 className="display display-xl">Frameworks</h1>
      <p className="lede">Use the same stylesheet, themes, and HTML classes across projects.</p>
    </header>
    <CopyCode text="npm install @utkristi/ui" language="Shell" />
    <h2>Portable components</h2>
    <p>CSS components work in server-rendered pages and client apps. The DOM entry point connects native dialogs and tabs, including controls rendered after initialization.</p>
    <div ref={root} className="card card-body" data-ut-preset="ledger">
      <div><button type="button" className="btn btn-solid" data-ut-open-dialog={id}>Workspace details</button></div>
      <dialog id={id} aria-labelledby={id + '-title'} className="modal ut-native-dialog">
        <header className="modal-head"><h3 className="modal-title" id={id + '-title'}>Workspace details</h3></header>
        <div className="modal-body">Shared release and review settings.</div>
        <form method="dialog" className="modal-foot"><button className="btn btn-solid">Done</button></form>
      </dialog>
      <div role="tablist" className="tabs" aria-label="Portable workspace views" data-ut-tabs>
        <button type="button" className="tab" role="tab" id={id + '-summary-tab'} aria-controls={id + '-summary'} aria-selected="true">Summary</button>
        <button type="button" className="tab" role="tab" id={id + '-history-tab'} aria-controls={id + '-history'} aria-selected="false" tabIndex={-1}>History</button>
      </div>
      <div role="tabpanel" className="tab-panel" id={id + '-summary'} aria-labelledby={id + '-summary-tab'} tabIndex={0}>
        Current release and review settings.
      </div>
      <div role="tabpanel" className="tab-panel" id={id + '-history'} aria-labelledby={id + '-history-tab'} tabIndex={0} hidden>
        Previously completed reviews.
      </div>
    </div>
    <h2>Copy an integration</h2>
    <p>React has the complete component API. Vue, Svelte, Angular, and HTML use the same CSS and native dialog behavior. Use the example ID once per page or give each instance its own IDs.</p>
    <Tabs label="Framework examples" items={[
      { id: 'html', label: 'HTML + JS', content: <><CopyCode text={markup} language="HTML" /><CopyCode text={vanilla} language="JavaScript" /></> },
      { id: 'vue', label: 'Vue', content: <CopyCode text={vue} language="WorkspaceDetails.vue" /> },
      { id: 'svelte', label: 'Svelte', content: <CopyCode text={svelte} language="WorkspaceDetails.svelte" /> },
      { id: 'angular', label: 'Angular', content: <><p>Import <code>@utkristi/ui/utkristi-ui.css</code> in the global stylesheet.</p>
        <CopyCode text={angular} language="workspace-details.ts" /></> },
      { id: 'react', label: 'React', content: <CopyCode text={react} language="WorkspaceDetails.tsx" /> },
    ]} />
    <h2>Portable tabs</h2>
    <p>Add this markup within the mounted region and call <code>initUI(root)</code> in place of <code>initDialogs(root)</code>.
      Tabs support arrow keys, Home, and End.</p>
    <CopyCode text={nativeTabs} language="HTML" />
  </article>;
}
