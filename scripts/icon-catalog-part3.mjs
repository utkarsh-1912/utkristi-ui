// App glyphs drawn on the Utkristi keyline. Each filled path includes any necessary cutouts.
const box = (x, y, w, h) => `M${x} ${y}h${w}v${h}h-${w}Z`;
const circle = (x, y, r) => `M${x + r} ${y}a${r} ${r} 0 1 1 ${-2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0Z`;
const keyline = 'M5 3h14q2 0 2 2v14q0 2-2 2H5q-2 0-2-2V5q0-2 2-2Z';
const panel = 'M5 4h14q2 0 2 2v12q0 2-2 2H5q-2 0-2-2V6q0-2 2-2Z';

const typography = [
  ['text-bold', 'Apply bold formatting to text.', 'weight typography rich-text', 'M8 4h4.5a4 4 0 0 1 0 8H8m0-8v16h5.5a4 4 0 0 0 0-8H8', 'M6 3h6.4a5 5 0 0 1 3.8 8.2A5.2 5.2 0 0 1 13.8 21H6Zm3.5 3v4h2.8a2 2 0 1 0 0-4Zm0 7v5h3.9a2.5 2.5 0 1 0 0-5Z'],
  ['text-italic', 'Set text in italics.', 'slant typography rich-text', 'M10 4h8M6 20h8m2-16-8 16', 'M9 3h10v2.8h-3L9.7 18.2H15V21H5v-2.8h2.3L13.6 5.8H9Z'],
  ['text-underline', 'Underline the selected text.', 'emphasis typography rich-text', 'M6 4v7a6 6 0 0 0 12 0V4M4 21h16', 'M4.5 3h3.3v8a4.2 4.2 0 0 0 8.4 0V3h3.3v8a7.5 7.5 0 1 1-15 0ZM3 19.5h18V22H3Z'],
  ['text-strikethrough', 'Strike through the selected text.', 'strike delete formatting', 'M17 6q-1-2-5-2-5 0-5 3 0 2 3 3m4 4q4 1 4 3 0 3-6 3-4 0-6-2M3 12h18', 'M17.8 7.7H15q-.7-1.8-3.3-1.8-2.3 0-2.3 1.3 0 .9 1.5 1.4H7q-1-1.1-1-2.3C6 3.8 8.4 3 12 3q4.7 0 5.8 4.7ZM6 16h3q1 2 3.7 2 2.4 0 2.4-1.2 0-1-1.6-1.5H18q.8.9.8 2.2c0 2.6-2.6 3.5-6.1 3.5q-5.3 0-6.7-5ZM3 10.6h18v2.8H3Z'],
  ['align-start', 'Align text to the start of a line.', 'left paragraph layout', 'M4 6h16M4 10h10m-10 4h16M4 18h10', box(3,5,18,2)+box(3,9,11,2)+box(3,13,18,2)+box(3,17,11,2)],
  ['align-center', 'Center text between the margins.', 'paragraph layout justify', 'M4 6h16M7 10h10M4 14h16M7 18h10', box(3,5,18,2)+box(6,9,12,2)+box(3,13,18,2)+box(6,17,12,2)],
  ['align-end', 'Align text to the end of a line.', 'right paragraph layout', 'M4 6h16M10 10h10M4 14h16M10 18h10', box(3,5,18,2)+box(10,9,11,2)+box(3,13,18,2)+box(10,17,11,2)],
  ['align-justify', 'Stretch text across both margins.', 'paragraph layout width', 'M4 6h16M4 10h16M4 14h16M4 18h16', box(3,5,18,2)+box(3,9,18,2)+box(3,13,18,2)+box(3,17,18,2)],
  ['indent-increase', 'Move a paragraph inward.', 'nest list formatting', 'M4 5h16m-9 5h9m-9 4h9M4 19h16M4 9l3 3-3 3', box(3,4,18,2)+box(11,9,10,2)+box(11,13,10,2)+box(3,18,18,2)+'M3 8l5 4-5 4V8Z'],
  ['indent-decrease', 'Move a paragraph outward.', 'outdent list formatting', 'M4 5h16m-9 5h9m-9 4h9M4 19h16M7 9l-3 3 3 3', box(3,4,18,2)+box(11,9,10,2)+box(11,13,10,2)+box(3,18,18,2)+'M8 8l-5 4 5 4V8Z'],
  ['list-numbered', 'Format items as a numbered list.', 'ordered ol sequence', 'M10 6h10m-10 6h10m-10 6h10M4 5l1-1v4m-1 3q3-1 3 1l-3 2h3m-3 3h2l1 1-1 1 1 1-1 1H4', box(9,5,12,2)+box(9,11,12,2)+box(9,17,12,2)+'M3 4l3-1v5H4V5H3Zm0 6h4v3H5v1h2v1H3v-3h2v-1H3Zm0 7h4v5H3v-1h2v-1H4v-1h1v-1H3Z'],
  ['list-checklist', 'Make a list of tasks to complete.', 'todos checklist tasks', 'M4 6l1.7 1.7L8 5m3 1h9M4 12l1.7 1.7L8 11m3 1h9M4 18l1.7 1.7L8 17m3 1h9', box(11,5,10,2)+box(11,11,10,2)+box(11,17,10,2)+'M3 5l2.6 1.5L8 3l1.8 1.5L5.8 9 3 6.9Zm0 6 2.6 1.5L8 9l1.8 1.5-4 4.5L3 12.9Zm0 6 2.6 1.5L8 15l1.8 1.5-4 4.5L3 18.9Z'],
  ['heading-one', 'Use a top-level heading.', 'title h1 typography', 'M4 5v14m8-14v14M4 12h8m4-3 3-3v13', box(3,4,3,16)+box(11,4,3,16)+box(6,10.5,5,3)+'M16 7l3-3h2v16h-3V8l-2 2Z'],
  ['heading-two', 'Use a second-level heading.', 'subtitle h2 typography', 'M4 5v14m8-14v14M4 12h8m3-3a3 3 0 0 1 6 0c0 2-3 4-6 8v2h6', box(3,4,3,16)+box(10,4,3,16)+box(6,10.5,4,3)+'M14.5 9a4 4 0 0 1 8 0q0 2.2-3 5l-2 2.5h5V20h-8v-3.6L18 12q1.6-1.8 1.6-3a1.1 1.1 0 0 0-2.2 0Z'],
  ['highlighter', 'Highlight text with a marker.', 'marker emphasize annotate', 'M5 19h10m-9-3 4-7 5 3-4 7-5-3Zm4-7 2-4 5 3-2 4', 'M6 18.5 12 3l7 4-8 13H4v-1.5Zm6-10.7-.9 1.9 4.2 2.4 1-1.9Z'],
  ['clear-formatting', 'Remove formatting from text.', 'reset clean text editor', 'M4 5h13m-6 0L7 18m-3 0h7m4-3 5 5m0-5-5 5', box(3,4,15,3)+'M11 6h3l-4 12h2v2H3v-2h4.4Zm4 7.5 2.5 2.5 2.5-2.5 1.7 1.7-2.5 2.5 2.5 2.5L20 22l-2.5-2.5L15 22l-1.7-1.8 2.5-2.5-2.5-2.5Z'],
];

