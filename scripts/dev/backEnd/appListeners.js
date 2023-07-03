/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - formListeners: Handles all listeners for the forms portion of the app.
   - schedulerListeners: Handles all listeners for the scheduler portion of the app.
   - vehicleDetailsListeners: Handles all listeners for the vehicle details portion of the app.
   - fuelListeners: Handles all listeners for the fuel details portion of the app.
   - timesheetsListeners: Handles all listeners for the timesheets portion of the app.
   - contactsListeners: Handles all listeners for the contacts portion of the app.
   - addListeners: Driver function for adding all app listeners.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Handles all listeners for the forms portion of the app.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- mainWindow is an object referencing the primary window of the Electron app.
	- exec provides the means to open files and folders.
	- infoPath is the path to the local user data.

*/
exports.formListeners = (BrowserWindow, path, fs, exec, ipc, tools, mainWindow, infoPath) => {
	// Handle the load of the forms page.
  	ipc.on("formLoad", event => {
  		mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "forms", "menuAttachedForms.html"));
  	});

  	// Handle the load of the mileage adjustment log.
  	ipc.on("mileageFormLoad", event => {
  		// Create a new window and maximize it.
  		let mileageFormWindow = tools.createWindow("forms/mileageAdjustmentForm", BrowserWindow, path, 1200, 1000),
	  		mileageAdjustmentFormFunc = (event, response) => { require("./formsPDFGen").mileageAdjustmentFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		mileageFormWindow.maximize();
	  	ipc.on("mileageFormSubmission", mileageAdjustmentFormFunc);
	  	mileageFormWindow.on("closed", () => {
	  		ipc.removeListener("mileageFormSubmission", mileageAdjustmentFormFunc);
	  	});
  	});

  	// Handle the opening of an empty mileage adjustment log.
  	ipc.on("mileageFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyMileageAdjustmentLog.pdf"));
  	});

  	// Handle the opening of the mileageAdjustmentLog folder.
  	ipc.on("mileageFormFolder", event => {
  		// If the folder mileageAdjustmentLog does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "mileageAdjustmentLog"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "mileageAdjustmentLog"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "mileageAdjustmentLog"));
  	});

  	// Handle the load of the bad pickup form.
  	ipc.on("badPickupFormLoad", event => {
  		// Create a new window and maximize it.
  		let badPickupFormWindow = tools.createWindow("forms/badPickupForm", BrowserWindow, path, 1200, 1000),
	  		badPickupFormFunc = (event, response) => { require("./formsPDFGen").badPickupFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		badPickupFormWindow.maximize();
	  	ipc.on("badPickupFormSubmission", badPickupFormFunc);
	  	badPickupFormWindow.on("closed", () => {
	  		ipc.removeListener("badPickupFormSubmission", badPickupFormFunc);
	  	});
  	});

  	// Handle the opening of an empty bad pickup or address correction form.
  	ipc.on("badPickupFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyBadPickupOrAddressCorrectionForm.pdf"));
  	});

  	// Handle the opening of the badPickupOrAddressCorrectionsForm folder.
  	ipc.on("badPickupFormFolder", event => {
  		// If the folder badPickupOrAddressCorrectionsForm does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "badPickupOrAddressCorrectionsForm"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "badPickupOrAddressCorrectionsForm"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "badPickupOrAddressCorrectionsForm"));
  	});

  	// Handle the load of the resubmission/manual invoice.
  	ipc.on("resubmissionInvoiceLoad", event => {
  		// Create a new window and maximize it.
  		let resubmissionInvoiceWindow = tools.createWindow("forms/resubmissionInvoice", BrowserWindow, path, 1200, 1000),
	  		resubmissionInvoiceFunc = (event, response) => {
	  			require("./formsPDFGen").resubmissionInvoicePDFGen(response, event, infoPath, tools, fs, path, exec);
	  		};
		resubmissionInvoiceWindow.maximize();
	  	ipc.on("resubmissionInvoiceSubmission", resubmissionInvoiceFunc);
	  	resubmissionInvoiceWindow.on("closed", () => {
	  		ipc.removeListener("resubmissionInvoiceSubmission", resubmissionInvoiceFunc);
	  	});
  	});

  	// Handle the opening of an empty resubmission/manual invoice.
  	ipc.on("resubmissionInvoiceEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyResubmissionInvoice.pdf"));
  	});

  	// Handle the opening of the resubmissionInvoice folder.
  	ipc.on("resubmissionInvoiceFolder", event => {
  		// If the folder resubmissionInvoice does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "resubmissionInvoice"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "resubmissionInvoice"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "resubmissionInvoice"));
  	});

  	// Handle the load of the re-route form.
  	ipc.on("reRouteFormLoad", event => {
  		// Create a new window and maximize it.
  		let reRouteFormWindow = tools.createWindow("forms/reRouteForm", BrowserWindow, path, 1200, 1000),
	  		reRouteFormFunc = (event, response) => { require("./formsPDFGen").reRouteFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		reRouteFormWindow.maximize();
	  	ipc.on("reRouteFormSubmission", reRouteFormFunc);
	  	reRouteFormWindow.on("closed", () => {
	  		ipc.removeListener("reRouteFormSubmission", reRouteFormFunc);
	  	});
  	});

  	// Handle the opening of an empty re-route form.
  	ipc.on("reRouteFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyReRouteForm.pdf"));
  	});

  	// Handle the opening of the reRouteForm folder.
  	ipc.on("reRouteFormFolder", event => {
  		// If the folder reRouteForm does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "reRouteForm"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "reRouteForm"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "reRouteForm"));
  	});

  	// Handle the load of the daily trip log.
  	ipc.on("dailyTripFormLoad", event => {
  		// Create a new window and maximize it.
  		let dailyTripFormWindow = tools.createWindow("forms/dailyTripForm", BrowserWindow, path, 1200, 1000),
	  		dailyTripFormFunc = (event, response) => { require("./formsPDFGen").dailyTripFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		dailyTripFormWindow.maximize();
	  	ipc.on("dailyTripFormSubmission", dailyTripFormFunc);
	  	dailyTripFormWindow.on("closed", () => {
	  		ipc.removeListener("dailyTripFormSubmission", dailyTripFormFunc);
	  	});
  	});

  	// Handle the opening of an empty daily trip log.
  	ipc.on("dailyTripFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyDailyTripLog.pdf"));
  	});

  	// Handle the opening of the dailyTripLog folder.
  	ipc.on("dailyTripFormFolder", event => {
  		// If the folder dailyTripLog does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "dailyTripLog"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "dailyTripLog"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "dailyTripLog"));
  	});

  	// Handle the load of the accident/incident report.
  	ipc.on("accidentFormLoad", event => {
  		// Create a new window and maximize it.
  		let accidentFormWindow = tools.createWindow("forms/accidentForm", BrowserWindow, path, 1200, 1000),
	  		accidentFormFunc = (event, response) => { require("./formsPDFGen").accidentFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		accidentFormWindow.maximize();
	  	ipc.on("accidentFormSubmission", accidentFormFunc);
	  	accidentFormWindow.on("closed", () => {
	  		ipc.removeListener("accidentFormSubmission", accidentFormFunc);
	  	});
  	});

  	// Handle the opening of an empty accident/incident report.
  	ipc.on("accidentFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyAccidentIncidentReport.pdf"));
  	});

  	// Handle the opening of the accidentIncidentReport folder.
  	ipc.on("accidentFormFolder", event => {
  		// If the folder accidentIncidentReport does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "accidentIncidentReport"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "accidentIncidentReport"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "accidentIncidentReport"));
  	});

  	// Handle the load of the driver training verification form.
  	ipc.on("driverTrainingFormLoad", event => {
  		// Create a new window and maximize it.
  		let driverTrainingFormWindow = tools.createWindow("forms/driverTrainingForm", BrowserWindow, path, 1200, 1000),
	  		driverTrainingFormFunc = (event, response) => { require("./formsPDFGen").driverTrainingFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		driverTrainingFormWindow.maximize();
	  	ipc.on("driverTrainingFormSubmission", driverTrainingFormFunc);
	  	driverTrainingFormWindow.on("closed", () => {
	  		ipc.removeListener("driverTrainingFormSubmission", driverTrainingFormFunc);
	  	});
  	});

  	// Handle the opening of an empty driver training verification form.
  	ipc.on("driverTrainingFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyDriverTrainingVerificationForm.pdf"));
  	});

  	// Handle the opening of the driverTrainingVerificationForm folder.
  	ipc.on("driverTrainingFormFolder", event => {
  		// If the folder driverTrainingVerificationForm does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "driverTrainingVerificationForm"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "driverTrainingVerificationForm"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "driverTrainingVerificationForm"));
  	});

  	// Handle the load of the driver training verification form.
  	ipc.on("vehicleUpdateFormLoad", event => {
  		// Create a new window and maximize it.
  		let vehicleUpdateFormWindow = tools.createWindow("forms/vehicleUpdateForm", BrowserWindow, path, 1200, 1000),
	  		vehicleUpdateFormFunc = (event, response) => { require("./formsPDFGen").vehicleUpdateFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		vehicleUpdateFormWindow.maximize();
	  	ipc.on("vehicleUpdateFormSubmission", vehicleUpdateFormFunc);
	  	vehicleUpdateFormWindow.on("closed", () => {
	  		ipc.removeListener("vehicleUpdateFormSubmission", vehicleUpdateFormFunc);
	  	});
  	});

  	// Handle the opening of an empty driver training verification form.
  	ipc.on("vehicleUpdateFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyVehicleUpdateForm.pdf"));
  	});

  	// Handle the opening of the driverTrainingVerificationForm folder.
  	ipc.on("vehicleUpdateFormFolder", event => {
  		// If the folder vehicleUpdateForm does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "vehicleUpdateForm"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "vehicleUpdateForm"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "vehicleUpdateForm"));
  	});

  	// Handle the load of the driver/attendant update form.
  	ipc.on("driverAttendantUpdateFormLoad", event => {
  		// Create a new window and maximize it.
  		let driverAttendantUpdateFormWindow = tools.createWindow("forms/driverAttendantUpdateForm", BrowserWindow, path, 1200, 1000),
	  		driverAttendantUpdateFormFunc = (event, response) => { require("./formsPDFGen").driverAttendantUpdateFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		driverAttendantUpdateFormWindow.maximize();
	  	ipc.on("driverAttendantUpdateFormSubmission", driverAttendantUpdateFormFunc);
	  	driverAttendantUpdateFormWindow.on("closed", () => {
	  		ipc.removeListener("driverAttendantUpdateFormSubmission", driverAttendantUpdateFormFunc);
	  	});
  	});

  	// Handle the opening of an empty driver/attendant update form.
  	ipc.on("driverAttendantUpdateFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyDriverAttendantUpdateForm.pdf"));
  	});

  	// Handle the opening of the driverAttendantUpdateForm folder.
  	ipc.on("driverAttendantUpdateFormFolder", event => {
  		// If the folder driverAttendantUpdateForm does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "driverAttendantUpdateForm"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "driverAttendantUpdateForm"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "driverAttendantUpdateForm"));
  	});

  	// Handle the load of the fingerprint form.
  	ipc.on("fingerprintFormLoad", event => {
  		// Create a new window and maximize it.
  		let fingerprintFormWindow = tools.createWindow("forms/fingerprintForm", BrowserWindow, path, 1200, 1000),
	  		fingerprintFormFunc = (event, response) => { require("./formsPDFGen").fingerprintFormPDFGen(response, event, infoPath, tools, fs, path, exec); };
		fingerprintFormWindow.maximize();
	  	ipc.on("fingerprintFormSubmission", fingerprintFormFunc);
	  	fingerprintFormWindow.on("closed", () => {
	  		ipc.removeListener("fingerprintFormSubmission", fingerprintFormFunc);
	  	});
  	});

  	// Handle the opening of an empty fingerprint form.
  	ipc.on("fingerprintFormEmpty", event => {
  		exec(tools.startCommandLineFile() + " " + path.join(__dirname, "../../../emptyForms", "emptyFingerprintForm.pdf"));
  	});

  	// Handle the opening of the fingerprintForm folder.
  	ipc.on("fingerprintFormFolder", event => {
  		// If the folder fingerprintForm does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "fingerprintForm"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "forms", "fingerprintForm"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "forms", "fingerprintForm"));
  	});
};



