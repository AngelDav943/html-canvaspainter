import { setPixel } from "./utils.js";

function pencil(pixels, x, y, color, weight) {
    let currentPixels = setPixel(
        pixels,
        x,
        y,
        color
    );
    
    return currentPixels;
}

export default pencil;