import { useEffect, useRef, useState } from 'react';
import {
  AlertDialog, Badge, BulkActionBar, Button, Card, CardBody, ColumnChooser, DataTable, DateRangePicker, Field,
  FilterBar, Select, Sheet, type DataColumn, type DataTableRemote, type DataTableRowKey,
  type DataTableState, type DateRangeValue,
} from '@utkristi/ui';
import type { Example } from './examples';

const projects = Array.from({ length: 120 }, (_, index) => ({
  id: index + 1,
  name: `${['Atlas', 'Meridian', 'Horizon', 'Studio'][index % 4]} ${String(index + 1).padStart(3, '0')}`,
  team: ['Design', 'Engineering', 'Operations'][index % 3],
  status: index % 5 === 0 ? 'Paused' : 'Active',
}));
const projectColumns: DataColumn<typeof projects[number]>[] = [
  { key: 'name', header: 'Project', sortable: true },
  { key: 'team', header: 'Team', sortable: true },
  { key: 'status', header: 'Status', sortable: true, render: (row) => <Badge>{row.status}</Badge> },
];
const projectPageSize = 8;

function ProjectWorklist() {
  const [state, setState] = useState<DataTableState>({ query: '', page: 1 });
  const [team, setTeam] = useState('');
  const [mode, setMode] = useState('normal');
  const [failNext, setFailNext] = useState(false);
  const [selected, setSelected] = useState<readonly DataTableRowKey[]>([]);
  const [archived, setArchived] = useState<ReadonlySet<DataTableRowKey>>(() => new Set());
  const [confirming, setConfirming] = useState(false);
  const [detail, setDetail] = useState<typeof projects[number]>();
  const [result, setResult] = useState<{ rows: typeof projects; total: number }>({ rows: [], total: 0 });
  const [status, setStatus] = useState<DataTableRemote['status']>('loading');
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus((previous) => previous === 'loading' ? 'loading' : 'refreshing');
    const timer = window.setTimeout(() => {
      if (controller.signal.aborted) return;
      if (failNext) {
        setStatus('error');
        return;
      }
      const query = state.query.trim().toLowerCase();
      const matching = mode === 'empty' ? [] : projects.filter((row) =>
        !archived.has(row.id) && (!team || row.team === team) &&
        [row.name, row.team, row.status].some((value) => value.toLowerCase().includes(query)));
      const sort = state.sort;
      if (sort?.key === 'name' || sort?.key === 'team' || sort?.key === 'status') {
        const key = sort.key;
        matching.sort((left, right) => left[key].localeCompare(right[key]) * (sort.descending ? -1 : 1));
      }
      const start = (state.page - 1) * projectPageSize;
      setResult({ rows: matching.slice(start, start + projectPageSize), total: matching.length });
      setStatus('idle');
    }, mode === 'slow' ? 1100 : 250);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [state, team, mode, failNext, archived]);

  function filterTeam(value: string) {
    setTeam(value);
    setState((previous) => ({ ...previous, page: 1 }));
  }

  function clearSelection() {
    setSelected([]);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return <Card><CardBody className="worklist-filters">
    <div><span className="label">Operations / Projects</span><h3 ref={heading} tabIndex={-1}>Project worklist</h3>
      <p className="muted">Search 120 simulated records. Requests return one page at a time.</p></div>
    <FilterBar filters={team ? [{ id: 'team', label: team }] : []} onRemove={() => filterTeam('')} onReset={() => filterTeam('')}>
      <Field label="Team"><Select value={team} onChange={(event) => filterTeam(event.currentTarget.value)}>
        <option value="">All teams</option><option>Design</option><option>Engineering</option><option>Operations</option>
      </Select></Field>
      <Field label="Response"><Select value={mode} onChange={(event) => {
        setMode(event.currentTarget.value); setFailNext(false);
        setState((previous) => ({ ...previous, page: 1 }));
      }}><option value="normal">Normal</option><option value="slow">Slow</option><option value="empty">Empty</option></Select></Field>
      <Button variant="ghost" onClick={() => setFailNext(true)} disabled={failNext}>Simulate error</Button>
    </FilterBar>
    <BulkActionBar count={selected.length} onClear={clearSelection}>
      <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>Archive selected</Button>
    </BulkActionBar>
    <DataTable columns={projectColumns} rows={result.rows} getRowKey={(row) => row.id} pageSize={projectPageSize} stack
      searchLabel="Search projects" selection={{ selectedKeys: selected, onSelectionChange: setSelected }}
      onRowClick={setDetail} remote={{ state, onStateChange: setState, totalRows: result.total, status, onRetry: () => setFailNext(false) }} />
    <Sheet open={Boolean(detail)} onClose={() => setDetail(undefined)} title={detail?.name} label="Project details">
      {detail && <dl><dt>Team</dt><dd>{detail.team}</dd><dt>Status</dt><dd>{detail.status}</dd></dl>}
    </Sheet>
    <AlertDialog open={confirming} onClose={() => setConfirming(false)} title="Archive selected projects?"
      description={`${selected.length} projects will be removed from this demo worklist.`} destructive confirmLabel="Archive projects"
      onConfirm={() => {
        setArchived((previous) => new Set([...previous, ...selected]));
        clearSelection(); setConfirming(false);
        setState((previous) => ({ ...previous, page: 1 }));
      }} />
  </CardBody></Card>;
}