/*

Handles all listeners for the scheduler portion of the app.

	- ipc provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- infoPath is the path to the local user data.

*/
exports.schedulerListeners = (path, fs, exec, ipc, tools, mainWindow, infoPath) => {
	// Handles the load of the scheduler app.
  	ipc.on("scheduleLoad", event => {
  		mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "scheduler", "menuAttachedScheduler.html"));
  	});

  	// Handles the opening of the csvFiles folder.
  	ipc.on("csvFilesFolderOpen", event => {
  		// If the corresponding folder for the csv files does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "scheduler", "csvFiles"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "scheduler", "csvFiles"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + '"' + path.join(infoPath, "BatHaTransportationApps", "data", "scheduler", "csvFiles") + '"');
  	});

  	// Handles the opening of the pdfFiles folder.
  	ipc.on("pdfFilesFolderOpen", event => {
  		// If the corresponding folder for the csv files does not exist, then create it.
		if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "scheduler", "pdfFiles"))) {
			fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "scheduler", "pdfFiles"), { "recursive": true });
		}
  		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "scheduler", "pdfFiles"));
  	});

  	// Loads the generation of a single pdf once a submission on the scheduler app has been made. 
	ipc.on("schedulerPDF", (event, data) => {
		require("./schedulerPDFGen").pdfGenerator(data, event, "F", infoPath, tools, fs, path, exec);
	});

	// Loads the generation of multiple pdf once a submission on the scheduler app has been made. 
	ipc.on("multipleSchedulerPDF", (event, data) => {
		require("./schedulerPDFGen").pdfGeneratorDriver(data, event, "F", infoPath, tools, fs, path, exec);
	});
};



