export function hexToRGBA(color) {
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

export function lerpColor(colorA, colorB, timeFactor) {
    timeFactor = Math.min(1, Math.max(0, timeFactor))
    return (1 - timeFactor) * colorA + ( timeFactor * colorB )
}

export function getPixelRGBA(pixels, x, y) {
    if (x >= pixels.width || x < 0 || y >= pixels.height || y < 0) return;

    const arrayCoords = (y * pixels.width + x) * 4;
    
    return {
        r: pixels.data[arrayCoords],
        g: pixels.data[arrayCoords + 1],
        b: pixels.data[arrayCoords + 2],
        a: pixels.data[arrayCoords + 3]
    }
}

export function setPixel(pixels, x, y, rgbColor, forceColor) {
    if (rgbColor.a == 0 && forceColor != true) return pixels;
    if (x >= pixels.width || x < 0 || y >= pixels.height || y < 0) return pixels

    const arrayCoords = (y * pixels.width + x) * 4;

    pixels.data[arrayCoords]     = rgbColor.r;
    pixels.data[arrayCoords + 1] = rgbColor.g;
    pixels.data[arrayCoords + 2] = rgbColor.b;
    pixels.data[arrayCoords + 3] = rgbColor.a;
    
    // COLOR BLENDING
    // const alphaFactor = (pixels.data[arrayCoords + 3] + rgbColor.a) / 510
    // pixels.data[arrayCoords]     = lerpColor(rgbColor.r, pixels.data[arrayCoords]    , alphaFactor);
    // pixels.data[arrayCoords + 1] = lerpColor(rgbColor.g, pixels.data[arrayCoords + 1], alphaFactor);
    // pixels.data[arrayCoords + 2] = lerpColor(rgbColor.b, pixels.data[arrayCoords + 2], alphaFactor);
    // pixels.data[arrayCoords + 3] = Math.min(255, pixels.data[arrayCoords + 3] + rgbColor.a);

    return pixels;
}

export function lineX(pixels, fromX, toX, y, color) {
    let currentPixels = pixels;
    for (let currentX = fromX; currentX < toX; currentX++) {
        currentPixels = setPixel(currentPixels, currentX, y, color);
    }
    return currentPixels;
}

export function square(pixels, x, y, height, width, color) {
    let currentPixels = pixels;
    for (let targetY = 0; targetY < height; targetY++) {
        currentPixels = lineX(currentPixels, x, x + width, targetY + y, color);
    }
    return currentPixels
}
