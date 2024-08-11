import { setPixel } from "./utils.js";

function brush(pixels, x, y, color, radius, weight) {
    let currentPixels = pixels;

    // creates the circle from top to bottom
    for (let targetY = -radius; targetY < radius; targetY++) {
        // calculates the line width with this formula
        // weight used for radius
        const width = Math.floor(Math.sqrt((radius*radius) - (targetY * targetY)))

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