/*

Handles all listeners for the vehicle details portion of the app.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path provides the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- infoPath is the path to the local user data.

*/
exports.vehicleDetailsListeners = (BrowserWindow, path, fs, exec, ipc, tools, mainWindow, infoPath) => {
	// Handles the load of the vehicle details app.
  	ipc.on("vehicleDetailsLoad", event => {
  		mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "vehicleDetails", "menuAttachedVehicleDetails.html"));
  		mainWindow.webContents.on("did-finish-load", () => {
  			mainWindow.webContents.send("vehicleDetailsLoadOptions");
  		});
  	});

  	// Handles the addition of a vehicle.
	ipc.on("addVehicle", event => {
		let addVehicleWindow = tools.createWindow("vehicleDetails/addVehicle", BrowserWindow, path, 1200, 1000);
		addVehicleWindow.maximize();
		ipc.once("addVehicleSubmission", (event, data) => {
			require("./modifyVehicle").addVehicle(data, event, BrowserWindow.getFocusedWindow(), infoPath, tools, fs, path);
			mainWindow.reload();
		});
	});

	// Handles the update of a vehicle.
	ipc.on("updateVehicle", (event, data) => {
		let updateVehicleWindow = tools.createWindow("vehicleDetails/addVehicle", BrowserWindow, path, 1200, 1000);
		updateVehicleWindow.maximize();
		updateVehicleWindow.webContents.on("did-finish-load", () => {
			updateVehicleWindow.webContents.send("updateVehicleLoad", data);
			ipc.once("addVehicleSubmission", (event, data) => {
				require("./modifyVehicle").updateVehicle(data, event, BrowserWindow.getFocusedWindow(), infoPath, tools, fs, path);
				mainWindow.reload();
			});
		});
	});

	// Handles the removal of a vehicle.
	ipc.on("removeVehicle", (event, data) => {
		require("./modifyVehicle").removeVehicle(data, event, mainWindow, BrowserWindow, ipc, infoPath, tools, fs, path);
	});

	// Handles the opening of a vehicle's assets folder.
	ipc.on("vehicleFiles", (event, data) => {
		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "vehicles", data, "assets"));
		event.sender.send("vehicleFilesSuccess", data);
	});

	// Handles the generation of a pdf once a submission on the vehicle details app has been made.
	ipc.on("vehicleReport", (event, data) => {
		require("./vehicleDetailsPDFGen").pdfGenerator(data, event, infoPath, tools, fs, path, exec);
	});

	// Handles the update of all vehicles.
	ipc.on("updateAllVehicles", event => {
		let updateAllVehiclesWindow = tools.createWindow("vehicleDetails/updateVehicles", BrowserWindow, path, 1200, 1000);
		updateAllVehiclesWindow.maximize();
		updateAllVehiclesWindow.webContents.on("did-finish-load", () => {
			updateAllVehiclesWindow.webContents.send("updateAllVehiclesLoad");
			ipc.once("updateAllVehiclesSubmission", (event, data) => {
				require("./modifyVehicle").updateAllVehicles(data, event, BrowserWindow.getFocusedWindow(), infoPath, tools, fs, path);
				mainWindow.reload();
			});
		});
	});

	// Handles the generation of the vehicles form.
  	ipc.on("vehicleForm", event => {
  		let vehicleFormWindow = tools.createWindow("vehicleDetails/vehicleFormSelection", BrowserWindow, path, 900, 500);
  		vehicleFormWindow.webContents.on("did-finish-load", () => {
  			vehicleFormWindow.webContents.send("vehicleFormLoad");
  			ipc.once("vehicleFormGen", (event, data) => {
  				require("./vehicleFormPDFGen").pdfGenerator(data, event, vehicleFormWindow, infoPath, tools, fs, path, exec);
  				mainWindow.reload();
  			});
  		});
  	});
};



