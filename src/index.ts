import { getWords } from "./words";

const wordsBox = document.querySelector(".words-box");
const inputField = document.getElementById("input-field") as HTMLInputElement;
const timer = document.querySelector(".timer-text");
const restartBtn = document.querySelector(".restart-btn");
const resultMenu = document.querySelector(".result-menu");
const wpmText = document.querySelector(".wpm");

let words: string[];
let index = 0;
let correctCount = 0;

let wordsDisplayMax = 18;
let displayedWordsIndex = 0;

let curTimer: ReturnType<typeof startTimer> | null;

inputField?.addEventListener("input", onInput);
inputField?.addEventListener("beforeinput", onBeforeInput);
restartBtn?.addEventListener("click", start);

function reset() {
  inputField.value = "";
  index = 0;
  correctCount = 0;
  displayedWordsIndex = 0;
  curTimer?.stop();
}

async function start() {
  reset();

  const wordsData = await getWords();
  words = wordsData ?? [];

  displayWords();

  curTimer = startTimer(
    60000,
    1000,
    (timeLeft) => {
      const seconds = (timeLeft / 1000).toString();
      const timeResult = `0:${seconds.length < 2 ? "0" + seconds : seconds}`;
      if (timer) {
        timer.textContent = timeResult;
      }
    },
    () => {
      resultMenu?.setAttribute("style", "");
      if (wpmText) wpmText.textContent = correctCount + " WPM";
    }
  );

  styleCurWord("still");
}

function displayWords() {
  if (!wordsBox) return;

  displayedWordsIndex = 0;
  const remainingWordsCount = words.length - index;

  Array.from(wordsBox.children).forEach((child, f, s) => {
    child.remove();
  });
  for (
    let i = 0, offset = index;
    i < Math.min(wordsDisplayMax, remainingWordsCount);
    i++, offset++
  ) {
    const word = words[offset];
    const elem = document.createElement("div");
    elem.textContent = word;
    elem.className = "word";
    wordsBox.append(elem);
  }
}

function onInput(ev: Event) {
  curTimer?.start()
  if (ev instanceof InputEvent) {
    const state = isPartiallyCorrect() ? "correct" : "wrong";
    styleCurWord(state);
  }
}

function onBeforeInput(ev: Event) {
  if (ev instanceof InputEvent) {
    if (ev.data === " ") {
      ev.preventDefault();
      next();
    }
  }
}

function next() {
  if (isCorrect()) {
    correctCount++;
    styleCurWord("correct");
  } else {
    styleCurWord("wrong");
  }

  inputField.value = "";
  index++;
  displayedWordsIndex++;

  if (displayedWordsIndex >= wordsDisplayMax) {
    displayWords();
  }

  styleCurWord("still");
}

function isCorrect() {
  return inputField.value === words[index];
}

function isPartiallyCorrect() {
  const length = inputField.value.length;
  const slice = words[index].slice(0, length);
  return inputField.value === slice;
}

function styleCurWord(state: "still" | "correct" | "wrong") {
  if (!wordsBox || !wordsBox.children[displayedWordsIndex]) return;

  wordsBox.children[displayedWordsIndex].classList.add("current");
  switch (state) {
    case "correct":
      wordsBox.children[displayedWordsIndex].classList.add("correct");
      wordsBox.children[displayedWordsIndex].classList.remove("wrong");
      break;
    case "wrong":
      wordsBox.children[displayedWordsIndex].classList.add("wrong");
      wordsBox.children[displayedWordsIndex].classList.remove("correct");
      break;
  }
  if (displayedWordsIndex > 0) {
    wordsBox.children[displayedWordsIndex - 1].classList.remove("current");
  }
}

function startTimer(
  durationMs = 60000,
  updateEveryMs = 1000,
  updateCb?: (timeLeft: number) => void,
  finishCb?: () => void
) {
  let timeMs = durationMs;
  let started = false;
  let stopped = false;

  if (updateCb) {
    updateCb(timeMs);
  }

  function loop() {
    if (stopped) return;

    timeMs -= updateEveryMs;

    if (updateCb) {
      updateCb(timeMs);
    }

    setTimeout(() => {
      if (timeMs > 0) {
        loop();
      } else {
        if (finishCb) {
          finishCb();
        }
      }
    }, updateEveryMs);
  }

  return {
    stop: () => {
      stopped = true;
    },
    start: () => {
      if (!started) {
        started = true;
        loop();
      }
    },
  };
}

start();
