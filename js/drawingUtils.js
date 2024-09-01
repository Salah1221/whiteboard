import { Line, Circle, QuadCurve } from "./shapes.js";
import {
  lastCurveState,
  points,
  drawingState,
  context,
  drawingsObj,
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

  drawingsObj.stroke.push(curve);

  lastCurveState.lastMidX = midPoint.x;
  lastCurveState.lastMidY = midPoint.y;
  lastCurveState.lastX = x;
  lastCurveState.lastY = y;
};

const redrawFrame = () => {
  context.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = 0; i < drawingsObj.drawings.length; i++) {
    if (!Array.isArray(drawingsObj.drawings[i])) {
      drawingsObj.drawings[i].draw();
    } else {
      for (let j = 0; j < drawingsObj.drawings[i].length; j++) {
        drawingsObj.drawings[i][j].draw();
      }
    }
  }
};

export let ref;

export const drawAnim = () => {
  redrawFrame();
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

const distanceBetweenPointAndLine = (x1, y1, x2, y2, x0, y0) => {
  return (
    Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) /
    Math.hypot(y2 - y1, x2 - x1)
  );
};

const isCircleIntersectingEraser = (erase_x, erase_y, erase_radius, circle) => {
  return (
    Math.hypot(erase_x - circle.x, erase_y - circle.y) <=
      erase_radius + circle.R &&
    Math.hypot(erase_x - circle.x, erase_y - circle.y) >=
      Math.abs(erase_radius - circle.R)
  );
};

const isLineIntersectingEraser = (erase_x, erase_y, erase_radius, line) => {
  // Check if the distance from eraser to line is less than or equal to the radius
  if (
    distanceBetweenPointAndLine(
      line.x1,
      line.y1,
      line.x2,
      line.y2,
      erase_x,
      erase_y
    ) > erase_radius
  ) {
    return false;
  }

  // Calculate the squared length of the line segment
  const lineLength2 =
    Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2);

  // Calculate the dot product of (eraser - line1) and (line2 - line1)
  const dot =
    ((erase_x - line.x1) * (line.x2 - line.x1) +
      (erase_y - line.y1) * (line.y2 - line.y1)) /
    lineLength2;

  // Check if the closest point is on the line segment
  return dot >= 0 && dot <= 1;
};

export const eraseAt = (erase_x, erase_y) => {
  const eraserSize = drawingState.lineWidth * 5;
  drawingsObj.drawings = drawingsObj.drawings.filter((drawing) => {
    if (Array.isArray(drawing)) {
      for (let i = 0; i < drawing.length; i++) {
        if (
          isLineIntersectingEraser(erase_x, erase_y, eraserSize, drawing[i])
        ) {
          return false;
        }
      }
      return true;
    } else {
      if (drawing instanceof Line) {
        return !isLineIntersectingEraser(erase_x, erase_y, eraserSize, drawing);
      } else if (drawing instanceof Circle) {
        return !isCircleIntersectingEraser(
          erase_x,
          erase_y,
          eraserSize,
          drawing
        );
      }
    }
  });
  redrawFrame();
};
