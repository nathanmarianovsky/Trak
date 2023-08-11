/*

BASIC DETAILS: This file handles all reactions on the addContact.html page.

   - driverPageFix: Modify the addContact page to be utilized for the addition of a contact.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.
    - fs and path provide the means to work with local files.
    - localPath is the path to the local user data.

*/
var { ipcRenderer } = require("electron");
const fs = require("fs"),
    path = require("path"),
    localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");



// /*

// Modify the addContact page to be utilized for the addition of a contact.

// */
// var driverPageFix = () => {
//     // Modify the page directions.
//     document.getElementsByClassName("formInfo")[0].textContent = "The first and last name are the only required fields to create a driver.";
//     // Define and modify all additional inputs to be added to the page.
//     const row = document.createElement("div"),
//         outerDiv1 = document.createElement("div"),
//         outerDiv2 = document.createElement("div"),
//         outerDiv3 = document.createElement("div"),
//         outerDiv4 = document.createElement("div"),
//         input1 = document.createElement("input"),
//         input2 = document.createElement("input"),
//         input3 = document.createElement("input"),
//         input4 = document.createElement("input"),
//         label1 = document.createElement("label"),
//         label2 = document.createElement("label"),
//         label3 = document.createElement("label"),
//         label4 = document.createElement("label");
//     row.classList.add("row");
//     outerDiv1.classList.add("input-field", "col", "s3");
//     outerDiv2.classList.add("input-field", "col", "s3");
//     outerDiv3.classList.add("input-field", "col", "s3");
//     outerDiv4.classList.add("input-field", "col", "s3");
//     input1.setAttribute("id", "MAVTDate");
//     input1.setAttribute("type", "date");
//     input1.classList.add("validate", "center");
//     input2.setAttribute("id", "CPRDate");
//     input2.setAttribute("type", "date");
//     input2.classList.add("validate", "center");
//     input3.setAttribute("id", "employmentDate");
//     input3.setAttribute("type", "date");
//     input3.classList.add("validate", "center");
//     input4.setAttribute("id", "terminationDate");
//     input4.setAttribute("type", "date");
//     input4.classList.add("validate", "center");
//     label1.setAttribute("for", "MAVTDate");
//     label1.textContent = "MAVT Date:";
//     label2.setAttribute("for", "CPRDate");
//     label2.textContent = "CPR Date:";
//     label3.setAttribute("for", "employmentDate");
//     label3.textContent = "Employment Date:";
//     label4.setAttribute("for", "terminationDate");
//     label4.textContent = "Termination Date:";
//     outerDiv1.append(input1, label1);
//     outerDiv2.append(input2, label2);
//     outerDiv3.append(input3, label3);
//     outerDiv4.append(input4, label4);
//     row.append(outerDiv1, outerDiv2, outerDiv3, outerDiv4);
//     const parentNode = document.getElementById("contactsForm");
//     parentNode.insertBefore(row, parentNode.children[1]);
//     const notes = document.getElementById("notes");
//     notes.parentNode.classList.remove("s9");
//     notes.parentNode.classList.add("s6");
//     const checkboxLabel = document.createElement("label"),
//         checkboxInput = document.createElement("input"),
//         checkboxSpan = document.createElement("span");
//     checkboxInput.setAttribute("id", "driverCheckbox");
//     checkboxInput.setAttribute("type", "checkbox");
//     checkboxInput.classList.add("filled-in");
//     checkboxSpan.setAttribute("id", "driverCheckboxSpan");
//     checkboxSpan.classList.add("checkboxText");
//     checkboxSpan.textContent = "Active Driver";
//     checkboxInput.checked = true;
//     checkboxLabel.append(checkboxInput, checkboxSpan);
//     notes.parentNode.parentNode.append(checkboxLabel);
// };



// // Display a notification whenever a contact already exists with a provided name.
// ipcRenderer.on("contactExists", (event, response) => {
//     M.toast({"html": "A contact with the name " + response + " already exists! You can remove or update this contact on a separate page.", "classes": "rounded"});
// });