const development = [
  ['git-fork', 'Fork a repository into a new workspace.', 'git branch source', 'M6 6v5q0 3 3 3h6q3 0 3-3V6m-6 8v4M4 4h4v3H4zm12 0h4v3h-4zm-6 14h4v3h-4z', box(3,3,6,5)+box(15,3,6,5)+box(9,17,6,5)+'M5 8h2v3q0 2 2 2h6q2 0 2-2V8h2v3q0 4-4 4h-2v2h-2v-2H9q-4 0-4-4Z'],
  ['code-review', 'Review and approve a change.', 'approve diff pull-request', 'M8 6 4 10l4 4m8-8 4 4-4 4m-5 2 3 3 6-5', 'M7.5 4 9 5.8 5 10l4 4.2L7.5 16l-5.5-6 5.5-6ZM16.5 4 22 10l-4 4-1.8-1.5L19 10l-4-4.2L16.5 4Zm-6 11.3 3 2.7 6.8-5.5L22 14.6 13.5 22l-4.8-5Z'],
  ['braces', 'View an object or structured source.', 'json object syntax', 'M9 4H8Q6 4 6 7v2q0 3-2 3 2 0 2 3v2q0 3 2 3h1m6-16h1q2 0 2 3v2q0 3 2 3-2 0-2 3v2q0 3-2 3h-1', 'M9 3v3H8q-1 0-1 2v1q0 2-1 3 1 1 1 3v1q0 2 1 2h1v3H8q-4 0-4-5v-1q0-1.5-2-1.5v-3Q4 10.5 4 9V8q0-5 4-5Zm6 0h1q4 0 4 5v1q0 1.5 2 1.5v3q-2 0-2 1.5v1q0 5-4 5h-1v-3h1q1 0 1-2v-1q0-2 1-3-1-1-1-3V8q0-2-1-2h-1Z'],
  ['regex', 'Match text with a regular expression.', 'pattern match wildcard', 'M5 20h.01M14 4v12m-5-9 10 6m0-6-10 6', circle(5,19,2)+'M13 3h2v6l5.2-3 1 1.8-5.2 3 5.2 3-1 1.8-5.2-3V18h-2v-5.4l-5.2 3-1-1.8 5.2-3-5.2-3 1-1.8 5.2 3Z'],
  ['webhook', 'Send events to a callback URL.', 'endpoint event integration', 'M12 7v5l-5 4m5-4 5 4M9 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM3 18a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm12 0a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z', circle(12,5,3)+circle(6,18,3)+circle(18,18,3)+'M11 8h2v3.4l4.5 3.3-1.3 1.7-4.2-3.1-4.2 3.1-1.3-1.7 4.5-3.3Z'],
  ['deploy', 'Release a build to an environment.', 'release ship publish cloud', 'M7 10a5 5 0 0 1 10-1 4.5 4.5 0 0 1 0 9H7a4 4 0 1 1 0-8Zm5 7v-7m-3 3 3-3 3 3', 'M7 9a5.4 5.4 0 0 1 10.3-1.4A5.6 5.6 0 0 1 17 19H7A5 5 0 1 1 7 9Zm1.4 3.5 1.5 1.5 1.1-1.2V17h2v-4.2l1.1 1.2 1.5-1.5L12 9Z'],
  ['code-test', 'Run a suite of automated checks.', 'test suite qa verify', 'M7 4h10m-8 0v6l-5 8q-1 2 2 2h12q3 0 2-2l-5-8V4M9 15l2 2 4-4', 'M7 3h10v2h-1v4.7l5 8.1q1.6 3.2-2 3.2H5q-3.6 0-2-3.2l5-8.1V5H7Zm.8 12.3 3 3 5.4-5.5-1.5-1.5-3.9 4-1.5-1.5Z'],
  ['variable', 'Inspect a variable or parameter.', 'expression input configuration', 'M7 4q-7 8 0 16m10-16q7 8 0 16m-7-11 4 6m0-6-4 6', 'M5.7 3 8 4.5q-6 7.5 0 15L5.7 21q-7-9 0-18Zm12.6 0q7 9 0 18L16 19.5q6-7.5 0-15L18.3 3ZM9 8l3 2.5L15 8l1.5 1.5L13.5 12l3 2.5L15 16l-3-2.5L9 16l-1.5-1.5 3-2.5-3-2.5Z'],
  ['diff', 'Compare additions and removals.', 'change patch compare code', 'M5 4h14v16H5zm0 8h14M9 8h6m-3-2v4m-3 6h6', keyline+box(7,7,10,2)+box(11,5,2,2)+box(11,9,2,1.5)+box(5,11.5,14,1)+box(7,15,10,2)],
  ['server-rack', 'View servers and deployments.', 'hosting infrastructure data backend', 'M4 4h16v7H4zm0 9h16v7H4zm3-5h.01m-.01 8h.01m4-8h6m-6 8h6', box(3,3,18,8)+circle(7,7,1)+box(11,6,7,2)+box(3,13,18,8)+circle(7,17,1)+box(11,16,7,2)],
  ['database-search', 'Find a record in a database.', 'sql query storage', 'M16 6c0 2-3 3-6 3S4 8 4 6s3-3 6-3 6 1 6 3v5M4 6v12c0 2 3 3 6 3m-6-9c0 2 3 3 6 3m3 1a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm5 2 3 3', 'M10 2c4 0 7 1.7 7 4v4.5h-2.4Q13 10 10 10 6 10 3 8V6c0-2.3 3-4 7-4ZM3 10q3 2 7 2h2.2A5 5 0 0 0 11 15q-5 0-8-2Zm0 5q3 2 8 2 .2 2 2 4-1.2 1-3 1c-4 0-7-1.7-7-4Zm13-3a4 4 0 0 1 3.5 6l2.5 2.5L20.5 22 18 19.5a4 4 0 1 1-2-7.5Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'],
  ['file-diff', 'Open a file with tracked changes.', 'patch source comparison', 'M6 3h8l4 4v14H6zm8 0v5h4M9 12h6m-3-2v4m-3 3h6', 'M5 2h10l4 4v16H5Zm9 2v4h3Zm-5 7v2h2v2h2v-2h2v-2h-2V9h-2v2Zm0 6v2h6v-2Z'],
  ['code-compare', 'Compare two versions of source.', 'diff compare revision', 'M7 4v16m10-16v16M7 8h8m-3-3 3 3-3 3m5 5H9m3-3-3 3 3 3', box(5,3,3,18)+box(16,3,3,18)+'M8 7h4V4l4 4-4 4V9H8Zm8 8h-4v-3l-4 4 4 4v-3h4Z'],
  ['database-lock', 'Restrict access to stored data.', 'storage private sql', 'M16 6c0 2-3 3-6 3S4 8 4 6s3-3 6-3 6 1 6 3v5M4 6v12c0 2 3 3 6 3m-6-9c0 2 3 3 6 3m3 1h8v5h-8zm2 0v-2a2 2 0 0 1 4 0v2', 'M10 2c4 0 7 1.7 7 4v3q-2 0-3 2-5 0-11-3V6c0-2.3 3-4 7-4ZM3 10q3 2 8 2h2v2l-1 1q-6 0-9-2Zm0 5q3 2 8 2v4q-6 0-8-3Zm12 0v-1a2 2 0 0 1 4 0v1h2v7h-8v-7Zm1.3 0h1.4v-1a.7.7 0 1 0-1.4 0Z'],
];