const auditEvents = [
  { id: 'AU-104', date: '2026-10-24', event: 'API key rotated', actor: 'Asha Rao', area: 'Security' },
  { id: 'AU-103', date: '2026-10-23', event: 'Policy updated', actor: 'Nora Chen', area: 'Workspace' },
  { id: 'AU-102', date: '2026-10-22', event: 'Invite accepted', actor: 'Mika Laurent', area: 'Access' },
  { id: 'AU-101', date: '2026-10-21', event: 'Role changed', actor: 'Asha Rao', area: 'Access' },
];
const auditColumns = [
  { key: 'event', header: 'Event', label: 'Event', required: true },
  { key: 'date', header: 'Date', label: 'Date', sortValue: (row: typeof auditEvents[number]) => row.date },
  { key: 'actor', header: 'Actor', label: 'Actor' },
  { key: 'area', header: 'Area', label: 'Area' },
];
const auditDefaults = { columns: auditColumns.map(({ key }) => key), range: { start: '', end: '' } };
const auditViewKey = 'utkristi-audit-view';

function readAuditView(): typeof auditDefaults | null {
  try {
    const saved = JSON.parse(localStorage.getItem(auditViewKey) ?? 'null');
    if (saved?.version !== 1 || !Array.isArray(saved.columns)) return null;
    const { start, end } = saved.range ?? {};
    const date = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof start !== 'string' || typeof end !== 'string' ||
      (start && !date.test(start)) || (end && !date.test(end)) || (start && end && start > end)) return null;
    return { range: { start, end },
      columns: auditColumns.filter(({ key, required }) => required || saved.columns.includes(key)).map(({ key }) => key) };
  } catch { return null; }
}

function AuditExplorer() {
  const [saved, setSaved] = useState(readAuditView);
  const [range, setRange] = useState<DateRangeValue>(auditDefaults.range);
  const [columns, setColumns] = useState(auditDefaults.columns);
  const [detail, setDetail] = useState<typeof auditEvents[number]>();
  const [notice, setNotice] = useState('');
  const invalid = Boolean(range.start && range.end && range.start > range.end);
  const filtered = invalid ? auditEvents : auditEvents.filter(({ date }) =>
    (!range.start || date >= range.start) && (!range.end || date <= range.end));

  return <Card><CardBody className="worklist-filters">
    <div><span className="label">Governance / Activity</span><h3>Audit explorer</h3>
      <p className="muted">Review sample events or save your date and column preferences in this browser.</p></div>
    <FilterBar filters={range.start || range.end ? [{ id: 'range', label: `${range.start || 'Any date'} to ${range.end || 'Any date'}` }] : []}
      onRemove={() => setRange(auditDefaults.range)} onReset={() => setRange(auditDefaults.range)}>
      <DateRangePicker value={range} onChange={setRange} />
      <ColumnChooser columns={auditColumns} visible={columns} onChange={setColumns} />
    </FilterBar>
    <div className="worklist-controls">
      <Button variant="ghost" size="sm" disabled={invalid} onClick={() => {
        const view = { columns, range };
        try {
          localStorage.setItem(auditViewKey, JSON.stringify({ version: 1, ...view }));
          setSaved(view);
          setNotice('View saved in this browser.');
        } catch { setNotice('Browser storage is unavailable.'); }
      }}>Save view</Button>
      <Button variant="ghost" size="sm" disabled={!saved} onClick={() => {
        if (!saved) return;
        setRange(saved.range); setColumns(saved.columns); setNotice('Saved view loaded.');
      }}>Load saved view</Button>
      <span role="status" className="muted">{notice}</span>
    </div>
    <DataTable columns={auditColumns.filter(({ key }) => columns.includes(key))} rows={filtered}
      getRowKey={(row) => row.id} stack searchLabel="Search audit events" onRowClick={setDetail} />
    <Sheet open={Boolean(detail)} onClose={() => setDetail(undefined)} title={detail?.event} label="Audit event details">
      {detail && <dl><dt>Event ID</dt><dd>{detail.id}</dd><dt>Actor</dt><dd>{detail.actor}</dd><dt>Date</dt><dd>{detail.date}</dd></dl>}
    </Sheet>
  </CardBody></Card>;
}

