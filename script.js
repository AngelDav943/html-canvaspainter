const canvas = document.getElementById("painting");
const context = canvas.getContext("2d", {
    willReadFrequently: true
});

let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
let imageHistory = [imageData]

const selects = document.querySelectorAll("div.select")
const selectValues = {}
for (const select of selects) {
    selectValues[select.id] = select.ariaCurrent || ''

    const defaultSelected = select.querySelector(`[value="${select.ariaCurrent}"]`)
    defaultSelected.classList.add("selected")

    const buttons = select.querySelectorAll("button")
    for (const button of buttons) {
        button.onclick = function() {
            const lastSelected = select.querySelector(".selected")
            if (lastSelected) lastSelected.classList.remove("selected")

            button.classList.add("selected")
            selectValues[select.id] = button.value
            select.ariaCurrent = button.value
        }
    }
}
console.log(selectValues)

const colorValue = document.getElementById("fillColor")

import brush from "./paint-tools/brush.js";
import flood_fill from "./paint-tools/bucket.js";
import eraser from "./paint-tools/eraser.js";
import pencil from "./paint-tools/pencil.js";
import spray from "./paint-tools/spray.js";
import { hexToRGBA } from "./paint-tools/utils.js";

const undoButton = document.getElementById("undo")
const redoButton = document.getElementById("redo")

let currentHistoryPosition = 1
function pushHistory(overrideImage) {
    let savedImage = imageData
    if (overrideImage != undefined) savedImage = overrideImage

    imageHistory.splice(imageHistory.length - (currentHistoryPosition - 1))
    redoButton.disabled = true
    undoButton.disabled = false

    currentHistoryPosition = 1

    imageHistory.push(savedImage)
    if (imageHistory.length > 5) imageHistory.shift()
}

function moveHistory(position) {
    currentHistoryPosition = Math.max(1, Math.min(imageHistory.length, currentHistoryPosition - position))

    if (currentHistoryPosition == imageHistory.length) {
        undoButton.disabled = true
    } else {
        undoButton.disabled = false
    }

    if (currentHistoryPosition > 1) {
        redoButton.disabled = false
    } else {
        redoButton.disabled = true
    }

    console.log(imageHistory, currentHistoryPosition)
    let newImageData = imageHistory[imageHistory.length - currentHistoryPosition]

    if (newImageData == undefined) return

    context.putImageData(newImageData, 0, 0);
}
undoButton.onclick = () => moveHistory(-1)
redoButton.onclick = () => moveHistory(1)

function clearCanvas() {
    let newImageData = new ImageData(imageData.width, imageData.height)
    imageData = newImageData
    context.putImageData(newImageData, 0, 0);
    pushHistory()
}
document.getElementById("clearCanvas").onclick = clearCanvas

let activeClick = false;
let lastPos = undefined;
let paintDebounce = false;
let lastTouches = {};

const tools = {
    "pencil": pencil,
    "brush": brush,
    "spray": spray,
    "eraser": eraser
}

const startTools = {
    "bucket": async (pixels, x, y, color, weight) =>  {
        const newPixels = await flood_fill(canvas, context, x, y, color)
        pushHistory(newPixels)
        
        activeClick = false;
        
        return newPixels
    }
}

async function paint(event, isTouch, currentToolList) {
    if (paintDebounce == true || activeClick == false) return;
    
    if (currentToolList == undefined) {
        currentToolList = tools
    }

    if (currentToolList[selectValues.mode] == undefined) return;

    paintDebounce = true

    let identifier = -1
    if (event.identifier != undefined) {
        isTouch = true;
        identifier = event.identifier
    }

    let force = 1
    if (event.force != undefined) force = event.force

    function setLastPosition() {
        if (isTouch == true) {
            lastTouches[identifier] = { y: y, x: x }
        } else {
            lastPos = { y: y, x: x }
        }
    }
    
    const x = Math.floor((event.offsetX / canvas.offsetWidth) * canvas.width);
    const y = Math.floor((event.offsetY / canvas.offsetHeight) * canvas.height);
    
    let currentLast = undefined
    if (isTouch == true) {
        currentLast = lastTouches[identifier]
    } else {
        currentLast = lastPos
    }
    
    imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    let newPixels = imageData

    if (currentLast == null) currentLast = { y: y, x: x };
    
    const diffX = x - currentLast?.x
    const diffY = y - currentLast?.y
    const distance = Math.sqrt(diffX * diffX + diffY * diffY)
    const steps = Math.max(1, Math.floor(distance * 2))
    
    const weight = Math.floor(parseInt(selectValues.radius) * force)

    // makes an approximated path from the last position to the new position
    for (let t = 0; t < steps; t++) {
        const time = t / steps

        const lerpX = Math.floor((1 - time) * currentLast.x + (time * x))
        const lerpY = Math.floor((1 - time) * currentLast.y + (time * y))


        newPixels = await currentToolList[selectValues.mode](
            newPixels,  // pixels
            lerpX, lerpY, // coordinates
            hexToRGBA(colorValue.value), // color
            weight  // weight
        );
    }

    paintDebounce = false
    if (newPixels != undefined) {
        context.putImageData(newPixels, 0, 0);
        if (activeClick == true) setLastPosition()
    }
}

function setMouseStatus(event, status) {
    if (status == activeClick) return;

    if (status == true) {
        activeClick = true;

        
        if (startTools[selectValues.mode] != undefined) {
            paint(event, false, startTools)
            activeClick = false;
            return
        }
        
        paint(event, event.identifier != undefined, tools);
        
        return;
    }
    
    pushHistory()

    lastPos = undefined;
    activeClick = false;
}

canvas.addEventListener("mouseleave", (e) => setMouseStatus(e, false));
canvas.addEventListener("mouseup", (e) => setMouseStatus(e, false));

canvas.addEventListener("mousedown", (e) => setMouseStatus(e, true));
canvas.addEventListener("mousemove", paint);

function convertTouchToMouse(TouchEvent, callback) {
    if (TouchEvent == undefined) return
    if (TouchEvent.touches == undefined || callback == undefined) return

    for (const touch of TouchEvent.touches) {
        const offset = {
            offsetX: touch.clientX - canvas.offsetLeft,
            offsetY: touch.clientY - canvas.offsetTop
        }

        callback({
            ...touch,
            identifier: touch.identifier,
            force: touch.force,
            ...offset
        }, true)
    }
}

function endTouch(event) {
    for (const touchIdentifier of Object.keys(lastTouches)) {
        let exists = false
        for (const touch of event.touches) {
            if (touch.identifier == touchIdentifier) exists = true
        }

        if (exists == false) {
            delete lastTouches[touchIdentifier]
        }
    }

    if (event.touches.length < 1) {
        setMouseStatus(event, false);
    }
}

canvas.addEventListener("touchend", endTouch);
canvas.addEventListener("touchcancel", endTouch);

canvas.addEventListener("touchstart", (event) => convertTouchToMouse(event, setMouseStatus));
canvas.addEventListener("touchmove", (event) => convertTouchToMouse(event, paint));