const data = [
  ['chart-donut', 'Show proportions as a ring chart.', 'analytics pie metrics', 'M12 3a9 9 0 1 0 9 9h-5a4 4 0 1 1-4-4Zm4 1a8 8 0 0 1 4 4h-4Z', 'M11 2v6a4 4 0 1 0 5 5h6a10 10 0 1 1-11-11Zm3 .2A10 10 0 0 1 21.8 10H14Z'],
  ['chart-area', 'Show cumulative change over time.', 'analytics time series trend', 'M4 5v14h16M7 16l4-5 3 2 5-7v10Z', 'M3 4h2v14h16v3H3Zm4 12 4-6 3 2 6-8v12Z'],
  ['chart-scatter', 'Compare individual data points.', 'analytics scatterplot dot', 'M4 4v16h16M8 15h.01m4-5h.01m4 3h.01m3-7h.01', 'M3 3h2.5v15.5H21V21H3Z'+circle(8,15,1.6)+circle(12,10,1.6)+circle(16,13,1.6)+circle(19,6,1.6)],
  ['chart-bars-horizontal', 'Compare categories with horizontal bars.', 'analytics ranking metrics', 'M4 4v16h16M8 7h7m-7 5h11m-11 5h5', 'M3 3h2v16h16v2H3Z'+box(7,5,9,3)+box(7,10,13,3)+box(7,15,7,3)],
  ['trend-up', 'Indicate an upward trend.', 'increase growth positive', 'm3 17 6-6 4 4 7-9m-6 0h6v6', 'M2 17l7-7 4 4 5-6h-4V5h8v8h-3V9.5l-6 8-4-4-5 5Z'],
  ['trend-down', 'Indicate a downward trend.', 'decrease decline negative', 'm3 7 6 6 4-4 7 9m-6 0h6v-6', 'M2 7l2-2 5 5 4-4 6 8V11h3v8h-8v-3h4l-5-6-4 4Z'],
  ['dashboard-layout', 'Open an overview dashboard.', 'metrics widgets overview', 'M3 4h18v16H3zm0 5h18m-10 0v11', panel+box(6,6,12,2)+box(6,10,4,7)+box(12,10,6,7)],
  ['table-add-row', 'Insert a row into a table.', 'spreadsheet record create', 'M3 4h18v9H3ZM3 8.5h18M12 4v9M9 19h6m-3-3v6', box(2,3,20,11)+box(4.2,5.1,6.7,2.3)+box(13.1,5.1,6.7,2.3)+box(4.2,9.5,6.7,2.3)+box(13.1,9.5,6.7,2.3)+'M11 16h2v2h2v2h-2v2h-2v-2H9v-2h2Z'],
  ['table-add-column', 'Insert a column into a table.', 'spreadsheet field create', 'M4 3h9v18H4ZM8.5 3v18M4 12h9M16 12h6m-3-3v6', box(3,2,11,20)+box(5.1,4.2,2.3,6.7)+box(9.5,4.2,2.3,6.7)+box(5.1,13.1,2.3,6.7)+box(9.5,13.1,2.3,6.7)+'M18 9h2v2h2v2h-2v2h-2v-2h-2v-2h2Z'],
  ['pivot-table', 'Summarize a table by rows and columns.', 'pivot spreadsheet report', 'M4 4h16v16H4zm0 6h16m-10 0v10m3-5h4m-2-2v4', keyline+box(6,6,12,2)+box(6,10,3,8)+'M13 12h2v2h2v2h-2v2h-2v-2h-2v-2h2Z'],
  ['export-data', 'Export tabular data to a file.', 'download report csv', 'M4 4h16v8M4 4v16h9M4 9h16m-10 0v11m8-5v6m-3-3 3 3 3-3', 'M3 3h18v9h-3v-2h-6v8h1v3H3Zm3 3v2h12V6Zm0 4v8h3v-8Zm11 4h2v4l1.5-1.5L22 18l-4 4-4-4 1.5-1.5L17 18Z'],
  ['filter-off', 'Clear an active filter.', 'remove funnel no-filter', 'M4 5h16l-6 7v5l-4 2v-6L4 5Zm0-2 16 18', 'M2 4h20l-6 7-6-7h6l-2 3 1.5 1.5L18 6H8l6 7v5l-5 3v-8Zm1-2 19 19-1.5 1.5-19-19Z'],
  ['activity-pulse', 'Track changes in live activity.', 'health pulse timeline metrics', 'M3 12h4l3-7 4 14 3-7h4', 'M2 11h4.4L10 2l4.2 14L16.3 11H22v2.6h-4l-4 8.4L9.8 8.7 8 13.6H2Z'],
  ['gauge', 'Show capacity on a dial.', 'speed meter usage', 'M4 18a9 9 0 1 1 16 0H4zm8-3 4-5m-9 5h.01m5-8h.01m5 8h.01', 'M3.2 19a10 10 0 1 1 17.6 0Zm2.4-3h12.8a7 7 0 0 0-12.8 0Zm5 0 5.4-6 1.4 1.4-4.5 5.2Z'],
];

