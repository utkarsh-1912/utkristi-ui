import { useEffect, useState } from 'react';

interface VerificationReport {
  recordedAt: string;
  tests?: { total: number; passed: number; failed: number };
  bundles?: { name: string; bytes: number; budget: number }[];
  benchmark?: string;
}

const base = import.meta.env.BASE_URL;
export default function Verification() {
  const [report, setReport] = useState<VerificationReport | null>();
  useEffect(() => {
    const request = new AbortController();
    void fetch(`${base}verification.json`, { signal: request.signal }).then(async (response) => {
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return null;
      const report = await response.json() as VerificationReport;
      return typeof report.recordedAt === 'string' ? report : null;
    }).then(setReport).catch(() => { if (!request.signal.aborted) setReport(null); });
    return () => request.abort();
  }, []);
  const support = [
    ['View Transitions', typeof document.startViewTransition === 'function'],
    ['Native dialogs', typeof globalThis.HTMLDialogElement?.prototype.showModal === 'function'],
    ['Native popovers and anchor positioning', typeof HTMLElement.prototype.showPopover === 'function' &&
      Boolean(window.CSS?.supports('position-area: block-end span-inline-end'))],
    ['Scroll-driven enter animations', Boolean(window.CSS?.supports('animation-timeline: view()'))],
  ] as const;
  return <article className="doc-article">
    <h1>Verification status</h1>
    <h2>CI results</h2>
    {report === undefined ? <p role="status">Loading verification results…</p> :
      report ? <>
        <p>Recorded <time dateTime={report.recordedAt}>{new Date(report.recordedAt).toLocaleDateString()}</time>.</p>
        {report.tests && <p>{report.tests.passed} of {report.tests.total} tests passed. {report.tests.failed} failed.</p>}
        {report.bundles && <ul>{report.bundles.map(({ name, bytes, budget }) =>
          <li key={name}>{name} — {bytes.toLocaleString()} bytes gzipped, {budget.toLocaleString()} byte budget</li>)}</ul>}
        {report.benchmark && <pre className="code">{report.benchmark}</pre>}
      </> : <p>This build has no attached CI verification results.</p>}
    <h2>Support in this browser</h2>
    <ul>{support.map(([feature, supported]) => <li key={feature}>{feature} — {supported ? 'supported' : 'fallback'}</li>)}</ul>
    <h2>Agent reference</h2>
    <ul>
      <li><a className="link" href={`${base}llms.txt`}>Component index</a></li>
      <li><a className="link" href={`${base}llms-full.txt`}>Full reference</a></li>
      <li><a className="link" href={`${base}component-manifest.json`}>Machine-readable manifest</a></li>
    </ul>
  </article>;
}
