import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const baseUrl = process.argv[2] ?? "http://127.0.0.1:5173/velora";
const screenshotDir = path.join(projectRoot, "screenshots");
const browserCandidates = [
  process.env.CHROME_PATH,
  process.env.BROWSER_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const executable = browserCandidates.find((candidate) => existsSync(candidate));
if (!executable) throw new Error("Chrome or Edge was not found. Set CHROME_PATH to a local browser executable.");

const portServer = net.createServer();
await new Promise((resolve, reject) => {
  portServer.once("error", reject);
  portServer.listen(0, "127.0.0.1", resolve);
});
const port = portServer.address().port;
await new Promise((resolve, reject) => portServer.close((error) => error ? reject(error) : resolve()));

const temporaryRoot = path.resolve(os.tmpdir());
const browserProfile = await mkdtemp(path.join(temporaryRoot, "velora-chrome-"));
const normalizedTempPrefix = temporaryRoot.endsWith(path.sep) ? temporaryRoot : temporaryRoot + path.sep;
if (!path.resolve(browserProfile).startsWith(normalizedTempPrefix) || !path.basename(browserProfile).startsWith("velora-chrome-")) {
  throw new Error("Refusing to use a browser profile outside the temporary VELORA test directory.");
}

const browser = spawn(executable, [
  "--headless=new",
  "--disable-gpu",
  "--disable-background-networking",
  "--disable-crash-reporter",
  "--disable-breakpad",
  "--disable-default-apps",
  "--no-first-run",
  "--no-default-browser-check",
  "--hide-scrollbars",
  "--remote-allow-origins=*",
  "--remote-debugging-port=" + port,
  "--user-data-dir=" + browserProfile,
  baseUrl,
], { stdio: "ignore", windowsHide: true });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Browser debugging endpoint returned HTTP " + response.status);
  return response.json();
};

let socket;
let nextId = 0;
const pending = new Map();
const failures = [];

