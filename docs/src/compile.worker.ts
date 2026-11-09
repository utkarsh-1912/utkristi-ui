import { transform } from 'sucrase';

self.addEventListener('message', (event: MessageEvent<{ token: string; source: string }>) => {
  const { token, source } = event.data;
  try {
    const { code } = transform(source, {
      transforms: ['typescript', 'jsx', 'imports'], jsxRuntime: 'automatic', production: true, filePath: 'example.tsx',
    });
    self.postMessage({ token, code });
  } catch (error) {
    self.postMessage({ token, error: error instanceof Error ? error.message : String(error) });
  }
});