// // Display a notification whenever a driver already exists with a provided name.
// ipcRenderer.on("contactExists", (event, response) => {
//     M.toast({"html": "A driver with the name " + response + " already exists! You can remove or update this driver on a separate page.", "classes": "rounded"});
// });



// // Display a notification if there was an issue in writing to the data file of a contact.
// ipcRenderer.on("addContactFailure", (event, response) => {
//     M.toast({"html": "There was an issue in writing the data file associated to the contact " + response + ".", "classes": "rounded"});
// });



// // Display a notification if there was an issue in writing to the data file of a driver.
// ipcRenderer.on("addDriverFailure", (event, response) => {
//     M.toast({"html": "There was an issue in writing the data file associated to the driver " + response + ".", "classes": "rounded"});
// });



// // Display a notification if there was an issue in writing to the data file of a contact.
// ipcRenderer.on("updateContactFailure", (event, response) => {
//     M.toast({"html": "There was an issue in updating the data file associated to the contact " + response + ".", "classes": "rounded"});
// });



// // Display a notification if there was an issue in writing to the data file of a driver.
// ipcRenderer.on("updateDriverFailure", (event, response) => {
//     M.toast({"html": "There was an issue in updating the data file associated to the driver " + response + ".", "classes": "rounded"});
// });



// // Display a notification if there was an error in copying over a specific file.
// ipcRenderer.on("copyFailure", (event, response) => {
//     M.toast({"html": "There was an error in copying over the file " + response + ".", "classes": "rounded"});
// });



// // Display a notification for the successful addition of a contact.
// ipcRenderer.on("addContactSuccess", (event, response) => {
//     M.toast({"html": "The contact associated to the name " + response + " has officially been created and saved. This window will now close!", "classes": "rounded"});
// });



// // Display a notification for the successful addition of a drver.
// ipcRenderer.on("addDriverSuccess", (event, response) => {
//     M.toast({"html": "The driver associated to the name " + response + " has officially been created and saved. This window will now close!", "classes": "rounded"});
// });



// // Display a notification for the successful update of a contact.
// ipcRenderer.on("updateContactSuccess", (event, response) => {
//     M.toast({"html": "The contact associated to the name " + response + " has officially been updated. This window will now close!", "classes": "rounded"});
// });



// // Display a notification for the successful update of a driver.
// ipcRenderer.on("updateDriverSuccess", (event, response) => {
//     M.toast({"html": "The driver associated to the name " + response + " has officially been updated. This window will now close!", "classes": "rounded"});
// });



// // Display a notification if there was an error in renaming a contact's directory.
// ipcRenderer.on("contactFolderRenameFailure", (event, response) => {
//     M.toast({"html": "There was an error in renaming the contact folder " + response[0] + " to " + response[1] + ".", "classes": "rounded"});
// });



// // Display a notification if there was an error in renaming a driver's directory.
// ipcRenderer.on("contactFolderRenameFailure", (event, response) => {
//     M.toast({"html": "There was an error in renaming the driver folder " + response[0] + " to " + response[1] + ".", "classes": "rounded"});
// });