const accessMembers = [
  { id: 'asha', name: 'Asha Rao', role: 'Owner', team: 'Design' },
  { id: 'mika', name: 'Mika Laurent', role: 'Editor', team: 'Engineering' },
  { id: 'nora', name: 'Nora Chen', role: 'Viewer', team: 'Operations' },
];
const accessColumns = [
  { key: 'name', header: 'Member' }, { key: 'team', header: 'Team' }, { key: 'role', header: 'Role' },
];

function RolesAndAccess() {
  const [members, setMembers] = useState(accessMembers);
  const [detail, setDetail] = useState<typeof accessMembers[number]>();
  const [notice, setNotice] = useState('');
  return <Card><CardBody className="worklist-filters">
    <div><span className="label">Governance / Members</span><h3>Roles and access</h3>
      <p className="muted">Open a member to review or change their demo role.</p></div>
    <DataTable columns={accessColumns} rows={members} getRowKey={(row) => row.id} stack searchLabel="Search members"
      onRowClick={(row) => { setNotice(''); setDetail(row); }} />
    <span role="status" className="muted">{notice}</span>
    <Sheet open={Boolean(detail)} onClose={() => setDetail(undefined)} title={detail?.name} label="Member access"
      footer={detail && <Button disabled={detail.role === 'Owner'} onClick={() => {
        setMembers((previous) => previous.map((member) => member.id === detail.id ? detail : member));
        setNotice(`Saved ${detail.name} as ${detail.role}.`); setDetail(undefined);
      }}>Save role</Button>}>
      {detail && <Field label="Role" hint={detail.role === 'Owner' ? 'The workspace owner is protected.' : undefined}>
        <Select value={detail.role} disabled={detail.role === 'Owner'}
          onChange={(event) => setDetail({ ...detail, role: event.currentTarget.value })}>
          <option disabled>Owner</option><option>Editor</option><option>Viewer</option>
        </Select>
      </Field>}
    </Sheet>
  </CardBody></Card>;
}

export const worklistBlocks = {
  'project-worklist': { name: 'Project worklist', category: 'Application',
    description: 'A server-style worklist with paging, team filters, persistent selection across pages, and recoverable errors.',
    preview: ProjectWorklist, jsx: '',
    html: '<section class="card"><div class="card-body"><h3>Project worklist</h3><div class="table-wrap"><table class="table"><thead><tr><th scope="col">Project</th><th scope="col">Team</th></tr></thead><tbody><tr><td>Atlas 001</td><td>Design</td></tr></tbody></table></div></div></section>' },
  'audit-explorer': { name: 'Audit explorer', category: 'Application',
    description: 'Filter an activity log by inclusive dates, choose columns, save a view, and open event details.',
    preview: AuditExplorer, jsx: '',
    html: '<fieldset class="worklist-dates"><legend class="field-label">Date range</legend><div class="worklist-controls"><label class="field">Start date<input class="input" type="date"></label><label class="field">End date<input class="input" type="date"></label></div></fieldset>' },
  'roles-and-access': { name: 'Roles and access', category: 'Application',
    description: 'Review workspace members and edit simulated permissions in a detail sheet.',
    preview: RolesAndAccess, jsx: '',
    html: '<section class="card"><div class="card-body"><h3>Member access</h3><label class="field">Role<select class="select"><option>Editor</option><option>Viewer</option></select></label></div></section>' },
} satisfies Record<string, Example & { category: string }>;
