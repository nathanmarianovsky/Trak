/*

BASIC DETAILS: This file handles all account activity.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



// Display a notification if there was an issue in reading the profile.json file.
ipcRenderer.on("profileFileOpeningFailure", event => {
    M.toast({"html": "There was an error opening the configuration file associated to the profile settings.", "classes": "rounded"});
});



// Display a notification if there was an issue in writing the profile.json file.
ipcRenderer.on("profileFileWritingFailure", event => {
    M.toast({"html": "There was an error writing the configuration file associated to the profile settings.", "classes": "rounded"});
});



// Display a notification for the successful update of the profile.json file and the requirement of an application restart.
ipcRenderer.on("profileFileWritingSuccess", event => {
    M.toast({"html": "The profile settings have been updated. The application will now restart.", "classes": "rounded"});
});



// Wait for the window to finish loading.
window.addEventListener("load", () => {
	// Define the buttons for all account choices.
    const accountProfile = document.getElementById("accountProfile"),
        accountInterface = document.getElementById("accountInterface"),
    	accountApply = document.getElementById("accountApply");
    // Define the relevant portions of the page that are in the account rotation.
    const accountProfileContainer = document.getElementById("accountProfileContainer"),
        accountInterfaceContainer = document.getElementById("accountInterfaceContainer"),
        accountContainers = Array.from(document.getElementsByClassName("accountContainer")),
        accountSelectionItems = Array.from(document.getElementsByClassName("accountSelectionItems"));
    // Listen for a click event on the accountProfile button on the top bar to display the local profile settings.
    settingsBtnsInit(ipcRenderer, accountProfile, accountContainers, accountSelectionItems, accountProfileContainer,
        ["accountProfileButtons"], ["accountInterfaceButtons"]);
    // // Listen for a click event on the settingsInterface button on the top bar to display the interface settings.
    // settingsBtnsInit(ipcRenderer, settingsInterface, settingsContainers, settingsSelectionItems, settingsInterfaceContainer,
    //     ["settingsInterfaceButtons"], ["settingsDisplayButtons", "settingsLogsButtons", "settingsDataButtons"]);
	// Define the inputs on the account modal.
	const password = document.getElementById("profilePassword");
        passwordIcon = document.getElementById("profilePasswordIcon");
    // encrypt.value = configData.encrypt;
    // encrypt.setAttribute("lastValue", configData.encrypt);
    // By default load the options section of the settings modal.
	accountProfile.click();
	// Reset the values in the settings modal upon an exit.
	const accountModalInstance = M.Modal.init(document.getElementById("accountModal"), { "onCloseStart": () => {
            accountProfile.click();
			// encrypt.value = encrypt.getAttribute("lastValue");
		}
	});
    password.addEventListener("click", e => {
        passwordIcon.classList.remove("active");
    });
    password.addEventListener("input", e => {
        passwordIcon.classList.remove("active");
        if(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(e.target.value)) {
            password.classList.remove("invalid");
            password.classList.add("valid");
        }
        else if(e.target.value == "") {
            password.classList.remove("invalid", "valid");
        }
        else {
            password.classList.add("invalid");
            password.classList.remove("valid");
        }
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
    // Listen for a click on the apply button in order to submit a back-end request to update the configuration files.
	accountApply.addEventListener("click", e => {
        if(password.classList.contains("valid") || (!password.classList.contains("valid") && !password.classList.contains("invalid"))) {
    		// Submit a back-end request to update the configuration files.
            ipcRenderer.send("accountSave", password.value);
            // Close the settings modal.
    		accountModalInstance.close();
        }
        else {
            M.toast({"html": "The provided password does not meet the minimal requirements.", "classes": "rounded"});
        }
	});
});