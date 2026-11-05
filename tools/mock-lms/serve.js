// For IT: a tiny local web server for testing only. Listens on this computer
// (127.0.0.1) and serves files from the repository folder. No outside access.
// Usage: node tools/mock-lms/serve.js [port]   then open
//   http://127.0.0.1:8123/tools/mock-lms/mock-lms.html
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
  '.vtt': 'text/vtt', '.pdf': 'application/pdf', '.xml': 'application/xml', '.json': 'application/json' };
function start(port) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = path.normalize(path.join(root, url));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise(r => server.listen(port, '127.0.0.1', () => r(server)));
}
if (require.main === module) {
  const port = Number(process.argv[2]) || 8123;
  start(port).then(() => console.log(`Mock LMS: http://127.0.0.1:${port}/tools/mock-lms/mock-lms.html`));
}
module.exports = { start };
