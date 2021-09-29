/** 
 * NOTES:
 *  JavaScript updates view faster than TypeScript.
 *  onClick, would not work properly in TypeScript.
 *  Non formatted hex is stored in hidden element of the HTML for easy updating.
**/

// Function to update the yellow highlighted text based on the item clicked on
function updateSelection(elementId) {
    updateHtml(elementId.split('-')[1], -1)
    const element = document.getElementById(elementId);
    element.style.color = element.style.color === "yellow" ? "white" : "yellow";
}

// Function for creating the html for the hex
function getHexHtml(lines, lineNum, dataPositon) {
    const arrow = document.getElementById('arrowIcon');
    let htmlLines = "";
    let lineCount = 0;
    lines = lines.split('\n');

    lines.forEach((line) => {
        htmlLines += "<p>";

        if (line === lines[lineNum]) {
            htmlLines += arrow.innerHTML
        }
        // else {
        //     htmlLines += `<span style="width: 10px; height: 10px;"></span>`
        // }

        let lineParts = line.split(" ");

        for (var i=0; i < lineParts.length; i++) {
            let spanId = `byteSpan-${lineCount}-${i}`;
            let textColor = line === lines[lineNum] && i === dataPositon && lineParts[i] === lineParts[dataPositon] ? "yellow" : "white";
            htmlLines += `<span id="${spanId}" onclick="updateSelection('${spanId}');" style="color: ${textColor};">${lineParts[i]}</span> `;
        }
    
        htmlLines += "</p>";
        lineCount += 1;
    });

    return htmlLines;
}

// Function that will update the html of the hex web view
function updateHtml(lineNum, dataPosition) {
    const nonHtmlHexObj = document.getElementById('nonHtmlHex');
    const hexHtmlObj = document.getElementById('hexHtml');
    var lines = nonHtmlHexObj.textContent;
    var htmlLines = getHexHtml(lines, lineNum, dataPosition)
    hexHtmlObj.innerHTML = htmlLines;
}

// Function that gets called by default to create and update the hex web view
(function main() {
    const vscode = acquireVsCodeApi();

    var lineNum = 0;
    var dataPosition = 1;
    updateHtml(lineNum, dataPosition)

    window.addEventListener('message', event => {
        const message = event.data;
        updateHtml(message.args.lineNum, message.args.dataPosition);
    });
} ());