const commerce = [
  ['shopping-cart', 'View items ready for checkout.', 'basket store buy', 'M3 4h2l2 11h11l3-8H6m3 13h.01m8 0h.01', 'M2 3h4l.5 3H22l-3.5 10h-12l-2-11H2Zm5 5 1 5h9l1.8-5Z'+circle(9,20,2)+circle(17,20,2)],
  ['shopping-bag', 'Open a shopping bag or order.', 'checkout store retail', 'M5 8h14l2 13H3zm4 2V6a3 3 0 0 1 6 0v4', 'M4 7h3V6a5 5 0 0 1 10 0v1h3l2 15H2Zm5 0h6V6a3 3 0 0 0-6 0Zm0 2v3h2V9Zm4 0v3h2V9Z'],
  ['storefront', 'Open a shop or vendor page.', 'store retail shop', 'M4 8 6 4h12l2 4v3H4zm1 3v9h14v-9m-9 9v-5h4v5', 'M5 3h14l3 6v3h-2v9H4v-9H2V9Zm1 9v7h3v-5h6v5h3v-7Z'],
  ['receipt', 'Read a receipt or invoice.', 'tax payment billing', 'M6 3h12v18l-3-2-3 2-3-2-3 2zm3 5h6m-6 4h6m-6 4h3', 'M5 2h14v20l-3.5-2-3.5 2-3.5-2L5 22Zm3 4v2h8V6Zm0 4v2h8v-2Zm0 4v2h4v-2Z'],
  ['wallet', 'Manage saved payment methods.', 'money balance cards', 'M3 7a3 3 0 0 1 3-3h12v3m-15 0h18v13H3zm18 5h-6v4h6m-3-2h.01', 'M3 5q0-2 3-2h13v3H5v1h16v4h-6q-2 0-2 2v2q0 2 2 2h6v4H3Zm12 8h6v2h-6Z'],
  ['coins', 'View a balance or credits.', 'currency payment tokens', 'M4 7c0 2 3 3 7 3s7-1 7-3-3-3-7-3-7 1-7 3Zm0 0v8c0 2 3 3 7 3m-7-7c0 2 3 3 7 3m3 3a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z', 'M11 3c4 0 8 1.4 8 4s-4 4-8 4-8-1.4-8-4 4-4 8-4ZM3 10q3 2.5 8 2.5 3 0 5-.8l-1.4 1.7q-1.5 1-3.6 1-5 0-8-1.8Zm0 5q4 2 9 1.8-.2 1.2.4 2.4Q4 20 3 16Zm14.5-2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z'],
  ['bank', 'View a bank account or institution.', 'financial money columns', 'M3 9 12 4l9 5H3Zm2 10h14M7 12v4m5-4v4m5-4v4', 'M12 2.5 22 8v2H2V8Zm-6 9h3v5H6Zm4.5 0h3v5h-3Zm4.5 0h3v5h-3ZM3 18h18v3H3Z'],
  ['price-tag', 'Label an item with a price or tag.', 'commerce label discount', 'M3 5h8l9 9-6 6-9-9V5zm4 3h.01', 'M2 4h9.5L22 14.5 14.5 22 4 11.5V6H2Zm6 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z'],
  ['percent-off', 'Show a percentage discount.', 'sale deal coupon', 'M5 19 19 5M4 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm10 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z', 'M3.5 19 19 3.5 20.5 5 5 20.5Z'+circle(7,7,4)+circle(7,7,1.6)+circle(17,17,4)+circle(17,17,1.6)],
  ['truck', 'Track a shipment or delivery.', 'shipping courier transit', 'M3 6h11v10H3zm11 3h4l3 4v3h-7m-8 3h.01m12 0h.01', 'M2 5h13v3h4l3 4v5h-1.5a3 3 0 0 0-5 0h-7a3 3 0 0 0-5 0H2Zm13 5v4h5v-1l-2.4-3Z'+circle(6,19,2)+circle(18,19,2)],
  ['parcel-check', 'Confirm that a package arrived.', 'shipping delivered order', 'M4 7l8-4 8 4v10l-8 4-8-4Zm0 0 8 4 8-4m-8 4v10m1-7 2 2 3-4', 'M12 2 21 6.5v11L12 22l-9-4.5v-11Zm0 2.4L6.5 7 12 9.8 17.5 7ZM5 9v7l6 3v-7Zm8.3 4.5-1.3 1.4 2.8 2.8 4.2-4.5-1.4-1.3-2.8 3Z'],
  ['barcode', 'Scan a product barcode.', 'sku scanning inventory', 'M4 5v14m3-14v14m4-14v14m3-14v14m3-14v14m3-14v14', box(3,4,2,16)+box(6,4,2,16)+box(10,4,2,16)+box(13,4,1,16)+box(16,4,2,16)+box(20,4,1,16)],
  ['scan-corners', 'Position an object inside a scan area.', 'scanner capture focus', 'M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5m-7-8h8', 'M3 3h7v2H5v5H3Zm11 0h7v7h-2V5h-5ZM3 14h2v5h5v2H3Zm16 0h2v7h-7v-2h5ZM7 11h10v2H7Z'],
  ['refund', 'Return a payment or issue a refund.', 'money return credit', 'M5 10a8 8 0 1 1 1 7M5 5v5h5m2-2v8m-2-6h4m-4 4h4', 'M3 4h2.8v3a9 9 0 1 1-.7 11.2L7.5 17a6.2 6.2 0 1 0 1.7-8H11v2.8H3Zm8 3h2v2h2v2h-4v1h4v4h-2v2h-2v-2H9v-2h4v-1H9V9h2Z'],
];