/*

Handles all listeners for the fuel details portion of the app.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- infoPath is the path to the local user data.

*/
exports.fuelListeners = (BrowserWindow, path, fs, exec, ipc, tools, mainWindow, infoPath) => {
	// Handles the load of the fuel details app.
  	ipc.on("fuelLoad", event => {
  		mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "fuelDetails", "menuAttachedFuelDetails.html"));
  		mainWindow.webContents.on("did-finish-load", () => {
			mainWindow.webContents.send("fuelLoadOptions");
		});
  	});

	// Handles the update of fuel records.
	ipc.on("updateFuel", (event, data) => {
		let updateFuelWindow = tools.createWindow("fuelDetails/updateFuel", BrowserWindow, path, 1200, 1000);
		updateFuelWindow.maximize();
		updateFuelWindow.webContents.on("did-finish-load", () => {
			updateFuelWindow.webContents.send("updateFuelLoad", data);
			ipc.once("updateFuelSubmission", (event, data) => {
				require("./fuelRecords").updateFuel(data, event, updateFuelWindow, infoPath, tools, fs, path);
				mainWindow.reload();
			});
		});
	});

	// Handles the generation of a monthly report.
	ipc.on("monthlyReport", (event, data) => {
		require("./fuelRecords").monthlyReport(data, event, infoPath, tools, fs, path, exec);
	});

	// Handles the load of the plot of all vehicle sums.
	ipc.on("sumPlot", (event, data) => {
		let sumPlotWindow = tools.createWindow("fuelDetails/plots", BrowserWindow, path, 1100, 900, false);
		sumPlotWindow.webContents.on("did-finish-load", () => {
			sumPlotWindow.webContents.send("sumPlotLoad", data);
		});
	});

	// Handles the load of the plot of the overall total sum.
	ipc.on("sumTotalPlot", (event, data) => {
		let sumTotalPlotWindow = tools.createWindow("fuelDetails/plots", BrowserWindow, path, 1100, 900, false);
		sumTotalPlotWindow.webContents.on("did-finish-load", () => {
			sumTotalPlotWindow.webContents.send("sumTotalPlotLoad", data);
		});
	});

	// Handles the load of the plot of all vehicle mileage traveled.
	ipc.on("mileagePlot", (event, data) => {
		let mileagePlotWindow = tools.createWindow("fuelDetails/plots", BrowserWindow, path, 1100, 900, false);
		mileagePlotWindow.webContents.on("did-finish-load", () => {
			mileagePlotWindow.webContents.send("mileagePlotLoad", data);
		});
	});

	// Handles the load of the plot of all vehicle rates.
	ipc.on("ratePlot", (event, data) => {
		let ratePlotWindow = tools.createWindow("fuelDetails/plots", BrowserWindow, path, 1100, 900, false);
		ratePlotWindow.webContents.on("did-finish-load", () => {
			ratePlotWindow.webContents.send("ratePlotLoad", data);
		});
	});
};



