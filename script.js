const canvas = document.getElementById("painting");
const context = canvas.getContext("2d");

const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

const colorValue = document.getElementById("fillColor")

let mouseClick = false;

function clearCanvas() {
    imageData.data = imageData.data.fill(0)

    context.putImageData(imageData, 0, 0);
}

function hexToRGBA(color) {
    if (color[0] == "#") {
        // hex notation
        color = color.replace("#", "");
        var bigint = parseInt(color, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return { r: r, g: g, b: b, a: 255 };
    } else if (color.indexOf("rgba(") == 0) {
        // already in rgba notation
        color = color
            .replace("rgba(", "")
            .replace(" ", "")
            .replace(")", "")
            .split(",");
        return { r: color[0], g: color[1], b: color[2], a: color[3] * 255 };
    } else {
        console.error("warning: can't convert color to rgba: " + color);
        return { r: 0, g: 0, b: 0, a: 0 };
    }
}

function lerpColor(colorA, colorB, timeFactor) {
    timeFactor = Math.min(1, Math.max(0, timeFactor))
    return (1 - timeFactor) * colorA + ( timeFactor * colorB )
}

function setPixel(pixels, x, y, rgbColor) {
    if (rgbColor.a == 0) return pixels;

    if (x >= pixels.width || x < 0 || y >= pixels.height || y < 0) return pixels

    const arrayCoords = (y * canvas.width + x) * 4;



    pixels.data[arrayCoords]     = rgbColor.r;
    pixels.data[arrayCoords + 1] = rgbColor.g;
    pixels.data[arrayCoords + 2] = rgbColor.b;
    pixels.data[arrayCoords + 3] = Math.min(255, pixels.data[arrayCoords + 3] + rgbColor.a);

    return pixels;
}

function lineX(pixels, fromX, toX, y, color) {
    let currentPixels = pixels;
    for (let currentX = fromX; currentX < toX; currentX++) {
        currentPixels = setPixel(currentPixels, currentX, y, color);
    }
    return currentPixels;
}

function square(pixels, x, y, height, width, color) {
    let currentPixels = pixels;
    for (let targetY = 0; targetY < height; targetY++) {
        currentPixels = lineX(currentPixels, x, x + width, targetY + y, color);
    }
    return currentPixels
}

function brush(pixels, x, y, color, radius) {
    let currentPixels = pixels;
    // currentPixels = lineX(currentPixels, x - radius, x + radius, y, color);

    for (let targetY = -radius; targetY < radius; targetY++) {
        const width = Math.floor(Math.sqrt((radius*radius) - (targetY * targetY)))

        for (let currentX = (x-width); currentX < (x+width); currentX++) {

            let newAlpha = Math.floor(Math.random() * 255)


            const newColor = {
                ...color,
                a: newAlpha
            }

            if (newColor.a < 253) newColor.a = 0
            newColor.a = Math.ceil(newColor.a / 255) * 255

            newColor.a = 50

            currentPixels = setPixel(
                currentPixels,
                currentX,
                (targetY + y),
                newColor
            );
        }

        // currentPixels = lineX(currentPixels, x - width, x + width, targetY + y, color);

    }

    return currentPixels;
}

function paint(event) {
    if (mouseClick == false) return;

    const x = Math.floor((event.offsetX / canvas.offsetWidth) * canvas.width);
    const y = Math.floor((event.offsetY / canvas.offsetHeight) * canvas.height);

    // const squareAdded = square(
    //     imageData,
    //     x - 25,
    //     y - 25,
    //     50,
    //     50,
    //     {
    //         r: 255,
    //         g: 0,
    //         b: 0,
    //         a: 255
    //     }
    // )

    console.log("color", hexToRGBA(colorValue.value))

    const newPixels = brush(
        imageData,
        x,
        y,
        hexToRGBA(colorValue.value),
        25
    );

    console.log("pixels", newPixels);

    context.putImageData(newPixels, 0, 0);

    // console.log(arrayCoords, "paint", x, y);
}

function setMouseStatus(event, status) {
    if (status == true) {
        mouseClick = true;
        paint(event);
        return;
    }
    mouseClick = false;
}

canvas.addEventListener("mouseup", (e) => setMouseStatus(e, false));
canvas.addEventListener("mousedown", (e) => setMouseStatus(e, true));
canvas.addEventListener("mousemove", paint);
