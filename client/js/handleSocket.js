import { redrawFrame } from "./drawingUtils";
import { drawingsObj } from "./init";

const socket = io();

export const sendDrawing = (data) => {
  socket.emit("draw", data);
};

// Listen for drawing data from the server
socket.on("draw", (data) => {
  drawingsObj.drawings.push(...data);
  redrawFrame();
});
