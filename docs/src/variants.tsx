import { useState } from 'react';
import { Accordion, Alert, Button, Dialog, FileDropzone, Gallery, Icon, Progress } from '@utkristi/ui';
import type { Example } from './examples';

function DropzoneExample() {
  const [files, setFiles] = useState<File[]>([]);
  return <>
    <FileDropzone multiple onFiles={setFiles} />
    <p role="status">{files.length ? `${files.length} ${files.length === 1 ? 'file' : 'files'} selected` : 'No files selected'}</p>
    {files.length > 0 && <ul style={{ overflowWrap: 'anywhere' }}>{files.map((file, index) => <li key={index}>{file.name}</li>)}</ul>}
  </>;
}

const artwork = [
  { id: 'design', name: 'Brand identity', icon: 'palette' },
  { id: 'library', name: 'Component library', icon: 'layers' },
  { id: 'launch', name: 'Release artwork', icon: 'rocket' },
] as const;

function GalleryLightbox() {
  const [active, setActive] = useState<number>();
  const item = active === undefined ? undefined : artwork[active];
  return <>
    <Gallery columns={3}>{artwork.map(({ id, name, icon }, index) => <Button key={id} variant="ghost" block
      style={{ display: 'grid', justifyItems: 'center', minHeight: 100, whiteSpace: 'normal' }} onClick={() => setActive(index)}>
      <Icon name={icon} size={32} />{name}
    </Button>)}</Gallery>
    <Dialog title={item?.name} open={item !== undefined} onClose={() => setActive(undefined)} footer={<>
      <Button variant="ghost" onClick={() => setActive((index) => ((index ?? 0) + artwork.length - 1) % artwork.length)}>Previous</Button>
      <Button variant="ghost" onClick={() => setActive((index) => ((index ?? 0) + 1) % artwork.length)}>Next</Button>
    </>}>
      {item && <div style={{ textAlign: 'center', paddingBlock: 36 }}><Icon name={item.icon} size={96} /></div>}
    </Dialog>
  </>;
}

export const variants = {
  'accordion-panel': { name: 'Panel with multiple sections', description: 'Give the accordion a surface and allow multiple sections to stay open.',
    preview: () => <Accordion appearance="panel" multiple defaultValue={['billing']} items={[
      { id: 'billing', label: 'Billing', content: 'Invoices are issued on the first of each month.' },
      { id: 'members', label: 'Team access', content: 'Admins can invite teammates from settings.' },
    ]} />, jsx: '', html: '<div class="accordion accordion-panel"><details open><summary>Billing</summary>Invoices are issued on the first of each month.</details><details><summary>Team access</summary>Admins can invite teammates from settings.</details></div>' },
  'file-dropzone': { name: 'Drag and drop', description: 'Select files with the native picker or drop them onto the target.',
    preview: DropzoneExample, jsx: '', html: '<div class="file-dropzone"><label>Choose files <input class="file-input" type="file" multiple></label></div>' },
  'gallery-lightbox': { name: 'Gallery with lightbox', description: 'Open a preview and move between items without leaving the gallery.',
    preview: GalleryLightbox, jsx: '', html: '<div class="media-gallery" data-columns="3"><figure><figcaption>Brand identity</figcaption></figure><figure><figcaption>Component library</figcaption></figure></div>' },
  'alert-statuses': { name: 'Status and actions', description: 'Use different tones and offer a next step inside an alert.',
    preview: () => <div style={{ display: 'grid', gap: 10 }}><Alert title="Changes saved" tone="ok">Your workspace is up to date.</Alert>
      <Alert title="Storage almost full" tone="warn">Review your files before the next upload.</Alert>
      <Alert title="Upload failed" tone="bad">The connection dropped. Try again when you’re online.</Alert></div>, jsx: '',
    html: '<div class="alert" data-tone="ok" role="status"><strong>Changes saved</strong><div class="alert-description">Your workspace is up to date.</div></div>' },
  'button-states': { name: 'Loading and disabled', description: 'Show progress while an action runs and mark actions that are unavailable.',
    preview: () => <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><Button loading>Saving</Button><Button disabled variant="ghost">Publish</Button><Button variant="danger">Delete draft</Button></div>, jsx: '',
    html: '<button class="btn btn-solid" aria-busy="true" disabled>Saving</button><button class="btn btn-ghost" disabled>Publish</button><button class="btn btn-danger">Delete draft</button>' },
  'progress-labelled': { name: 'Labelled progress', description: 'Pair progress with a task label and a visible percentage.',
    preview: () => <div style={{ display: 'grid', gap: 10 }}><strong>Importing projects</strong><Progress value={64} aria-label="Importing projects" /><span>64% complete</span></div>, jsx: '',
    html: '<label>Importing projects <progress value="64" max="100">64%</progress></label>' },
} satisfies Record<string, Example>;

export const variantSets: Partial<Record<string, (keyof typeof variants)[]>> = {
  accordion: ['accordion-panel'], 'file-input': ['file-dropzone'], gallery: ['gallery-lightbox'],
  alert: ['alert-statuses'], button: ['button-states'], progress: ['progress-labelled'],
};
