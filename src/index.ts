import { getWords } from "./words";

const wordsBox = document.querySelector(".words-box");
const inputField = document.getElementById("input-field") as HTMLInputElement;
const timer = document.querySelector(".timer");
const restartBtn = document.querySelector(".restart-btn");
const resultMenu = document.querySelector(".result-menu");
const wpmText = document.querySelector(".wpm");

let words: string[];
let index = 0;
let correctCount = 0;

inputField?.addEventListener("input", onInput);
inputField?.addEventListener("beforeinput", onBeforeInput);
restartBtn?.addEventListener("click", start);

async function start() {
  if (!wordsBox) return;

  const wordsData = await getWords();
  words = wordsData ?? [];
  inputField.value = "";
  index = 0;
  correctCount = 0;

  Array.from(wordsBox.children).forEach((child, f, s) => {
    child.remove();
  });
  if (words) {
    words.forEach((word) => {
      const elem = document.createElement("div");
      elem.textContent = word;
      elem.className = "word";
      wordsBox.append(elem);
    });
  }

  startTimer(60000, 1000, (timeLeft) => {
    if (timer) {
      timer.textContent = (timeLeft / 1000).toString();
    }
  }, () => {
    resultMenu?.setAttribute("style", "display: block;")
    if(wpmText)
    wpmText.textContent = correctCount + " WPM"
  });

  styleCurWord("still");
}

function onInput(ev: Event) {
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
  if (wordsBox) {
    wordsBox.children[index].classList.add("current");
    switch (state) {
      case "correct":
        wordsBox.children[index].classList.add("correct");
        wordsBox.children[index].classList.remove("wrong");
        break;
      case "wrong":
        wordsBox.children[index].classList.add("wrong");
        wordsBox.children[index].classList.remove("correct");
        break;
    }
    if (index > 0) {
      wordsBox.children[index - 1].classList.remove("current");
    }
  }
}

function startTimer(
  durationMs = 60000,
  updateEveryMs = 1000,
  updateCb?: (timeLeft: number) => void,
  finishCb?: () => void
) {
  let timeMs = durationMs;
  loop();
  function loop() {
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
}

start();
