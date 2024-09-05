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



// Display a notification for the successful opening of the logs folder.
ipcRenderer.on("logsFolderSuccess", event => {
    M.toast({"html": "The folder containing the log files has been opened.", "classes": "rounded"});
    ipcRenderer.send("logsRequest");
});



// Display a notification for the successful opening of the logs file.
ipcRenderer.on("libraryFolderSuccess", event => {
    M.toast({"html": "The folder containing the library records has been opened.", "classes": "rounded"});
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
        libraryFolder = document.getElementById("libraryFolder"),
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
        ipcRenderer.send("logsFolder");
    });
    libraryFolder.addEventListener("click", e => {
        ipcRenderer.send("libraryFolder");
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
    ipcRenderer.send("getConfigurations");
    ipcRenderer.on("sentConfigurations", (configurationsEvent, configurationsFileStr) => {
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
            autosaveInterval = document.getElementById("autosaveInterval"),
            logoColor = document.getElementById("logoColor"),
            updateLoad = document.getElementById("updateLoad"),
            animeActive = document.getElementById("animeActive"),
            bookActive = document.getElementById("bookActive"),
            filmActive = document.getElementById("filmActive"),
            mangaActive = document.getElementById("mangaActive"),
            showActive = document.getElementById("showActive");
        // Display a notification if there was an error in reading the configuration file.
        if(configurationsFileStr == "") {
            M.toast({"html": "There was an error opening the configuration file associated to the application settings.", "classes": "rounded"});
            // Load the original settings.
            primaryColor.value = "#2A2A8E";
            primaryColor.setAttribute("lastValue", "#2A2A8E");
    		secondaryColor.value = "#D9D9DB";
    		secondaryColor.setAttribute("lastValue", "#D9D9DB");
            if(appPath !== null) {
        		appPath.value = localPath;
        		appPath.setAttribute("lastValue", localPath);
            }
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
            notificationsInterval.value = "3";
            notificationsInterval.setAttribute("lastValue", "3");
            logoColor.value = "white";
            logoColor.setAttribute("lastValue", "white");
            updateLoad.checked = true;
            updateLoad.setAttribute("lastValue", "true");
            animeActive.checked = true;
            animeActive.setAttribute("lastValue", "true");
            bookActive.checked = true;
            bookActive.setAttribute("lastValue", "true");
            filmActive.checked = true;
            filmActive.setAttribute("lastValue", "true");
            mangaActive.checked = true;
            mangaActive.setAttribute("lastValue", "true");
            showActive.checked = true;
            showActive.setAttribute("lastValue", "true");
        }
        // If the file loaded without issues populate the settings modal with the current application setup.
        else {
            ipcRenderer.send("getNotifications");
            ipcRenderer.on("sentNotifications", (notificationsEvent, notificationsFileStr) => {
            	const configData = JSON.parse(configurationsFileStr),
                    notificationsData = JSON.parse(notificationsFileStr);
                primaryColor.value = configData[configData.current != undefined ? "current" : "original"].primaryColor;
                primaryColor.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].primaryColor);
                secondaryColor.value = configData[configData.current != undefined ? "current" : "original"].secondaryColor;
                secondaryColor.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].secondaryColor);
                if(appPath !== null) {
                    appPath.value = configData[configData.current != undefined ? "current" : "original"].path;
                    appPath.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].path);
                }
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
                autosaveInterval.value = configData[configData.current != undefined ? "current" : "original"].autosave;
                autosaveInterval.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].autosave);
                animeActive.checked = configData[configData.current != undefined ? "current" : "original"].active.anime;
                animeActive.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].active.anime);
                bookActive.checked = configData[configData.current != undefined ? "current" : "original"].active.book;
                bookActive.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].active.book);
                filmActive.checked = configData[configData.current != undefined ? "current" : "original"].active.film;
                filmActive.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].active.film);
                mangaActive.checked = configData[configData.current != undefined ? "current" : "original"].active.manga;
                mangaActive.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].active.manga);
                showActive.checked = configData[configData.current != undefined ? "current" : "original"].active.show;
                showActive.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].active.show);
                if(notificationsFileStr == "") {
                    M.toast({"html": "There was an error opening the notifications file associated to the application notifications.", "classes": "rounded"});
                }
                else {
                    notificationsInterval.value = notificationsData.interval;
                    notificationsInterval.setAttribute("lastValue", notificationsData.interval);
                }
                logoColor.value = configData[configData.current != undefined ? "current" : "original"].icon;
                logoColor.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].icon);
                updateLoad.checked = configData[configData.current != undefined ? "current" : "original"].update;
                updateLoad.setAttribute("lastValue", configData[configData.current != undefined ? "current" : "original"].update);
                initSelect();
                // Listen for a click on the color reset button to restore the color inputs to the original values.
                settingsColorReset.addEventListener("click", e => {
                    primaryColor.value = configData.original.primaryColor;
                    secondaryColor.value = configData.original.secondaryColor;
                });
                // Listen for a click on the path reset button to restore the directory input to the original destination.
                if(settingsDataReset !== null) {
                    settingsDataReset.addEventListener("click", e => {
                        appPath.value = configData.original.path;
                        appPath.classList.remove("validate", "valid");
                    });
                }
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
            });
        }
        // Read the tutorial.json file.
        ipcRenderer.send("getTutorial");
        ipcRenderer.on("sentTutorial", (tutorialEvent, tutorialFileStr) => {
            // Define the settings modal input for the tutorial option.
            const tutorialLoad = document.getElementById("tutorialLoad");
            // If there was an issue in reading the tutorial.json file notify the user.
            if(tutorialFileStr == "") {
                ipcRenderer.send("introductionFileSave", true);
                tutorialLoad.checked = false;
                tutorialLoad.setAttribute("lastValue", "false");
            }
            // If tutorial.json was read successfully, then populate the settings modal accordingly.
            else {
                const tutorialData = JSON.parse(tutorialFileStr);
                tutorialLoad.checked = tutorialData.introduction;
                tutorialLoad.setAttribute("lastValue", tutorialData.introduction);
            }
        	// Reset the values in the settings modal upon an exit.
        	const settingsModalInstance = M.Modal.init(document.getElementById("settingsModal"), { "onCloseStart": () => {
                    settingsDisplay.click();
        			primaryColor.value = primaryColor.getAttribute("lastValue");
    	    		secondaryColor.value = secondaryColor.getAttribute("lastValue");
                    if(appPath !== null) {
        	    		appPath.value = appPath.getAttribute("lastValue");
        	    		appPath.classList.remove("validate", "valid");
                    }
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
                    autosaveInterval.value = autosaveInterval.getAttribute("lastValue");
                    updateLoad.checked = updateLoad.getAttribute("lastValue") == "true";
                    animeActive.checked = animeActive.getAttribute("lastValue") == "true";
                    bookActive.checked = bookActive.getAttribute("lastValue") == "true";
                    filmActive.checked = filmActive.getAttribute("lastValue") == "true";
                    mangaActive.checked = mangaActive.getAttribute("lastValue") == "true";
                    showActive.checked = showActive.getAttribute("lastValue") == "true";
        		}
        	});
            // Listen for a click on the apply button in order to submit a back-end request to update the configuration files.
        	settingsApply.addEventListener("click", e => {
                // Check that the window sizes meet the minimal requirements.
                if(parseInt(primaryWindowWidth.value) >= 1000 && parseInt(primaryWindowHeight.value) >= 800 && parseInt(secondaryWindowWidth.value) >= 1400 && parseInt(secondaryWindowHeight.value) >= 1000
                    && Array.from(document.getElementsByClassName("categoryActiveCheckbox")).map(elem => elem.children[0].checked).reduce((accum, cur) => accum || cur, false)) {
            		// Submit a back-end request to update the configuration files.
                    ipcRenderer.send("settingsSave", [
            			appPath !== null ? appPath.value : "",
        				primaryColor.value,
        				secondaryColor.value,
        				primaryWindowWidth.value,
        				primaryWindowHeight.value,
                        primaryWindowFullscreen.checked,
        				secondaryWindowWidth.value,
        				secondaryWindowHeight.value,
                        secondaryWindowFullscreen.checked,
                        logoColor.value,
                        updateLoad.checked,
                        animeActive.checked,
                        bookActive.checked,
                        filmActive.checked,
                        mangaActive.checked,
                        showActive.checked,
                        autosaveInterval.value,
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
                else {
                    M.toast({"html": "At least one record category has to be selected for the application to function properly.", "classes": "rounded"});
                }
        	});
            // Listen for a change in the path input in order to highlight it accordingly.
        	const btnFunc = e => e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
            if(appPath !== null) { appPath.addEventListener("change", btnFunc); }
            // Listen for a change in the primary window width input in order to highlight it accordingly.
        	primaryWindowWidth.addEventListener("change", btnFunc);
            // Listen for a change in the primary window height input in order to highlight it accordingly.
        	primaryWindowHeight.addEventListener("change", btnFunc);
            // Listen for a change in the secondary window width input in order to highlight it accordingly.
        	secondaryWindowWidth.addEventListener("change", btnFunc);
            // Listen for a change in the secondary window height input in order to highlight it accordingly.
        	secondaryWindowHeight.addEventListener("change", btnFunc);
            // Write the app version based on the version in the package.json file.
            ipcRenderer.send("getVersion");
            ipcRenderer.on("sentVersion", (versionEvent, versionFileStr) => {
                if(versionFileStr == "") { M.toast({"html": "There was an issue reading the application package.json file.", "classes": "rounded"}); }
                document.getElementById("appVersion").textContent = "App Version: " + (versionFileStr == "" ? "" : JSON.parse(versionFileStr).version);
            });
        });
    });
});