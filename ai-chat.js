// AI Chat Engine - Safe & Production Ready
window.aiChat = (function () {
  let apiKey = localStorage.getItem("anthropic_api_key") || "";
  let chatHistory = [];
  let totalRequests = parseInt(localStorage.getItem("ai_total_requests") || "0");
  let totalTokens = parseInt(localStorage.getItem("ai_total_tokens") || "0");
  let startTime = localStorage.getItem("ai_start_time") || Date.now().toString();

  // ✅ SAFE EVENT HELPER
  function safeAddListener(el, event, handler) {
    if (el) el.addEventListener(event, handler);
  }

  function saveStats() {
    localStorage.setItem("ai_total_requests", totalRequests);
    localStorage.setItem("ai_total_tokens", totalTokens);
    localStorage.setItem("ai_start_time", startTime);
  }

  function updateMetrics() {
    document.querySelectorAll("[data-ai-requests]").forEach(el => el.textContent = totalRequests);
    document.querySelectorAll("[data-ai-tokens]").forEach(el => el.textContent = totalTokens);
    document.querySelectorAll("[data-ai-users]").forEach(el => el.textContent = "1");

    const uptimeMs = Date.now() - parseInt(startTime);
    const hours = Math.floor(uptimeMs / 3600000);
    const mins = Math.floor((uptimeMs % 3600000) / 60000);

    document.querySelectorAll("[data-ai-uptime]").forEach(el => {
      el.textContent = `${hours}h ${mins}m`;
    });
  }

  function getPageType() {
    const page = document.body?.getAttribute("x-data") || "";
    if (page.includes("imageGenerator")) return "image";
    if (page.includes("codeGenerator")) return "code";
    if (page.includes("videoGenerator")) return "video";
    return "text";
  }

  function getSystemPrompt(type) {
    return {
      text: "You are an expert content writer.",
      image: "You are an expert AI image prompt engineer.",
      code: "You are an expert software engineer.",
      video: "You are an expert video scriptwriter."
    }[type] || "You are an AI assistant.";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollToBottom() {
    const el =
      document.querySelector(".custom-scrollbar.relative") ||
      document.querySelector(".no-scrollbar.relative");
    if (el) el.scrollTop = el.scrollHeight;
  }

  function createUserMessage(text) {
    const div = document.createElement("div");
    div.innerHTML = `<p>${escapeHtml(text)}</p>`;
    return div;
  }

  function createAIMessage() {
    const div = document.createElement("div");
    div.innerHTML = `<p class="ai-text-content">Generating...</p>`;
    return div;
  }

  function updateAIMessage(el, content) {
    const textEl = el.querySelector(".ai-text-content");
    if (textEl) textEl.innerHTML = content.replace(/\n/g, "<br>");
  }

  async function sendMessage(textarea) {
    if (!apiKey) return alert("Add API Key");

    const text = textarea?.value?.trim();
    if (!text) return;

    textarea.value = "";

    const chatContainer =
      document.querySelector(".custom-scrollbar.relative") ||
      document.querySelector('[class*="space-y"]');

    if (!chatContainer) return;

    chatContainer.appendChild(createUserMessage(text));
    const aiMsg = createAIMessage();
    chatContainer.appendChild(aiMsg);

    scrollToBottom();

    try {
      chatHistory.push({ role: "user", content: text });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: chatHistory
        })
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error.message);

      const content = data.content?.[0]?.text || "No response";

      chatHistory.push({ role: "assistant", content });

      totalRequests++;
      totalTokens += (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

      saveStats();
      updateMetrics();
      updateAIMessage(aiMsg, content);
    } catch (err) {
      updateAIMessage(aiMsg, "Error: " + err.message);
    }

    scrollToBottom();
  }

  function clearChat() {
    const chatContainer =
      document.querySelector(".custom-scrollbar.relative") ||
      document.querySelector('[class*="space-y"]');
    if (chatContainer) chatContainer.innerHTML = "";
  }

  function init() {
    if (!localStorage.getItem("ai_start_time")) {
      localStorage.setItem("ai_start_time", Date.now());
    }

    updateMetrics();
    setInterval(updateMetrics, 60000);

    const sendBtn = document.getElementById("chat-send-btn");
    const textarea = document.querySelector("textarea");

    // ✅ SAFE EVENTS
    if (sendBtn && textarea) {
      sendBtn.onclick = () => sendMessage(textarea);
    }

    safeAddListener(textarea, "keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(textarea);
      }
    });
  }

  return { init, sendMessage, clearChat };
})();

// ✅ SAFE INIT
document.addEventListener("DOMContentLoaded", () => {
  if (window.aiChat) window.aiChat.init();
});