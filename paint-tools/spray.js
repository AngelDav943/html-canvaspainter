import { setPixel } from "./utils.js";

async function spray(pixels, x, y, color, weight) {
    let currentPixels = pixels;

    const max = 255
    let point = false;

    // creates the circle from top to bottom
    for (let targetY = -weight; targetY < weight; targetY++) {
        // calculates the line width with this formula
        // weight used for radius
        const width = Math.floor(Math.sqrt((weight*weight) - (targetY * targetY)))

        // creates a line
        for (let currentX = (x-width); currentX < (x+width); currentX++) {

            let newAlpha = Math.floor(Math.random() * max)
            const newColor = {
                ...color,
                a: newAlpha
            }
            if (newColor.a < 254 || point == true) {
                newColor.a = 0
            }
            newColor.a = Math.ceil(newColor.a / max) * 255
            if (newColor.a == 255) point = true

            currentPixels = setPixel(
                currentPixels,
                currentX,
                (targetY + y),
                newColor
            );
        }
    }

    return currentPixels;
}

export default spray;