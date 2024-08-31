import { drawingState, canvas } from "./init.js";
import { handlePointerDown, handleToolsClick } from "./eventHandlers.js";

const toolsBtns = document.body.querySelectorAll(
  ".tools > button:not(.show-btn)"
);

const dBtn = document.body.querySelector(".d-btn");
const colorCircles = document.body.querySelectorAll(".colors .circle");
const colorBtns = document.body.querySelectorAll(".colors button");
const widthCircles = document.body.querySelectorAll(".width .circle");
const widthBtns = document.body.querySelectorAll(".width button");

const modes = ["stroke", "circle", "line", "erase"];

toolsBtns.forEach((toolsBtn, i, btns) => {
  toolsBtn.addEventListener("click", () => {
    drawingState.state = modes[i];
    btns.forEach((btn) => {
      btn.classList.remove("active");
    });
    toolsBtn.classList.add("active");
    handleToolsClick();
  });
});

handleToolsClick();

colorCircles.forEach((circle) => {
  circle.style.backgroundColor = circle.dataset.color;
});

colorBtns.forEach((colorBtn, i) => {
  if (colorBtn.classList.contains("active")) {
    colorBtn.style.backgroundColor = colorBtn.children[0].dataset.color;
    colorBtn.children[0].style.backgroundColor = "white";
  }
  colorBtn.addEventListener("click", () => {
    const COLOR = colorBtn.children[0].dataset.color;
    colorBtns.forEach((btn) => {
      btn.style.backgroundColor = "transparent";
      btn.children[0].style.backgroundColor = btn.children[0].dataset.color;
      btn.classList.remove("active");
    });
    drawingState.color = COLOR;
    colorBtn.style.backgroundColor = COLOR;
    colorBtn.children[0].style.backgroundColor = "white";
    colorBtn.classList.add("active");
  });
  colorBtn.addEventListener("mouseenter", () => {
    if (!colorBtn.classList.contains("active")) {
      colorBtn.style.backgroundColor = "hsl(0 0% 0% / 0.2)";
    }
  });
  colorBtn.addEventListener("mouseleave", () => {
    if (!colorBtn.classList.contains("active")) {
      colorBtn.style.backgroundColor = "transparent";
    }
  });
});

widthCircles.forEach((circle) => {
  circle.style.width = +circle.dataset.width * 3 + "px";
});

widthBtns.forEach((widthBtn) => {
  widthBtn.addEventListener("click", () => {
    widthBtns.forEach((btn) => {
      btn.classList.remove("active");
    });
    widthBtn.classList.add("active");
    canvas.classList.remove(`erase-${drawingState.weight}`);
    document.body.classList.remove(`erase-${drawingState.weight}`);
    drawingState.weight = +widthBtn.children[0].dataset.width;
    canvas.classList.add(`erase-${drawingState.weight}`);
    document.body.classList.add(`erase-${drawingState.weight}`);
    if (!dBtn.classList.contains("active")) {
      drawingState.lineWidth = drawingState.weight;
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerDown);
    } else {
      window.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerDown);
    }
  });
});

dBtn.addEventListener("click", () => {
  dBtn.classList.toggle("active");
  if (!dBtn.classList.contains("active")) {
    drawingState.lineWidth = drawingState.weight;
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerDown);
  } else {
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerDown);
  }
});