const communication = [
  ['mail', 'Open messages or send an email.', 'envelope inbox email', 'M4 5h16v14H4zm0 0 8 7 8-7', panel+'M5 6l7 6 7-6v2l-7 6-7-6Z'],
  ['mail-open', 'Read an opened email.', 'inbox read envelope', 'M4 9l8-5 8 5v11H4zm0 0 8 6 8-6', 'M12 3l9 5.7V21H3V8.7Zm0 2.4-6 3.7 6 4.5 6-4.5ZM5 12v7h14v-7l-7 5Z'],
  ['inbox', 'View new incoming work.', 'mail messages notifications', 'M7 5h10l4 9v5H3v-5Zm-4 9h5l2 2h4l2-2h5', 'M6 4h12l4 10v6H2v-6Zm2 2-3 7h4l2 2h2l2-2h4l-3-7Z'],
  ['send', 'Send a message or submission.', 'plane submit email', 'm3 10 18-6-6 16-4-7-8-3zm8 3 10-9', 'M2 9.6 22 3l-6.8 19L11 14l-9-4.4Zm4 .4 5.8 2.3 5.8-5.7Zm7 3.5 2 3.6 3.1-8.3Z'],
  ['reply', 'Reply to a message.', 'respond conversation return', 'M10 5 3 11l7 6v-4h3c4 0 6 2 8 5v-3c0-4-3-6-7-6h-4Z', 'M11 3.5v4.3h3c5 0 8 3 8 7.6v4.8c-2.4-3.8-5.1-6-9.2-6H11v4.3L2.5 11Z'],
  ['reply-all', 'Reply to everyone in a conversation.', 'respond group email', 'M6.5 7 2.5 11l4 4M12 5l-6 6 6 6v-4h2c3.5 0 5.5 2 7.5 5v-3c0-4-3-6-6.5-6h-3Z', 'M5.8 6.4 1.5 11l4.3 4.6 1.4-1.5L4.3 11l2.9-3.1ZM13 3.8v4h2c4.5 0 7 3 7 7.4v4.6c-2.4-3.7-5-5.6-8.3-5.6H13v4l-7.1-7.2Z'],
  ['megaphone', 'Broadcast an announcement.', 'marketing notice audio', 'M4 9h5l9-4v14l-9-4H4zm5 6 2 5m10-9v2', 'M3 8h6l10-4v16L9 16H8l3 5H8l-3-5H3Zm7 2v4l7 3V7Zm10 0h2v4h-2Z'],
  ['video-off', 'Turn off video in a call.', 'camera disabled media', 'M4 6h12v12H4zm12 4 5-3v10l-5-3M3 3l18 18', 'M3 5h14v4l5-3v13l-5-3v3H3Zm-1-1 1.7-1.7 18 18-1.7 1.7Z'],
  ['headphones', 'Listen or open support audio.', 'audio headset support', 'M4 13v-2a8 8 0 0 1 16 0v2m-16 0h4v7H6q-2 0-2-2Zm16 0h-4v7h2q2 0 2-2Z', 'M3 11a9 9 0 0 1 18 0v7a3 3 0 0 1-3 3h-3v-9h3v-1a6 6 0 1 0-12 0v1h3v9H6a3 3 0 0 1-3-3Z'],
  ['volume-up', 'Increase or play sound.', 'speaker loud audio', 'M4 9h4l5-4v14l-5-4H4zm12 0q3 3 0 6m2-8q5 5 0 10', 'M3 8h4l7-5v18l-7-5H3Zm12.4 1 1.6-1.4q4 4.4 0 8.8L15.4 15q3-3 0-6Zm3-2.6L20 5q6 7 0 14l-1.6-1.4q5-5.6 0-11.2Z'],
  ['volume-mute', 'Mute playback or an audio channel.', 'speaker silence audio', 'M4 9h4l5-4v14l-5-4H4zm12 1 4 4m0-4-4 4', 'M3 8h4l7-5v18l-7-5H3Zm12 1 1.5-1.5L19 10l2.5-2.5L23 9l-2.5 2.5L23 14l-1.5 1.5L19 13l-2.5 2.5L15 14l2.5-2.5Z'],
  ['pause', 'Pause an animation or playback.', 'media stop hold', 'M7 5v14m10-14v14', box(5,4,5,16)+box(14,4,5,16)],
  ['skip-next', 'Skip to the next track or item.', 'media forward playback', 'm5 5 11 7-11 7zm13 0v14', 'M4 4v16l13-8Zm14 0h3v16h-3Z'],
  ['skip-previous', 'Return to the previous track or item.', 'media back playback', 'm19 5-11 7 11 7zm-13 0v14', 'M20 4v16L7 12ZM3 4h3v16H3Z'],
];

