import { setPixel } from "./utils.js";

function brush(pixels, x, y, color, weight) {
    let currentPixels = pixels;

    // creates the circle from top to bottom
    for (let targetY = -weight; targetY < weight; targetY++) {
        // calculates the line width with this formula
        // weight used for radius
        const width = Math.floor(Math.sqrt((weight*weight) - (targetY * targetY)))

        // creates a line
        for (let currentX = (x-width); currentX < (x+width); currentX++) {

            currentPixels = setPixel(
                currentPixels,
                currentX,
                (targetY + y),
                color
            );
        }
    }
    return currentPixels;
}

export default brush;