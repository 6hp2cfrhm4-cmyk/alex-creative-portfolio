import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const screenshotsPath = join(root, "screenshots");
const viteCli = join(root, "node_modules", "vite", "bin", "vite.js");
const edgeCandidates = [
  process.env.KERN_E2E_BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];
const browserPath = edgeCandidates.find((candidate) => candidate && existsSync(candidate));

assert.ok(browserPath, "Install Microsoft Edge or Chrome, or set KERN_E2E_BROWSER to its executable.");

async function reservePort() {
  const server = createServer();
  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise((resolvePromise, reject) => {
    server.close((error) => error ? reject(error) : resolvePromise());
  });
  return port;
}

async function waitForHttp(url, child, timeoutMs = 25000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) throw new Error("Vite exited before it was ready.");
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The development server is still starting.
    }
    await delay(150);
  }
  throw new Error("Timed out waiting for the local Vite server.");
}

async function waitForCdp(url, child, timeoutMs = 20000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) throw new Error("The browser exited before DevTools was ready.");
    try {
      const response = await fetch(url + "/json/version");
      if (response.ok) return response.json();
    } catch {
      // DevTools may need a moment to bind its port.
    }
    await delay(150);
  }
  throw new Error("Timed out waiting for the browser DevTools endpoint.");
}

class DevToolsClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id && this.pending.has(message.id)) {
        const pending = this.pending.get(message.id);
        this.pending.delete(message.id);
        clearTimeout(pending.timeout);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result ?? {});
        return;
      }
      if (message.method) {
        const callbacks = this.listeners.get(message.method) ?? [];
        for (const callback of callbacks) callback(message.params ?? {});
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Timed out waiting for DevTools command: " + method));
      }, 15000);
      this.pending.set(id, { resolve: resolvePromise, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, callback) {
    const callbacks = this.listeners.get(method) ?? [];
    callbacks.push(callback);
    this.listeners.set(method, callbacks);
  }

  waitFor(method, timeoutMs = 12000) {
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        const callbacks = this.listeners.get(method) ?? [];
        this.listeners.set(method, callbacks.filter((callback) => callback !== listener));
        reject(new Error("Timed out waiting for browser event: " + method));
      }, timeoutMs);
      const listener = (params) => {
        clearTimeout(timer);
        const callbacks = this.listeners.get(method) ?? [];
        this.listeners.set(method, callbacks.filter((callback) => callback !== listener));
        resolvePromise(params);
      };
      this.on(method, listener);
    });
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (response.exceptionDetails) {
      const message = response.exceptionDetails.exception?.description ?? response.exceptionDetails.text;
      throw new Error("Browser evaluation failed: " + message);
    }
    return response.result?.value;
  }
}

function keyData(key) {
  const common = { key, type: "keyDown" };
  if (key === "Enter") return { ...common, code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 };
  if (key === "Escape") return { ...common, code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 };
  if (key === "ArrowRight") return { ...common, code: "ArrowRight", windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 39 };
  if (key === "ArrowLeft") return { ...common, code: "ArrowLeft", windowsVirtualKeyCode: 37, nativeVirtualKeyCode: 37 };
  if (key === " ") return { ...common, code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 };
  return common;
}

async function pressKey(client, key) {
  const down = keyData(key);
  down.type = "rawKeyDown";
  await client.send("Input.dispatchKeyEvent", down);
  if (key === "Enter" || key === " ") {
    await client.send("Input.dispatchKeyEvent", { type: "char", key, text: key === "Enter" ? "\r" : " " });
  }
  await client.send("Input.dispatchKeyEvent", { ...down, type: "keyUp" });
}

async function focus(client, selector) {
  const expression = "(() => { const element = document.querySelector(" + JSON.stringify(selector) + "); if (!element) return false; element.focus(); return document.activeElement === element; })()";
  assert.equal(await client.evaluate(expression), true, "Could not focus " + selector);
}

async function waitFor(client, expression, description, timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await client.evaluate(expression)) return;
    await delay(100);
  }
  throw new Error("Timed out waiting for " + description);
}

async function click(client, selector) {
  const expression = "(() => { const element = document.querySelector(" + JSON.stringify(selector) + "); if (!element) return false; element.click(); return true; })()";
  assert.equal(await client.evaluate(expression), true, "Could not click " + selector);
}

async function setViewport(client, width, height) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 768,
    screenWidth: width,
    screenHeight: height,
  });
  await client.evaluate("window.scrollTo(0, 0)");
  await delay(180);
}

async function capture(client, name) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(join(screenshotsPath, name), Buffer.from(result.data, "base64"));
}

