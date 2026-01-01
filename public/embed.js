(function () {
  const script = document.currentScript;
  if (!script) return;

  // 🔑 NIEUW: we gebruiken data-config
  const config = script.getAttribute("data-config");
  if (!config) {
    console.error("Embed error: missing data-config");
    return;
  }

  const origin = new URL(script.src).origin;
  const EMBED_URL = `${origin}/embed#${config}`;
  const Z_INDEX = "2147483647";

  // ===== Open button =====
  const openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.innerText = "💬 Chat";
  Object.assign(openBtn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: Z_INDEX,
    padding: "12px 16px",
    borderRadius: "999px",
    border: "none",
    background: "#22c55e",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  });

  // ===== Container =====
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "360px",
    height: "520px",
    zIndex: Z_INDEX,
    display: "none",
    borderRadius: "14px",
    overflow: "hidden",
    background: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  });

  // ===== Header =====
  const header = document.createElement("div");
  Object.assign(header.style, {
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px",
    background: "#111827",
    color: "white",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    fontSize: "14px",
  });

  const title = document.createElement("div");
  title.innerText = "Chat";
  title.style.fontWeight = "600";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.innerText = "✕";
  Object.assign(closeBtn.style, {
    border: "none",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    fontSize: "18px",
    padding: "6px 8px",
  });

  header.appendChild(title);
  header.appendChild(closeBtn);

  // ===== Iframe =====
  const iframe = document.createElement("iframe");
  iframe.src = EMBED_URL;
  Object.assign(iframe.style, {
    width: "100%",
    height: "calc(100% - 44px)",
    border: "none",
  });

  container.appendChild(header);
  container.appendChild(iframe);

  document.body.appendChild(openBtn);
  document.body.appendChild(container);

  function openChat() {
    container.style.display = "block";
    openBtn.style.display = "none";
  }

  function closeChat() {
    container.style.display = "none";
    openBtn.style.display = "inline-block";
  }

  openBtn.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChat();
  });
})();
