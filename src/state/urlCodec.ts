import LZString from 'lz-string';
import type { TrackerRunState } from './types.ts';

export function encodeStateToUrl(state: TrackerRunState): string {
  try {
    const jsonStr = JSON.stringify(state);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    const url = new URL(window.location.href);
    url.searchParams.set('data', compressed);
    return url.toString();
  } catch (err) {
    console.error('Failed to encode state to URL:', err);
    return window.location.href;
  }
}

export function decodeStateFromUrl(searchParams: URLSearchParams): TrackerRunState | null {
  const dataParam = searchParams.get('data');
  if (!dataParam) return null;

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(dataParam);
    if (!decompressed) {
      // Fallback: check if it was raw base64 or uncompressed JSON
      try {
        const decoded = decodeURIComponent(atob(dataParam));
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    }
    const state: TrackerRunState = JSON.parse(decompressed);
    if (state && typeof state === 'object' && state.completedCravings) {
      return state;
    }
  } catch (err) {
    console.error('Failed to decode state from URL parameter:', err);
  }
  return null;
}