async function typeText(client, selector, text) {
  await focus(client, selector);
  await client.send("Input.insertText", { text });
}

async function main() {
  const appPort = await reservePort();
  const debugPort = await reservePort();
  const baseUrl = "http://127.0.0.1:" + appPort;
  const debugUrl = "http://127.0.0.1:" + debugPort;
  const profilePath = await mkdtemp(join(tmpdir(), "kern-e2e-"));
  const vite = spawn(process.execPath, [viteCli, "--host", "127.0.0.1", "--port", String(appPort), "--strictPort"], {
    cwd: root,
    stdio: "ignore",
  });
  let browser;
  let client;
  const consoleErrors = [];
  const pageExceptions = [];
  const localHttpErrors = [];

  try {
    await waitForHttp(baseUrl, vite);
    browser = spawn(browserPath, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--remote-allow-origins=*",
      "--remote-debugging-port=" + debugPort,
      "--user-data-dir=" + profilePath,
      "--window-size=1440,900",
      baseUrl + "/work/kern",
    ], { stdio: "ignore" });

    await waitForCdp(debugUrl, browser);
    const targetResponse = await fetch(debugUrl + "/json/list");
    assert.equal(targetResponse.ok, true);
    const targets = await targetResponse.json();
    const target = targets.find((item) => item.type === "page" && item.url.includes("/work/kern"));
    assert.ok(target?.webSocketDebuggerUrl, "KERN route did not open in the browser.");

    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolvePromise, reject) => {
      socket.addEventListener("open", resolvePromise, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    client = new DevToolsClient(socket);
    client.on("Runtime.consoleAPICalled", (event) => {
      if (event.type === "error") consoleErrors.push(event.args?.map((arg) => arg.value ?? arg.description).join(" "));
    });
    client.on("Runtime.exceptionThrown", (event) => {
      pageExceptions.push(event.exceptionDetails?.exception?.description ?? event.exceptionDetails?.text ?? "Browser exception");
    });
    client.on("Network.responseReceived", (event) => {
      if (event.response.url.startsWith(baseUrl) && event.response.status >= 400) {
        localHttpErrors.push(event.response.status + " " + event.response.url);
      }
    });

    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Network.enable");
    await waitFor(client, "Boolean(document.querySelector('.kern-site'))", "the KERN page");
    await client.evaluate("Promise.race([document.fonts.ready, new Promise((resolvePromise) => setTimeout(resolvePromise, 2500))])");
    await delay(450);
    assert.equal(await client.evaluate("document.documentElement.lang"), "ru");
    assert.match(await client.evaluate("document.title"), /KERN \/ BARBER CLUB/);
    assert.equal(await client.evaluate("Boolean(document.querySelector('.kern-hero__image')?.naturalWidth)"), true);

    const viewportCaptures = [
      [1440, 900, "kern-1440x900.png"],
      [1280, 800, "kern-1280x800.png"],
      [768, 1024, "kern-768x1024.png"],
      [390, 844, "kern-390x844.png"],
      [360, 800, "kern-360x800.png"],
    ];
    for (const [width, height, filename] of viewportCaptures) {
      await setViewport(client, width, height);
      const dimensions = await client.evaluate("({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth })");
      assert.equal(dimensions.page, dimensions.viewport, "Horizontal overflow at " + width + "px.");
      await capture(client, filename);
    }
    console.log("PASS responsive screenshots: 1440×900, 1280×800, 768×1024, 390×844, 360×800");

    await setViewport(client, 390, 844);
    await focus(client, ".kern-menu-toggle");
    await pressKey(client, "Enter");
    await waitFor(client, "Boolean(document.querySelector('.kern-mobile-menu[open]'))", "mobile navigation to open");
    await pressKey(client, "Escape");
    await waitFor(client, "!document.querySelector('.kern-mobile-menu')?.open", "mobile navigation to close");
    assert.equal(await client.evaluate("document.activeElement.matches('.kern-menu-toggle')"), true);
    await pressKey(client, " ");
    await waitFor(client, "Boolean(document.querySelector('.kern-mobile-menu[open]'))", "mobile navigation to open with Space");
    await pressKey(client, "Escape");
    await waitFor(client, "!document.querySelector('.kern-mobile-menu')?.open", "mobile navigation to close after Space");
    assert.equal(await client.evaluate("document.activeElement.matches('.kern-menu-toggle')"), true);
    console.log("PASS mobile menu keyboard open, Escape close, and focus return");

    await focus(client, "#services .kern-filter-row button:nth-child(3)");
    await pressKey(client, "Enter");
    assert.equal(await client.evaluate("document.querySelector('#services .kern-filter-row button:nth-child(3)').getAttribute('aria-pressed')"), "true");
    assert.equal(await client.evaluate("document.querySelectorAll('#services .kern-service-row').length"), 2);

    await focus(client, "#lookbook .kern-filter-row button:nth-child(5)");
    await pressKey(client, "Enter");
    assert.equal(await client.evaluate("document.querySelectorAll('#lookbook .kern-look-card').length"), 1);
    await focus(client, "#lookbook .kern-filter-row button:nth-child(1)");
    await pressKey(client, "Enter");
    await focus(client, 'button[aria-label="Открыть референс: Текстурный кроп"]');
    await pressKey(client, "Enter");
    await waitFor(client, "Boolean(document.querySelector('[data-lookbook-dialog][open]'))", "the haircut lightbox");
    assert.equal(await client.evaluate("document.querySelector('[data-lookbook-dialog] h2')?.textContent"), "Текстурный кроп");
    await pressKey(client, "ArrowRight");
    assert.equal(await client.evaluate("document.querySelector('[data-lookbook-dialog] h2')?.textContent"), "Низкий fade");
    await pressKey(client, "Escape");
    await waitFor(client, "!document.querySelector('[data-lookbook-dialog]')?.open", "the haircut lightbox to close");
    assert.equal(await client.evaluate("document.activeElement.getAttribute('aria-label')"), "Открыть референс: Текстурный кроп");
    console.log("PASS service filters and lookbook keyboard filtering, arrows, Escape, and focus return");

    await focus(client, '[data-finder-option="length:short"]');
    await pressKey(client, "Enter");
    await focus(client, '[data-finder-option="effort:minimal"]');
    await pressKey(client, "Enter");
    await focus(client, '[data-finder-option="character:sharp"]');
    await pressKey(client, "Enter");
    assert.equal(await client.evaluate("document.querySelectorAll('.kern-finder-result').length"), 2);
    assert.match(await client.evaluate("document.querySelector('.kern-finder-results')?.textContent ?? ''"), /Текстурный кроп/);
    console.log("PASS three-question style finder returns two deterministic references");

    await focus(client, "#top .kern-button");
    await pressKey(client, "Enter");
    await waitFor(client, "Boolean(document.querySelector('[data-booking-dialog][open]'))", "the booking dialog");
    await click(client, ".kern-booking-nav .kern-button");
    assert.match(await client.evaluate("document.querySelector('[data-booking-dialog] [role=\"alert\"]')?.textContent ?? ''"), /Выбери услугу/);
    await focus(client, '[data-service-choice="haircut"]');
    await pressKey(client, "Enter");
    await click(client, ".kern-booking-nav .kern-button");
    await waitFor(client, "Boolean(document.querySelector('[data-barber-choice=\"any\"]'))", "barber choices");
    await focus(client, '[data-barber-choice="any"]');
    await pressKey(client, "Enter");
    await click(client, ".kern-booking-nav .kern-button");
    await waitFor(client, "Boolean(document.querySelector('[data-booking-date]'))", "available booking dates");
    await focus(client, "[data-booking-date]");
    await pressKey(client, "Enter");
    await waitFor(client, "Boolean(document.querySelector('[data-booking-time][data-available=\"true\"]'))", "available booking times");
    const slot = await client.evaluate("(() => { const date = document.querySelector('[data-booking-date][aria-pressed=\"true\"]'); const time = document.querySelector('[data-booking-time][data-available=\"true\"]'); return { date: date?.getAttribute('data-booking-date'), time: time?.getAttribute('data-booking-time') }; })()");
    assert.ok(slot.date && slot.time, "The demo calendar has no valid service slot.");
    await setViewport(client, 390, 844);
    const bookingNext = await client.evaluate("(() => { const button = document.querySelector('.kern-booking-nav > .kern-button'); const style = button && getComputedStyle(button); return { text: button?.innerText, disabled: button?.disabled, color: style?.color, background: style?.backgroundColor }; })()");
    assert.equal(bookingNext.disabled, false, "The booking next-step button is unexpectedly disabled.");
    assert.match(bookingNext.text ?? "", /Продолжить/, "The booking next-step label is missing.");
    assert.notEqual(bookingNext.color, bookingNext.background, "The booking next-step label has no contrast.");
    console.log("PASS booking step has an enabled, readable next action");
    await capture(client, "kern-booking-390x844.png");
    await focus(client, '[data-booking-time][data-available="true"]');
    await pressKey(client, "Enter");
    await click(client, ".kern-booking-nav .kern-button");
    await click(client, ".kern-booking-nav .kern-button");
    await waitFor(client, "Boolean(document.querySelector('input[name=\"phone\"]'))", "the contact form");

    await typeText(client, 'input[name="name"]', "Алекс");
    await typeText(client, 'input[name="phone"]', "123");
    await click(client, ".kern-booking-submit");
    await waitFor(client, "Boolean(document.querySelector('input[name=\"phone\"]')?.getAttribute('aria-invalid') === 'true')", "phone validation");
    assert.match(await client.evaluate("document.querySelector('#booking-phone-error')?.textContent ?? ''"), /от 10 до 15 цифр/);

    await focus(client, 'input[name="phone"]');
    await pressKey(client, "Control");
    const selectAllDown = { type: "keyDown", key: "a", code: "KeyA", windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65, modifiers: 2 };
    await client.send("Input.dispatchKeyEvent", selectAllDown);
    await client.send("Input.dispatchKeyEvent", { ...selectAllDown, type: "keyUp" });
    await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Control", code: "ControlLeft", windowsVirtualKeyCode: 17, nativeVirtualKeyCode: 17 });
    await client.send("Input.insertText", { text: "+7 (900) 123-45-67" });
    await focus(client, 'input[name="demo-consent"]');
    await pressKey(client, " ");
    assert.equal(await client.evaluate("document.querySelector('input[name=\"demo-consent\"]')?.checked"), true);
    await focus(client, ".kern-booking-submit");
    await pressKey(client, "Enter");
    await waitFor(client, "Boolean(document.querySelector('.kern-booking-success'))", "booking confirmation", 12000);
    assert.match(await client.evaluate("document.querySelector('.kern-booking-success')?.textContent ?? ''"), /Демо-запись сохранена в этом браузере; сообщение салону не отправлялось/);

    const saved = await client.evaluate("JSON.parse(localStorage.getItem('kern-demo-reservations-v1') || '[]')");
    assert.equal(saved.length, 1);
    assert.equal(Object.keys(saved[0]).sort().join(","), "barberId,date,duration,time");
    assert.equal(JSON.stringify(saved).includes("Алекс"), false);
    const savedReservation = saved[0];
    console.log("PASS booking validation, confirmation, anonymous storage, and race-safe slot reservation");

    await click(client, '[data-booking-dialog] .kern-icon-button--dark');
    await waitFor(client, "!document.querySelector('[data-booking-dialog]')", "booking dialog to close");
    await client.send("Page.navigate", { url: baseUrl + "/work/kern" });
    await waitFor(client, "Boolean(document.querySelector('.kern-site'))", "direct route after refresh");
    await focus(client, "#top .kern-button");
    await pressKey(client, "Enter");
    await waitFor(client, "Boolean(document.querySelector('[data-booking-dialog][open]'))", "booking dialog after refresh");
    await focus(client, '[data-service-choice="haircut"]');
    await pressKey(client, "Enter");
    await click(client, ".kern-booking-nav .kern-button");
    await waitFor(client, "Boolean(document.querySelector('[data-barber-choice=\"' + " + JSON.stringify(savedReservation.barberId) + " + '\"]'))", "the reserved barber");
    await focus(client, '[data-barber-choice="' + savedReservation.barberId + '"]');
    await pressKey(client, "Enter");
    await click(client, ".kern-booking-nav .kern-button");
    await waitFor(client, "Boolean(document.querySelector('[data-booking-date=\"' + " + JSON.stringify(savedReservation.date) + " + '\"]'))", "the saved booking date");
    await focus(client, '[data-booking-date="' + savedReservation.date + '"]');
    await pressKey(client, "Enter");
    await waitFor(client, "Boolean(document.querySelector('[data-booking-time=\"' + " + JSON.stringify(savedReservation.time) + " + '\"]'))", "the saved booking time");
    assert.equal(await client.evaluate("document.querySelector('[data-booking-time=\"' + " + JSON.stringify(savedReservation.time) + " + '\"]')?.getAttribute('data-available')"), "false");
    console.log("PASS occupied demo time stays unavailable after a page reload");

    await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    assert.equal(await client.evaluate("getComputedStyle(document.querySelector('.kern-hero__content')).animationName"), "none");
    await client.send("Emulation.setEmulatedMedia", { features: [] });

    assert.deepEqual(localHttpErrors, []);
    assert.deepEqual(pageExceptions, []);
    assert.deepEqual(consoleErrors, []);
    console.log("PASS no local 404s, console errors, or uncaught browser exceptions");
  } finally {
    if (client) {
      try {
        await client.send("Browser.close");
      } catch {
        // The browser may already have exited after a failed check.
      }
      client.socket.close();
    }
    if (browser && browser.exitCode === null) browser.kill();
    if (vite && vite.exitCode === null) vite.kill();
  }
}

await mkdir(screenshotsPath, { recursive: true });
await main();