const devices = [
  ['bluetooth', 'Connect a nearby Bluetooth device.', 'wireless pairing device', 'M12 3v18l5-5-10-8m5-5 5 5-10 8', 'M11 2h1.5l6 6.1-4.8 3.9 4.8 3.9-6 6.1H11v-8l-4.2 3.3-1.3-1.8L10 12 5.5 8.5l1.3-1.8L11 10Zm2 4v3.8l2.2-1.8Zm0 8.2V18l2.2-2Z'],
  ['ethernet', 'Open wired connection settings.', 'network lan connection', 'M4 7h16v10H4zm4 10v3m8-3v3m-8-9h.01m4 0h.01m4 0h.01', box(3,6,18,12)+box(7,10,2,2)+box(11,10,2,2)+box(15,10,2,2)+box(7,18,2,3)+box(15,18,2,3)],
  ['usb', 'Connect or inspect a USB device.', 'port cable peripheral', 'M12 3v17m0-17-2 2m2-2 2 2M7 8v3l5 3m5-4v4l-5 3m3-8h4v3h-4zM5 7h4v3H5z', 'M12 2l4 5h-3v5l3-2h-1V7h5v5h-2v2l-5 3v4h-2v-7l-5-3v-1H4V6h5v4H8l3 2V7H8Z'],
  ['plug', 'Connect a device or integration.', 'power connector cable', 'M9 4v6m6-6v6m-7 0h8v3a4 4 0 0 1-8 0zm4 7v4', 'M8 3h2v6h4V3h2v6h2v4a6 6 0 0 1-5 5.9V22h-2v-3.1A6 6 0 0 1 6 13V9h2Z'],
  ['printer', 'Print a document or label.', 'paper device output', 'M7 9V4h10v5M7 17H4V9h16v8h-3M7 14h10v6H7Z', 'M6 3h12v5h3v10h-3v3H6v-3H3V8h3Zm2 2v3h8V5Zm0 10v4h8v-4Z'+circle(17,11,1)],
  ['keyboard', 'Open keyboard options or shortcuts.', 'keys typing shortcut', 'M3 7h18v10H3zm4 3h.01m3 0h.01m4 0h.01m3 0h.01m-8 4h6', 'M3 6h18q1 0 1 1v10q0 1-1 1H3q-1 0-1-1V7q0-1 1-1Z'+box(6,9,2,2)+box(9,9,2,2)+box(13,9,2,2)+box(16,9,2,2)+box(8,13,8,2)],
  ['mouse', 'View pointer or mouse settings.', 'cursor click device', 'M6 10a6 6 0 0 1 12 0v5a6 6 0 0 1-12 0Zm6-6v6', 'M12 3a7 7 0 0 1 7 7v5a7 7 0 1 1-14 0v-5a7 7 0 0 1 7-7Zm-1 2v6h2V5Z'],
  ['chip', 'Represent a processor or hardware module.', 'cpu compute silicon', 'M6 6h12v12H6zm3-3v3m6-3v3m-6 12v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3m-11-4h4v4h-4z', box(5,5,14,14)+box(10,10,4,4)+box(8,2,2,3)+box(14,2,2,3)+box(8,19,2,3)+box(14,19,2,3)+box(2,8,3,2)+box(2,14,3,2)+box(19,8,3,2)+box(19,14,3,2)],
  ['hard-drive', 'Show a local drive or disk.', 'storage hardware backup', 'M4 6h16l1 9H3zm-1 9v4h18v-4m-14 2h.01m4 0h.01', 'M3.5 5h17L22 15v5H2v-5Zm2 2-.8 7h14.6l-.8-7Z'+circle(7,17,1)+circle(11,17,1)],
  ['monitor-play', 'Play a video on a display.', 'screen media playback', 'M3 4h18v13H3zm9 13v4m-4 0h8m-6-13 5 3-5 3Z', 'M2.5 3h19v15H13v2h4v2H7v-2h4v-2H2.5Zm7 4v8l6-4Z'],
  ['battery-charge', 'Show a device charging.', 'energy power battery', 'M3 7h16v10H3zm16 3h2v4h-2m-7-5-3 4h3l-1 3', 'M2 6h18v3h2v6h-2v3H2Zm10 2-5 5h4l-1 3 6-6h-4Z'],
  ['signal-bars', 'Show cellular signal strength.', 'reception mobile network', 'M4 19v-4m5 4v-7m5 7V8m5 11V4', box(3,14,3,6)+box(8,11,3,9)+box(13,7,3,13)+box(18,3,3,17)],
  ['plug-off', 'Show a disconnected integration.', 'unplug power offline', 'M9 5v4m6-4v5m-7 0h8v3a4 4 0 0 1-8 0zm4 7v4M3 3l18 18', 'M8 4h2v5h4V4h2v5h2v4a6 6 0 0 1-5 5.9V22h-2v-3.1A6 6 0 0 1 6 13V9h2ZM2 3.6 3.6 2 22 20.4 20.4 22Z'],
];

