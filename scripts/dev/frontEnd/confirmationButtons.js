/*

BASIC DETAILS: This file adds the functionality for all submit buttons on the confirmation.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Define the submit button and a variable to hold the data associated to the removal of records.
    const submitButton = document.getElementById("confirmSubmit");
    let submissionData = 0;
    // Once the app has finished loading the confirmation window update the primary text.
    ipcRenderer.on("recordsConfirmationText", (event, data) => {
        document.getElementById("confirmationText").textContent = "Please verify that you indeed wish to remove all data associated to the checked records.";
        submissionData = data;
    });
    // Listen for a click event on the confirmation button in order to remove any number of records. 
    submitButton.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("confirmationRemoveRecords", submissionData);
    });
});