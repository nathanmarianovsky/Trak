/*

BASIC DETAILS: This file handles all reactions on the index.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



ipcRenderer.on("loadBlink", (event, step) => {
    const splashLoadContainer = Array.from(document.getElementById("splashLoadContainer").children),
        splashMessage = document.getElementById("splashMessage");
    if(step < 6) {
        if(step == 1) {
            splashMessage.textContent = "Loading Application Tray";
        }
        else if(step == 2) {
            splashMessage.textContent = "Creating Configuration Files and Folders";
        }
        else if(step == 3) {
            splashMessage.textContent = "Modifying the HTML and CSS Files";
        }
        else if(step == 4) {
            splashMessage.textContent = "Loading the Primary Window";
        }
        else if(step == 5) {
            splashMessage.textContent = "Loading the Library Records";
        }
        for(let u = 0; u < step - 1; u++) {
            splashLoadContainer[u].classList.remove("loadBlink");
            splashLoadContainer[u].style.opacity = 1;
        }
        splashLoadContainer[step - 1].classList.add("loadBlink");
    }
    else {
        splashMessage.textContent = "Application Ready";
        splashLoadContainer[4].classList.remove("loadBlink");
        splashLoadContainer[4].style.opacity = 1;
    }
});