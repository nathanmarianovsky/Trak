/*

BASIC DETAILS: Provides all actions associated to working with the app settings.

   - updateSettings: Handles the update of the settings configuration file.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Handles the update of all settings files.

    - path and fs provide the means to work with local files.
    - log provides the means to create application logs to keep track of what is going on.
    - app and ipc provide the means to operate the Electron app.
    - dataArr is the array submitted from the front-end to update the settings options.
    - appDirectory is the path to the local user data.
    - win is an object representing the primary window.
    - evnt provides the means to interact with the front-end of the Electron app.

*/
exports.updateSettings = (fs, path, log, ipc, app, dataArr, appDirectory, win, evnt) => {
    // Define the new data to be saved for the settings configuration file.
    const writeData = {
        "path": dataArr[0],
        "primaryColor": dataArr[1],
        "secondaryColor": dataArr[2],
        "primaryWindowWidth": dataArr[3],
        "primaryWindowHeight": dataArr[4],
        "primaryWindowFullscreen": dataArr[5],
        "secondaryWindowWidth": dataArr[6],
        "secondaryWindowHeight": dataArr[7],
        "secondaryWindowFullscreen": dataArr[8],
        "icon": dataArr[9],
        "update": dataArr[10]
    };
    // Read the settings tutorial.json file.
    fs.readFile(path.join(appDirectory, "Trak", "config", "tutorial.json"), "UTF8", (er, tutorialFile) => {
        // If there was an issue reading the tutorial.json file notify the user.
        if(er) {
            log.error("There was an error in reading the tutorial configuration file.");
            evnt.sender.send("introductionFileReadFailure");
        }
        else {
            log.info("The tutorial configuration file has been successfully read.");
            // Define the tutorial boolean.
            const origIntro = JSON.parse(tutorialFile).introduction;
            // Write the tutorial.json file with the submitted data.
            fs.writeFile(path.join(appDirectory, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": dataArr[dataArr.length - 1] }), "UTF8", error => {
                // If there was an issue writing the tutorial.json file notify the user.
                if(error) {
                    log.error("There was an error in updating the tutorial configuration file.");
                    evnt.sender.send("introductionFileSaveFailure");
                }
                else {
                    log.info("The tutorial configuration file has been successfully rewritten.");
                    // If the tutorial data was changed notify the user that the file was successfully updated.
                    if(origIntro != dataArr[dataArr.length - 1]) { evnt.sender.send("introductionFileSaveSuccess"); }
                    // Read the settings configuration.json file.
                    fs.readFile(path.join(appDirectory, "Trak", "config", "configuration.json"), (err, file) => {
                        // If there was an issue in reading the configuration.json file notify the user.
                        if(err) {
                            log.error("There was an error in reading the settings configuration file.");
                            evnt.sender.send("configurationFileOpeningFailure");
                        }
                        else {
                            log.info("The settings configuration file has been successfully read.");
                            // Define the settings configuration data.
                            const configurationData = JSON.parse(file);
                            // Delete the user records located in the previous location if requested.
                            ipc.on("dataOriginalDelete", (eve, resp) => {
                                // Only delete the previous user records if the user wants to.
                                if(resp[0] == true) {
                                    // Remove the directory and all content in it.
                                    fs.rm(configurationData.current.path, { "forced": true, "recursive": true}, er => {
                                        // If there was an issue in removing the directory notify the user.
                                        if(er) {
                                            log.error("There was an error in deleting the original data associated to the records.");
                                            eve.sender.send("dataDeleteFailure");
                                        }
                                        else {
                                            log.info("The original data associated to the records has been successfully deleted.");
                                            // Properly define the previous primary and secondary colors.
                                            if(resp[1] == true) {
                                                writeData.previousPrimaryColor = configurationData.current.primaryColor;
                                                writeData.previousSecondaryColor = configurationData.current.secondaryColor;
                                            }
                                            else {
                                                writeData.previousPrimaryColor = configurationData.original.primaryColor;
                                                writeData.previousSecondaryColor = configurationData.original.secondaryColor;
                                            }
                                            configurationData.current = writeData;
                                            // Write the configuration.json file with the submitted data.
                                            fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
                                                // If there was an issue in writing the configuration.json notify the user.
                                                if(err) {
                                                    log.error("There was an error writing the configuration file associated to the application settings.");
                                                    eve.sender.send("configurationFileWritingFailure");
                                                }
                                                else {
                                                    log.info("The application settings have been updated. The application will now restart.");
                                                    // Notify the user that the configuration.json was successfully updated and restart the application.
                                                    eve.sender.send("configurationFileWritingSuccess");
                                                    setTimeout(() => {
                                                        app.relaunch();
                                                        app.exit();
                                                    }, 2000);
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    // Properly define the previous primary and secondary colors.
                                    if(resp[1] == true) {
                                        writeData.previousPrimaryColor = configurationData.current.primaryColor;
                                        writeData.previousSecondaryColor = configurationData.current.secondaryColor;
                                    }
                                    else {
                                        writeData.previousPrimaryColor = configurationData.original.primaryColor;
                                        writeData.previousSecondaryColor = configurationData.original.secondaryColor;
                                    }
                                    configurationData.current = writeData;
                                    // Write the configuration.json file with the submitted data.
                                    fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
                                        // If there was an issue in writing the configuration.json notify the user.
                                        if(err) {
                                            log.error("There was an error writing the configuration file associated to the application settings.");
                                            eve.sender.send("configurationFileWritingFailure");
                                        }
                                        else {
                                            log.info("The application settings have been updated. The application will now restart.");
                                            // Notify the user that the configuration.json was successfully updated and restart the application.
                                            eve.sender.send("configurationFileWritingSuccess");
                                            setTimeout(() => {
                                                app.relaunch();
                                                app.exit();
                                            }, 2000);
                                        }
                                    });
                                }
                            });
                            // If the current parameters do not exist then compare the provided options to the original parameters.
                            if(configurationData.current == undefined) {
                                // If the provided options are the same as the original parameters then write the configuration.json file, but do not restart the app.
                                if(configurationData.original.path == writeData.path && configurationData.original.primaryColor == writeData.primaryColor
                                    && configurationData.original.secondaryColor == writeData.secondaryColor && configurationData.original.primaryWindowWidth == writeData.primaryWindowWidth
                                    && configurationData.original.primaryWindowHeight == writeData.primaryWindowHeight && configurationData.original.secondaryWindowWidth == writeData.secondaryWindowWidth
                                    && configurationData.original.secondaryWindowHeight == writeData.secondaryWindowHeight && configurationData.original.primaryWindowFullscreen == writeData.primaryWindowFullscreen
                                    && configurationData.original.secondaryWindowFullscreen == writeData.secondaryWindowFullscreen && configurationData.original.icon == writeData.icon
                                    && configurationData.original.update == writeData.update && origIntro == dataArr[dataArr.length - 1]) {
                                    writeData.previousPrimaryColor = configurationData.original.primaryColor;
                                    writeData.previousSecondaryColor = configurationData.original.secondaryColor;
                                    configurationData.current = writeData;
                                    // Write the configuration.json file with the submitted data.
                                    fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
                                        // If there was an issue in writing the configuration.json notify the user.
                                        if(err) {
                                            log.error("There was an error writing the configuration file associated to the application settings.");
                                            evnt.sender.send("configurationFileWritingFailure");
                                        }
                                        else {
                                            log.info("The application settings have been updated.");
                                            win.reload();
                                            setTimeout(() => {
                                                win.webContents.send("configurationFileWritingSuccessSimple");
                                            }, 500);
                                        }
                                    });
                                }
                                // If the provided options are not the same as the original parameters then write the configuration.json file and restart the app.
                                else {
                                    // If the provided data path is the same then proceed by writing the configuration.json file and restarting the app.
                                    if(configurationData.original.path == writeData.path) {
                                        writeData.previousPrimaryColor = configurationData.original.primaryColor;
                                        writeData.previousSecondaryColor = configurationData.original.secondaryColor;
                                        configurationData.current = writeData;
                                        // Write the configuration.json file with the submitted data.
                                        fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
                                            // If there was an issue in writing the configuration.json notify the user.
                                            if(err) {
                                                log.error("There was an error writing the configuration file associated to the application settings.");
                                                evnt.sender.send("configurationFileWritingFailure");
                                            }
                                            else {
                                                log.info("The application settings have been updated. The application will now restart.");
                                                // Notify the user that the configuration.json was successfully updated and restart the application.
                                                evnt.sender.send("configurationFileWritingSuccess");
                                                setTimeout(() => {
                                                    app.relaunch();
                                                    app.exit();
                                                }, 2000);
                                            }
                                        });
                                    }
                                    // If the provided data path is different than the original path then proceed by copying the user records and asking if they would like to remove the original directory.
                                    else {
                                        fs.copy(configurationData.current.path, path.join(writeData.path), err => {
                                            if(err) {
                                                log.error("There was an error in copying the original data associated to the records.");
                                                event.sender.send("dataCopyFailure");
                                            }
                                            else {
                                                log.info("The user is being asked on whether they would like to delete the library records data in the previous save location.");
                                                event.sender.send("dataOriginalDeleteAsk", false);
                                            }
                                        });
                                    }
                                }
                            }
                            // If the current parameters do exist then compare the provided options to them.
                            else {
                                // If the provided options are the same as the current parameters then write the configuration.json file, but do not restart the app.
                                if(configurationData.current.path == writeData.path && configurationData.current.primaryColor == writeData.primaryColor
                                    && configurationData.current.secondaryColor == writeData.secondaryColor && configurationData.current.primaryWindowWidth == writeData.primaryWindowWidth
                                    && configurationData.current.primaryWindowHeight == writeData.primaryWindowHeight && configurationData.current.secondaryWindowWidth == writeData.secondaryWindowWidth
                                    && configurationData.current.secondaryWindowHeight == writeData.secondaryWindowHeight && configurationData.current.primaryWindowFullscreen == writeData.primaryWindowFullscreen
                                    && configurationData.current.secondaryWindowFullscreen == writeData.secondaryWindowFullscreen && configurationData.current.icon == writeData.icon
                                    && configurationData.current.update == writeData.update && origIntro == dataArr[dataArr.length - 1]) {
                                    writeData.previousPrimaryColor = configurationData.current.primaryColor;
                                    writeData.previousSecondaryColor = configurationData.current.secondaryColor;
                                    configurationData.current = writeData;
                                    // Write the configuration.json file with the submitted data.
                                    fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
                                        // If there was an issue in writing the configuration.json notify the user.
                                        if(err) {
                                            log.error("There was an error writing the configuration file associated to the application settings.");
                                            evnt.sender.send("configurationFileWritingFailure");
                                        }
                                        else {
                                            log.info("The application settings have been updated.");
                                            win.reload();
                                            setTimeout(() => {
                                                win.webContents.send("configurationFileWritingSuccessSimple");
                                            }, 500);
                                        }
                                    });
                                }
                                // If the provided options are not the same as the current parameters then write the configuration.json file and restart the app.
                                else {
                                    if(configurationData.current.path == writeData.path) {
                                        writeData.previousPrimaryColor = configurationData.current.primaryColor;
                                        writeData.previousSecondaryColor = configurationData.current.secondaryColor;
                                        configurationData.current = writeData;
                                        // Write the configuration.json file with the submitted data.
                                        fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
                                            // If there was an issue in writing the configuration.json notify the user.
                                            if(err) {
                                                log.error("There was an error writing the configuration file associated to the application settings.");
                                                evnt.sender.send("configurationFileWritingFailure");
                                            }
                                            else {
                                                log.info("The application settings have been updated. The application will now restart.");
                                                // Notify the user that the configuration.json was successfully updated and restart the application.
                                                evnt.sender.send("configurationFileWritingSuccess")
                                                setTimeout(() => {
                                                    app.relaunch();
                                                    app.exit();
                                                }, 2000);
                                            }
                                        });
                                    }
                                    // If the provided data path is different than the current path then proceed by copying the user records and asking if they would like to remove the current directory.
                                    else {
                                        fs.copy(configurationData.current.path, path.join(writeData.path), err => {
                                            if(err) {
                                                log.error("There was an error in copying the original data associated to the records.");
                                                evnt.sender.send("dataCopyFailure");
                                            }
                                            else {
                                                log.info("The user is being asked on whether they would like to delete the library records data in the previous save location.");
                                                evnt.sender.send("dataOriginalDeleteAsk", true);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }
    });
};



module.exports = exports;