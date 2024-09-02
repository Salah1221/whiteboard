const canvas = document.body.querySelector("#whiteboard");
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext("2d");

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

let lastCurveState = {
  lastX: 0,
  lastY: 0,
  lastMidX: 0,
  lastMidY: 0,
};

let drawingsObj = {
  drawings: [],
  stroke: [],
  redo: [],
};

let drawingState = {
  isDrawing: false,
  state: "stroke",
  color: "red",
  lineWidth: 2,
  weight: 2,
  isErasing: false,
};

let points = {
  p1: {
    x: undefined,
    y: undefined,
  },
  p2: {
    x: undefined,
    y: undefined,
  },
};

export { context, canvas, lastCurveState, drawingState, points, drawingsObj };