/*

Handles all listeners for the timesheets portion of the app.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- infoPath is the path to the local user data.

*/
exports.timesheetsListeners = (BrowserWindow, path, fs, exec, ipc, tools, mainWindow, infoPath) => {
	// Handles the load of the fuel details app.
  	ipc.on("timesheetsLoad", event => {
  		// Define the default loading behavior absent the need for a seed.
  		let defLoad = seedInfo => {
  			// If the drivers folder does not exist, then create it.
			if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "drivers"))) {
				fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "drivers"), { "recursive": true });
			}
			require("./modifyTimesheets").seedInitialization(JSON.parse(fs.readFileSync(path.join(infoPath, "BatHaTransportationApps", "data", "timesheets", "seed.json"))).value, infoPath, fs, path, () => {
  				mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "timesheets", "menuAttachedTimesheets.html"));
				mainWindow.webContents.on("did-finish-load", () => {
					mainWindow.webContents.send("timesheetsLoadOptions");
					if(seedInfo == true) { mainWindow.webContents.send("seedInfo"); }
				});	
			});
  		};
  		// If the seed exists then load the default timesheets page, otherwise load the seed initialization page.
  		if(fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "timesheets", "seed.json"))) { defLoad(false); }
  		else {
  			// Load the seed initialization page.
  			mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "timesheets", "menuAttachedTimesheetsSeed.html"));
  			// Wait for a seed to be submitted.
	  		ipc.once("timesheetsSeedSubmission", (event, date) => {
	  			// Create the records folder inside of the timesheets folder if necessary.
	  			if(!fs.existsSync(path.join(infoPath, "BatHaTransportationApps", "data", "timesheets", "records"))) {
	  				fs.mkdirSync(path.join(infoPath, "BatHaTransportationApps", "data", "timesheets", "records"), { "recursive": true });
	  			}
	  			// Write the seed file.
	  			fs.writeFileSync(path.join(infoPath, "BatHaTransportationApps", "data", "timesheets", "seed.json"), JSON.stringify({"value": date}), "UTF8");
	  			// Perform the seed initialization which will create directories associated to the pay periods from the seed until the current date.
	  			require("./modifyTimesheets").seedInitialization(date, infoPath, fs, path, () => {});
	  			// Once a seed has been provided load the default page and notify the user that the seed has been permanently saved.
	  			defLoad(true);
	  		});
  		}
  	});

	// Handles the load of the driver add page.
  	ipc.on("addDriver", event => {
  		let driverAddWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
  		driverAddWindow.webContents.on("did-finish-load", () => {
  			driverAddWindow.webContents.send("driverAdd");
  			ipc.once("addDriverSubmission", (event, data) => {
  				require("./modifyDriver").addDriver(data, event, driverAddWindow, infoPath, fs, path);
  				mainWindow.reload();
  			});
  		});
  	});

  	// Handles the update of a driver.
  	ipc.on("updateDriver", (event, name) => {
  		let driverUpdateWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
  		driverUpdateWindow.webContents.on("did-finish-load", () => {
  			driverUpdateWindow.webContents.send("driverUpdateInfo", name);
  			ipc.once("updateDriverSubmission", (event, data) => {
  				require("./modifyDriver").updateDriver(data, event, driverUpdateWindow, infoPath, fs, path);
  				mainWindow.reload();
  			});
  		});
  	});

  	// Handles the deletion of a driver.
  	ipc.on("removeDriver", (event, name) => {
  		require("./modifyDriver").removeDriver(name, event, mainWindow, BrowserWindow, ipc, infoPath, tools, fs, path);
  	});

  	// Handles the opening of a driver's assets folder.
	ipc.on("driverFiles", (event, name) => {
		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "drivers", name, "assets"));
		event.sender.send("driverFilesSuccess", name.split("_")[1] + " " + name.split("_")[0]);
	});

	// Handles the load of the timesheets update page.
  	ipc.on("timesheetsUpdate", (event, arr) => {
  		let timesheetsUpdateWindow = tools.createWindow("timesheets/timesheetsPayPeriod", BrowserWindow, path, 1200, 900);
  		timesheetsUpdateWindow.maximize();
  		timesheetsUpdateWindow.webContents.on("did-finish-load", () => {
  			timesheetsUpdateWindow.webContents.send("timesheetsPayPeriodLoad", arr);
  			ipc.once("timesheetsSave", (event, data) => {
  				require("./modifyTimesheets").saveTimesheets(data, event, BrowserWindow.getFocusedWindow(), infoPath, fs, path);
  			});
  		});
  	});

  	// Handles the generation of the timesheets report.
  	ipc.on("timesheetsReport", (event, arr) => {
  		let timesheetsReportWindow = tools.createWindow("timesheets/timesheetsReportSelection", BrowserWindow, path, 900, 500);
  		timesheetsReportWindow.webContents.on("did-finish-load", () => {
  			timesheetsReportWindow.webContents.send("timesheetsPayPeriodLoad", arr);
  			ipc.once("timesheetsReportGen", (event, data) => {
  				require("./modifyTimesheets").timesheetsPDFGen(data, event, timesheetsReportWindow, infoPath, tools, fs, path, exec);
  				mainWindow.reload();
  			});
  		});
  	});
};



