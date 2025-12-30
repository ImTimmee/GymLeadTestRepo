(function () {
  const script = document.currentScript;
  if (!script) return;

  /**
   * Gebruik bij voorkeur:
   * data-chatbot-url="https://jouwdomein/chat/..."
   * 
   * Fallback:
   * data-chatbot-id="..."
   */
  const chatbotUrlAttr = script.getAttribute("data-chatbot-url");
  const chatbotId = script.getAttribute("data-chatbot-id");

  let CHAT_URL = chatbotUrlAttr;

  if (!CHAT_URL) {
    if (!chatbotId) {
      console.error(
        "Chatbot embed error: provide data-chatbot-url OR data-chatbot-id"
      );
      return;
    }

    // automatisch juiste domein (vercel nu, custom domain later)
    const origin = new URL(script.src).origin;
    CHAT_URL = `${origin}/chat/${chatbotId}`;
  }

  const Z_INDEX = "2147483647";

  // ===== Open button =====
  const openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.innerText = "💬 Chat";
  openBtn.setAttribute("aria-label", "Open chat");
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
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    fontSize: "14px",
  });

  const title = document.createElement("div");
  title.innerText = "Chat";
  title.style.fontWeight = "600";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.innerText = "✕";
  closeBtn.setAttribute("aria-label", "Close chat");
  Object.assign(closeBtn.style, {
    border: "none",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    fontSize: "18px",
    padding: "6px 8px",
    borderRadius: "8px",
  });

  closeBtn.onmouseenter = () => {
    closeBtn.style.background = "rgba(255,255,255,0.12)";
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = "transparent";
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // ===== Iframe =====
  const iframe = document.createElement("iframe");
  iframe.src = CHAT_URL;
  iframe.title = "Chatbot";
  Object.assign(iframe.style, {
    width: "100%",
    height: "calc(100% - 44px)",
    border: "none",
    display: "block",
  });

  container.appendChild(header);
  container.appendChild(iframe);

  // ===== Mount =====
  document.body.appendChild(openBtn);
  document.body.appendChild(container);

  // ===== Logic =====
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

  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && container.style.display === "block") {
      closeChat();
    }
  });
})();
