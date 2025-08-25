// ui.js

// === Font Loader ===
export function loadBuddyFont() {
  const fontLink = document.createElement("link");
  fontLink.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink);
}

// === Timer Display Creator ===
export function createTimerDisplay() {
  const timer = document.createElement("div");
  timer.id = "study-timer";
  timer.textContent = "You Got This!";
  Object.assign(timer.style, {
    position: "relative",
    top: "-5px",
    backgroundColor: "rgba(0,0,0,0.7)",
    border: "1px solid white",
    borderRadius: "4px",
    padding: "4px 6px",
    fontSize: "10px",
    fontFamily: "'Press Start 2P', monospace",
    color: "white",
    whiteSpace: "nowrap",
    textAlign: "center"
  });
  return timer;
}

// === Buddy Container Creator ===
export function createBuddyContainer(buddyImg, buddyName) {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "100px",
    height: "120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: "9999"
  });

  const gif = document.createElement("img");
  gif.src = chrome.runtime.getURL(buddyImg);
  gif.alt = buddyName;
  Object.assign(gif.style, {
    width: "100%",
    height: "100px"
  });

  gif.addEventListener("mouseenter", () => container.style.opacity = "0");
  gif.addEventListener("mouseleave", () => container.style.opacity = "1");

  container.appendChild(gif);

  return { container, gif };
}
