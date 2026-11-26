export interface IconManifestEntry {
  readonly name: string;
  readonly group: string;
  readonly keywords: readonly string[];
  readonly description: string;
  readonly styles: readonly ('line' | 'filled' | 'duotone')[];
  readonly has3d: boolean;
  readonly hues3d: readonly string[];
}

export const iconManifest: readonly IconManifestEntry[] = [
  {
    "name": "arrow-left",
    "group": "Navigation",
    "keywords": [
      "back",
      "previous",
      "west",
      "left",
      "direction"
    ],
    "description": "Navigate backward or to the previous item.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "arrow-right",
    "group": "Navigation",
    "keywords": [
      "forward",
      "next",
      "east",
      "right",
      "direction"
    ],
    "description": "Proceed forward or to the next item.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "arrow-up",
    "group": "Navigation",
    "keywords": [
      "up",
      "north",
      "top",
      "ascend"
    ],
    "description": "Move upward or return to top.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "arrow-down",
    "group": "Navigation",
    "keywords": [
      "down",
      "south",
      "bottom",
      "descend"
    ],
    "description": "Move downward or jump to bottom.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "arrow-up-right",
    "group": "Navigation",
    "keywords": [
      "northeast",
      "diagonal",
      "launch",
      "open",
      "out"
    ],
    "description": "Open destination in a new context or diagonal jump.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chevron-down",
    "group": "Navigation",
    "keywords": [
      "expand",
      "caret",
      "open",
      "down",
      "select"
    ],
    "description": "Expand section or open dropdown menu.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chevron-up",
    "group": "Navigation",
    "keywords": [
      "collapse",
      "caret",
      "up",
      "fold"
    ],
    "description": "Collapse section or fold disclosure.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chevron-left",
    "group": "Navigation",
    "keywords": [
      "previous",
      "caret",
      "left",
      "back"
    ],
    "description": "Step back one page or slide.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chevron-right",
    "group": "Navigation",
    "keywords": [
      "next",
      "caret",
      "right",
      "forward"
    ],
    "description": "Step forward one page or slide.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "menu",
    "group": "Navigation",
    "keywords": [
      "hamburger",
      "bars",
      "navigation",
      "drawer"
    ],
    "description": "Toggle primary navigation drawer or sheet.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "close",
    "group": "Navigation",
    "keywords": [
      "dismiss",
      "cancel",
      "x",
      "remove",
      "clear"
    ],
    "description": "Dismiss dialog, sheet, toast, or active filter.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "more-horizontal",
    "group": "Navigation",
    "keywords": [
      "ellipsis",
      "dots",
      "more",
      "options",
      "menu"
    ],
    "description": "Reveal overflow actions in a horizontal bar.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "more-vertical",
    "group": "Navigation",
    "keywords": [
      "kebab",
      "dots",
      "more",
      "options",
      "menu"
    ],
    "description": "Reveal overflow actions in a compact vertical stack.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "home",
    "group": "Navigation",
    "keywords": [
      "house",
      "dashboard",
      "start",
      "main",
      "overview"
    ],
    "description": "Return to the workspace home or root overview.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "external",
    "group": "Navigation",
    "keywords": [
      "out",
      "new-tab",
      "window",
      "link",
      "share"
    ],
    "description": "Open resource in an external browser tab or window.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "plus",
    "group": "Actions",
    "keywords": [
      "add",
      "new",
      "create",
      "insert"
    ],
    "description": "Create or add a new item.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "minus",
    "group": "Actions",
    "keywords": [
      "subtract",
      "remove",
      "less",
      "dash"
    ],
    "description": "Remove item, zoom out, or indicate indeterminate state.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "check",
    "group": "Actions",
    "keywords": [
      "done",
      "tick",
      "confirm",
      "approve",
      "complete"
    ],
    "description": "Confirm selection or mark task complete.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "search",
    "group": "Actions",
    "keywords": [
      "find",
      "magnifier",
      "lookup",
      "query",
      "filter"
    ],
    "description": "Find items, files, or commands by query.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "filter",
    "group": "Actions",
    "keywords": [
      "funnel",
      "refine",
      "sieve",
      "criteria"
    ],
    "description": "Narrow results by criteria or attributes.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "sort",
    "group": "Actions",
    "keywords": [
      "order",
      "arrange",
      "rank",
      "arrows"
    ],
    "description": "Order rows or items ascending or descending.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "edit",
    "group": "Actions",
    "keywords": [
      "pencil",
      "write",
      "rename",
      "modify",
      "compose"
    ],
    "description": "Modify text, rename item, or enter editing mode.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "copy",
    "group": "Actions",
    "keywords": [
      "duplicate",
      "clone",
      "clipboard"
    ],
    "description": "Duplicate selection or copy snippet to clipboard.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "paste",
    "group": "Actions",
    "keywords": [
      "clipboard",
      "board",
      "insert"
    ],
    "description": "Insert clipboard contents into the current view.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "trash",
    "group": "Actions",
    "keywords": [
      "delete",
      "remove",
      "bin",
      "garbage",
      "destroy"
    ],
    "description": "Delete item or move to workspace trash.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "undo",
    "group": "Actions",
    "keywords": [
      "revert",
      "back",
      "history",
      "step-back"
    ],
    "description": "Revert the most recent change.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "redo",
    "group": "Actions",
    "keywords": [
      "forward",
      "repeat",
      "step-forward"
    ],
    "description": "Reapply a previously reverted change.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "refresh",
    "group": "Actions",
    "keywords": [
      "reload",
      "sync",
      "rotate",
      "update"
    ],
    "description": "Reload data or synchronize state.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "download",
    "group": "Actions",
    "keywords": [
      "export",
      "save",
      "fetch",
      "down"
    ],
    "description": "Save file or artifact to local storage.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "upload",
    "group": "Actions",
    "keywords": [
      "import",
      "publish",
      "send",
      "up"
    ],
    "description": "Publish local files or assets to the workspace.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "share",
    "group": "Actions",
    "keywords": [
      "send",
      "distribute",
      "nodes",
      "network"
    ],
    "description": "Distribute workspace link or grant access.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "link",
    "group": "Actions",
    "keywords": [
      "url",
      "chain",
      "hyperlink",
      "anchor"
    ],
    "description": "Copy URL or connect two resources.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "pin",
    "group": "Actions",
    "keywords": [
      "thumbtack",
      "stick",
      "keep",
      "attach"
    ],
    "description": "Keep item anchored at the top of a list or board.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "star",
    "group": "Actions",
    "keywords": [
      "favorite",
      "rate",
      "bookmark",
      "featured"
    ],
    "description": "Mark item as favorite or featured.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "heart",
    "group": "Actions",
    "keywords": [
      "like",
      "love",
      "react",
      "appreciate"
    ],
    "description": "React with appreciation or save to liked items.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "bookmark",
    "group": "Actions",
    "keywords": [
      "save",
      "ribbon",
      "read-later",
      "flag"
    ],
    "description": "Save place in documentation or code for later reading.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "info",
    "group": "Status",
    "keywords": [
      "information",
      "details",
      "about",
      "notice"
    ],
    "description": "Display neutral context or helpful guidance.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "warning",
    "group": "Status",
    "keywords": [
      "caution",
      "alert",
      "triangle",
      "exclamation"
    ],
    "description": "Alert user to a potential risk or non-blocking issue.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "error",
    "group": "Status",
    "keywords": [
      "danger",
      "fail",
      "octagon",
      "critical",
      "stop"
    ],
    "description": "Indicate a blocking failure or validation error.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "success",
    "group": "Status",
    "keywords": [
      "ok",
      "verified",
      "passed",
      "check-circle"
    ],
    "description": "Confirm completed operation or healthy check.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "help",
    "group": "Status",
    "keywords": [
      "question",
      "support",
      "faq",
      "assist"
    ],
    "description": "Open contextual documentation or support.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "lock",
    "group": "Status",
    "keywords": [
      "private",
      "secure",
      "padlock",
      "protected"
    ],
    "description": "Indicate private access or protected permission.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "unlock",
    "group": "Status",
    "keywords": [
      "open",
      "public",
      "padlock",
      "unprotected"
    ],
    "description": "Indicate public access or editable state.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "eye",
    "group": "Status",
    "keywords": [
      "view",
      "show",
      "visible",
      "watch",
      "preview"
    ],
    "description": "Preview item or reveal hidden value.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "eye-off",
    "group": "Status",
    "keywords": [
      "hide",
      "hidden",
      "invisible",
      "secret"
    ],
    "description": "Hide sensitive value or mute preview.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "bell",
    "group": "Status",
    "keywords": [
      "notification",
      "alert",
      "ring",
      "inbox"
    ],
    "description": "View workspace notifications and mentions.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "bell-off",
    "group": "Status",
    "keywords": [
      "mute",
      "silent",
      "dnd",
      "quiet"
    ],
    "description": "Silence notifications or enable do-not-disturb.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "clock",
    "group": "Status",
    "keywords": [
      "time",
      "schedule",
      "watch",
      "pending",
      "timer"
    ],
    "description": "Show timestamp, duration, or scheduled run.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "spinner-ring",
    "group": "Status",
    "keywords": [
      "loading",
      "progress",
      "busy",
      "wait"
    ],
    "description": "Indicate background processing or active sync.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "offline",
    "group": "Status",
    "keywords": [
      "disconnected",
      "no-wifi",
      "local",
      "outage"
    ],
    "description": "Show disconnected network or local-only mode.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "sun",
    "group": "Theme and settings",
    "keywords": [
      "light",
      "paper",
      "day",
      "brightness",
      "theme"
    ],
    "description": "Switch to Paper (light) theme.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "moon",
    "group": "Theme and settings",
    "keywords": [
      "dark",
      "night",
      "crescent",
      "theme"
    ],
    "description": "Switch to Night (dark) theme.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "system",
    "group": "Theme and settings",
    "keywords": [
      "auto",
      "os",
      "display",
      "monitor",
      "theme"
    ],
    "description": "Follow operating-system appearance preference.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "palette",
    "group": "Theme and settings",
    "keywords": [
      "color",
      "swatches",
      "hue",
      "paint",
      "design"
    ],
    "description": "Choose custom accent and icon colour hues.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "settings",
    "group": "Theme and settings",
    "keywords": [
      "gear",
      "cog",
      "preferences",
      "options",
      "config"
    ],
    "description": "Configure workspace preferences and system options.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "sliders",
    "group": "Theme and settings",
    "keywords": [
      "controls",
      "faders",
      "equalizer",
      "tune",
      "adjust"
    ],
    "description": "Fine-tune numeric parameters and controls.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "brush",
    "group": "Theme and settings",
    "keywords": [
      "paint",
      "style",
      "format",
      "design",
      "art"
    ],
    "description": "Apply visual styles or format surface appearance.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "glass-sparkle",
    "group": "Theme and settings",
    "keywords": [
      "glass",
      "frosted",
      "translucent",
      "sparkle",
      "theme"
    ],
    "description": "Activate the frosted Glass surface theme.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "room",
    "group": "Collaboration",
    "keywords": [
      "workspace",
      "door",
      "portal",
      "studio",
      "colabs"
    ],
    "description": "Enter a live collaborative CoLabs room.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "project",
    "group": "Collaboration",
    "keywords": [
      "briefcase",
      "workspace",
      "collection",
      "cube"
    ],
    "description": "Organize multi-file workspaces and deliverables.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "snippet",
    "group": "Collaboration",
    "keywords": [
      "code-card",
      "fragment",
      "clip",
      "template"
    ],
    "description": "Save or share a reusable code snippet card.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "invite",
    "group": "Collaboration",
    "keywords": [
      "mail",
      "envelope",
      "send",
      "member"
    ],
    "description": "Send a workspace or room invitation.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "people",
    "group": "Collaboration",
    "keywords": [
      "team",
      "users",
      "members",
      "group",
      "collaborators"
    ],
    "description": "Show active collaborators and team members.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "presence-cursor",
    "group": "Collaboration",
    "keywords": [
      "pointer",
      "mouse",
      "multiplayer",
      "live",
      "collaborator"
    ],
    "description": "Track live multiplayer pointers on the canvas.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chat",
    "group": "Collaboration",
    "keywords": [
      "message",
      "bubble",
      "comment",
      "discuss",
      "conversation"
    ],
    "description": "Open room discussion and message threads.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "call",
    "group": "Collaboration",
    "keywords": [
      "phone",
      "handset",
      "voice",
      "audio",
      "talk"
    ],
    "description": "Start or join a real-time voice call.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "call-leave",
    "group": "Collaboration",
    "keywords": [
      "hangup",
      "end-call",
      "disconnect",
      "phone-off"
    ],
    "description": "Hang up and leave the active voice session.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "mic",
    "group": "Collaboration",
    "keywords": [
      "microphone",
      "voice",
      "record",
      "audio",
      "speak"
    ],
    "description": "Enable microphone audio input.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "mic-off",
    "group": "Collaboration",
    "keywords": [
      "mute",
      "silent",
      "microphone-off"
    ],
    "description": "Mute microphone audio input.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "camera",
    "group": "Collaboration",
    "keywords": [
      "video",
      "webcam",
      "stream",
      "meeting"
    ],
    "description": "Enable video camera stream.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "camera-off",
    "group": "Collaboration",
    "keywords": [
      "video-off",
      "webcam-off",
      "hide-video"
    ],
    "description": "Turn off video camera stream.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "screen-share",
    "group": "Collaboration",
    "keywords": [
      "present",
      "broadcast",
      "display",
      "stream"
    ],
    "description": "Present your display or window to the room.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "whiteboard",
    "group": "Collaboration",
    "keywords": [
      "canvas",
      "draw",
      "board",
      "pen",
      "sketch"
    ],
    "description": "Sketch diagrams and flows together on a shared board.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "ai-spark",
    "group": "Collaboration",
    "keywords": [
      "ai",
      "assistant",
      "magic",
      "sparkle",
      "prompt"
    ],
    "description": "Invoke assistant suggestions inside a conversation.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "analytics",
    "group": "Collaboration",
    "keywords": [
      "metrics",
      "insights",
      "pulse",
      "stats",
      "telemetry"
    ],
    "description": "Inspect room activity, velocity, and performance metrics.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "history",
    "group": "Collaboration",
    "keywords": [
      "timeline",
      "revisions",
      "audit",
      "past",
      "restore"
    ],
    "description": "Browse timeline snapshots and revision logs.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "focus",
    "group": "Collaboration",
    "keywords": [
      "target",
      "crosshair",
      "center",
      "spotlight",
      "follow"
    ],
    "description": "Follow a collaborator or center on active selection.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "command",
    "group": "Collaboration",
    "keywords": [
      "shortcut",
      "hotkey",
      "cmd",
      "palette",
      "keyboard"
    ],
    "description": "Open the quick command palette.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "layers",
    "group": "Collaboration",
    "keywords": [
      "stack",
      "surfaces",
      "planes",
      "depth"
    ],
    "description": "Switch between stacked surfaces or elevation levels.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "code",
    "group": "Code",
    "keywords": [
      "brackets",
      "source",
      "markup",
      "developer",
      "syntax"
    ],
    "description": "View or edit source code.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "terminal",
    "group": "Code",
    "keywords": [
      "shell",
      "console",
      "cli",
      "prompt",
      "bash"
    ],
    "description": "Open interactive shell and command runner.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "run",
    "group": "Code",
    "keywords": [
      "play",
      "execute",
      "start",
      "launch"
    ],
    "description": "Execute current script, test, or sandbox build.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "stop",
    "group": "Code",
    "keywords": [
      "halt",
      "kill",
      "abort",
      "square"
    ],
    "description": "Terminate running process or build.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "bug",
    "group": "Code",
    "keywords": [
      "debug",
      "issue",
      "defect",
      "error",
      "insect"
    ],
    "description": "Inspect runtime issue or file a defect report.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "branch",
    "group": "Code",
    "keywords": [
      "git",
      "fork",
      "version",
      "tree"
    ],
    "description": "Switch or create a version-control branch.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "commit",
    "group": "Code",
    "keywords": [
      "git",
      "node",
      "snapshot",
      "sha"
    ],
    "description": "Record a snapshot in version history.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "merge",
    "group": "Code",
    "keywords": [
      "git",
      "join",
      "combine",
      "integrate"
    ],
    "description": "Combine changes from two branches.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "pull-request",
    "group": "Code",
    "keywords": [
      "pr",
      "review",
      "git",
      "diff"
    ],
    "description": "Propose and review code changes before merging.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "github",
    "group": "Code",
    "keywords": [
      "repo",
      "git",
      "source-control",
      "octocat"
    ],
    "description": "Connect repository hosting and workflows.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "file",
    "group": "Code",
    "keywords": [
      "page",
      "sheet",
      "blank",
      "asset"
    ],
    "description": "Represent a generic workspace file.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "file-code",
    "group": "Code",
    "keywords": [
      "script",
      "tsx",
      "css",
      "module",
      "source-file"
    ],
    "description": "Represent a source code or configuration module.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "folder",
    "group": "Code",
    "keywords": [
      "directory",
      "collection",
      "files",
      "path"
    ],
    "description": "Group files inside a directory.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "folder-open",
    "group": "Code",
    "keywords": [
      "directory",
      "expanded",
      "open",
      "browse"
    ],
    "description": "Show an expanded directory in the file tree.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "add-file",
    "group": "Code",
    "keywords": [
      "new-file",
      "create",
      "document-plus"
    ],
    "description": "Create a new file in the current directory.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "add-folder",
    "group": "Code",
    "keywords": [
      "new-folder",
      "mkdir",
      "directory-plus"
    ],
    "description": "Create a new folder in the workspace tree.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "save",
    "group": "Code",
    "keywords": [
      "disk",
      "floppy",
      "store",
      "write"
    ],
    "description": "Persist current changes to disk or cloud.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "database",
    "group": "Code",
    "keywords": [
      "storage",
      "sql",
      "data",
      "cylinder",
      "store"
    ],
    "description": "Inspect structured storage, tables, and queries.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "api",
    "group": "Code",
    "keywords": [
      "webhook",
      "endpoint",
      "plug",
      "connect",
      "rest"
    ],
    "description": "Configure endpoints, webhooks, and integrations.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "package",
    "group": "Code",
    "keywords": [
      "box",
      "cube",
      "npm",
      "bundle",
      "artifact"
    ],
    "description": "Manage published modules, dependencies, and releases.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "calendar",
    "group": "Content",
    "keywords": [
      "date",
      "month",
      "schedule",
      "event",
      "day"
    ],
    "description": "Pick dates, milestones, and release schedules.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "image",
    "group": "Content",
    "keywords": [
      "photo",
      "picture",
      "media",
      "gallery"
    ],
    "description": "Embed or preview visual artwork and screenshots.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "video",
    "group": "Content",
    "keywords": [
      "film",
      "movie",
      "clip",
      "player"
    ],
    "description": "Play recorded walkthroughs and media clips.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "music",
    "group": "Content",
    "keywords": [
      "audio",
      "sound",
      "note",
      "track"
    ],
    "description": "Attach audio cues or sound tracks.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "document",
    "group": "Content",
    "keywords": [
      "text",
      "article",
      "spec",
      "notes",
      "doc"
    ],
    "description": "Write specifications, guides, and structured prose.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "table",
    "group": "Content",
    "keywords": [
      "grid",
      "spreadsheet",
      "rows",
      "columns",
      "data"
    ],
    "description": "Display structured rows and columns.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chart-bar",
    "group": "Content",
    "keywords": [
      "bars",
      "histogram",
      "graph",
      "comparison"
    ],
    "description": "Compare categorical quantities with vertical bars.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chart-line",
    "group": "Content",
    "keywords": [
      "trend",
      "line-graph",
      "series",
      "plot"
    ],
    "description": "Plot trends and series over time.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "kanban",
    "group": "Content",
    "keywords": [
      "board",
      "columns",
      "cards",
      "tasks",
      "sprint"
    ],
    "description": "Organize work items across board columns.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "list",
    "group": "Content",
    "keywords": [
      "rows",
      "bullets",
      "lines",
      "items"
    ],
    "description": "Display items in a vertical stacked list.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "grid",
    "group": "Content",
    "keywords": [
      "tiles",
      "cards",
      "gallery",
      "matrix"
    ],
    "description": "Display items in a balanced tile gallery.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "quote",
    "group": "Content",
    "keywords": [
      "blockquote",
      "citation",
      "excerpt",
      "speech"
    ],
    "description": "Highlight an excerpt or customer citation.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "user",
    "group": "Commerce and account",
    "keywords": [
      "profile",
      "account",
      "person",
      "avatar",
      "member"
    ],
    "description": "Open personal profile or account settings.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "user-plus",
    "group": "Commerce and account",
    "keywords": [
      "invite-user",
      "add-member",
      "seat",
      "signup"
    ],
    "description": "Add a collaborator or provision a new seat.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "logout",
    "group": "Commerce and account",
    "keywords": [
      "signout",
      "exit",
      "leave"
    ],
    "description": "Sign out of the current session.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "login",
    "group": "Commerce and account",
    "keywords": [
      "signin",
      "enter",
      "auth"
    ],
    "description": "Authenticate into a workspace account.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "key",
    "group": "Commerce and account",
    "keywords": [
      "token",
      "secret",
      "credential",
      "auth",
      "password"
    ],
    "description": "Manage API tokens, SSH keys, and credentials.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "shield",
    "group": "Commerce and account",
    "keywords": [
      "security",
      "protection",
      "guard",
      "sso",
      "verify"
    ],
    "description": "Verify enterprise security, SSO, and audit policies.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "credit-card",
    "group": "Commerce and account",
    "keywords": [
      "billing",
      "payment",
      "plan",
      "subscription"
    ],
    "description": "Configure billing method and workspace subscription.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "gift",
    "group": "Commerce and account",
    "keywords": [
      "reward",
      "present",
      "perk",
      "bonus"
    ],
    "description": "Redeem workspace credits or celebrate a release.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "rocket",
    "group": "Commerce and account",
    "keywords": [
      "launch",
      "deploy",
      "ship",
      "startup",
      "boost"
    ],
    "description": "Deploy production release or quickstart a workspace.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "trophy",
    "group": "Commerce and account",
    "keywords": [
      "award",
      "cup",
      "winner",
      "milestone",
      "champion"
    ],
    "description": "Highlight milestone achievements and benchmarks.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "desktop",
    "group": "Device and system",
    "keywords": [
      "monitor",
      "screen",
      "display",
      "workstation"
    ],
    "description": "Preview layout at full desktop viewport width.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "laptop",
    "group": "Device and system",
    "keywords": [
      "notebook",
      "computer",
      "macbook"
    ],
    "description": "Preview layout on notebook screens.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "phone",
    "group": "Device and system",
    "keywords": [
      "mobile",
      "smartphone",
      "handheld",
      "responsive"
    ],
    "description": "Test responsive layout at 375px mobile width.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "tablet",
    "group": "Device and system",
    "keywords": [
      "ipad",
      "slate",
      "touchscreen"
    ],
    "description": "Preview medium-breakpoint tablet layouts.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "cloud",
    "group": "Device and system",
    "keywords": [
      "sync",
      "remote",
      "hosted",
      "weather",
      "server"
    ],
    "description": "Indicate cloud sync, remote storage, or edge hosting.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "wifi",
    "group": "Device and system",
    "keywords": [
      "network",
      "signal",
      "wireless",
      "online"
    ],
    "description": "Show wireless connection strength.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "battery",
    "group": "Device and system",
    "keywords": [
      "power",
      "charge",
      "energy",
      "capacity"
    ],
    "description": "Display device power or resource quota.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "power",
    "group": "Device and system",
    "keywords": [
      "on-off",
      "switch",
      "shutdown",
      "boot"
    ],
    "description": "Toggle service state or restart sandbox environment.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "globe",
    "group": "Device and system",
    "keywords": [
      "world",
      "earth",
      "international",
      "locale",
      "web"
    ],
    "description": "Select locale, region, or public domain routing.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "utkristi-mark",
    "group": "Brand and social",
    "keywords": [
      "logo",
      "brand",
      "utkristi",
      "mark",
      "ecosystem"
    ],
    "description": "Two rising ribbons and a floating accent tile forming the Utkristi ecosystem mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "x-social",
    "group": "Brand and social",
    "keywords": [
      "twitter",
      "social",
      "post",
      "x"
    ],
    "description": "Link to X (formerly Twitter) profile in neutral ink.",
    "styles": [
      "line"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "linkedin",
    "group": "Brand and social",
    "keywords": [
      "social",
      "network",
      "career",
      "company"
    ],
    "description": "Link to LinkedIn company or member profile in neutral ink.",
    "styles": [
      "line"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "discord",
    "group": "Brand and social",
    "keywords": [
      "community",
      "chat",
      "server",
      "social"
    ],
    "description": "Join community server and developer channels in neutral ink.",
    "styles": [
      "line"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "youtube",
    "group": "Brand and social",
    "keywords": [
      "video",
      "channel",
      "stream",
      "social"
    ],
    "description": "Watch video tutorials and release demos in neutral ink.",
    "styles": [
      "line"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "text-bold",
    "group": "Text formatting",
    "keywords": [
      "weight",
      "typography",
      "rich-text"
    ],
    "description": "Apply bold formatting to text.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "text-italic",
    "group": "Text formatting",
    "keywords": [
      "slant",
      "typography",
      "rich-text"
    ],
    "description": "Set text in italics.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "text-underline",
    "group": "Text formatting",
    "keywords": [
      "emphasis",
      "typography",
      "rich-text"
    ],
    "description": "Underline the selected text.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "text-strikethrough",
    "group": "Text formatting",
    "keywords": [
      "strike",
      "delete",
      "formatting"
    ],
    "description": "Strike through the selected text.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "align-start",
    "group": "Text formatting",
    "keywords": [
      "left",
      "paragraph",
      "layout"
    ],
    "description": "Align text to the start of a line.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "align-center",
    "group": "Text formatting",
    "keywords": [
      "paragraph",
      "layout",
      "justify"
    ],
    "description": "Center text between the margins.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "align-end",
    "group": "Text formatting",
    "keywords": [
      "right",
      "paragraph",
      "layout"
    ],
    "description": "Align text to the end of a line.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "align-justify",
    "group": "Text formatting",
    "keywords": [
      "paragraph",
      "layout",
      "width"
    ],
    "description": "Stretch text across both margins.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "indent-increase",
    "group": "Text formatting",
    "keywords": [
      "nest",
      "list",
      "formatting"
    ],
    "description": "Move a paragraph inward.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "indent-decrease",
    "group": "Text formatting",
    "keywords": [
      "outdent",
      "list",
      "formatting"
    ],
    "description": "Move a paragraph outward.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "list-numbered",
    "group": "Text formatting",
    "keywords": [
      "ordered",
      "ol",
      "sequence"
    ],
    "description": "Format items as a numbered list.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "list-checklist",
    "group": "Text formatting",
    "keywords": [
      "todos",
      "checklist",
      "tasks"
    ],
    "description": "Make a list of tasks to complete.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "heading-one",
    "group": "Text formatting",
    "keywords": [
      "title",
      "h1",
      "typography"
    ],
    "description": "Use a top-level heading.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "heading-two",
    "group": "Text formatting",
    "keywords": [
      "subtitle",
      "h2",
      "typography"
    ],
    "description": "Use a second-level heading.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "highlighter",
    "group": "Text formatting",
    "keywords": [
      "marker",
      "emphasize",
      "annotate"
    ],
    "description": "Highlight text with a marker.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "clear-formatting",
    "group": "Text formatting",
    "keywords": [
      "reset",
      "clean",
      "text",
      "editor"
    ],
    "description": "Remove formatting from text.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "git-fork",
    "group": "Code",
    "keywords": [
      "git",
      "branch",
      "source"
    ],
    "description": "Fork a repository into a new workspace.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "code-review",
    "group": "Code",
    "keywords": [
      "approve",
      "diff",
      "pull-request"
    ],
    "description": "Review and approve a change.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "braces",
    "group": "Code",
    "keywords": [
      "json",
      "object",
      "syntax"
    ],
    "description": "View an object or structured source.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "regex",
    "group": "Code",
    "keywords": [
      "pattern",
      "match",
      "wildcard"
    ],
    "description": "Match text with a regular expression.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "webhook",
    "group": "Code",
    "keywords": [
      "endpoint",
      "event",
      "integration"
    ],
    "description": "Send events to a callback URL.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "deploy",
    "group": "Code",
    "keywords": [
      "release",
      "ship",
      "publish",
      "cloud"
    ],
    "description": "Release a build to an environment.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "code-test",
    "group": "Code",
    "keywords": [
      "test",
      "suite",
      "qa",
      "verify"
    ],
    "description": "Run a suite of automated checks.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "variable",
    "group": "Code",
    "keywords": [
      "expression",
      "input",
      "configuration"
    ],
    "description": "Inspect a variable or parameter.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "diff",
    "group": "Code",
    "keywords": [
      "change",
      "patch",
      "compare",
      "code"
    ],
    "description": "Compare additions and removals.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "server-rack",
    "group": "Code",
    "keywords": [
      "hosting",
      "infrastructure",
      "data",
      "backend"
    ],
    "description": "View servers and deployments.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "database-search",
    "group": "Code",
    "keywords": [
      "sql",
      "query",
      "storage"
    ],
    "description": "Find a record in a database.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "file-diff",
    "group": "Code",
    "keywords": [
      "patch",
      "source",
      "comparison"
    ],
    "description": "Open a file with tracked changes.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "code-compare",
    "group": "Code",
    "keywords": [
      "diff",
      "compare",
      "revision"
    ],
    "description": "Compare two versions of source.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "database-lock",
    "group": "Code",
    "keywords": [
      "storage",
      "private",
      "sql"
    ],
    "description": "Restrict access to stored data.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chart-donut",
    "group": "Data and analytics",
    "keywords": [
      "analytics",
      "pie",
      "metrics"
    ],
    "description": "Show proportions as a ring chart.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chart-area",
    "group": "Data and analytics",
    "keywords": [
      "analytics",
      "time",
      "series",
      "trend"
    ],
    "description": "Show cumulative change over time.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chart-scatter",
    "group": "Data and analytics",
    "keywords": [
      "analytics",
      "scatterplot",
      "dot"
    ],
    "description": "Compare individual data points.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chart-bars-horizontal",
    "group": "Data and analytics",
    "keywords": [
      "analytics",
      "ranking",
      "metrics"
    ],
    "description": "Compare categories with horizontal bars.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "trend-up",
    "group": "Data and analytics",
    "keywords": [
      "increase",
      "growth",
      "positive"
    ],
    "description": "Indicate an upward trend.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "trend-down",
    "group": "Data and analytics",
    "keywords": [
      "decrease",
      "decline",
      "negative"
    ],
    "description": "Indicate a downward trend.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "dashboard-layout",
    "group": "Data and analytics",
    "keywords": [
      "metrics",
      "widgets",
      "overview"
    ],
    "description": "Open an overview dashboard.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "table-add-row",
    "group": "Data and analytics",
    "keywords": [
      "spreadsheet",
      "record",
      "create"
    ],
    "description": "Insert a row into a table.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "table-add-column",
    "group": "Data and analytics",
    "keywords": [
      "spreadsheet",
      "field",
      "create"
    ],
    "description": "Insert a column into a table.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "pivot-table",
    "group": "Data and analytics",
    "keywords": [
      "pivot",
      "spreadsheet",
      "report"
    ],
    "description": "Summarize a table by rows and columns.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "export-data",
    "group": "Data and analytics",
    "keywords": [
      "download",
      "report",
      "csv"
    ],
    "description": "Export tabular data to a file.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "filter-off",
    "group": "Data and analytics",
    "keywords": [
      "remove",
      "funnel",
      "no-filter"
    ],
    "description": "Clear an active filter.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "activity-pulse",
    "group": "Data and analytics",
    "keywords": [
      "health",
      "pulse",
      "timeline",
      "metrics"
    ],
    "description": "Track changes in live activity.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "gauge",
    "group": "Data and analytics",
    "keywords": [
      "speed",
      "meter",
      "usage"
    ],
    "description": "Show capacity on a dial.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "shopping-cart",
    "group": "Commerce and account",
    "keywords": [
      "basket",
      "store",
      "buy"
    ],
    "description": "View items ready for checkout.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "shopping-bag",
    "group": "Commerce and account",
    "keywords": [
      "checkout",
      "store",
      "retail"
    ],
    "description": "Open a shopping bag or order.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "storefront",
    "group": "Commerce and account",
    "keywords": [
      "store",
      "retail",
      "shop"
    ],
    "description": "Open a shop or vendor page.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "receipt",
    "group": "Commerce and account",
    "keywords": [
      "tax",
      "payment",
      "billing"
    ],
    "description": "Read a receipt or invoice.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "wallet",
    "group": "Commerce and account",
    "keywords": [
      "money",
      "balance",
      "cards"
    ],
    "description": "Manage saved payment methods.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "coins",
    "group": "Commerce and account",
    "keywords": [
      "currency",
      "payment",
      "tokens"
    ],
    "description": "View a balance or credits.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "bank",
    "group": "Commerce and account",
    "keywords": [
      "financial",
      "money",
      "columns"
    ],
    "description": "View a bank account or institution.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "price-tag",
    "group": "Commerce and account",
    "keywords": [
      "commerce",
      "label",
      "discount"
    ],
    "description": "Label an item with a price or tag.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "percent-off",
    "group": "Commerce and account",
    "keywords": [
      "sale",
      "deal",
      "coupon"
    ],
    "description": "Show a percentage discount.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "truck",
    "group": "Commerce and account",
    "keywords": [
      "shipping",
      "courier",
      "transit"
    ],
    "description": "Track a shipment or delivery.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "parcel-check",
    "group": "Commerce and account",
    "keywords": [
      "shipping",
      "delivered",
      "order"
    ],
    "description": "Confirm that a package arrived.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "barcode",
    "group": "Commerce and account",
    "keywords": [
      "sku",
      "scanning",
      "inventory"
    ],
    "description": "Scan a product barcode.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "scan-corners",
    "group": "Commerce and account",
    "keywords": [
      "scanner",
      "capture",
      "focus"
    ],
    "description": "Position an object inside a scan area.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "refund",
    "group": "Commerce and account",
    "keywords": [
      "money",
      "return",
      "credit"
    ],
    "description": "Return a payment or issue a refund.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "mail",
    "group": "Communication and media",
    "keywords": [
      "envelope",
      "inbox",
      "email"
    ],
    "description": "Open messages or send an email.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "mail-open",
    "group": "Communication and media",
    "keywords": [
      "inbox",
      "read",
      "envelope"
    ],
    "description": "Read an opened email.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "inbox",
    "group": "Communication and media",
    "keywords": [
      "mail",
      "messages",
      "notifications"
    ],
    "description": "View new incoming work.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "send",
    "group": "Communication and media",
    "keywords": [
      "plane",
      "submit",
      "email"
    ],
    "description": "Send a message or submission.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "reply",
    "group": "Communication and media",
    "keywords": [
      "respond",
      "conversation",
      "return"
    ],
    "description": "Reply to a message.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "reply-all",
    "group": "Communication and media",
    "keywords": [
      "respond",
      "group",
      "email"
    ],
    "description": "Reply to everyone in a conversation.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "megaphone",
    "group": "Communication and media",
    "keywords": [
      "marketing",
      "notice",
      "audio"
    ],
    "description": "Broadcast an announcement.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "video-off",
    "group": "Communication and media",
    "keywords": [
      "camera",
      "disabled",
      "media"
    ],
    "description": "Turn off video in a call.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "headphones",
    "group": "Communication and media",
    "keywords": [
      "audio",
      "headset",
      "support"
    ],
    "description": "Listen or open support audio.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "volume-up",
    "group": "Communication and media",
    "keywords": [
      "speaker",
      "loud",
      "audio"
    ],
    "description": "Increase or play sound.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "volume-mute",
    "group": "Communication and media",
    "keywords": [
      "speaker",
      "silence",
      "audio"
    ],
    "description": "Mute playback or an audio channel.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "pause",
    "group": "Communication and media",
    "keywords": [
      "media",
      "stop",
      "hold"
    ],
    "description": "Pause an animation or playback.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "skip-next",
    "group": "Communication and media",
    "keywords": [
      "media",
      "forward",
      "playback"
    ],
    "description": "Skip to the next track or item.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "skip-previous",
    "group": "Communication and media",
    "keywords": [
      "media",
      "back",
      "playback"
    ],
    "description": "Return to the previous track or item.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "bluetooth",
    "group": "Device and system",
    "keywords": [
      "wireless",
      "pairing",
      "device"
    ],
    "description": "Connect a nearby Bluetooth device.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "ethernet",
    "group": "Device and system",
    "keywords": [
      "network",
      "lan",
      "connection"
    ],
    "description": "Open wired connection settings.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "usb",
    "group": "Device and system",
    "keywords": [
      "port",
      "cable",
      "peripheral"
    ],
    "description": "Connect or inspect a USB device.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "plug",
    "group": "Device and system",
    "keywords": [
      "power",
      "connector",
      "cable"
    ],
    "description": "Connect a device or integration.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "printer",
    "group": "Device and system",
    "keywords": [
      "paper",
      "device",
      "output"
    ],
    "description": "Print a document or label.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "keyboard",
    "group": "Device and system",
    "keywords": [
      "keys",
      "typing",
      "shortcut"
    ],
    "description": "Open keyboard options or shortcuts.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "mouse",
    "group": "Device and system",
    "keywords": [
      "cursor",
      "click",
      "device"
    ],
    "description": "View pointer or mouse settings.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "chip",
    "group": "Device and system",
    "keywords": [
      "cpu",
      "compute",
      "silicon"
    ],
    "description": "Represent a processor or hardware module.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "hard-drive",
    "group": "Device and system",
    "keywords": [
      "storage",
      "hardware",
      "backup"
    ],
    "description": "Show a local drive or disk.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "monitor-play",
    "group": "Device and system",
    "keywords": [
      "screen",
      "media",
      "playback"
    ],
    "description": "Play a video on a display.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "battery-charge",
    "group": "Device and system",
    "keywords": [
      "energy",
      "power",
      "battery"
    ],
    "description": "Show a device charging.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "signal-bars",
    "group": "Device and system",
    "keywords": [
      "reception",
      "mobile",
      "network"
    ],
    "description": "Show cellular signal strength.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "plug-off",
    "group": "Device and system",
    "keywords": [
      "unplug",
      "power",
      "offline"
    ],
    "description": "Show a disconnected integration.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "shield-check",
    "group": "Accessibility and security",
    "keywords": [
      "security",
      "trust",
      "safe"
    ],
    "description": "Mark an item as protected or verified.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "shield-alert",
    "group": "Accessibility and security",
    "keywords": [
      "security",
      "risk",
      "warning"
    ],
    "description": "Warn about a security issue.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "fingerprint",
    "group": "Accessibility and security",
    "keywords": [
      "biometric",
      "login",
      "security"
    ],
    "description": "Unlock with a fingerprint.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "scan-face",
    "group": "Accessibility and security",
    "keywords": [
      "biometric",
      "camera",
      "identity"
    ],
    "description": "Scan a face for verification.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "user-check",
    "group": "Accessibility and security",
    "keywords": [
      "account",
      "verified",
      "member"
    ],
    "description": "Approve a person or membership.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "user-off",
    "group": "Accessibility and security",
    "keywords": [
      "account",
      "block",
      "member"
    ],
    "description": "Disable a person’s access.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "badge-verified",
    "group": "Accessibility and security",
    "keywords": [
      "check",
      "seal",
      "trust"
    ],
    "description": "Show a verified profile or item.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "key-round",
    "group": "Accessibility and security",
    "keywords": [
      "credentials",
      "login",
      "token"
    ],
    "description": "Manage an access key.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "id-card",
    "group": "Accessibility and security",
    "keywords": [
      "profile",
      "badge",
      "credentials"
    ],
    "description": "View a user identity card.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "accessibility",
    "group": "Accessibility and security",
    "keywords": [
      "a11y",
      "assist",
      "universal"
    ],
    "description": "Open accessibility preferences.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "eye-scan",
    "group": "Accessibility and security",
    "keywords": [
      "vision",
      "focus",
      "accessibility"
    ],
    "description": "Inspect a visual target or scan result.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "keyboard-focus",
    "group": "Accessibility and security",
    "keywords": [
      "a11y",
      "focus",
      "target",
      "interaction"
    ],
    "description": "Show a focus target for keyboard users.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "sidebar-left",
    "group": "Layout and views",
    "keywords": [
      "navigation",
      "panel",
      "layout"
    ],
    "description": "Toggle a sidebar at the start edge.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "sidebar-right",
    "group": "Layout and views",
    "keywords": [
      "navigation",
      "panel",
      "layout"
    ],
    "description": "Toggle a sidebar at the end edge.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "panel-top",
    "group": "Layout and views",
    "keywords": [
      "layout",
      "header",
      "region"
    ],
    "description": "Open a panel above the content.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "panel-bottom",
    "group": "Layout and views",
    "keywords": [
      "layout",
      "footer",
      "region"
    ],
    "description": "Open a panel below the content.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "columns-two",
    "group": "Layout and views",
    "keywords": [
      "layout",
      "split",
      "grid"
    ],
    "description": "Arrange content in two columns.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "columns-three",
    "group": "Layout and views",
    "keywords": [
      "layout",
      "split",
      "grid"
    ],
    "description": "Arrange content in three columns.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "fullscreen",
    "group": "Layout and views",
    "keywords": [
      "maximize",
      "media",
      "screen"
    ],
    "description": "Expand content to the full viewport.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "fullscreen-exit",
    "group": "Layout and views",
    "keywords": [
      "minimize",
      "screen",
      "media"
    ],
    "description": "Return content to its normal size.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "window-stack",
    "group": "Layout and views",
    "keywords": [
      "browser",
      "layers",
      "layout"
    ],
    "description": "Switch between overlapping windows.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "split-view",
    "group": "Layout and views",
    "keywords": [
      "editor",
      "compare",
      "resize"
    ],
    "description": "Show two panes side by side.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "expand-all",
    "group": "Layout and views",
    "keywords": [
      "accordion",
      "unfold",
      "expand"
    ],
    "description": "Open all sections of a list.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "collapse-all",
    "group": "Layout and views",
    "keywords": [
      "accordion",
      "fold",
      "collapse"
    ],
    "description": "Close all sections of a list.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "map-pin",
    "group": "Places and transport",
    "keywords": [
      "location",
      "address",
      "marker"
    ],
    "description": "Show a location on a map.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "map-route",
    "group": "Places and transport",
    "keywords": [
      "directions",
      "navigation",
      "path"
    ],
    "description": "Show a route between places.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "compass",
    "group": "Places and transport",
    "keywords": [
      "navigation",
      "direction",
      "north"
    ],
    "description": "Orient a map or find a bearing.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "navigation-pointer",
    "group": "Places and transport",
    "keywords": [
      "directions",
      "gps",
      "cursor"
    ],
    "description": "Point toward a destination.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "building",
    "group": "Places and transport",
    "keywords": [
      "company",
      "workplace",
      "address"
    ],
    "description": "View an organization or office.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "warehouse",
    "group": "Places and transport",
    "keywords": [
      "storage",
      "inventory",
      "shipping"
    ],
    "description": "View a warehouse or fulfillment center.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "car",
    "group": "Places and transport",
    "keywords": [
      "transport",
      "route",
      "trip"
    ],
    "description": "Use driving directions or track a vehicle.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "train",
    "group": "Places and transport",
    "keywords": [
      "transit",
      "travel",
      "transport"
    ],
    "description": "Use rail directions or track a train.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "bus",
    "group": "Places and transport",
    "keywords": [
      "transit",
      "travel",
      "transport"
    ],
    "description": "Use bus directions or track a shuttle.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "bike",
    "group": "Places and transport",
    "keywords": [
      "transport",
      "bicycle",
      "route"
    ],
    "description": "Use cycling directions or track a ride.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "flag",
    "group": "Places and transport",
    "keywords": [
      "report",
      "milestone",
      "navigation"
    ],
    "description": "Flag an item or mark a waypoint.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "signpost",
    "group": "Places and transport",
    "keywords": [
      "navigation",
      "wayfinding"
    ],
    "description": "Show a route direction or destination.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "microsoft",
    "group": "Brands",
    "keywords": [
      "microsoft",
      "company",
      "brand",
      "logo"
    ],
    "description": "Microsoft company mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "adobe",
    "group": "Brands",
    "keywords": [
      "adobe",
      "company",
      "brand",
      "logo"
    ],
    "description": "Adobe company mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "vercel",
    "group": "Brands",
    "keywords": [
      "vercel",
      "company",
      "brand",
      "logo"
    ],
    "description": "Vercel company mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "netflix",
    "group": "Brands",
    "keywords": [
      "netflix",
      "company",
      "brand",
      "logo"
    ],
    "description": "Netflix company mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "figma",
    "group": "Brands",
    "keywords": [
      "figma",
      "company",
      "brand",
      "logo"
    ],
    "description": "Figma company mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "linear",
    "group": "Brands",
    "keywords": [
      "linear",
      "company",
      "brand",
      "logo"
    ],
    "description": "Linear company mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "python",
    "group": "Languages",
    "keywords": [
      "python",
      "py",
      "snake",
      "scripting",
      "language",
      "code"
    ],
    "description": "Python programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "java",
    "group": "Languages",
    "keywords": [
      "java",
      "jvm",
      "coffee",
      "cup",
      "language",
      "code"
    ],
    "description": "Java programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "c",
    "group": "Languages",
    "keywords": [
      "c",
      "clang",
      "gcc",
      "systems",
      "language",
      "code"
    ],
    "description": "C programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "cpp",
    "group": "Languages",
    "keywords": [
      "cpp",
      "c++",
      "cplusplus",
      "systems",
      "language",
      "code"
    ],
    "description": "C++ programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "csharp",
    "group": "Languages",
    "keywords": [
      "csharp",
      "c#",
      "cs",
      "dotnet",
      "language",
      "code"
    ],
    "description": "C# programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "javascript",
    "group": "Languages",
    "keywords": [
      "javascript",
      "js",
      "ecmascript",
      "node",
      "web",
      "language"
    ],
    "description": "JavaScript programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "typescript",
    "group": "Languages",
    "keywords": [
      "typescript",
      "ts",
      "typed",
      "javascript",
      "web",
      "language"
    ],
    "description": "TypeScript programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "go",
    "group": "Languages",
    "keywords": [
      "go",
      "golang",
      "gopher",
      "concurrency",
      "backend",
      "language"
    ],
    "description": "Go programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "ruby",
    "group": "Languages",
    "keywords": [
      "ruby",
      "rb",
      "rails",
      "gem",
      "language",
      "code"
    ],
    "description": "Ruby programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "swift",
    "group": "Languages",
    "keywords": [
      "swift",
      "ios",
      "macos",
      "apple",
      "language",
      "code"
    ],
    "description": "Swift programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "kotlin",
    "group": "Languages",
    "keywords": [
      "kotlin",
      "kt",
      "jvm",
      "android",
      "language",
      "code"
    ],
    "description": "Kotlin programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "rust",
    "group": "Languages",
    "keywords": [
      "rust",
      "rs",
      "cargo",
      "systems",
      "language",
      "code"
    ],
    "description": "Rust programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "scala",
    "group": "Languages",
    "keywords": [
      "scala",
      "jvm",
      "functional",
      "language",
      "code"
    ],
    "description": "Scala programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  },
  {
    "name": "dart",
    "group": "Languages",
    "keywords": [
      "dart",
      "flutter",
      "mobile",
      "language",
      "code"
    ],
    "description": "Dart programming language mark.",
    "styles": [
      "line",
      "filled",
      "duotone"
    ],
    "has3d": true,
    "hues3d": [
      "blue",
      "lime",
      "violet",
      "teal",
      "amber",
      "coral",
      "rose",
      "graphite"
    ]
  }
] as const;
