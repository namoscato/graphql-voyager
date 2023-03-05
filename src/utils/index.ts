export * from './dom-helpers';
export * from './highlight';

export function isMatch(sourceText: string, searchValue: string) {
  if (!searchValue) {
    return true;
  }

  try {
    const escaped = searchValue.replace(/[^_0-9A-Za-z]/g, (ch) => '\\' + ch);
    return sourceText.search(new RegExp(escaped, 'i')) !== -1;
  } catch (e) {
    return sourceText.toLowerCase().includes(searchValue.toLowerCase());
  }
}

export function loadWorker(path: string, relative: boolean): Worker {
  const url = relative ? relativeToJsUrlPathname(path) : path;
  return new Worker(url);
}

function relativeToJsUrlPathname(path: string): string {
  try {
    const url = new URL(
      path,
      (document.currentScript as HTMLScriptElement).src,
    );
    return url.pathname;
  } catch (e) {
    return path;
  }
}
