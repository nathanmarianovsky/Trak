/*

BASIC DETAILS: This file handles all titlebar functionality.

    - windowControls: Initializes the listeners associated to the minimize, maximize, restore, and close buttons.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



/*

Initializes the listeners associated to the minimize, maximize, restore, and close buttons.

*/
const windowControls = () => {
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('minButton').addEventListener("click", event => {
        ipcRenderer.send("minimizeWindow");
    });

    document.getElementById('maxButton').addEventListener("click", event => {
        ipcRenderer.send("maximizeWindow");
        document.getElementById('maxButton').style.visibility = "hidden";
        document.getElementById('restoreButton').style.visibility = "visible";

    });

    document.getElementById('restoreButton').addEventListener("click", event => {
        ipcRenderer.send("restoreWindow");
        document.getElementById('restoreButton').style.visibility = "hidden";
        document.getElementById('maxButton').style.visibility = "visible";
    });

    document.getElementById('closeButton').addEventListener("click", event => {
        ipcRenderer.send("closeWindow");
    });
};



// Initialize the listeners only once the page is ready.
window.addEventListener("load", () => {
    windowControls();
});