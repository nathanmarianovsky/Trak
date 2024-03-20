/*

BASIC DETAILS: This file handles all settings activity.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



// Display a notification if there was an issue in reading the configuration.json file.
ipcRenderer.on("configurationFileOpeningFailure", event => {
    M.toast({"html": "There was an error opening the configuration file associated to the application settings.", "classes": "rounded"});
});



// Display a notification if there was an issue in writing the configuration.json file.
ipcRenderer.on("configurationFileWritingFailure", event => {
    M.toast({"html": "There was an error writing the configuration file associated to the application settings.", "classes": "rounded"});
});



// Display a notification for the successful update of the configuration.json file and the requirement of an application restart.
ipcRenderer.on("configurationFileWritingSuccess", event => {
    M.toast({"html": "The application settings have been updated. The application will now restart.", "classes": "rounded"});
});



// Display a notification for the successful update of the configuration.json file.
ipcRenderer.on("configurationFileWritingSuccessSimple", event => {
    M.toast({"html": "The application settings have been updated.", "classes": "rounded"});
});



// Display a notification if there was an issue in copying the data associated to all records.
ipcRenderer.on("copyDataFailure", event => {
    M.toast({"html": "There was an issue in copying the data associated to the records.", "classes": "rounded"});
});



// Display a notification if there was an issue in deleting the original data associated to all records.
ipcRenderer.on("dataDeleteFailure", event => {
    M.toast({"html": "There was an error in deleting the original data associated to the records.", "classes": "rounded"});
});



// Display a notification if there was an issue in copying the library records.
ipcRenderer.on("dataCopyFailure", event => {
    M.toast({"html": "There was an error in copying the original data associated to the records.", "classes": "rounded"});
});



// Display a notification if there was an issue in reading the logs file.
ipcRenderer.on("logsFileReadFailure", event => {
    M.toast({"html": "There was an issue reading the logs file.", "classes": "rounded"});
});



// Display a notification for the successful opening of the logs file.
ipcRenderer.on("logsFileSuccess", event => {
    M.toast({"html": "The folder containing the log files has been opened.", "classes": "rounded"});
    ipcRenderer.send("logsRequest");
});



// Display the modal to be used in asking the user whether the original data folder should be deleted.
ipcRenderer.on("dataOriginalDeleteAsk", (event, response) => {
    // Define the deletion modal.
	const dataDeleteModalInstance = M.Modal.init(document.getElementById("dataDeleteModal"));
    // Open the deletion modal.
	dataDeleteModalInstance.open();
    // Listen for a click on the deny button in order to not delete the previous data records.
    document.getElementById("dataDeleteDeny").addEventListener("click", e => {
    	ipcRenderer.send("dataOriginalDelete", [false, response]);
    });
    // Listen for a click on the accept button in order to delete the previous data records.
    document.getElementById("dataDeleteAccept").addEventListener("click", e => {
    	ipcRenderer.send("dataOriginalDelete", [true, response]);
    });
});



// Wait for the window to finish loading.
window.addEventListener("load", () => {
	// Define the buttons for all settings choices.
    const settingsDisplay = document.getElementById("settingsDisplay"),
        settingsInterface = document.getElementById("settingsInterface"),
        settingsData = document.getElementById("settingsData"),
    	settingsLogs = document.getElementById("settingsLogs"),
        settingsAbout = document.getElementById("settingsAbout"),
        settingsColorReset = document.getElementById("settingsColorReset"),
        settingsDataReset = document.getElementById("settingsDataReset"),
        settingsSizesReset = document.getElementById("settingsSizesReset"),
        settingsIntervalReset = document.getElementById("settingsIntervalReset"),
        aboutGithub = document.getElementById("aboutGithub"),
    	settingsApply = document.getElementById("settingsApply");
    // Define the relevant portions of the page that are in the settings rotation.
    const settingsDisplayContainer = document.getElementById("settingsDisplayContainer"),
        settingsInterfaceContainer = document.getElementById("settingsInterfaceContainer"),
        settingsDataContainer = document.getElementById("settingsDataContainer"),
        settingsLogsContainer = document.getElementById("settingsLogsContainer"),
        settingsAboutContainer = document.getElementById("settingsAboutContainer"),
        settingsContainers = Array.from(document.getElementsByClassName("settingsContainer")),
        settingsSelectionItems = Array.from(document.getElementsByClassName("settingsSelectionItems"));
    logsFolder.addEventListener("click", e => {
        ipcRenderer.send("logsFile");
    });
    // Listen for a click event on the settingsDisplay button on the top bar to display the display settings.
    settingsBtnsInit(ipcRenderer, settingsDisplay, settingsContainers, settingsSelectionItems, settingsDisplayContainer,
        ["settingsDisplayButtons"], ["settingsLogsButtons", "settingsDataButtons", "settingsInterfaceButtons"]);
    // Listen for a click event on the settingsInterface button on the top bar to display the interface settings.
    settingsBtnsInit(ipcRenderer, settingsInterface, settingsContainers, settingsSelectionItems, settingsInterfaceContainer,
        ["settingsInterfaceButtons"], ["settingsDisplayButtons", "settingsLogsButtons", "settingsDataButtons"]);
    // Listen for a click event on the settingsData button on the top bar to display the data settings.
    settingsBtnsInit(ipcRenderer, settingsData, settingsContainers, settingsSelectionItems, settingsDataContainer,
        ["settingsDataButtons"], ["settingsDisplayButtons", "settingsLogsButtons", "settingsInterfaceButtons"]);
    // Listen for a click event on the settingsLogs button on the top bar to display the application logs.
    settingsBtnsInit(ipcRenderer, settingsLogs, settingsContainers, settingsSelectionItems, settingsLogsContainer,
        ["settingsLogsButtons"], ["settingsDisplayButtons", "settingsDataButtons", "settingsInterfaceButtons"]);
    // Listen for a click event on the settingsAnalytics button on the top bar to display the record analytics.
    settingsBtnsInit(ipcRenderer, settingsAnalytics, settingsContainers, settingsSelectionItems, settingsAnalyticsContainer, [],
        ["settingsDisplayButtons", "settingsLogsButtons", "settingsDataButtons", "settingsInterfaceButtons"]);
    // Listen for a click event on the settingsAbout button on the top bar to display the about section of the app.
    settingsBtnsInit(ipcRenderer, settingsAbout, settingsContainers, settingsSelectionItems, settingsAboutContainer, [],
        ["settingsDisplayButtons", "settingsLogsButtons", "settingsDataButtons", "settingsInterfaceButtons"]);
    // Listen for a click event on the aboutGithub button in the about section in order to open the associated link in the default browser.
    aboutGithub.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("aboutGithub");
    });
    // Read the settings configuration file.
    fs.readFile(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8", (err, file) => {
    	// Define the inputs on the settings modal.
    	const primaryColor = document.getElementById("primaryColor"),
    		secondaryColor = document.getElementById("secondaryColor"),
    		appPath = document.getElementById("appPath"),
    		primaryWindowWidth = document.getElementById("primaryWindowWidth"),
    		primaryWindowHeight = document.getElementById("primaryWindowHeight"),
            primaryWindowFullscreen = document.getElementById("primaryWindowFullscreen"),
    		secondaryWindowWidth = document.getElementById("secondaryWindowWidth"),
    		secondaryWindowHeight = document.getElementById("secondaryWindowHeight"),
            secondaryWindowFullscreen = document.getElementById("secondaryWindowFullscreen"),
            notificationsInterval = document.getElementById("notificationsInterval"),
            logoColor = document.getElementById("logoColor");
        // Display a notification if there was an error in reading the configuration file.
        if(err) {
            M.toast({"html": "There was an error opening the configuration file associated to the application settings.", "classes": "rounded"});
            // Load the original settings.
            primaryColor.value = "#2A2A8E";
            primaryColor.setAttribute("lastValue", "#2A2A8E");
    		secondaryColor.value = "#D9D9DB";
    		secondaryColor.setAttribute("lastValue", "#D9D9DB");
    		appPath.value = localPath;
    		appPath.setAttribute("lastValue", localPath);
    		primaryWindowWidth.value = "1000";
    		primaryWindowWidth.setAttribute("lastValue", "1000");
    		primaryWindowHeight.value = "800";
    		primaryWindowHeight.setAttribute("lastValue", "800");
            primaryWindowFullscreen.checked = false;
            primaryWindowFullscreen.setAttribute("lastValue", "false");
    		secondaryWindowWidth.value = "1400";
    		secondaryWindowWidth.setAttribute("lastValue", "1400");
    		secondaryWindowHeight.value = "1000";
    		secondaryWindowHeight.setAttribute("lastValue", "1000");
            secondaryWindowFullscreen.checked = false;
            secondaryWindowFullscreen.setAttribute("lastValue", "false");
            notificationsInterval.value = "14";
            notificationsInterval.setAttribute("lastValue", "14");
            logoColor.value = "white";
            logoColor.setAttribute("lastValue", "white");
        }
        // If the file loaded without issues populate the settings modal with the current application setup.
        else {
        	const configData = JSON.parse(file),
                notificationsData = JSON.parse(fs.readFileSync(path.join(basePath, "Trak", "config", "notifications.json"), "UTF8"));
            primaryColor.value = configData[configData.current != undefined ? "current" : "original"].primaryColor;
            primaryColor.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].primaryColor);
            secondaryColor.value = configData[configData.current != undefined ? "current" : "original"].secondaryColor;
            secondaryColor.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].secondaryColor);
            appPath.value = configData[configData.current != undefined ? "current" : "original"].path;
            appPath.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].path);
            primaryWindowWidth.value = configData[configData.current != undefined ? "current" : "original"].primaryWindowWidth;
            primaryWindowWidth.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].primaryWindowWidth);
            primaryWindowHeight.value = configData[configData.current != undefined ? "current" : "original"].primaryWindowHeight;
            primaryWindowHeight.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].primaryWindowHeight);
            primaryWindowFullscreen.checked = configData[configData.current != undefined ? "current" : "original"].primaryWindowFullscreen;
            primaryWindowFullscreen.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].primaryWindowFullscreen);
            secondaryWindowWidth.value = configData[configData.current != undefined ? "current" : "original"].secondaryWindowWidth;
            secondaryWindowWidth.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].secondaryWindowWidth);
            secondaryWindowHeight.value = configData[configData.current != undefined ? "current" : "original"].secondaryWindowHeight;
            secondaryWindowHeight.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].secondaryWindowHeight);
            secondaryWindowFullscreen.checked = configData[configData.current != undefined ? "current" : "original"].secondaryWindowFullscreen;
            secondaryWindowFullscreen.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].secondaryWindowFullscreen);
            notificationsInterval.value = notificationsData.interval;
            notificationsInterval.setAttribute("lastValue", notificationsData.interval);
            logoColor.value = configData[configData.current != undefined ? "current" : "original"].icon;
            logoColor.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].icon);
            initSelect();
            // Listen for a click on the color reset button to restore the color inputs to the original values.
            settingsColorReset.addEventListener("click", e => {
                primaryColor.value = configData.original.primaryColor;
                secondaryColor.value = configData.original.secondaryColor;
            });
            // Listen for a click on the path reset button to restore the directory input to the original destination.
            settingsDataReset.addEventListener("click", e => {
                appPath.value = configData.original.path;
                appPath.classList.remove("validate", "valid");
            });
            // Listen for a click on the sizes reset button to restore the sizes of the windows to their original values.
            settingsSizesReset.addEventListener("click", e => {
                primaryWindowWidth.value = configData.original.primaryWindowWidth;
                primaryWindowWidth.classList.remove("validate", "valid");
                primaryWindowHeight.value = configData.original.primaryWindowHeight;
                primaryWindowHeight.classList.remove("validate", "valid");
                secondaryWindowWidth.value = configData.original.secondaryWindowWidth;
                secondaryWindowWidth.classList.remove("validate", "valid");
                secondaryWindowHeight.value = configData.original.secondaryWindowHeight;
                secondaryWindowHeight.classList.remove("validate", "valid");
            });
            settingsIntervalReset.addEventListener("click", e => {
                notificationsInterval.value = "14";
                initSelect();
            });
            // By default load the options section of the settings modal.
        	settingsDisplay.click();
        }
        // Read the tutorial.json file.
        fs.readFile(path.join(basePath, "Trak", "config", "tutorial.json"), "UTF8", (err, tutorialInfo) => {
            // Define the settings modal input for the tutorial option.
            const tutorialLoad = document.getElementById("tutorialLoad");
            // If there was an issue in reading the tutorial.json file notify the user.
            if(err) {
                ipcRenderer.send("introductionFileSave", true);
                tutorialLoad.checked = false;
                tutorialLoad.setAttribute("lastValue", "false");
            }
            // If tutorial.json was read successfully, then populate the settings modal accordingly.
            else {
                const tutorialData = JSON.parse(tutorialInfo);
                tutorialLoad.checked = tutorialData.introduction;
                tutorialLoad.setAttribute("lastValue", tutorialData.introduction);
            }
        	// Reset the values in the settings modal upon an exit.
        	const settingsModalInstance = M.Modal.init(document.getElementById("settingsModal"), { "onCloseStart": () => {
                    settingsDisplay.click();
        			primaryColor.value = primaryColor.getAttribute("lastValue");
    	    		secondaryColor.value = secondaryColor.getAttribute("lastValue");
    	    		appPath.value = appPath.getAttribute("lastValue");
    	    		appPath.classList.remove("validate", "valid");
    	    		primaryWindowWidth.value = primaryWindowWidth.getAttribute("lastValue");
    	    		primaryWindowWidth.classList.remove("validate", "valid");
    	    		primaryWindowHeight.value = primaryWindowHeight.getAttribute("lastValue");
    	    		primaryWindowHeight.classList.remove("validate", "valid");
                    primaryWindowFullscreen.checked = primaryWindowFullscreen.getAttribute("lastValue") == "true";
    	    		secondaryWindowWidth.value = secondaryWindowWidth.getAttribute("lastValue");
    	    		secondaryWindowWidth.classList.remove("validate", "valid");
    	    		secondaryWindowHeight.value = secondaryWindowHeight.getAttribute("lastValue");
    	    		secondaryWindowHeight.classList.remove("validate", "valid");
                    secondaryWindowFullscreen.checked = secondaryWindowFullscreen.getAttribute("lastValue") == "true";
                    tutorialLoad.checked = tutorialLoad.getAttribute("lastValue") == "true";
                    notificationsInterval.value = notificationsInterval.getAttribute("lastValue");
        		}
        	});
            // Listen for a click on the apply button in order to submit a back-end request to update the configuration files.
        	settingsApply.addEventListener("click", e => {
                // Format the submitted directory.
        		const submitPath = appPath.value.substring(appPath.value.length - 10) == "\\Trak\\data" ? appPath.value : appPath.value + "\\Trak\\data";
                // Check that the window sizes meet the minimal requirements.
                if(parseInt(primaryWindowWidth.value) >= 1000 && parseInt(primaryWindowHeight.value) >= 800 && parseInt(secondaryWindowWidth.value) >= 1400 && parseInt(secondaryWindowHeight.value) >= 1000) {
            		// Submit a back-end request to update the configuration files.
                    ipcRenderer.send("settingsSave", [
            			submitPath,
        				primaryColor.value,
        				secondaryColor.value,
        				primaryWindowWidth.value,
        				primaryWindowHeight.value,
                        primaryWindowFullscreen.checked,
        				secondaryWindowWidth.value,
        				secondaryWindowHeight.value,
                        secondaryWindowFullscreen.checked,
                        logoColor.value,
                        tutorialLoad.checked
            		]);
                    ipcRenderer.send("notificationsIntervalSave", notificationsInterval.value);
                    // Close the settings modal.
            		settingsModalInstance.close();
                }
                // Display a notification if the primary window width is too small.
                else if(parseInt(primaryWindowWidth.value) < 1000) {
                    M.toast({"html": "The primary window width has to be at least 1000.", "classes": "rounded"});
                }
                // Display a notification if the primary window height is too small.
                else if(parseInt(primaryWindowHeight.value) < 800) {
                    M.toast({"html": "The primary window height has to be at least 800.", "classes": "rounded"});
                }
                // Display a notification if the secondary window width is too small.
                else if(parseInt(secondaryWindowWidth.value) < 1400) {
                    M.toast({"html": "The secondary window width has to be at least 1400.", "classes": "rounded"});
                }
                // Display a notification if the secondary window height is too small.
                else if(parseInt(secondaryWindowHeight.value) < 1000) {
                    M.toast({"html": "The secondary window height has to be at least 1000.", "classes": "rounded"});
                }
        	});
            // Listen for a change in the path input in order to highlight it accordingly.
        	const btnFunc = e => e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
            appPath.addEventListener("change", btnFunc);
            // Listen for a change in the primary window width input in order to highlight it accordingly.
        	primaryWindowWidth.addEventListener("change", btnFunc);
            // Listen for a change in the primary window height input in order to highlight it accordingly.
        	primaryWindowHeight.addEventListener("change", btnFunc);
            // Listen for a change in the secondary window width input in order to highlight it accordingly.
        	secondaryWindowWidth.addEventListener("change", btnFunc);
            // Listen for a change in the secondary window height input in order to highlight it accordingly.
        	secondaryWindowHeight.addEventListener("change", btnFunc);
            // Write the app version based on the version in the package.json file.
            fs.readFile(path.join(basePath, "Trak", "config", "location.json"), "UTF8", (resp, fl) => {
                if(resp) { M.toast({"html": "There was an issue reading the configurations location.json file.", "classes": "rounded"}); }
                else {
                    document.getElementById("appVersion").textContent = "App Version: " + JSON.parse(fs.readFileSync(path.join(JSON.parse(fl).appLocation, "package.json"), "UTF8")).version;
                }
            });
        });
    });
});