const access = [
  ['shield-check', 'Mark an item as protected or verified.', 'security trust safe', 'M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Zm-4 9 3 3 5-6', 'M12 2 3 5.5V11q0 7 9 11 9-4 9-11V5.5Zm-5 10 1.5-1.5 2.5 2.5 4.8-5 1.5 1.5-6.3 6.6Z'],
  ['shield-alert', 'Warn about a security issue.', 'security risk warning', 'M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Zm0 5v5m0 3h.01', 'M12 2 3 5.5V11q0 7 9 11 9-4 9-11V5.5Zm-1 5v6h2V7Z'+circle(12,16,1)],
  ['fingerprint', 'Unlock with a fingerprint.', 'biometric login security', 'M4 12a8 8 0 0 1 16 0m-14 4q1-2 1-4a5 5 0 0 1 10 0q0 4-2 8m-6-2q1-2 1-6a2 2 0 0 1 4 0q0 5-2 8m6-4q1-2 1-4', 'M3 12a9 9 0 1 1 18 0q0 3-1.3 5.4l-1.8-1Q19 14 19 12a7 7 0 0 0-14 0Zm2 4q1-2 1-4a6 6 0 0 1 12 0q0 5-2.4 8.6l-1.7-1.1Q16 16 16 12a4 4 0 1 0-8 0q0 2.5-1.3 5Zm3 2q1-2.2 1-6a3 3 0 1 1 6 0q0 5-2.4 8.8l-1.7-1.1Q13 16 13 12a1 1 0 1 0-2 0q0 4.2-1.2 7Z'],
  ['scan-face', 'Scan a face for verification.', 'biometric camera identity', 'M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4M9 10h.01m6 0h.01m-6 4q3 3 6 0', 'M3 3h6v2H5v4H3Zm12 0h6v6h-2V5h-4ZM3 15h2v4h4v2H3Zm16 0h2v6h-6v-2h4ZM8 13l1.7-.8q2.3 3 4.6 0l1.7.8q-4 6-8 0Z'+circle(9,9.5,1.15)+circle(15,9.5,1.15)],
  ['user-check', 'Approve a person or membership.', 'account verified member', 'M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 20v-2a5 5 0 0 1 10 0v2m2-6 2 2 4-4', circle(8,8,4)+'M2.5 21v-3a5.5 5.5 0 1 1 11 0v3Zm11.7-7 1.5-1.5 1.4 1.4 3.4-3.4L22 12l-4.9 5Z'],
  ['user-off', 'Disable a person’s access.', 'account block member', 'M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 20v-2a5 5 0 0 1 10 0v2m3-7 5 5m0-5-5 5', circle(8,8,4)+'M2.5 21v-3a5.5 5.5 0 1 1 11 0v3Zm12-8.2 1.4-1.4 2.1 2.1 2.1-2.1 1.4 1.4-2.1 2.1 2.1 2.1-1.4 1.4-2.1-2.1-2.1 2.1-1.4-1.4 2.1-2.1Z'],
  ['badge-verified', 'Show a verified profile or item.', 'check seal trust', 'M12 3l3 2 4 .5.5 4L22 12l-2.5 2.5-.5 4-4 .5-3 2-3-2-4-.5-.5-4L2 12l2.5-2.5.5-4L9 5Zm-3 9 2 2 4-4', 'M12 2l3.3 2.2 4.6.6.6 4.4L23 12l-2.5 2.8-.6 4.4-4.6.6L12 22l-3.3-2.2-4.6-.6-.6-4.4L1 12l2.5-2.8.6-4.4 4.6-.6Zm-4 10 3 3.2 5.2-5.3-1.4-1.4-3.8 3.8-1.6-1.7Z'],
  ['key-round', 'Manage an access key.', 'credentials login token', 'M7 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm3 7 8 8 3-3m-6 0 2-2', 'M7 3a5 5 0 0 1 4.7 6.7L22 20l-2 2-3-3-2 2-2-2 2-2-5.3-5.3A5 5 0 1 1 7 3Zm0 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'],
  ['id-card', 'View a user identity card.', 'profile badge credentials', 'M3 5h18v14H3zm7 7a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm-5 5q3-4 6 0m2-7h5m-5 4h5', panel+circle(8,10.5,2)+box(13,9,5,2)+box(13,13,5,2)+'M5 17q3-5 6 0Z'],
  ['accessibility', 'Open accessibility preferences.', 'a11y assist universal', 'M12 4h.01M4 9l8 2 8-2m-8 2v4m0 0-4 6m4-6 4 6', circle(12,4,2)+'M3 8l9 2 9-2 .5 2-7.8 2v3.3l3.9 5.4-2 1.4-3.6-5-3.6 5-2-1.4 3.9-5.4V12l-7.8-2Z'],
  ['eye-scan', 'Inspect a visual target or scan result.', 'vision focus accessibility', 'M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4M6 12q6-7 12 0-6 7-12 0Zm6 0h.01', 'M3 3h6v2H5v4H3Zm12 0h6v6h-2V5h-4ZM3 15h2v4h4v2H3Zm16 0h2v6h-6v-2h4ZM4.5 12Q12 3 19.5 12 12 21 4.5 12Z'+circle(12,12,2)],
  ['keyboard-focus', 'Show a focus target for keyboard users.', 'a11y focus target interaction', 'M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4m-7-7h6v5H9z', 'M3 3h6v2H5v4H3Zm12 0h6v6h-2V5h-4ZM3 15h2v4h4v2H3Zm16 0h2v6h-6v-2h4ZM8 9h8v6H8Zm2 2v2h4v-2Z'],
];

const layout = [
  ['sidebar-left', 'Toggle a sidebar at the start edge.', 'navigation panel layout', 'M3 4h18v16H3zm6 0v16', panel+box(5,6,3,12)+box(11,6,8,12)],
  ['sidebar-right', 'Toggle a sidebar at the end edge.', 'navigation panel layout', 'M3 4h18v16H3zm12 0v16', panel+box(5,6,8,12)+box(16,6,3,12)],
  ['panel-top', 'Open a panel above the content.', 'layout header region', 'M3 4h18v16H3zm0 6h18', panel+box(5,6,14,3)+box(5,12,14,6)],
  ['panel-bottom', 'Open a panel below the content.', 'layout footer region', 'M3 4h18v16H3zm0 10h18', panel+box(5,6,14,6)+box(5,15,14,3)],
  ['columns-two', 'Arrange content in two columns.', 'layout split grid', 'M3 5h18v14H3zm9 0v14', panel+box(5,6,6,12)+box(13,6,6,12)],
  ['columns-three', 'Arrange content in three columns.', 'layout split grid', 'M3 5h18v14H3zm6 0v14m6-14v14', panel+box(5,6,3,12)+box(10,6,4,12)+box(16,6,3,12)],
  ['fullscreen', 'Expand content to the full viewport.', 'maximize media screen', 'M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5', 'M3 3h7v2H5v5H3Zm11 0h7v7h-2V5h-5ZM3 14h2v5h5v2H3Zm16 0h2v7h-7v-2h5Z'],
  ['fullscreen-exit', 'Return content to its normal size.', 'minimize screen media', 'M4 9h5V4m11 5h-5V4M9 20v-5H4m11 5v-5h5', 'M7 3h3v7H3V7h4Zm7 0h3v4h4v3h-7ZM3 14h7v7H7v-4H3Zm11 0h7v3h-4v4h-3Z'],
  ['window-stack', 'Switch between overlapping windows.', 'browser layers layout', 'M3 8h14v12H3zm4-4h14v12h-4', 'M6 3h16v14h-4v-2h2V5H6Zm-4 4h16v14H2Zm2 2v10h12V9Z'],
  ['split-view', 'Show two panes side by side.', 'editor compare resize', 'M3 4h18v16H3zm9 0v16M6 8h3m6 0h3', panel+box(5,6,6,12)+box(13,6,6,12)+box(6,7,4,2)+box(14,7,4,2)],
  ['expand-all', 'Open all sections of a list.', 'accordion unfold expand', 'M4 5h16M4 12h16M4 19h16m-9-3 2 2 2-2m-4-7 2 2 2-2', box(3,4,18,2)+box(3,11,18,2)+box(3,19,18,2)+'M9 7h2l1 1.2L13 7h2l-3 3Zm0 7h2l1 1.2 1-1.2h2l-3 3Z'],
  ['collapse-all', 'Close all sections of a list.', 'accordion fold collapse', 'M4 5h16M4 12h16M4 19h16m-9-2 2-2 2 2m-4-7 2-2 2 2', box(3,4,18,2)+box(3,11,18,2)+box(3,19,18,2)+'M9 10l3-3 3 3h-2l-1-1.2-1 1.2Zm0 7 3-3 3 3h-2l-1-1.2-1 1.2Z'],
];