// // Handle the load of contact information on the update page.
// ipcRenderer.on("contactUpdateInfo", (event, name) => {
//     // Attempt to read a contact's data file.
//     fs.readFile(path.join(localPath, "BatHaTransportationApps", "data", "contacts", name, "data.json"), (err, file) => {
//         // Display a notification if there was an error in reading the data file.
//         if(err) {
//             const nameArr = name.split("_");
//             M.toast({"html": "There was an error opening the data file associated to the contact with name " + nameArr[1] + " " + nameArr[0] + ".", "classes": "rounded"});
//         }
//         // If the file loaded without issues populate the page with a contact's information.
//         else {
//             const contactData = JSON.parse(file);
//             document.getElementById("firstName").value = contactData.firstName;
//             document.getElementById("firstName").parentNode.children[1].classList.add("active");
//             if(contactData.middleName != "") {
//                 document.getElementById("middleName").value = contactData.middleName;
//                 document.getElementById("middleName").parentNode.children[1].classList.add("active");
//             }
//             document.getElementById("lastName").value = contactData.lastName;
//             document.getElementById("lastName").parentNode.children[1].classList.add("active");
//             if(contactData.birthday != "") {
//                 document.getElementById("birthday").value = contactData.birthday;
//             }
//             if(contactData.notes != "") {
//                 document.getElementById("notes").value = contactData.notes;
//                 document.getElementById("notes").parentNode.children[1].classList.add("active");
//             }
//             for(let l = 0; l < contactData.phones.length; l++) {
//                 let outerDiv = document.createElement("div"),
//                     innerDiv1 = document.createElement("div"),
//                     innerDiv2 = document.createElement("div"),
//                     innerDiv3 = document.createElement("div"),
//                     input1 = document.createElement("input"),
//                     input2 = document.createElement("input"),
//                     btnDiv = document.createElement("div"),
//                     btn = document.createElement("button"),
//                     label1 = document.createElement("label"),
//                     label2 = document.createElement("label"),
//                     delIcon = document.createElement("icon");
//                 outerDiv.classList.add("row");
//                 outerDiv.setAttribute("id", "outerDiv-" + l);
//                 innerDiv1.classList.add("input-field", "col", "s6");
//                 innerDiv2.classList.add("input-field", "col", "s5");
//                 innerDiv3.classList.add("input-field", "col", "s1");
//                 input1.setAttribute("id", "phoneLabel_" + l);
//                 input1.setAttribute("type", "text");
//                 input1.setAttribute("data-length", "25");
//                 input1.classList.add("validate", "center", "characterCounter");
//                 input1.value = contactData.phones[l].label;
//                 input2.setAttribute("id", "phoneNumber_" + l);
//                 input2.setAttribute("type", "text");
//                 input2.setAttribute("data-length", "14");
//                 input2.classList.add("validate", "center", "characterCounter");
//                 input2.value = contactData.phones[l].number;
//                 btnDiv.classList.add("removePhoneButtonDiv");
//                 btn.setAttribute("type", "submit");
//                 btn.setAttribute("id", "remove-" + l);
//                 btn.classList.add("btn", "waves-effect", "waves-light", "removePhoneButton");
//                 label1.setAttribute("for", "phoneLabel_" + l);
//                 label1.textContent = "Phone # Label:";
//                 label1.classList.add("active");
//                 label2.setAttribute("for", "phoneNumber_" + l);
//                 label2.textContent = "Phone #:";
//                 label2.classList.add("active");
//                 delIcon.classList.add("material-icons", "center", "removePhoneIcon");
//                 delIcon.setAttribute("id", "removePhoneIcon-" + l);
//                 delIcon.textContent = "remove";
//                 innerDiv1.append(input1, label1);
//                 innerDiv2.append(input2, label2);
//                 btn.append(delIcon);
//                 btnDiv.append(btn);
//                 innerDiv3.append(btnDiv);
//                 outerDiv.append(innerDiv3, innerDiv1, innerDiv2);
//                 document.getElementById("contactsForm").append(outerDiv);
//                 btn.addEventListener("click", e => {
//                     e.preventDefault();
//                     let num = parseInt(e.target.id.split("-")[1]);
//                     document.getElementById("outerDiv-" + num).remove();
//                     num++;
//                     while(document.getElementById("outerDiv-" + num) != null) {
//                         let newNum = num - 1;
//                         document.getElementById("outerDiv-" + num).setAttribute("id", "outerDiv-" + newNum);
//                         document.getElementById("remove-" + num).setAttribute("id", "remove-" + newNum);
//                         document.getElementById("removePhoneIcon-" + num).setAttribute("id", "removePhoneIcon-" + newNum);
//                         document.getElementById("phoneNumber_" + num).nextElementSibling.setAttribute("for", "phoneNumber_" + newNum);
//                         document.getElementById("phoneNumber_" + num).setAttribute("id", "phoneNumber_" + newNum);
//                         document.getElementById("phoneLabel_" + num).nextElementSibling.setAttribute("for", "phoneLabel_" + newNum);
//                         document.getElementById("phoneLabel_" + num).setAttribute("id", "phoneLabel_" + newNum);
//                         num++;
//                     }
//                 });
//                 input2.addEventListener("keydown", event => {
//                     phoneNumberFormatter(input2);
//                 });
//             }
//             const oldInfo = document.createElement("div");
//             oldInfo.setAttribute("id", "infoDiv");
//             oldInfo.setAttribute("title", contactData.lastName + "_" + contactData.firstName);
//             oldInfo.style.display = "none";
//             document.body.append(oldInfo);
//             document.getElementById("pageTitle").textContent = "Update Contact";
//             document.title = "Update Contact";
//         }
//     });
// });



