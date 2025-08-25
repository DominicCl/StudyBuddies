// timer.js
import { getStorage, setStorage } from './storage.js';

let currentCountdownInterval;

export function clearCurrentInterval() {
  clearInterval(currentCountdownInterval);
}

export function startRegularTimer(container, timerEl, hours, minutes, onFinish) {
  let totalSeconds = (Number(hours) * 3600) + (Number(minutes) * 60);

  currentCountdownInterval = setInterval(async () => {
    const { showBuddy } = await getStorage("showBuddy");
    if (!showBuddy) {
      container.remove();
      clearCurrentInterval();
      return;
    }

    if (totalSeconds <= 0) {
      clearCurrentInterval();
      timerEl.textContent = "Time's Up!";
      setTimeout(() => container.remove(), 5000);
      onFinish?.();
      return;
    }

    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    timerEl.textContent = `STUDY: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    totalSeconds--;
  }, 1000);
}

export function runPomodoro(container, timerEl, currentInterval, numIntervals, intervalTime, breakTime, isBreak) {
  let intervalTimeSec = intervalTime * 60;
  let breakTimeSec = breakTime * 60;

  const pomodoroStep = async () => {
    const { showBuddy } = await getStorage("showBuddy");
    if (!showBuddy) {
      container.remove();
      clearCurrentInterval();
      return;
    }
  };

  if (!isBreak) {
    if (currentInterval <= numIntervals) {
      currentCountdownInterval = setInterval(() => {
        pomodoroStep().then(() => {
          if (intervalTimeSec <= 0) {
            clearCurrentInterval();
            setStorage({
              isPomodoroBreak: true,
              currentPomodoroInterval: currentInterval + 1
            });
            runPomodoro(container, timerEl, currentInterval + 1, numIntervals, intervalTime, breakTime, true);
            return;
          }
          let minutes = Math.floor(intervalTimeSec / 60);
          let seconds = intervalTimeSec % 60;
          timerEl.textContent = `STUDY: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          intervalTimeSec--;
        });
      }, 1000);
    }
  } else {
    if (currentInterval > numIntervals) {
      clearCurrentInterval();
      timerEl.textContent = "Time's Up!";
      setTimeout(() => container.remove(), 5000);
      return;
    }
    currentCountdownInterval = setInterval(() => {
      pomodoroStep().then(() => {
        if (breakTimeSec <= 0) {
          clearCurrentInterval();
          setStorage({ isPomodoroBreak: false });
          runPomodoro(container, timerEl, currentInterval, numIntervals, intervalTime, breakTime, false);
          return;
        }
        let minutes = Math.floor(breakTimeSec / 60);
        let seconds = breakTimeSec % 60;
        timerEl.textContent = `BREAK: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        breakTimeSec--;
      });
    }, 1000);
  }
}
