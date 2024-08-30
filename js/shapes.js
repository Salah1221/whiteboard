import { context } from "./init.js";

export class Line {
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

export class Circle {
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

export class QuadCurve {
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
