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

const isPointInEraser = (erase_x, erase_y, erase_radius, x, y) => {
  return Math.hypot(erase_x - x, erase_y - y) <= erase_radius;
};

const isCircleIntersectingEraser = (erase_x, erase_y, erase_radius, circle) => {
  return (
    Math.hypot(erase_x - circle.x, erase_y - circle.y) <=
    erase_radius + circle.R
  );
};

const isLineIntersectingEraser = (erase_x, erase_y, erase_radius, line) => {
  // formula from: https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
  return (
    Math.abs(
      (line.y2 - line.y1) * erase_x -
        (line.x2 - line.x1) * erase_y +
        line.x2 * line.y1 -
        line.y2 * line.x1
    ) /
      Math.hypot(line.y2 - line.y1, line.x2 - line.y1) <=
    erase_radius
  );
};

export const eraseAt = (erase_x, erase_y) => {
  const eraserSize = drawingState.lineWidth * 5;
  drawingsObj.drawings = drawingsObj.drawings.filter((drawing) => {
    if (Array.isArray(drawing)) {
      for (let i = 0; i < drawing.length; i++) {
        if (
          isPointInEraser(
            erase_x,
            erase_y,
            eraserSize,
            drawing[i].cpx,
            drawing[i].cpy
          )
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
