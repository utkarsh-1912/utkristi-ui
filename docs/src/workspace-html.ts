const navigationScript = `
document.querySelectorAll('[data-workspace-demo]').forEach(workspace => {
  workspace.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      workspace.querySelectorAll('[data-view]').forEach(item => {
        if (item === button) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
      workspace.querySelectorAll('[data-panel]').forEach(panel => {
        panel.hidden = panel.dataset.panel !== button.dataset.view;
      });
    });
  });
});
`;

function workspace(title: string, variant: string, tabs: [string, string, string][], script = '') {
  return `<section class="workspace" data-variant="${variant}" data-workspace-demo>
  <header class="workspace-header"><strong>${title}</strong></header>
  <div class="workspace-layout">
    <nav class="workspace-navigation" aria-label="Workspace">
      ${tabs.map(([id, label], index) => `<button type="button" data-view="${id}"${index ? '' : ' aria-current="page"'}>${label}</button>`).join('\n      ')}
    </nav>
    <div class="workspace-content">
      ${tabs.map(([id, label, content], index) => `<section data-panel="${id}" aria-label="${label}"${index ? ' hidden' : ''}>${content}</section>`).join('\n      ')}
    </div>
  </div>
  <footer class="workspace-status">Local sample data</footer>
</section>
<script>
${navigationScript}
${script}
</script>`;
}

export const consoleWorkspaceHtml = workspace('Operations console', 'terminal', [
  ['console', 'Console', `<div role="log" aria-label="Command output" data-output style="max-height:240px;overflow:auto"><p>Type help for available commands.</p></div>
<form data-command-form><label class="field">Command<input class="input" name="command" autocomplete="off"></label><button class="btn btn-solid" type="submit">Run</button></form>`],
  ['services', 'Services', '<ul><li>API gateway — Healthy</li><li>Event worker — Healthy</li><li>Search index — Healthy</li></ul>'],
], `document.querySelectorAll('[data-command-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const input = form.elements.namedItem('command');
    const command = input.value.trim();
    const output = form.closest('[data-workspace-demo]').querySelector('[data-output]');
    if (!command) return;
    if (command === 'clear') output.replaceChildren();
    else {
      const entry = document.createElement('p');
      entry.textContent = '> ' + command + ' — ' + (command === 'help'
        ? 'Commands: help, status, clear'
        : command === 'status' ? 'Build passed. 3 services healthy. Sample data.' : 'Unknown command. Type help.');
      output.append(entry);
      while (output.children.length > 100) output.firstElementChild.remove();
    }
    input.value = '';
  });
});`);

export const studioWorkspaceHtml = workspace('Creative studio', 'studio', [
  ['assets', 'Assets', '<div class="sample-row"><button class="btn btn-ghost" data-asset aria-pressed="true">Brand identity</button><button class="btn btn-ghost" data-asset aria-pressed="false">Launch artwork</button><button class="btn btn-ghost" data-asset aria-pressed="false">Product interface</button></div>'],
  ['inspector', 'Inspector', '<label class="field">Asset name<input class="input" data-asset-name value="Brand identity"></label>'],
], `document.querySelectorAll('[data-asset]').forEach(button => {
  button.addEventListener('click', () => {
    const workspace = button.closest('[data-workspace-demo]');
    workspace.querySelectorAll('[data-asset]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    workspace.querySelector('[data-asset-name]').value = button.textContent;
    workspace.querySelector('.workspace-status').textContent = button.textContent + ' selected';
  });
});
document.querySelectorAll('[data-asset-name]').forEach(input => {
  input.addEventListener('input', () => {
    const workspace = input.closest('[data-workspace-demo]');
    workspace.querySelector('[data-asset][aria-pressed="true"]').textContent = input.value;
    workspace.querySelector('.workspace-status').textContent = input.value + ' selected';
  });
});`);

export const officeWorkspaceHtml = workspace('Team operations', 'office', [
  ['tasks', 'My tasks', '<h3>Today</h3><div style="display:grid;gap:16px"><label><input type="checkbox" class="checkbox" data-task> Review supplier invoice</label><label><input type="checkbox" class="checkbox" data-task> Approve access request</label><label><input type="checkbox" class="checkbox" data-task> Prepare weekly report</label></div>'],
  ['team', 'Team', '<h3>Operations team</h3><p>Asha Rao · Finance</p><p>Nora Chen · Platform</p><p>Mika Laurent · Delivery</p>'],
], `document.querySelectorAll('[data-task]').forEach(input => {
  input.addEventListener('change', () => {
    const workspace = input.closest('[data-workspace-demo]');
    workspace.querySelector('.workspace-status').textContent = workspace.querySelectorAll('[data-task]:checked').length + ' of 3 tasks complete';
  });
});`);
