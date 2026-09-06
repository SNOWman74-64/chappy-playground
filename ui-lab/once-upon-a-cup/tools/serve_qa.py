"""Loopback-only browser fixtures, without changing the production files.

Run: python once-upon-a-cup/tools/serve_qa.py
Visit port 4174 with /fail-once/, /reduced-motion/, /no-webgl/, or /context-loss/.
Media/WebGL overrides apply only to fixture responses, not OS/browser settings.
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import threading
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SCENARIOS = {"fail-once", "reduced-motion", "no-webgl", "context-loss"}
MEDIA_FIXTURE = """
const originalMedia = window.matchMedia.bind(window);
window.matchMedia = query => {
  const result = originalMedia(query);
  if (query === '(prefers-reduced-motion: reduce)') {
    Object.defineProperty(result, 'matches', { value: true });
  }
  return result;
};
"""
WEBGL_FIXTURE = """
const originalContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
  return kind.startsWith('webgl') ? null : originalContext.call(this, kind, ...args);
};
"""
CONTEXT_FIXTURE = """
document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button');
  button.textContent = 'QA: lose WebGL context';
  button.style.cssText = 'position:fixed;top:4px;right:4px;z-index:100;padding:12px';
  button.onclick = () => {
    const gl = document.querySelector('canvas')?.getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  };
  document.body.append(button);
});
"""


class Handler(SimpleHTTPRequestHandler):
    failed_once = False
    lock = threading.Lock()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_text(self, text, content_type):
        payload = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        path = urlsplit(self.path).path
        parts = path.lstrip("/").split("/", 1)
        scenario = parts[0]
        if scenario not in SCENARIOS:
            self.send_error(404, "Choose a documented QA scenario")
            return
        relative = parts[1] if len(parts) > 1 else ""
        self.path = "/" + relative
        if scenario == "fail-once" and relative == "assets/cafe.glb":
            with self.lock:
                first = not Handler.failed_once
                Handler.failed_once = True
            if first:
                self.send_error(503, "Intentional one-time model failure")
                return
        if relative in {"", "index.html"}:
            html = (ROOT / "index.html").read_text("utf-8")
            fixture = {"reduced-motion": MEDIA_FIXTURE, "no-webgl": WEBGL_FIXTURE,
                       "context-loss": CONTEXT_FIXTURE}.get(scenario, "")
            html = html.replace("<head>", "<head><script>" + fixture + "</script>", 1)
            self.send_text(html, "text/html; charset=utf-8")
        elif scenario == "reduced-motion" and relative == "styles.css":
            css = (ROOT / "styles.css").read_text("utf-8")
            self.send_text(css.replace("@media(prefers-reduced-motion:reduce)", "@media all"),
                           "text/css; charset=utf-8")
        else:
            super().do_GET()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4174)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"QA fixtures: http://127.0.0.1:{args.port}/fail-once/?debug", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