/*

Handles all listeners for the contacts portion of the app.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- infoPath is the path to the local user data.

*/
exports.contactsListeners = (BrowserWindow, path, fs, exec, ipc, tools, mainWindow, infoPath) => {
	// Handles the load of the contacts app.
  	ipc.on("contactsLoad", event => {
  		mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "contacts", "menuAttachedContacts.html"));
  		mainWindow.webContents.on("did-finish-load", () => {
  			mainWindow.webContents.send("contactsLoadRows");
  		});
  	});

  	// Handles the load of the contacts add page.
  	ipc.on("contactsAddLoad", event => {
  		let contactsAddWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
  		contactsAddWindow.webContents.on("did-finish-load", () => {
  			ipc.once("addContactSubmission", (event, data) => {
  				require("./modifyContact").addContact(data, event, contactsAddWindow, infoPath, fs, path);
  				mainWindow.reload();
  			});
  		});
  	});

  	// Handles the load of a contact card.
  	ipc.on("contactCard", (event, name) => {
  		let contactCardWindow = tools.createWindow("contacts/contactCard", BrowserWindow, path, 800, 600);
  		contactCardWindow.webContents.once("did-finish-load", () => {
  			contactCardWindow.webContents.send("contactCardInfo", name);
  		});
  	});

  	// Handles the load of a contact card's trip dates.
	ipc.on("contactTripDates", (event, info) => {
	    require("./contactTrips").fileCheckIterate(infoPath, info, BrowserWindow.getFocusedWindow(), fs, path);
	});

  	// Handles the update of a contact.
  	ipc.on("contactUpdate", (event, name) => {
  		let contactUpdateWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
  		contactUpdateWindow.webContents.on("did-finish-load", () => {
  			contactUpdateWindow.webContents.send("contactUpdateInfo", name);
  			ipc.once("updateContactSubmission", (event, data) => {
  				require("./modifyContact").updateContact(data, event, contactUpdateWindow, infoPath, fs, path);
  				mainWindow.reload();
  			});
  		});
  	});

  	// Handles the deletion of a contact.
  	ipc.on("contactRemove", (event, name) => {
  		require("./modifyContact").removeContact(name, event, mainWindow, BrowserWindow, ipc, infoPath, tools, fs, path);
  	});

  	// Handles the deletion of multiple contacts.
  	ipc.on("contactsRemove", (event, list) => {
  		require("./modifyContact").removeContacts(list, event, mainWindow, BrowserWindow, ipc, infoPath, tools, fs, path);
  	});

  	// Handles the opening of a contact's assets folder.
	ipc.on("contactFiles", (event, name) => {
		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "contacts", name, "assets"));
		event.sender.send("contactFilesSuccess", name.split("_")[1] + " " + name.split("_")[0]);
	});
};



