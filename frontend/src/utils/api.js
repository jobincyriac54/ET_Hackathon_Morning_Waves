const BASE = '/api';

export async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Streams SSE chunks from the backend. onChunk receives the full accumulated
// text on each update so the UI can just set state directly.
export async function streamPost(path, body, onChunk) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Stream request failed');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // hold onto the incomplete last line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(line.slice(6));
        if (json.chunk) {
          full += json.chunk;
          onChunk(full);
        }
      } catch { /* malformed chunk — skip */ }
    }
  }
  return full;
}

export async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
