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



// Display a notification for the successful update of the profile.json file.
ipcRenderer.on("profileFileWritingSuccessSimple", event => {
    M.toast({"html": "The profile settings have been updated.", "classes": "rounded"});
});



// Wait for the window to finish loading.
window.addEventListener("load", () => {
	// Define the buttons for all settings choices.
    const accountDisplay = document.getElementById("accountProfile"),
        accountInterface = document.getElementById("accountInterface"),
    	accountApply = document.getElementById("accountApply");
    // Define the relevant portions of the page that are in the settings rotation.
    const accountProfileContainer = document.getElementById("accountProfileContainer"),
        accountInterfaceContainer = document.getElementById("accountInterfaceContainer"),
        accountContainers = Array.from(document.getElementsByClassName("accountContainer")),
        accountSelectionItems = Array.from(document.getElementsByClassName("accountSelectionItems"));
    // // Listen for a click event on the settingsDisplay button on the top bar to display the display settings.
    // settingsBtnsInit(ipcRenderer, settingsDisplay, settingsContainers, settingsSelectionItems, settingsDisplayContainer,
    //     ["settingsDisplayButtons"], ["settingsLogsButtons", "settingsDataButtons", "settingsInterfaceButtons"]);
    // // Listen for a click event on the settingsInterface button on the top bar to display the interface settings.
    // settingsBtnsInit(ipcRenderer, settingsInterface, settingsContainers, settingsSelectionItems, settingsInterfaceContainer,
    //     ["settingsInterfaceButtons"], ["settingsDisplayButtons", "settingsLogsButtons", "settingsDataButtons"]);
    // Read the settings configuration file.
    ipcRenderer.send("getProfile");
    ipcRenderer.on("sentProfile", (configurationsEvent, profileFileStr) => {
    	// Define the inputs on the account modal.
    	const password = document.getElementById("profilePassword")
            encrypt = document.getElementById("profileEncrypt");
        // Display a notification if there was an error in reading the configuration file.
        if(profileFileStr == "") {
            M.toast({"html": "There was an error opening the configuration file associated to the profile settings.", "classes": "rounded"});
            // Load the original settings.
            encrypt.checked = false;
            encrypt.setAttribute("lastValue", "false");
        }
        // If the file loaded without issues populate the settings modal with the current application setup.
        else {
        	const configData = JSON.parse(profileFileStr);
            encrypt.value = configData.encrypt;
            encrypt.setAttribute("lastValue", configData.encrypt);
            // By default load the options section of the settings modal.
        	accountProfile.click();
        }
    	// Reset the values in the settings modal upon an exit.
    	const accountModalInstance = M.Modal.init(document.getElementById("accountModal"), { "onCloseStart": () => {
                accountProfile.click();
    			encrypt.value = encrypt.getAttribute("lastValue");
    		}
    	});
        // // Listen for a click on the apply button in order to submit a back-end request to update the configuration files.
    	// settingsApply.addEventListener("click", e => {
        //     // Check that the window sizes meet the minimal requirements.
        //     if(parseInt(primaryWindowWidth.value) >= 1000 && parseInt(primaryWindowHeight.value) >= 800 && parseInt(secondaryWindowWidth.value) >= 1400 && parseInt(secondaryWindowHeight.value) >= 1000
        //         && Array.from(document.getElementsByClassName("categoryActiveCheckbox")).map(elem => elem.children[0].checked).reduce((accum, cur) => accum || cur, false)) {
        // 		// Submit a back-end request to update the configuration files.
        //         ipcRenderer.send("settingsSave", [
        // 			appPath !== null ? appPath.value : "",
    	// 			primaryColor.value,
    	// 			secondaryColor.value,
    	// 			primaryWindowWidth.value,
    	// 			primaryWindowHeight.value,
        //             primaryWindowFullscreen.checked,
    	// 			secondaryWindowWidth.value,
    	// 			secondaryWindowHeight.value,
        //             secondaryWindowFullscreen.checked,
        //             logoColor.value,
        //             updateLoad.checked,
        //             animeActive.checked,
        //             bookActive.checked,
        //             filmActive.checked,
        //             mangaActive.checked,
        //             showActive.checked,
        //             autosaveInterval.value,
        //             tutorialLoad.checked
        // 		]);
        //         ipcRenderer.send("notificationsIntervalSave", notificationsInterval.value);
        //         // Close the settings modal.
        // 		accountModalInstance.close();
        //     }
        //     // Display a notification if the primary window width is too small.
        //     else if(parseInt(primaryWindowWidth.value) < 1000) {
        //         M.toast({"html": "The primary window width has to be at least 1000.", "classes": "rounded"});
        //     }
        //     // Display a notification if the primary window height is too small.
        //     else if(parseInt(primaryWindowHeight.value) < 800) {
        //         M.toast({"html": "The primary window height has to be at least 800.", "classes": "rounded"});
        //     }
        //     // Display a notification if the secondary window width is too small.
        //     else if(parseInt(secondaryWindowWidth.value) < 1400) {
        //         M.toast({"html": "The secondary window width has to be at least 1400.", "classes": "rounded"});
        //     }
        //     // Display a notification if the secondary window height is too small.
        //     else if(parseInt(secondaryWindowHeight.value) < 1000) {
        //         M.toast({"html": "The secondary window height has to be at least 1000.", "classes": "rounded"});
        //     }
        //     else {
        //         M.toast({"html": "At least one record category has to be selected for the application to function properly.", "classes": "rounded"});
        //     }
    	// });
        // // Listen for a change in the path input in order to highlight it accordingly.
    	// const btnFunc = e => e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
        // if(appPath !== null) { appPath.addEventListener("change", btnFunc); }
        // // Listen for a change in the primary window width input in order to highlight it accordingly.
    	// primaryWindowWidth.addEventListener("change", btnFunc);
        // // Listen for a change in the primary window height input in order to highlight it accordingly.
    	// primaryWindowHeight.addEventListener("change", btnFunc);
        // // Listen for a change in the secondary window width input in order to highlight it accordingly.
    	// secondaryWindowWidth.addEventListener("change", btnFunc);
        // // Listen for a change in the secondary window height input in order to highlight it accordingly.
    	// secondaryWindowHeight.addEventListener("change", btnFunc);
        // // Write the app version based on the version in the package.json file.
        // ipcRenderer.send("getVersion");
        // ipcRenderer.on("sentVersion", (versionEvent, versionFileStr) => {
        //     if(versionFileStr == "") { M.toast({"html": "There was an issue reading the application package.json file.", "classes": "rounded"}); }
        //     document.getElementById("appVersion").textContent = "App Version: " + (versionFileStr == "" ? "" : JSON.parse(versionFileStr).version);
        // });
    });
});