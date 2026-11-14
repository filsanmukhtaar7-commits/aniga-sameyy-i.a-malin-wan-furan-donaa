const { spawn } = require('node:child_process');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const url = `http://localhost:${port}`;
const server = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
  cwd: path.join(__dirname, '..'),
  env: process.env,
  stdio: 'inherit'
});

let opened = false;
let stopping = false;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function openBrowser() {
  if (process.env.TEKZONE_NO_BROWSER === '1') {
    console.log(`Browser launch skipped. Open ${url}`);
    return;
  }

  let command;
  let args;
  if (process.platform === 'win32') {
    command = 'rundll32.exe';
    args = ['url.dll,FileProtocolHandler', url];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  const browser = spawn(command, args, { detached: true, stdio: 'ignore', shell: false });
  browser.on('error', error => console.log(`Could not open a browser automatically: ${error.message}\nOpen ${url}`));
  browser.unref();
  console.log(`TekZone is ready. Opening ${url}`);
}

async function waitUntilReady() {
  const deadline = Date.now() + 90_000;
  while (!opened && !stopping && Date.now() < deadline) {
    if (server.exitCode !== null) return;
    try {
      const response = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(1500) });
      if (response.ok) {
        const health = await response.json();
        if (health.ok && health.db === 'connected') {
          opened = true;
          await openBrowser();
          return;
        }
      }
    } catch {}
    await sleep(1000);
  }
  if (!opened && !stopping && server.exitCode === null) {
    console.error(`TekZone did not become ready within 90 seconds. Check MongoDB, then open ${url} when the server is ready.`);
  }
}

server.on('exit', code => {
  stopping = true;
  process.exitCode = code ?? 0;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopping = true;
    if (!server.killed) server.kill(signal);
  });
}

waitUntilReady().catch(error => {
  console.error(error);
  stopping = true;
  server.kill();
  process.exitCode = 1;
});
