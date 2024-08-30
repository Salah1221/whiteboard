import {
  stroke,
  drawings,
  drawingState,
  lastCurveState,
  points,
  canvas,
} from "./init.js";
import { drawStroke, ref, drawAnim } from "./drawingUtils.js";
import { Line, Circle } from "./shapes.js";

export const strokeMouseEvents = {
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
    drawings.push(stroke);
    stroke = [];
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
      drawings.push(
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
      drawings.push(
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

export const handleToolsClick = () => {
  if (drawingState.state === "stroke") {
    cancelAnimationFrame(ref);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("click", handleClick);
    canvas.addEventListener("mousedown", strokeMouseEvents.mousedown);
    canvas.addEventListener("mousemove", strokeMouseEvents.mousemove);
    canvas.addEventListener("mouseup", strokeMouseEvents.mouseup_out);
    canvas.addEventListener("mouseout", strokeMouseEvents.mouseup_out);
    dBtn.disabled = false;
  } else {
    canvas.removeEventListener("mousedown", strokeMouseEvents.mousedown);
    canvas.removeEventListener("mousemove", strokeMouseEvents.mousemove);
    canvas.removeEventListener("mouseup", strokeMouseEvents.mouseup_out);
    canvas.removeEventListener("mouseout", strokeMouseEvents.mouseup_out);
    canvas.addEventListener("click", handleClick);
    cancelAnimationFrame(ref);
    dBtn.disabled = true;
    dBtn.classList.remove("active");
    window.removeEventListener("pointerup", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerDown);
    drawAnim();
  }
};
