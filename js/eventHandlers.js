import {
  drawingsObj,
  drawingState,
  lastCurveState,
  points,
  canvas,
} from "./init.js";
import { drawStroke, ref, drawAnim, eraseAt } from "./drawingUtils.js";
import { Line, Circle } from "./shapes.js";

export let strokeMouseEvents = {
  mousedown: (e) => {
    drawingState.isDrawing = true;
    lastCurveState.lastX = e.clientX;
    lastCurveState.lastY = e.clientY;
    lastCurveState.lastMidX = lastCurveState.lastX;
    lastCurveState.lastMidY = lastCurveState.lastY;
  },
  mousemove: (e) => {
    if (!drawingState.isDrawing) return;
    drawStroke(
      e.clientX,
      e.clientY,
      drawingState.color,
      drawingState.lineWidth
    );
  },
  mouseup_out: () => {
    drawingState.isDrawing = false;
    drawingsObj.drawings.push(drawingsObj.stroke);
    drawingsObj.stroke = [];
  },
};

export const handleMouseMove = (e) => {
  points.p2.x = e.x;
  points.p2.y = e.y;
};

export const handleClick = (e) => {
  if (drawingState.isDrawing) {
    canvas.removeEventListener("mousemove", handleMouseMove);
    drawingState.isDrawing = false;
    if (drawingState.state === "line")
      drawingsObj.drawings.push(
        new Line(
          points.p1.x,
          points.p1.y,
          points.p2.x,
          points.p2.y,
          drawingState.color,
          drawingState.lineWidth
        )
      );
    if (drawingState.state === "circle")
      drawingsObj.drawings.push(
        new Circle(
          points.p1.x,
          points.p1.y,
          Math.hypot(points.p1.x - points.p2.x, points.p1.y - points.p2.y),
          drawingState.color,
          "transparent",
          drawingState.lineWidth
        )
      );
    points.p1.x = points.p2.x = points.p1.y = points.p2.y = undefined;
  } else {
    points.p1.x = e.clientX;
    points.p1.y = e.clientY;
    canvas.addEventListener("mousemove", handleMouseMove);
    drawingState.isDrawing = true;
  }
};

export const handlePointerDown = (e) => {
  drawingState.lineWidth =
    e.pressure * drawingState.weight || drawingState.weight;
};

const dBtn = document.body.querySelector(".d-btn");

const handleMouseDownDelete = () => {
  canvas.classList.remove(`erase-${drawingState.weight}`);
  canvas.classList.add(`erase-${drawingState.weight}-pressed`);
};

const handleMouseUpDelete = () => {
  canvas.classList.add(`erase-${drawingState.weight}`);
  canvas.classList.remove(`erase-${drawingState.weight}-pressed`);
};

export const handleToolsClick = () => {
  if (drawingState.state === "stroke") {
    cancelAnimationFrame(ref);
    canvas.classList.remove(`erase-${drawingState.weight}`);
    document.body.classList.remove(`erase-${drawingState.weight}`);
    canvas.classList.add("crosshair");
    document.body.classList.add("crosshair");
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("click", handleClick);
    canvas.removeEventListener("mousedown", startErasing);
    canvas.removeEventListener("mousemove", eraseWhileMouseDown);
    canvas.removeEventListener("mouseup", stopErasing);
    canvas.removeEventListener("mousedown", handleMouseDownDelete);
    canvas.removeEventListener("mouseup", handleMouseUpDelete);
    canvas.removeEventListener("mouseleave", handleMouseUpDelete);
    drawingState.isDrawing = false;
    canvas.addEventListener("mousedown", strokeMouseEvents.mousedown);
    canvas.addEventListener("mousemove", strokeMouseEvents.mousemove);
    canvas.addEventListener("mouseup", strokeMouseEvents.mouseup_out);
    canvas.addEventListener("mouseout", strokeMouseEvents.mouseup_out);
    dBtn.disabled = false;
  } else if (drawingState.state === "erase") {
    canvas.classList.add(`erase-${drawingState.weight}`);
    document.body.classList.add(`erase-${drawingState.weight}`);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("click", handleClick);
    canvas.removeEventListener("mousedown", strokeMouseEvents.mouse);
    canvas.removeEventListener("mousemove", strokeMouseEvents.mousemove);
    canvas.removeEventListener("mouseup", strokeMouseEvents.mouseup_out);
    canvas.removeEventListener("mouseout", strokeMouseEvents.mouseup_out);
    cancelAnimationFrame(ref);
    dBtn.disabled = true;
    dBtn.classList.remove("active");
    window.removeEventListener("pointerup", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerDown);
    canvas.addEventListener("mousedown", startErasing);
    canvas.addEventListener("mousemove", eraseWhileMouseDown);
    canvas.addEventListener("mouseup", stopErasing);
    canvas.addEventListener("mousedown", handleMouseDownDelete);
    canvas.addEventListener("mouseup", handleMouseUpDelete);
    canvas.addEventListener("mouseleave", handleMouseUpDelete);
  } else {
    canvas.classList.remove(`erase-${drawingState.weight}`);
    document.body.classList.remove(`erase-${drawingState.weight}`);
    canvas.removeEventListener("mousedown", strokeMouseEvents.mousedown);
    canvas.removeEventListener("mousemove", strokeMouseEvents.mousemove);
    canvas.removeEventListener("mouseup", strokeMouseEvents.mouseup_out);
    canvas.removeEventListener("mouseout", strokeMouseEvents.mouseup_out);
    canvas.removeEventListener("mousedown", startErasing);
    canvas.removeEventListener("mousemove", eraseWhileMouseDown);
    canvas.removeEventListener("mouseup", stopErasing);
    canvas.removeEventListener("mousedown", handleMouseDownDelete);
    canvas.removeEventListener("mouseup", handleMouseUpDelete);
    canvas.removeEventListener("mouseleave", handleMouseUpDelete);
    canvas.addEventListener("click", handleClick);
    cancelAnimationFrame(ref);
    dBtn.disabled = true;
    dBtn.classList.remove("active");
    window.removeEventListener("pointerup", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerDown);
    drawAnim();
  }
};

export const startErasing = (e) => {
  drawingState.isErasing = true;
  eraseAt(e.clientX, e.clientY);
};

export const stopErasing = () => {
  drawingState.isErasing = false;
};

export const eraseWhileMouseDown = (e) => {
  if (drawingState.isErasing) {
    eraseAt(e.clientX, e.clientY);
  }
};
