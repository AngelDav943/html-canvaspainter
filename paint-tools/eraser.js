import { setPixel } from "./utils.js";

function eraser(pixels, x, y, color, weight) {
    let currentPixels = pixels;

    // creates the circle from top to bottom
    for (let targetY = -weight; targetY < weight; targetY++) {
        // calculates the line width with this formula
        // weight used for radius
        const width = Math.floor(Math.sqrt((weight*weight) - (targetY * targetY)))

        // creates a line
        for (let currentX = (x-width); currentX < (x+width); currentX++) {

            currentPixels = setPixel(
                currentPixels, // pixel image
                currentX, // x position
                (targetY + y), // y position
                { r: 0, g: 0, b: 0, a: 0 }, // color
                true // forces the color even if it's alpha 0
            );
        }
    }
    return currentPixels;
}

export default eraser;