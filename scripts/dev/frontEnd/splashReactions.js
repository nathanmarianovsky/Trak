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



/*

Handles the typewriter effect for the splash screen logs terminal.

   - elem is the document element for which the text content is being updated.
   - str is a string corresponding to the new text content of the page element.

*/
const typeWriter = (elem, str) => {
    // Define the function which will write a single character with delay.
    const iterFunc = (iterElem, iterStr, iter) => {
        setTimeout(() => {
            iterElem.textContent += iterStr.charAt(iter);
        }, iter * 25);
    }
    // Iterate through all characters of the string.
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



// If the application failed to load update the splash screen accordingly.
ipcRenderer.on("loadFail", (event, logSub) => {
    // Define the page elements which will be hidden/shown.
    const splashMessage = document.getElementById("splashMessage"),
        splashLoadContainer = document.getElementById("splashLoadContainer"),
        logsTerminal = document.getElementById("logsTerminalSplash");
    // Reset the logs terminal.
    logsTerminal.innerHTML = "";
    // Hide the splash screen load components.
    splashMessage.style.display = "none";
    splashLoadContainer.style.display = "none";
    // Display the close button and the logs terminal.
    document.getElementById("dragRegion").style.visibility = "visible";
    document.getElementById("splashTerminalContainer").style.display = "block";
    // Proceed only if the logs were provided by the back end.
    const logs = logSub[0];
    if(logs.length > 0) {
        // Iterate through all the logs/
        for(let c = 0; c < logs.length; c++) {
            // Define the page element which will display the current log.
            let logSpan = document.createElement("span");
            // Handle the case of a log info message.
            if(logs[c].includes("[info]")) {
                typeWriter(logSpan, logs[c].replace(" [info]", ""))
            }
            // Handle the case of a log error message.
            else if(logs[c].includes("[error]")) {
                typeWriter(logSpan, logs[c].replace(" [error]", ""));
                logSpan.style.color = "red";
            }
            // Handle the case of a log warning message.
            else if(logs[c].includes("[warn]")) {
                typeWriter(logSpan, logs[c].replace(" [warn]", ""));
                logSpan.style.color = "blue";
            }
            // Append the page element to the splash screen logs terminal.
            logsTerminal.append(logSpan, document.createElement("br"));
        }
    }
    // Otherwise notify the user that the logs could not be read properly.
    else {
        // Define the page element which will display the current log.
        let logSpan = document.createElement("span");
        // Write the default message.
        typeWriter(logSpan, "The application failed to load and was unable to read the logs file located at " + logSub[1] + ".");
        // Append the page element to the splash screen logs terminal.
        logsTerminal.append(logSpan, document.createElement("br"));
    }
    windowControls();
});



ipcRenderer.on("passwordRequest", event => {
    // Define the page elements which will be hidden/shown.
    const splashMessage = document.getElementById("splashMessage"),
        splashLoadContainer = document.getElementById("splashLoadContainer"),
        dragRegion = document.getElementById("dragRegion"),
        splashPasswordContainer = document.getElementById("splashPasswordContainer");
    // Hide the splash screen load components.
    splashMessage.style.display = "none";
    splashLoadContainer.style.display = "none";
    // Display the close button and the password.
    dragRegion.style.visibility = "visible";
    splashPasswordContainer.style.display = "block";
    const password = document.getElementById("loadPassword"),
        passwordIcon = document.getElementById("loadPasswordIcon");
    password.addEventListener("input", e => {
        passwordIcon.classList.remove("active");
        event.sender.send("passwordCheck", e.target.value);
        ipcRenderer.on("passwordCheckResponse", (eve, proceed) => {
            if(proceed == true) {
                password.classList.add("valid");
                password.classList.remove("invalid");
                setTimeout(() => {
                    // Hide the close button and the password.
                    dragRegion.style.visibility = "hidden";
                    splashPasswordContainer.style.display = "none";
                    // Display the splash screen load components.
                    splashMessage.style.display = "block";
                    splashLoadContainer.style.display = "flex";
                }, 1000);
            }
            else {
                password.classList.remove("valid");
                password.classList.add("invalid");
            }
        });
        // if(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(e.target.value)) {
        //     password.classList.remove("invalid");
        //     password.classList.add("valid");
        // }
        // else if(e.target.value == "") {
        //     password.classList.remove("invalid", "valid");
        // }
        // else {
        //     password.classList.add("invalid");
        //     password.classList.remove("valid");
        // }
    });
    passwordIcon.addEventListener("click", e => {
        if(passwordIcon.textContent == "visibility") {
            passwordIcon.textContent = "visibility_off";
            password.setAttribute("type", "text");
        }
        else if(passwordIcon.textContent == "visibility_off") {
            passwordIcon.textContent = "visibility";
            password.setAttribute("type", "password");
        }
    });
    windowControls();
});