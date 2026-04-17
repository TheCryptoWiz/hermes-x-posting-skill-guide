const fs = require("fs");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const POSTS_FILE = process.argv[2] || path.join(__dirname, "posts.example.json");
const SKIP = Number.parseInt(process.argv[3] || "0", 10);
const CDP_PORT = Number.parseInt(process.env.CDP_PORT || "9222", 10);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchTargets(port) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}/json`, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const raw = fs.readFileSync(POSTS_FILE, "utf8");
  const parsed = JSON.parse(raw);
  const posts = Array.isArray(parsed.posts) ? parsed.posts.slice(SKIP) : [];

  if (!posts.length) {
    throw new Error("No posts found. Expected a JSON file with a posts array.");
  }

  const targets = await fetchTargets(CDP_PORT);
  const xTab = targets.find((target) => target.url && target.url.includes("x.com"));

  if (!xTab) {
    throw new Error(`No logged-in X tab found on CDP port ${CDP_PORT}.`);
  }

  const ws = new WebSocket(xTab.webSocketDebuggerUrl);
  let messageId = 1;

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = messageId++;
      const handler = (message) => {
        const data = JSON.parse(message);
        if (data.id === id) {
          ws.removeListener("message", handler);
          resolve(data);
        }
      };
      ws.on("message", handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    return response.result && response.result.result
      ? response.result.result.value
      : undefined;
  }

  async function press(key) {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, code: key });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key });
  }

  await new Promise((resolve, reject) => {
    ws.on("open", async () => {
      try {
        await press("Escape");
        await sleep(400);
        await send("Page.navigate", { url: "https://x.com/home" });
        await sleep(3000);

        for (const post of posts) {
          const [year, month, day] = post.date.split("-");
          const [rawHour, rawMinute] = post.time.split(":");
          let hour = Number.parseInt(rawHour, 10);
          const minute = Number.parseInt(rawMinute, 10).toString();
          let ampm = "am";

          if (hour >= 12) {
            ampm = "pm";
            if (hour > 12) {
              hour -= 12;
            }
          }
          if (hour === 0) {
            hour = 12;
          }

          const monthValue = String(Number.parseInt(month, 10));
          const dayValue = String(Number.parseInt(day, 10));
          const hourValue = String(hour);

          await evaluate(
            'document.querySelector("[data-testid=SideNav_NewTweet_Button]")?.click()'
          );
          await sleep(1500);

          await evaluate(
            'document.querySelector("[data-testid=tweetTextarea_0]")?.focus()'
          );
          await sleep(400);
          await evaluate(
            `document.execCommand("insertText", false, ${JSON.stringify(post.text)})`
          );
          await sleep(600);

          await evaluate(
            'document.querySelectorAll("[data-testid=scheduleOption]")[0]?.click()'
          );
          await sleep(1500);

          await evaluate(`(() => {
            const selects = document.querySelectorAll("select");
            if (selects.length < 6) return "FAIL";
            const values = [
              ${JSON.stringify(monthValue)},
              ${JSON.stringify(dayValue)},
              ${JSON.stringify(year)},
              ${JSON.stringify(hourValue)},
              ${JSON.stringify(minute)},
              ${JSON.stringify(ampm)}
            ];
            values.forEach((value, index) => {
              selects[index].value = value;
              selects[index].dispatchEvent(new Event("change", { bubbles: true }));
            });
            return "OK";
          })()`);
          await sleep(500);

          await evaluate(`(() => {
            const confirm =
              document.querySelector('[data-testid="scheduledConfirmationPrimaryAction"]') ||
              Array.from(document.querySelectorAll("button")).find(
                (button) => button.textContent.trim() === "Confirm"
              );
            if (confirm) {
              confirm.click();
              return "OK";
            }
            return "FAIL";
          })()`);
          await sleep(1200);

          await evaluate(`(() => {
            const button =
              document.querySelector('[data-testid="tweetButton"]') ||
              document.querySelector('[data-testid="tweetButtonInline"]');
            if (button) {
              button.click();
              return button.textContent.trim();
            }
            return "FAIL";
          })()`);
          await sleep(1500);

          await press("Escape");
          await sleep(800);
        }

        ws.close();
        resolve();
      } catch (error) {
        ws.close();
        reject(error);
      }
    });

    ws.on("error", reject);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
