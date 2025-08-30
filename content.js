// Load the font first
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

window.loadContent = async function loadContent() {
  const { studySessionId } = await chrome.storage.local.get("studySessionId");
  const mySessionId = studySessionId; // This identifies the session this tab is handling

  // Clear any previous intervals
  if (window.currentCountdownInterval) {
    clearInterval(window.currentCountdownInterval);
  }

  // Remove old container if it exists (taking care of duplicates)
  const oldContainer = document.getElementById("study-buddy-container");
  if (oldContainer) {
    oldContainer.remove();
  }

  // MOVE STYLE TO CSS STYLESHEET
  // Global container for both
  const container = document.createElement("div");
  container.id = "study-buddy-container";
  Object.assign(container.style, {
    position: "fixed",
    bottom: "20px",
    right: "30px",
    width: "100px",
    height: "120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: "9999", // Stacks buddy on top of almost everything in the webpage, ensuring it is almost always visible
    // Allows user to click through
    pointerEvents: "none"
  });
  document.body.appendChild(container);

  // Make buddy dissappear if we hover over it
  document.addEventListener("mousemove", (event) => {
    const rect = container.getBoundingClientRect();
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    container.style.opacity = isInside ? "0" : "1";
  });

  // === Buddy ===
  async function displayBuddy() {
    const { selectedBuddy } = await chrome.storage.local.get("selectedBuddy");
    if (!selectedBuddy) return;

    const gif = document.createElement("img");
    gif.src = chrome.runtime.getURL(selectedBuddy.img);
    gif.alt = selectedBuddy.name;
    Object.assign(gif.style, {
      width: "100%",
      height: "100px",
    });
    container.appendChild(gif);
  }

  let timer;
  // === Timer ===
  function createTimerDisplay() {
    timer = document.createElement("div");
    timer.id = "study-timer";
    // Default text content while we await data
    timer.textContent = "You Got This!"
    Object.assign(timer.style, {
      position: "relative",
      top: "-5px",
      backgroundColor: "rgba(0,0,0,0.7)",
      border: "1px solid white",
      borderRadius: "4px",
      padding: "4px 6px",
      fontSize: "8px",
      fontFamily: "'Press Start 2P', monospace",
      color: "white",
      whiteSpace: "nowrap",
      textAlign: "center"
    });
    container.appendChild(timer);
  }

  // ID for the interval so that we can assign and clear it 
  let currentCountdownInterval;

  async function updateTimer() {
    const { timerMode } = await chrome.storage.local.get("timerMode");
    const timer = document.getElementById("study-timer");

    // ***** REGULAR TIMER *****
    if (timerMode === 'regular') {
      const { studyHours, studyMinutes, startTimestamp } = await chrome.storage.local.get(["studyHours", "studyMinutes", "startTimestamp"]);

      currentCountdownInterval = setInterval(async () => {

        // ShowBuddy check and Correct Session check
        let showBuddy = false;
        let latestSessionId = 0;
        // Catches the error in case the extension is removed and no longer have access to local storage
        try {
          const result1 = await chrome.storage.local.get("showBuddy");
          showBuddy = result1.showBuddy;
          const result2 = await chrome.storage.local.get("studySessionId");
          latestSessionId = result2.studySessionId;
        } 
        catch(e) {}

        // Clears old interval so that it doesnt interrupt the new one and randomly remove the new buddy from the screen
        // ONLY AFFECTS OLD TIMER
        if (!showBuddy || latestSessionId !== mySessionId) {
          clearInterval(currentCountdownInterval);
          container.remove();
          return;
        }        

        let totalSeconds = (Number(studyHours) * 3600) + (Number(studyMinutes) * 60) - Math.floor((Date.now() - startTimestamp) / 1000);

        if (totalSeconds <= 0) {
          clearInterval(currentCountdownInterval);
          timer.textContent = "Time's Up!";
          // Remove buddy after 5 seconds
          setTimeout(async () => {
            const { studySessionId: latestSessionId } = await chrome.storage.local.get("studySessionId");   
            if (latestSessionId !== mySessionId) {
              // A new session has started since this one ended — do nothing (dont want to remove the new buddy session that started)
              return;
            }
            // AFFECTS NEW TIMER
            chrome.runtime.sendMessage({ action: "removeBuddy" });
            await chrome.storage.local.set({ showBuddy: false });
            container.remove();
          }, 5000);          
          return;
        }
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.ceil((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;
        timer.textContent = `STUDY: ${totalSeconds > 60 ? `${hours}:${minutes < 10 ? '0' : ''}${minutes}` : `${seconds < 10 ? '0' : ''}${seconds}`}`;
      }, 1000);

      // ***** POMODORO TIMER *****
    } else if (timerMode === 'pomodoro') {
      const { pomodoroNumIntervals, pomodoroIntervalTime, pomodoroBreakTime, isPomodoroBreak, startTimestamp } = await chrome.storage.local.get([
        "pomodoroNumIntervals",
        "pomodoroIntervalTime",
        "pomodoroBreakTime",
        "isPomodoroBreak",
        "startTimestamp"
      ]);

      const { currentPomodoroInterval = 1 } = await chrome.storage.local.get("currentPomodoroInterval");


      runPomodoro(currentPomodoroInterval, pomodoroNumIntervals, pomodoroIntervalTime, pomodoroBreakTime, isPomodoroBreak, startTimestamp);


    } else {
      return;
    }
  }

  async function runPomodoro(currentInterval, numIntervals, intervalTime, breakTime, isBreak, startTimestamp) {
    currentCountdownInterval = setInterval(async () => {

      // ShowBuddy check and Correct Session check
      let showBuddy = false;
      let latestSessionId = 0;
      // Catches the error in case the extension is removed and no longer have access to local storage
      try {
        const result1 = await chrome.storage.local.get("showBuddy");
        showBuddy = result1.showBuddy;
        const result2 = await chrome.storage.local.get("studySessionId");
        latestSessionId = result2.studySessionId;
      } 
      catch(e) {}

      // ShowBuddy Check and Correct Session check
      if (!showBuddy || latestSessionId !== mySessionId) {
        clearInterval(currentCountdownInterval);
        container.remove();
        return;
      }
      

      // The timestamp denotes the beginning of the new interval (study or break)
      const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
      const targetDuration = (isBreak ? breakTime : intervalTime) * 60;
      const remainingSeconds = targetDuration - elapsedSeconds;

      if (remainingSeconds <= 0) {
        clearInterval(currentCountdownInterval)

        if (!isBreak && currentInterval < numIntervals) { // check if we just ended a study interval, and if we have more to do
          await chrome.storage.local.set({
            isPomodoroBreak: true,
            currentPomodoroInterval: currentInterval + 1,
            startTimestamp: Date.now()
          });
          runPomodoro(currentInterval + 1, numIntervals, intervalTime, breakTime, true, Date.now());
        } else if (isBreak) { // check if we just ended a break
          await chrome.storage.local.set({
            isPomodoroBreak: false,
            startTimestamp: Date.now()
          });
          runPomodoro(currentInterval, numIntervals, intervalTime, breakTime, false, Date.now());
        } else {
          timer.textContent = "Time's Up!";
          setTimeout(async () => {
            const { studySessionId: latestSessionId } = await chrome.storage.local.get("studySessionId");
          
            if (latestSessionId !== mySessionId) {
              // A new session has started since this one ended — do nothing
              return;
            }
            chrome.runtime.sendMessage({ action: "removeBuddy" });
            await chrome.storage.local.set({ showBuddy: false });
            container.remove();
          }, 5000);

        }
        return;
      }

      let minutes = Math.floor(remainingSeconds / 60);
      let seconds = remainingSeconds % 60;
      timer.textContent = `${isBreak ? 'BREAK' : 'STUDY'} ${isBreak ? `` : `${currentInterval}/${numIntervals}`} : ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
  }

  chrome.storage.local.get("showBuddy", ({ showBuddy }) => {
    if (showBuddy) {
      createTimerDisplay()
      displayBuddy()
      updateTimer()
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "removeBuddy") {
      container.remove();
      clearInterval(currentCountdownInterval);
      return;
    }
  });
} // ----- END OF THE LOADCONTENT FUNCTION -----

// On page load, automatically load buddy if user was studying, but first ensure the font is loaded to avoid styling issues
Promise.all([
  document.fonts.ready,
  document.fonts.load("8px 'Press Start 2P'")
]).then(() => {
  chrome.storage.local.get("showBuddy", ({ showBuddy }) => {
    if (showBuddy && typeof window.loadContent === "function") {
      window.loadContent();
    }
  });
});

