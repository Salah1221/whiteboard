import { Line, Circle, QuadCurve } from "./shapes.js";
import {
  stroke,
  lastCurveState,
  points,
  drawings,
  drawingState,
  context,
} from "./init.js";

const getMidPoint = (x1, y1, x2, y2) => {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
};

export const drawStroke = (x, y, colour = "orange", lWidth = 2) => {
  const midPoint = getMidPoint(
    lastCurveState.lastX,
    lastCurveState.lastY,
    x,
    y
  );

  let curve = new QuadCurve(
    lastCurveState.lastMidX,
    lastCurveState.lastMidY,
    midPoint.x,
    midPoint.y,
    lastCurveState.lastX,
    lastCurveState.lastY,
    colour,
    lWidth
  );

  curve.draw();

  stroke.push(curve);

  lastCurveState.lastMidX = midPoint.x;
  lastCurveState.lastMidY = midPoint.y;
  lastCurveState.lastX = x;
  lastCurveState.lastY = y;
};

export let ref;

export const drawAnim = () => {
  context.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = 0; i < drawings.length; i++) {
    if (!Array.isArray(drawings[i])) {
      drawings[i].draw();
    } else {
      for (let j = 0; j < drawings[i].length; j++) {
        drawings[i][j].draw();
      }
    }
  }
  if (drawingState.state === "line")
    new Line(
      points.p1.x,
      points.p1.y,
      points.p2.x,
      points.p2.y,
      drawingState.color,
      drawingState.lineWidth
    ).draw();
  if (drawingState.state === "circle")
    new Circle(
      points.p1.x,
      points.p1.y,
      Math.hypot(points.p1.x - points.p2.x, points.p1.y - points.p2.y),
      drawingState.color,
      "transparent",
      drawingState.lineWidth
    ).draw();
  ref = requestAnimationFrame(drawAnim);
};