// // Changes the page to handle the addition of a new driver.
// ipcRenderer.on("driverAdd", event => {
//     document.title = "Add Driver";
//     document.getElementById("pageTitle").textContent = "Add Driver";
//     driverPageFix();
// });



// // Handle the load of driver information on the update page.
// ipcRenderer.on("driverUpdateInfo", (event, name) => {
//     driverPageFix();
//     // Attempt to read a driver's data file.
//     fs.readFile(path.join(localPath, "BatHaTransportationApps", "data", "drivers", name, "data.json"), (err, file) => {
//         // Display a notification if there was an error in reading the data file.
//         if(err) {
//             const nameArr = name.split("_");
//             M.toast({"html": "There was an error opening the data file associated to the driver with name " + nameArr[1] + " " + nameArr[0] + ".", "classes": "rounded"});
//         }
//         // If the file loaded without issues populate the page with a driver's information.
//         else {
//             const driverData = JSON.parse(file);
//             document.getElementById("firstName").value = driverData.firstName;
//             document.getElementById("firstName").parentNode.children[1].classList.add("active");
//             if(driverData.middleName != "") {
//                 document.getElementById("middleName").value = driverData.middleName;
//                 document.getElementById("middleName").parentNode.children[1].classList.add("active");
//             }
//             document.getElementById("lastName").value = driverData.lastName;
//             document.getElementById("lastName").parentNode.children[1].classList.add("active");
//             if(driverData.MAVTDate != "") {
//                 document.getElementById("MAVTDate").value = driverData.MAVTDate;
//             }
//             if(driverData.CPRDate != "") {
//                 document.getElementById("CPRDate").value = driverData.CPRDate;
//             }
//             if(driverData.employmentDate != "") {
//                 document.getElementById("employmentDate").value = driverData.employmentDate;
//             }
//             if(driverData.terminationDate != "") {
//                 document.getElementById("terminationDate").value = driverData.terminationDate;
//             }
//             if(driverData.birthday != "") {
//                 document.getElementById("birthday").value = driverData.birthday;
//             }
//             if(driverData.notes != "") {
//                 document.getElementById("notes").value = driverData.notes;
//                 document.getElementById("notes").parentNode.children[1].classList.add("active");
//             }
//             if(driverData.active == false) {
//                 document.getElementById("driverCheckbox").checked = false;
//             }
//             for(let l = 0; l < driverData.phones.length; l++) {
//                 let outerDiv = document.createElement("div"),
//                     innerDiv1 = document.createElement("div"),
//                     innerDiv2 = document.createElement("div"),
//                     innerDiv3 = document.createElement("div"),
//                     input1 = document.createElement("input"),
//                     input2 = document.createElement("input"),
//                     btnDiv = document.createElement("div"),
//                     btn = document.createElement("button"),
//                     label1 = document.createElement("label"),
//                     label2 = document.createElement("label"),
//                     delIcon = document.createElement("icon");
//                 outerDiv.classList.add("row");
//                 outerDiv.setAttribute("id", "outerDiv-" + l);
//                 innerDiv1.classList.add("input-field", "col", "s6");
//                 innerDiv2.classList.add("input-field", "col", "s5");
//                 innerDiv3.classList.add("input-field", "col", "s1");
//                 input1.setAttribute("id", "phoneLabel_" + l);
//                 input1.setAttribute("type", "text");
//                 input1.setAttribute("data-length", "25");
//                 input1.classList.add("validate", "center", "characterCounter");
//                 input1.value = driverData.phones[l].label;
//                 input2.setAttribute("id", "phoneNumber_" + l);
//                 input2.setAttribute("type", "text");
//                 input2.setAttribute("data-length", "14");
//                 input2.classList.add("validate", "center", "characterCounter");
//                 input2.value = driverData.phones[l].number;
//                 btnDiv.classList.add("removePhoneButtonDiv");
//                 btn.setAttribute("type", "submit");
//                 btn.setAttribute("id", "remove-" + l);
//                 btn.classList.add("btn", "waves-effect", "waves-light", "removePhoneButton");
//                 label1.setAttribute("for", "phoneLabel_" + l);
//                 label1.textContent = "Phone # Label:";
//                 label1.classList.add("active");
//                 label2.setAttribute("for", "phoneNumber_" + l);
//                 label2.textContent = "Phone #:";
//                 label2.classList.add("active");
//                 delIcon.classList.add("material-icons", "center", "removePhoneIcon");
//                 delIcon.setAttribute("id", "removePhoneIcon-" + l);
//                 delIcon.textContent = "remove";
//                 innerDiv1.append(input1, label1);
//                 innerDiv2.append(input2, label2);
//                 btn.append(delIcon);
//                 btnDiv.append(btn);
//                 innerDiv3.append(btnDiv);
//                 outerDiv.append(innerDiv3, innerDiv1, innerDiv2);
//                 document.getElementById("contactsForm").append(outerDiv);
//                 btn.addEventListener("click", e => {
//                     e.preventDefault();
//                     let num = parseInt(e.target.id.split("-")[1]);
//                     document.getElementById("outerDiv-" + num).remove();
//                     num++;
//                     while(document.getElementById("outerDiv-" + num) != null) {
//                         let newNum = num - 1;
//                         document.getElementById("outerDiv-" + num).setAttribute("id", "outerDiv-" + newNum);
//                         document.getElementById("remove-" + num).setAttribute("id", "remove-" + newNum);
//                         document.getElementById("removePhoneIcon-" + num).setAttribute("id", "removePhoneIcon-" + newNum);
//                         document.getElementById("phoneNumber_" + num).nextElementSibling.setAttribute("for", "phoneNumber_" + newNum);
//                         document.getElementById("phoneNumber_" + num).setAttribute("id", "phoneNumber_" + newNum);
//                         document.getElementById("phoneLabel_" + num).nextElementSibling.setAttribute("for", "phoneLabel_" + newNum);
//                         document.getElementById("phoneLabel_" + num).setAttribute("id", "phoneLabel_" + newNum);
//                         num++;
//                     }
//                 });
//                 input2.addEventListener("keydown", event => {
//                     phoneNumberFormatter(input2);
//                 });
//             }
//             const oldInfo = document.createElement("div");
//             oldInfo.setAttribute("id", "infoDiv");
//             oldInfo.setAttribute("title", driverData.lastName + "_" + driverData.firstName);
//             oldInfo.style.display = "none";
//             document.body.append(oldInfo);
//             document.getElementById("pageTitle").textContent = "Update Driver";
//             document.title = "Update Driver";
//         }
//     });
// });



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Initialize the select tags on the page.
    const elemsSelect = document.querySelectorAll("select"),
        instancesSelect = M.FormSelect.init(elemsSelect);
    // Initialize the floating action button on the page.
    const elemsFAB = document.querySelectorAll(".fixed-action-btn"),
        instancesFAB = M.FloatingActionButton.init(elemsFAB, { "hoverEnabled": false, "direction": "left" });
    // Initialize the menu tooltips.
    const elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
    // Initialize the modals.
    const elemsModal = document.querySelectorAll(".modal"),
        instancesModal = M.Modal.init(elemsModal);
    // Initialize the collapsible divs.
    const elemsCollapsible = document.querySelectorAll(".collapsible"),
        instancesCollapsible = M.Collapsible.init(elemsCollapsible);
    // Initialize the observer for the anime review.
    initAnimeReviewObserver();
});