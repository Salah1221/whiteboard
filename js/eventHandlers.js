import {
  drawingsObj,
  drawingState,
  lastCurveState,
  points,
  canvas,
} from "./init.js";
import {
  drawStroke,
  ref,
  drawAnim,
  eraseAt,
  pushToUndo,
  redrawFrame,
} from "./drawingUtils.js";
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
      drawingState.lineWidth,
    );
  },
  mouseup_out: () => {
    drawingState.isDrawing = false;
    if (drawingsObj.stroke.length > 0) {
      drawingsObj.drawings.push(drawingsObj.stroke);
      pushToUndo("draw", drawingsObj.stroke);
    }
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
    if (drawingState.state === "line") {
      const line = new Line(
        points.p1.x,
        points.p1.y,
        points.p2.x,
        points.p2.y,
        drawingState.color,
        drawingState.lineWidth,
      );
      drawingsObj.drawings.push(line);
      pushToUndo("draw", line);
    }
    if (drawingState.state === "circle") {
      const circle = new Circle(
        points.p1.x,
        points.p1.y,
        Math.hypot(points.p1.x - points.p2.x, points.p1.y - points.p2.y),
        drawingState.color,
        "transparent",
        drawingState.lineWidth,
      );
      drawingsObj.drawings.push(circle);
      pushToUndo("draw", circle);
    }
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

const mouseDownDelete = () => {
  canvas.style.cursor = `url('./assets/eraser_cursor\ size\ ${
    drawingState.weight
  }\ pressed.png') ${(5 * drawingState.weight) / 2} ${
    (5 * drawingState.weight) / 2
  }, auto`;
};

const mouseUpDelete = () => {
  canvas.style.cursor = `url('./assets/eraser_cursor\ size\ ${
    drawingState.weight
  }.png') ${(5 * drawingState.weight) / 2} ${
    (5 * drawingState.weight) / 2
  }, auto`;
};

const dBtn = document.body.querySelector(".d-btn");

export const handleToolsClick = () => {
  if (drawingState.state === "stroke") {
    canvas.style.cursor = "crosshair";
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("click", handleClick);
    canvas.removeEventListener("mousedown", startErasing);
    canvas.removeEventListener("mousemove", eraseWhileMouseDown);
    canvas.removeEventListener("mouseup", stopErasing);
    canvas.removeEventListener("mousedown", mouseDownDelete);
    canvas.removeEventListener("mouseup", mouseUpDelete);
    canvas.addEventListener("mousedown", strokeMouseEvents.mousedown);
    canvas.addEventListener("mousemove", strokeMouseEvents.mousemove);
    canvas.addEventListener("mouseup", strokeMouseEvents.mouseup_out);
    canvas.addEventListener("mouseout", strokeMouseEvents.mouseup_out);
    cancelAnimationFrame(ref);
    drawingState.isDrawing = false;
    dBtn.disabled = false;
  } else if (drawingState.state === "erase") {
    canvas.style.cursor = `url('./assets/eraser_cursor\ size\ ${
      drawingState.weight
    }.png') ${(5 * drawingState.weight) / 2} ${
      (5 * drawingState.weight) / 2
    }, auto`;
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("click", handleClick);
    canvas.removeEventListener("mousedown", strokeMouseEvents.mousedown);
    canvas.removeEventListener("mousemove", strokeMouseEvents.mousemove);
    canvas.removeEventListener("mouseup", strokeMouseEvents.mouseup_out);
    canvas.removeEventListener("mouseout", strokeMouseEvents.mouseup_out);
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerDown);
    canvas.addEventListener("mousedown", startErasing);
    canvas.addEventListener("mousemove", eraseWhileMouseDown);
    canvas.addEventListener("mouseup", stopErasing);
    canvas.addEventListener("mousedown", mouseDownDelete);
    canvas.addEventListener("mouseup", mouseUpDelete);
    cancelAnimationFrame(ref);
    dBtn.disabled = true;
    dBtn.classList.remove("active");
    drawingState.lineWidth = drawingState.weight;
  } else if (drawingState.state === "line" || drawingState.state === "circle") {
    canvas.style.cursor = "crosshair";
    canvas.removeEventListener("mousedown", strokeMouseEvents.mousedown);
    canvas.removeEventListener("mousemove", strokeMouseEvents.mousemove);
    canvas.removeEventListener("mouseup", strokeMouseEvents.mouseup_out);
    canvas.removeEventListener("mouseout", strokeMouseEvents.mouseup_out);
    canvas.removeEventListener("mousedown", startErasing);
    canvas.removeEventListener("mousemove", eraseWhileMouseDown);
    canvas.removeEventListener("mouseup", stopErasing);
    canvas.removeEventListener("mousedown", mouseDownDelete);
    canvas.removeEventListener("mouseup", mouseUpDelete);
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerDown);
    canvas.addEventListener("click", handleClick);
    cancelAnimationFrame(ref);
    dBtn.disabled = true;
    dBtn.classList.remove("active");
    drawingState.lineWidth = drawingState.weight;
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

const redoBtn = document.body.querySelector("button.redo");
const undoBtn = document.body.querySelector("button.undo");

export const handleUndo = () => {
  const lastAction = drawingsObj.undo.pop();
  if (drawingsObj.undo.length === 0) undoBtn.disabled = true;
  drawingsObj.redo.push(lastAction);
  redoBtn.disabled = false;
  if (lastAction.operation === "draw") {
    drawingsObj.drawings.pop();
  } else if (lastAction.operation === "erase") {
    drawingsObj.drawings.push(lastAction.element);
  } else if (lastAction.operation === "clear") {
    drawingsObj.drawings.push(...lastAction.element);
  }
  redrawFrame();
};

export const handleRedo = () => {
  const lastAction = drawingsObj.redo.pop();
  if (drawingsObj.redo.length === 0) redoBtn.disabled = true;
  drawingsObj.undo.push(lastAction);
  undoBtn.disabled = false;
  if (lastAction.operation === "draw") {
    drawingsObj.drawings.push(lastAction.element);
  } else if (lastAction.operation === "erase") {
    drawingsObj.drawings.pop();
  } else if (lastAction.operation === "clear") {
    drawingsObj.drawings = [];
  }
  redrawFrame();
};

export const clearCanvas = () => {
  drawingsObj.undo.push({ operation: "clear", element: drawingsObj.drawings });
  drawingsObj.drawings = [];
  redrawFrame();
};
