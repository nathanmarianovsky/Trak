/*

BASIC DETAILS: This file handles all reactions on the splash.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
const { ipcRenderer } = require("electron");



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