/*

BASIC DETAILS: Provides all actions associated to working with the app settings.

   - configRecordTypeCompare: Compares two application configuration objects to determine whether they have the same active record categories.
   - updateSettings: Handles the update of the settings configuration file.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Compares two application configuration objects to determine whether they have the same active record categories.

    - lhs and rhs are objects representing an application configuration.

*/
exports.configRecordTypeCompare = (lhs, rhs) => {
    return lhs.active.anime == rhs.active.anime
        && lhs.active.book == rhs.active.book
        && lhs.active.film == rhs.active.film
        && lhs.active.manga == rhs.active.manga
        && lhs.active.show == rhs.active.show;
};



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
    const checkVal = dataArr[0].substring(dataArr[0].length - 10),
        formattedPath = ((checkVal == "\\Trak\\data") || (checkVal == "/Trak/data"))
            ? dataArr[0] : (dataArr[0] + (process.env.APPDATA ? "\\Trak\\data" : "/Trak/data"));
    const writeData = {
        "path": formattedPath,
        "primaryColor": dataArr[1],
        "secondaryColor": dataArr[2],
        "primaryWindowWidth": dataArr[3],
        "primaryWindowHeight": dataArr[4],
        "primaryWindowFullscreen": dataArr[5],
        "secondaryWindowWidth": dataArr[6],
        "secondaryWindowHeight": dataArr[7],
        "secondaryWindowFullscreen": dataArr[8],
        "icon": dataArr[9],
        "autosave": dataArr[16],
        "update": dataArr[10],
        "active": {
            "anime": dataArr[11],
            "book": dataArr[12],
            "film": dataArr[13],
            "manga": dataArr[14],
            "show": dataArr[15]
        }
    };
    // Read the settings tutorial.json file.
    fs.readFile(path.join(appDirectory, "Trak", "config", "tutorial.json"), "UTF8", (er, tutorialFile) => {
        // If there was an issue reading the tutorial.json file notify the user.
        if(er) {
            log.error("There was an issue in reading the tutorial configuration file. Error Type: " + er.name + ". Error Message: " + er.message + ".");
            evnt.sender.send("introductionFileReadFailure");
        }
        else {
            log.info("The tutorial configuration file has been successfully read.");
            // Define the tutorial boolean.
            const origIntro = JSON.parse(tutorialFile).introduction;
            // Write the tutorial.json file with the submitted data.
            fs.writeFile(path.join(appDirectory, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": dataArr[dataArr.length - 1] }), "UTF8", writeErr => {
                // If there was an issue writing the tutorial.json file notify the user.
                if(writeErr) {
                    log.error("There was an issue in updating the tutorial configuration file. Error Type: " + writeErr.name + ". Error Message: " + writeErr.message + ".");
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
                            log.error("There was an issue in reading the settings configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
                            evnt.sender.send("configurationFileOpeningFailure");
                        }
                        else {
                            log.info("The settings configuration file has been successfully read.");
                            // Define the settings configuration data.
                            const configurationData = JSON.parse(file);
                            if(dataArr[0] == "") { writeData.path = configurationData.original.path; }
                            // Delete the user records located in the previous location if requested.
                            ipc.on("dataOriginalDelete", (eve, resp) => {
                                // Only delete the previous user records if the user wants to.
                                if(resp[0] == true) {
                                    // Remove the directory and all content in it.
                                    fs.rm(configurationData.current.path, { "forced": true, "recursive": true}, rmErr => {
                                        // If there was an issue in removing the directory notify the user.
                                        if(rmErr) {
                                            log.error("There was an issue in deleting the original data associated to the records. Error Type: " + rmErr.name + ". Error Message: " + rmErr.message + ".");
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
                                            fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", wrErr => {
                                                // If there was an issue in writing the configuration.json notify the user.
                                                if(wrErr) {
                                                    log.error("There was an issue writing the configuration file associated to the application settings. Error Type: " + wrErr.name + ". Error Message: " + wrErr.message + ".");
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
                                    fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", errWrite => {
                                        // If there was an issue in writing the configuration.json notify the user.
                                        if(errWrite) {
                                            log.error("There was an issue writing the configuration file associated to the application settings. Error Type: " + errWrite.name + ". Error Message: " + errWrite.message + ".");
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
                                    && configurationData.original.secondaryWindowFullscreen == writeData.secondaryWindowFullscreen && configurationData.original.icon == writeData.icon && configurationData.original.autosave == writeData.autosave
                                    && exports.configRecordTypeCompare(configurationData.original, writeData) && configurationData.original.update == writeData.update && origIntro == dataArr[dataArr.length - 1]) {
                                    writeData.previousPrimaryColor = configurationData.original.primaryColor;
                                    writeData.previousSecondaryColor = configurationData.original.secondaryColor;
                                    configurationData.current = writeData;
                                    // Write the configuration.json file with the submitted data.
                                    fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", curErr => {
                                        // If there was an issue in writing the configuration.json notify the user.
                                        if(curErr) {
                                            log.error("There was an issue writing the configuration file associated to the application settings. Error Type: " + curErr.name + ". Error Message: " + curErr.message + ".");
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
                                    if(configurationData.original.path == writeData.path || writeData.path == "") {
                                        writeData.previousPrimaryColor = configurationData.original.primaryColor;
                                        writeData.previousSecondaryColor = configurationData.original.secondaryColor;
                                        configurationData.current = writeData;
                                        // Write the configuration.json file with the submitted data.
                                        fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", resErr => {
                                            // If there was an issue in writing the configuration.json notify the user.
                                            if(resErr) {
                                                log.error("There was an issue writing the configuration file associated to the application settings. Error Type: " + resErr.name + ". Error Message: " + resErr.message + ".");
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
                                        fs.copy(configurationData.current.path, path.join(writeData.path), cpErr => {
                                            if(cpErr) {
                                                log.error("There was an issue in copying the original data associated to the records. Error Type: " + cpErr.name + ". Error Message: " + cpErr.message + ".");
                                                evnt.sender.send("dataCopyFailure");
                                            }
                                            else {
                                                log.info("The user is being asked on whether they would like to delete the library records data in the previous save location.");
                                                evnt.sender.send("dataOriginalDeleteAsk", false);
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
                                    && configurationData.current.secondaryWindowFullscreen == writeData.secondaryWindowFullscreen && configurationData.current.icon == writeData.icon && configurationData.current.autosave == writeData.autosave
                                    && exports.configRecordTypeCompare(configurationData.current, writeData) && configurationData.current.update == writeData.update && origIntro == dataArr[dataArr.length - 1]) {
                                    writeData.previousPrimaryColor = configurationData.current.primaryColor;
                                    writeData.previousSecondaryColor = configurationData.current.secondaryColor;
                                    configurationData.current = writeData;
                                    // Write the configuration.json file with the submitted data.
                                    fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", ogErr => {
                                        // If there was an issue in writing the configuration.json notify the user.
                                        if(ogErr) {
                                            log.error("There was an issue writing the configuration file associated to the application settings. Error Type: " + ogErr.name + ". Error Message: " + ogErr.message + ".");
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
                                    if(configurationData.current.path == writeData.path || writeData.path != "") {
                                        writeData.previousPrimaryColor = configurationData.current.primaryColor;
                                        writeData.previousSecondaryColor = configurationData.current.secondaryColor;
                                        configurationData.current = writeData;
                                        // Write the configuration.json file with the submitted data.
                                        fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", configErr => {
                                            // If there was an issue in writing the configuration.json notify the user.
                                            if(configErr) {
                                                log.error("There was an issue writing the configuration file associated to the application settings. Error Type: " + configErr.name + ". Error Message: " + configErr.message + ".");
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
                                        fs.copy(configurationData.current.path, path.join(writeData.path), copyErr => {
                                            if(copyErr) {
                                                log.error("There was an issue in copying the original data associated to the records. Error Type: " + copyErr.name + ". Error Message: " + copyErr.message + ".");
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