let drawings = [];
const canvas = document.body.querySelector("#whiteboard");
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext("2d");
let state = "stroke";
let stroke = [];
let color = "red";
let lineWidth = 2;

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

let isDrawing = false;

class Line {
  constructor(x1, y1, x2, y2, color, lineWidth) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.lineWidth = lineWidth;
  }

  draw() {
    context.beginPath();
    context.strokeStyle = this.color;
    context.lineWidth = this.lineWidth;
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
    context.stroke();
  }
}

class Circle {
  constructor(x, y, R, strokeColor, fillColor = "transparent", lineWidth) {
    this.x = x;
    this.y = y;
    this.R = R;
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.lineWidth = lineWidth;
  }

  draw() {
    context.beginPath();
    context.strokeStyle = this.strokeColor;
    context.fillStyle = this.fillColor;
    context.lineWidth = this.lineWidth;
    context.arc(this.x, this.y, this.R, 0, Math.PI * 2, false);
    context.stroke();
    context.fill();
  }
}

let lastX = 0;
let lastY = 0;
let lastMidX = 0;
let lastMidY = 0;

class QuadCurve {
  constructor(x1, y1, x2, y2, cpx, cpy, color, lineWidth) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.cpx = cpx;
    this.cpy = cpy;
    this.color = color;
    this.lineWidth = lineWidth;
  }

  draw() {
    context.strokeStyle = this.color;
    context.lineWidth = this.lineWidth;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(this.x1, this.y1);
    context.quadraticCurveTo(this.cpx, this.cpy, this.x2, this.y2);
    context.stroke();
  }
}

const getMidPoint = (x1, y1, x2, y2) => {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
};

const drawStroke = (x, y, color = "orange", lineWidth = 2) => {
  const midPoint = getMidPoint(lastX, lastY, x, y);

  let curve = new QuadCurve(
    lastMidX,
    lastMidY,
    midPoint.x,
    midPoint.y,
    lastX,
    lastY,
    color,
    lineWidth,
  );

  curve.draw();

  stroke.push(curve);

  lastMidX = midPoint.x;
  lastMidY = midPoint.y;
  lastX = x;
  lastY = y;
};

const strokeMouseEvents = {
  mousedown: (e) => {
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMidX = lastX;
    lastMidY = lastY;
  },
  mousemove: (e) => {
    if (!isDrawing) return;
    drawStroke(e.clientX, e.clientY, color, lineWidth);
  },
  mouseup_out: () => {
    isDrawing = false;
    drawings.push(stroke);
    stroke = [];
  },
};

let x2, y2, x1, y1;

const handleMouseMove = (e) => {
  x2 = e.x;
  y2 = e.y;
};

const handleClick = (e) => {
  if (isDrawing) {
    canvas.removeEventListener("mousemove", handleMouseMove);
    isDrawing = false;
    if (state === "line")
      drawings.push(new Line(x1, y1, x2, y2, color, lineWidth));
    if (state === "circle")
      drawings.push(
        new Circle(
          x1,
          y1,
          Math.hypot(x1 - x2, y1 - y2),
          color,
          "transparent",
          lineWidth,
        ),
      );
    x1 = x2 = y1 = y2 = undefined;
  } else {
    x1 = e.clientX;
    y1 = e.clientY;
    canvas.addEventListener("mousemove", handleMouseMove);
    isDrawing = true;
  }
};

let ref;

const drawAnim = () => {
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
  if (state === "line") new Line(x1, y1, x2, y2, color, lineWidth).draw();
  if (state === "circle")
    new Circle(
      x1,
      y1,
      Math.hypot(x1 - x2, y1 - y2),
      color,
      "transparent",
      lineWidth,
    ).draw();
  ref = requestAnimationFrame(drawAnim);
};

const toolsBtns = document.body.querySelectorAll(
  ".tools > button:not(.show-btn)",
);

const dBtn = document.body.querySelector(".d-btn");

const handleToolsClick = () => {
  if (state === "stroke") {
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

toolsBtns.forEach((toolsBtn, i, btns) => {
  toolsBtn.addEventListener("click", () => {
    state = i === 0 ? "stroke" : i === 1 ? "circle" : "line";
    console.log(state);
    btns.forEach((btn) => {
      btn.classList.remove("active");
    });
    toolsBtn.classList.add("active");
    handleToolsClick();
  });
});

handleToolsClick();

const colorCircles = document.body.querySelectorAll(".colors .circle");
const colorBtns = document.body.querySelectorAll(".colors button");

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
    color = COLOR;
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

const widthCircles = document.body.querySelectorAll(".width .circle");
const widthBtns = document.body.querySelectorAll(".width button");

widthCircles.forEach((circle) => {
  circle.style.width = +circle.dataset.width * 3 + "px";
});

let weight = 2;

const handlePointerDown = (e) => {
  lineWidth = e.pressure * weight || weight;
};

widthBtns.forEach((widthBtn) => {
  widthBtn.addEventListener("click", () => {
    widthBtns.forEach((btn) => {
      btn.classList.remove("active");
    });
    widthBtn.classList.add("active");
    weight = +widthBtn.children[0].dataset.width;
    if (!dBtn.classList.contains("active")) {
      lineWidth = weight;
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
    lineWidth = weight;
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerDown);
  } else {
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerDown);
  }
});
