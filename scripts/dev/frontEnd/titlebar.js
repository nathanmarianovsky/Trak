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
    const minButton = document.getElementById("minButton"),
        maxButton = document.getElementById("maxButton"),
        restoreButton = document.getElementById("restoreButton"),
        closeButton = document.getElementById("closeButton");
    // Listen for a click event on the minimize button in order to minimize an application window.
    minButton.addEventListener("click", event => {
        ipcRenderer.send("minimizeWindow");
    });
    // Listen for a click event on the maximize button in order to maximize an application window.
    maxButton.addEventListener("click", event => {
        ipcRenderer.send("maximizeWindow");
        // Hide the maximize button and show the restore button.
        maxButton.style.visibility = "hidden";
        restoreButton.style.visibility = "visible";
    });
    // Listen for a click event on the restore button in order to restore an application window to the original size parameters.
    restoreButton.addEventListener("click", event => {
        ipcRenderer.send("restoreWindow");
        // Hide the restore button and show the maximize button.
        restoreButton.style.visibility = "hidden";
        maxButton.style.visibility = "visible";
    });
    // Listen for a click event on the close button in order to close an application window.
    closeButton.addEventListener("click", event => {
        ipcRenderer.send("closeWindow");
    });
};



// Initialize the listeners only once the page is ready.
window.addEventListener("load", () => {
    windowControls();
});