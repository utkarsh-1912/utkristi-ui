const stack: string[] = [];

/** Register an open overlay layer so Escape closes only the topmost layer. */
export function pushOverlay(id: string): () => void {
  const index = stack.indexOf(id);
  if (index !== -1) stack.splice(index, 1);
  stack.push(id);
  return () => {
    const pos = stack.indexOf(id);
    if (pos !== -1) stack.splice(pos, 1);
  };
}

/** Returns true when no newer overlay sits above this id (or when the stack is empty). */
export function isTopOverlay(id: string): boolean {
  return stack.length === 0 || stack[stack.length - 1] === id;
}
