// NEW IDEA, YOU CAN UNLOCK NEW BUDDIES BY AMOUNT OF TIME STUDYING
import { buddies, renderBuddyButton } from './buddies.js';

function startBuddies() {
  // Container to contain the list of buddies
  const container = document.getElementById("buddy-list");

  // Loop through each existing buddy
  buddies.forEach(buddy => {
    let button = renderBuddyButton(buddy);

    // Event listener for each buddy button
    button.addEventListener("click", () => { // On click, we call this function
      // Accessing both checkboxes in the html code
      const regularCheckbox = document.getElementById("regular-checkbox");
      const pomodoroCheckbox = document.getElementById("pomodoro-checkbox");

      // Define some object to have these components (later stored in local storage)
      let storageData = {
        selectedBuddy: buddy,
        showBuddy: true, // Always set to true when selecting a buddy
        timerMode: null, // 'regular' or 'pomodoro'
        startTimestamp: Date.now(),  // Initial timestamp for tracking the time we started studying 
        studySessionId: Date.now(), // Differentiate different study sessions
      };

      // Actions to do if the regular checkbox was checked
      if (regularCheckbox.checked) {
        const hours = parseInt(document.getElementById("hours").value || 0); // Accessing the number of hours inputted
        const minutes = parseInt(document.getElementById("minutes").value || 0); // Accessing the number of minutes inputted
        if (hours === 0 && minutes === 0) {
          alert("Please enter a study duration for the Regular Timer.");
          return;
        }
        // New elements for storage data according to the regular timer
        storageData.timerMode = 'regular';
        storageData.studyHours = hours;
        storageData.studyMinutes = minutes;

        // Actions to do if the pomodoro checkbox was checked
      } else if (pomodoroCheckbox.checked) {
        const intervalTime = parseInt(document.getElementById("pomodoro-interval").value || 0); // Accessing the interval time
        const numIntervals = parseInt(document.getElementById("pomodoro-no-intervals").value || 0); // Accessing the no. of intervals
        const breakTime = parseInt(document.getElementById("pomodoro-break").value || 0); // Accessing the break time

        if (intervalTime === 0 || numIntervals === 0 || breakTime === 0) {
          alert("Please fill in all Pomodoro settings.");
          return;
        }
        // New elements for storage data according to the pomodoro timer
        storageData.timerMode = 'pomodoro';
        storageData.pomodoroIntervalTime = intervalTime;
        storageData.pomodoroNumIntervals = numIntervals;
        storageData.pomodoroBreakTime = breakTime;
        storageData.currentPomodoroInterval = 1; // Start at interval 1
        storageData.isPomodoroBreak = false; // Start in study mode
      } else {
        alert("Please select a timer type (Regular or Pomodoro).");
        return;
      }

      // After setting storageData:
      chrome.storage.local.set(storageData).then(() => {
        alert(`${buddy.name} is now your study buddy! Starting your session.`);

        // Inject on other tabs as well
        chrome.tabs.query({}, (tabs) => { // Load the content
          for (let tab of tabs) {

            chrome.scripting.executeScript({ // Actually run the content.js file in all the currently opened tabs
              target: { tabId: tab.id },
              files: ["content.js"]
            }, () => {
              chrome.scripting.executeScript({ // This callback function ensures that the window.loadContent() function inside content.js be called only once the content.js file has fully loaded  and checks of winow.loadContent exists before trying to call it
                target: { tabId: tab.id },
                func: () => window.loadContent && window.loadContent() 
              });
            });

          }
        });
      });

    }); // *** END OF THE BUTTON EVENT LISTENER ***

    container.appendChild(button); // Appending the buddy button to the buddy list container
  }); // *** END OF THE BUDDY FOR LOOP ***

  // Stop Studying Button
  document.querySelector(".js-stop-studying-btn").addEventListener("click", () => {
    // Clearing everything in local storage (except the study session id)
    chrome.storage.local.set({
      showBuddy: false, // Hide the buddy
      timerMode: null, // Clear timer mode
      selectedBuddy: null, // Clear selected buddy
      studyHours: null, // Clear regular timer data
      studyMinutes: null,
      startTimestamp: null,
      pomodoroIntervalTime: null, // Clear pomodoro data
      pomodoroNumIntervals: null,
      pomodoroBreakTime: null,
      currentPomodoroInterval: null,
      isPomodoroBreak: null,
    }).then(() => {
      alert("Study session ended. Buddy Hidden!");
    });
  });

  // Input Validation for hours/minutes of regular study timer
  document.getElementById("hours").addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 24) e.target.value = 24;
    else if (val < 0 || isNaN(val) || e.target.value.includes('.')) e.target.value = ""; // Handle negative or empty input
  });

  document.getElementById("minutes").addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 59) e.target.value = 59;
    else if (val < 0 || isNaN(val) || e.target.value.includes('.')) e.target.value = "";
  });

  // Pomodoro input validation
  document.getElementById("pomodoro-interval").addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (val < 1 || isNaN(val) || e.target.value.includes('.')) e.target.value = "";
  });
  document.getElementById("pomodoro-no-intervals").addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (val < 1 || isNaN(val) || e.target.value.includes('.')) e.target.value = "";
  });
  document.getElementById("pomodoro-break").addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (val < 1 || isNaN(val) || e.target.value.includes('.')) e.target.value = "";
  });

  // Checkbox logic for displaying relevant inputs
  const regularCheckbox = document.getElementById("regular-checkbox");
  const pomodoroCheckbox = document.getElementById("pomodoro-checkbox");

  const regularInputs = document.getElementById("study-time-input");
  const pomodoroSettings = document.getElementById("pomodoro-settings");

  regularCheckbox.addEventListener("change", () => {
    if (regularCheckbox.checked) {
      pomodoroCheckbox.checked = false;
      regularInputs.style.display = "flex";
      pomodoroSettings.style.display = "none";
    } else {
      regularInputs.style.display = "none";
    }
  });

  pomodoroCheckbox.addEventListener("change", () => {
    if (pomodoroCheckbox.checked) {
      regularCheckbox.checked = false;
      pomodoroSettings.style.display = "flex";
      regularInputs.style.display = "none";
    } else {
      pomodoroSettings.style.display = "none";
    }
  });

}; // *** END OF STARTBUDDIES FUNCTION *** 

startBuddies(); // Running the entire file