/*

Driver function for adding all app listeners.

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the path to the local user data.

*/
exports.addListeners = (app, BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath) => {
	// Loads the creation of a primary window upon the activation of the app.
  	app.on("activate", () => {
    	if(BrowserWindow.getAllWindows().length === 0) {
      		tools.createWindow("index", BrowserWindow, path);
    	}
  	});

  	// Close the Electron app if the primary window is closed.
  	mainWindow.on("close", () => {
    	mainWindow = null;
       	app.quit();
    });

  	// Handle the load of the home page.
  	ipc.on("homeLoad", event => {
  		mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "index.html"));
  	});

	// If the data folder does not exist, then create it.
	if(!fs.existsSync(path.join(dataPath, "BatHaTransportationApps", "data"))) {
		fs.mkdirSync(path.join(dataPath, "BatHaTransportationApps", "data"), { "recursive": true });
	}

  	// Add listeners for all available apps.
  	exports.formListeners(BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath);
  	exports.schedulerListeners(path, fs, exec, ipc, tools, mainWindow, dataPath);
  	exports.vehicleDetailsListeners(BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath);
  	exports.fuelListeners(BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath);
  	exports.timesheetsListeners(BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath);
  	exports.contactsListeners(BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath);
};



module.exports = exports;