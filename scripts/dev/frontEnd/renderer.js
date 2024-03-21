// const { BrowserWindow } = require("electron");

// const win = BrowserWindow.getCurrentWindow(); /* Note this is different to the
// html global `window` variable */

/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");

// // When document has loaded, initialise
// document.onreadystatechange = (event) => {
//     if (document.readyState == "complete") {
//         handleWindowControls();
//     }
// };

window.addEventListener("load", () => {
    handleWindowControls();
});

// window.onbeforeunload = (event) => {
//     /* If window is reloaded, remove win event listeners
//     (DOM element listeners get auto garbage collected but not
//     Electron win listeners as the win is not dereferenced unless closed) */
//     win.removeAllListeners();
// }

function handleWindowControls() {
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

    // // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    // toggleMaxRestoreButtons();
    // win.on('maximize', toggleMaxRestoreButtons);
    // win.on('unmaximize', toggleMaxRestoreButtons);

    // function toggleMaxRestoreButtons() {
    //     if (win.isMaximized()) {
    //         document.body.classList.add('maximized');
    //     } else {
    //         document.body.classList.remove('maximized');
    //     }
    // }
}