const places = [
  ['map-pin', 'Show a location on a map.', 'location address marker', 'M12 3a6 6 0 0 0-6 6c0 4 6 11 6 11s6-7 6-11a6 6 0 0 0-6-6Zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z', 'M12 2a7 7 0 0 1 7 7c0 4.3-7 13-7 13S5 13.3 5 9a7 7 0 0 1 7-7Z'+circle(12,9,2.75)],
  ['map-route', 'Show a route between places.', 'directions navigation path', 'M5 5h3v3H5zm11 11h3v3h-3zM8 6.5h7a3 3 0 0 1 0 6H9a2.5 2.5 0 0 0 0 5h7', box(3,4,6,5)+box(15,15,6,6)+'M9 5.5h6a4 4 0 0 1 0 8H9a1.5 1.5 0 0 0 0 3h6v2H9a3.5 3.5 0 0 1 0-7h6a2 2 0 0 0 0-4H9Z'],
  ['compass', 'Orient a map or find a bearing.', 'navigation direction north', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm4 5-2 6-6 2 2-6Z', circle(12,12,10)+circle(12,12,8)+'M17 7l-2.4 7.6L7 17l2.4-7.6Z'],
  ['navigation-pointer', 'Point toward a destination.', 'directions gps cursor', 'm4 11 16-7-7 16-2-7Z', 'M2.5 10.5 22 2l-8.5 19.5-3-7.5Zm5 0 4.5 1.7 1.5 4.4 4.3-10.2Z'],
  ['building', 'View an organization or office.', 'company workplace address', 'M5 21V5h9v16m0-11h5v11M3 21h18M8 8h3m-3 4h3m-3 4h3', 'M4 4h11v5h5v11h2v2H2v-2h2Zm3 3v2h5V7Zm0 4v2h5v-2Zm0 4v2h5v-2Zm9-3v2h2v-2Z'],
  ['warehouse', 'View a warehouse or fulfillment center.', 'storage inventory shipping', 'M3 20V9l9-5 9 5v11H3Zm4 0v-8h10v8m-10-4h10', 'M12 3l10 5.6V21h-5v-9H7v9H2V8.6Zm-3 11h6v2H9Zm0 4h6v3H9Z'],
  ['car', 'Use driving directions or track a vehicle.', 'transport route trip', 'm5 11 2-5h10l2 5M4 11h16v6H4zm2 6v3m12-3v3m-11-6h.01m10 0h.01', 'M4 10 6 5h12l2 5h1v8h-2v3h-2v-3H7v3H5v-3H3v-8Zm2.2 0h11.6l-1.2-3H7.4Z'+circle(7,14,1)+circle(17,14,1)],
  ['train', 'Use rail directions or track a train.', 'transit travel transport', 'M7 4h10q2 0 2 2v9q0 2-2 2H7q-2 0-2-2V6q0-2 2-2Zm-2 8h14m-10 5-3 4m9-4 3 4m-10-6h.01m8 0h.01', 'M7 3h10q3 0 3 3v9q0 2.6-2.5 3l2 3h-3l-2-3h-5l-2 3h-3l2-3Q4 17.6 4 15V6q0-3 3-3Zm0 3v5h10V6Z'+circle(8,14.5,1)+circle(16,14.5,1)],
  ['bus', 'Use bus directions or track a shuttle.', 'transit travel transport', 'M6 4h12q2 0 2 2v12H4V6q0-2 2-2ZM4 12h16M7 18v3m10-3v3m-9-6h.01m8 0h.01', 'M6 3h12q3 0 3 3v13h-3v3h-2v-3H8v3H6v-3H3V6q0-3 3-3Zm0 3v5h12V6Z'+circle(7,15,1.2)+circle(17,15,1.2)],
  ['bike', 'Use cycling directions or track a ride.', 'transport bicycle route', 'M3 16a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm10 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm-6 0 4-7h4l2 7m-6-7-2-3h3m3 3 1-4h3', circle(7,16,5)+circle(7,16,3)+circle(17,16,5)+circle(17,16,3)+'M7 15l4-7h3l1-4h5v2h-3l-1 3 2 6-2 .7-1.9-5.7H12l-3.3 6Zm1-10h5v2H8Z'],
  ['flag', 'Flag an item or mark a waypoint.', 'report milestone navigation', 'M5 21V4q4-2 7 1t7 1v9q-4 2-7-1t-7-1', 'M4 3q5-2 8 1t8 1v11q-5 2-8-1t-6-1v8H4Z'],
  ['signpost', 'Show a route direction or destination.', 'navigation wayfinding', 'M12 3v18M5 6h12l4 3-4 3H5zm14 8H8l-4 3 4 3h11z', 'M11 2h2v3h4l5 4-5 4h-4v1h7v7h-7v1h-2v-1H8l-6-4 6-3h3v-1H4V5h7Z'],
];

const catalog = [
  ['Text formatting', typography], ['Code', development], ['Data and analytics', data],
  ['Commerce and account', commerce], ['Communication and media', communication],
  ['Device and system', devices], ['Accessibility and security', access], ['Layout and views', layout], ['Places and transport', places],
];

export const iconsPart3 = catalog.flatMap(([group, entries]) => entries.map(([name, description, tags, line, filled]) => ({
  name, group, description, keywords: tags.split(' '), has3d: false, plate: filled, line, filled,
})));
