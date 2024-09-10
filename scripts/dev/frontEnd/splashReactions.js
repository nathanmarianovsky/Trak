/*

BASIC DETAILS: This file handles all reactions on the splash.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
const { ipcRenderer } = require("electron");



/*

Initializes the listeners associated to the minimize, maximize, restore, and close buttons.

*/
const windowControls = () => {
    const closeButton = document.getElementById("splashClose");
    // Listen for a click event on the close button in order to close an application window.
    closeButton.addEventListener("click", event => {
        ipcRenderer.send("closeSplash");
    });
};



const typeWriter = (elem, str) => {
    const iterFunc = (iterElem, iterStr, iter) => {
        setTimeout(() => {
            iterElem.textContent += iterStr.charAt(iter);
        }, iter * 25);
    }
    for(let w = 0; w < str.length; w++) {
        iterFunc(elem, str, w);
    }
};



// Update the page blinkers in order to indicate the application load percentage and display the associated message.
ipcRenderer.on("loadBlink", (event, step) => {
    // Define the page blinkers and splash message.
    const splashLoadContainer = Array.from(document.getElementById("splashLoadContainer").children),
        splashMessage = document.getElementById("splashMessage");
    // Proceed only if being asked to update the blinkers to a complete status.
    if(step < 6) {
        // Update the splash message accordingly.
        if(step == 1) { splashMessage.textContent = "Loading Application Tray"; }
        else if(step == 2) { splashMessage.textContent = "Creating Configuration Files and Folders"; }
        else if(step == 3) { splashMessage.textContent = "Modifying the HTML and CSS Files"; }
        else if(step == 4) { splashMessage.textContent = "Loading the Primary Window"; }
        else if(step == 5) { splashMessage.textContent = "Loading the Library Records"; }
        // Update the previous blinkers to a complete status.
        for(let u = 0; u < step - 1; u++) {
            splashLoadContainer[u].classList.remove("loadBlink");
            splashLoadContainer[u].style.opacity = 1;
        }
        // Update the current blinker to a update status.
        splashLoadContainer[step - 1].classList.add("loadBlink");
    }
    // Otherwise, place all blinkers on a complete status.
    else {
        splashMessage.textContent = "Application Ready";
        splashLoadContainer[4].classList.remove("loadBlink");
        splashLoadContainer[4].style.opacity = 1;
    }
});



ipcRenderer.on("loadFail", (event, logs) => {
    if(logs.length > 0) {
        const splashMessage = document.getElementById("splashMessage"),
            splashLoadContainer = document.getElementById("splashLoadContainer"),
            logsTerminal = document.getElementById("logsTerminalSplash");
        logsTerminal.innerHTML = "";
        splashMessage.style.display = "none";
        splashLoadContainer.style.display = "none";
        document.getElementById("dragRegion").style.visibility = "visible";
        document.getElementById("splashTerminalContainer").style.display = "block";
        for(let c = 0; c < logs.length; c++) {
            let logSpan = document.createElement("span");
            if(logs[c].includes("[info]")) {
                // logSpan.textContent = logs[c].replace(" [info]", "");
                typeWriter(logSpan, logs[c].replace(" [info]", ""))
            }
            else if(logs[c].includes("[error]")) {
                // logSpan.textContent = logs[c].replace(" [error]", "");
                typeWriter(logSpan, logs[c].replace(" [error]", ""));
                logSpan.style.color = "red";
            }
            else if(logs[c].includes("[warn]")) {
                // logSpan.textContent = logs[c].replace(" [warn]", "");
                typeWriter(logSpan, logs[c].replace(" [warn]", ""));
                logSpan.style.color = "blue";
            }
            logsTerminal.append(logSpan, document.createElement("br"));
        }
    }
    windowControls();
});



// Initialize the listeners only once the page is ready.
window.addEventListener("load", () => {
});