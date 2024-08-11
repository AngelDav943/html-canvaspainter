import { setPixel } from "./utils.js";

function ditherBrush(pixels, x, y, color, radius, weight) {
    let currentPixels = pixels;

    // creates the circle from top to bottom
    for (let targetY = -radius; targetY < radius; targetY++) {
        // calculates the line width with this formula
        // weight used for radius
        const width = Math.floor(Math.sqrt((radius*radius) - (targetY * targetY)))

        // creates a line
        for (let currentX = (x-width); currentX < (x+width); currentX++) {
            const currentY = (targetY + y)

            const targetColor = {
                ...color,
                a: color.a
            }

            if (currentX % weight != 0) targetColor.a = 0
            if (currentY % weight != 0) targetColor.a = 0

            currentPixels = setPixel(
                currentPixels,
                currentX,
                currentY,
                targetColor
            );
        }
    }
    return currentPixels;
}

export default ditherBrush;