try {
  let targets;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (browser.exitCode !== null) throw new Error("Browser exited before its debugging endpoint became ready.");
    try {
      targets = await fetchJson("http://127.0.0.1:" + port + "/json/list");
      if (targets.some((target) => target.type === "page" && target.webSocketDebuggerUrl)) break;
    } catch { /* Chromium is still starting. */ }
    await wait(150);
  }
  const target = targets?.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
  if (!target) throw new Error("Timed out waiting for a browser page target.");

  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out connecting to Chrome DevTools.")), 8000);
    socket.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("Could not connect to Chrome DevTools.")); }, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id) {
      const callback = pending.get(message.id);
      if (!callback) return;
      pending.delete(message.id);
      clearTimeout(callback.timeout);
      if (message.error) callback.reject(new Error(message.error.message));
      else callback.resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") failures.push("Uncaught browser exception: " + (message.params.exceptionDetails.text ?? "unknown error"));
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      failures.push("Browser console error: " + message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
    }
    if (message.method === "Network.responseReceived" && message.params.response.status >= 400 && message.params.response.url.startsWith("http://127.0.0.1:")) {
      failures.push("Local HTTP " + message.params.response.status + ": " + message.params.response.url);
    }
  });

  function send(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error("Timed out calling " + method)); }, 12000);
      pending.set(id, { resolve, reject, timeout });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text ?? "Page evaluation failed");
    return response.result.value;
  }

  async function capture(name) {
    const image = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
    await writeFile(path.join(screenshotDir, name), Buffer.from(image.data, "base64"));
  }

  async function press(key) {
    const code = key === "Escape" ? "Escape" : key;
    await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: key === "Escape" ? 27 : undefined });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: key === "Escape" ? 27 : undefined });
  }

  async function openRoute(width, height) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 700, screenWidth: width, screenHeight: height });
    await send("Page.navigate", { url: baseUrl });
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (await evaluate("Boolean(document.querySelector('#velora-title'))")) break;
      await wait(100);
    }
    await evaluate("(async()=>{document.querySelectorAll('img').forEach(image=>image.loading='eager');await Promise.all(Array.from(document.images).map(image=>image.decode().catch(()=>{})));await document.fonts.ready;return true})()");
    // The hero CTA is the last staggered element (0.24 s delay + 0.75 s rise).
    // Capture only after it reaches its final opacity so visual QA reflects the usable page.
    await wait(1050);
    const metrics = await evaluate(`(() => ({title:document.title,lang:document.documentElement.lang,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,h1Count:document.querySelectorAll('h1').length,images:Array.from(document.images).map(image=>({src:new URL(image.src).pathname,loaded:image.complete&&image.naturalWidth>0}))}))()`);
    assert.equal(metrics.lang, "ru", "Page language should be Russian");
    assert.equal(metrics.h1Count, 1, "There should be one page H1");
    assert.ok(metrics.scrollWidth <= width && metrics.bodyWidth <= width, "Horizontal overflow at " + width + "px: " + JSON.stringify(metrics));
    const broken = metrics.images.filter((image) => !image.loaded);
    assert.deepEqual(broken, [], "All page images should load at " + width + "px");
    await capture(`velora-${width}x${height}.png`);
    console.log(`PASS viewport ${width}x${height}; document ${metrics.scrollWidth}px; ${metrics.images.length} images; ${metrics.title}`);
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await mkdir(screenshotDir, { recursive: true });
  for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [390, 844], [360, 800]]) await openRoute(width, height);

  await openRoute(1440, 900);
  for (const [selector, filename] of [["#services", "velora-services-1440x900.png"], ["#masters", "velora-masters-1440x900.png"], ["#gallery", "velora-gallery-1440x900.png"], [".velora-faq", "velora-faq-1440x900.png"]]) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);
    await wait(180);
    await capture(filename);
  }
  await openRoute(390, 844);

  const clickByText = async (selector, text) => evaluate(`(() => { const element=Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(item=>item.textContent.includes(${JSON.stringify(text)})); if(!element) throw new Error('Missing control: '+${JSON.stringify(text)}); element.click(); return true; })()`);
  const click = async (selector) => evaluate(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); if(!element) throw new Error('Missing control: '+${JSON.stringify(selector)}); element.click(); return true; })()`);

  await clickByText("[role=tab]", "Окрашивание");
  assert.equal(await evaluate("document.querySelectorAll('#velora-service-list article').length"), 4, "Service category filter should show only matching services");
  await clickByText(".velora-gallery__filters button", "Детали");
  assert.equal(await evaluate("document.querySelectorAll('.velora-gallery__item').length"), 1, "Gallery filter should reduce the gallery");
  await click(".velora-gallery__item button");
  assert.equal(await evaluate("document.querySelector('.velora-lightbox').open"), true, "Gallery should open in a native dialog");
  const firstCaption = await evaluate("document.querySelector('#velora-lightbox-caption').textContent");
  await press("ArrowRight");
  assert.notEqual(await evaluate("document.querySelector('#velora-lightbox-caption').textContent"), firstCaption, "Gallery arrow key should change the image");
  await press("Escape");
  assert.equal(await evaluate("document.querySelector('.velora-lightbox').open"), false, "Escape should close the gallery");

  await click(".velora-menu-toggle");
  assert.equal(await evaluate("document.querySelector('.velora-menu-toggle').getAttribute('aria-expanded')"), "true", "Mobile menu should open");
  assert.equal(await evaluate("document.activeElement.getAttribute('href')"), "#services", "Opening the menu should move focus to its first link");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.velora-nav__mobile-booking')).color"), "rgb(248, 245, 239)", "The mobile menu action should have readable light text");
  await press("Escape");
  assert.equal(await evaluate("document.querySelector('.velora-menu-toggle').getAttribute('aria-expanded')"), "false", "Escape should close the mobile menu");
  assert.equal(await evaluate("document.activeElement.classList.contains('velora-menu-toggle')"), true, "Closing the menu should return focus to its trigger");
  console.log("PASS service and gallery filters, lightbox arrows/Escape, mobile menu focus/Escape");

  assert.equal(await evaluate("getComputedStyle(document.querySelector('.velora-sticky-booking')).color"), "rgb(248, 245, 239)", "The mobile booking action should have readable light text");
  await click(".velora-sticky-booking");
  await wait(250);
  await capture("velora-booking-service-390x844.png");
  await clickByText(".velora-booking__service", "Стрижка и укладка");
  await clickByText(".velora-booking__master-option", "Алёна Соколова");
  await clickByText(".velora-booking__actions button", "Выбрать дату");
  let bookingDate = null;
  for (let attempt = 0; attempt < 3 && !bookingDate; attempt += 1) {
    bookingDate = await evaluate(`(() => {const today=new Date();const key=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');return Array.from(document.querySelectorAll('.velora-calendar__days button:not(:disabled)')).map(button=>button.dataset.date).find(value=>value>key(today))||null})()`);
    if (!bookingDate) await clickByText(".velora-calendar-heading button", "→");
  }
  assert.ok(bookingDate, "There should be an upcoming selectable date");
  let selectedTime = null;
  for (let attempt = 0; attempt < 7 && !selectedTime; attempt += 1) {
    await click(`[data-date="${bookingDate}"]`);
    selectedTime = await evaluate("document.querySelector('.velora-booking__time-list button')?.textContent ?? null");
    if (!selectedTime) {
      const next = await evaluate(`(() => {const today=new Date();const key=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');const values=Array.from(document.querySelectorAll('.velora-calendar__days button:not(:disabled)')).map(button=>button.dataset.date).filter(value=>value>(${JSON.stringify(bookingDate)}));return values[0]||null})()`);
      if (!next) break;
      bookingDate = next;
    }
  }
  assert.ok(selectedTime, "A compatible future demo time should be available");
  await click(".velora-booking__time-list button");
  await capture("velora-booking-calendar-390x844.png");
  await clickByText(".velora-booking__actions button", "Продолжить");
  await capture("velora-booking-contact-390x844.png");
  const contactAction = await evaluate("(() => {const rect=document.querySelector('.velora-booking__actions .velora-button--dark').getBoundingClientRect();return {top:rect.top,bottom:rect.bottom,height:rect.height}})()");
  assert.ok(contactAction.height > 0 && contactAction.top >= 0 && contactAction.bottom <= 844, "The mobile contact step should keep its next action in view: " + JSON.stringify(contactAction));
  await clickByText(".velora-booking__actions button", "Проверить запись");
  assert.equal(await evaluate("document.querySelector('#booking-name').getAttribute('aria-invalid')"), "true", "Missing contact should be validated inline");
  await evaluate("document.querySelector('#booking-name').focus()");
  await send("Input.insertText", { text: "Елена" });
  await evaluate("document.querySelector('#booking-phone').focus()");
  await send("Input.insertText", { text: "+7 999 111-22-33" });
  await click(".velora-consent input");
  await clickByText(".velora-booking__actions button", "Проверить запись");
  assert.equal(await evaluate("document.querySelector('#booking-review-title')?.textContent"), "Проверьте детали", "Valid contact should reach the review step");
  await clickByText(".velora-booking__actions button", "Создать демо-запись");
  assert.equal(await evaluate("document.querySelector('.velora-booking__success h2')?.textContent"), "Демо-запись создана только в браузере", "Confirmation should clearly state the browser-only demo result");
  const reservation = await evaluate("JSON.parse(sessionStorage.getItem('velora-demo-reservations-v1')||'[]')[0]");
  assert.deepEqual(Object.keys(reservation).sort(), ["dateKey", "durationMinutes", "masterId", "time"], "Only anonymous slot data should persist in the tab");
  assert.ok(!JSON.stringify(reservation).includes("Елена") && !JSON.stringify(reservation).includes("999"), "Contact data must not be persisted");
  await clickByText(".velora-booking__success button", "Вернуться");
  await click(".velora-sticky-booking");
  await clickByText(".velora-booking__service", "Стрижка и укладка");
  await clickByText(".velora-booking__master-option", "Алёна Соколова");
  await clickByText(".velora-booking__actions button", "Выбрать дату");
  await click(`[data-date="${bookingDate}"]`);
  const remainingTimes = await evaluate("Array.from(document.querySelectorAll('.velora-booking__time-list button')).map(button=>button.textContent)");
  assert.ok(!remainingTimes.includes(selectedTime), "The reserved specialist/time should no longer be offered in this tab");
  console.log("PASS booking path, inline validation, summary, confirmation, privacy, and used-slot removal");

  await wait(180);
  assert.deepEqual(failures, [], "There should be no browser errors or local HTTP failures");
  console.log("PASS browser console and local network checks");
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  if (process.platform === "win32" && browser.pid) {
    try { execFileSync("taskkill", ["/PID", String(browser.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch { /* The browser may already have exited. */ }
  } else browser.kill();
  await wait(220);
  const resolvedProfile = path.resolve(browserProfile);
  if (resolvedProfile.startsWith(normalizedTempPrefix) && path.basename(resolvedProfile).startsWith("velora-chrome-")) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try { await rm(resolvedProfile, { recursive: true, force: true }); break; }
      catch (error) {
        if (!["EBUSY", "EPERM", "ENOTEMPTY"].includes(error.code) || attempt === 19) throw error;
        await wait(150);
      }
    }
  }
}
