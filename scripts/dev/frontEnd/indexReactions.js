/*

BASIC DETAILS: This file handles all reactions on the index page.

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



// Display a notification for the successful removal of an item.
ipcRenderer.once("removalSuccess", (event, response) => {
    M.toast({"html": "The record associated to " + response + " has been removed.", "classes": "rounded"});
});



// Display a notification for the successful removal of multiple items.
ipcRenderer.once("removalSuccessMultiple", (event, response) => {
    M.toast({"html": "The checked records have been removed.", "classes": "rounded"});
});



// Display a notification if there was an error in the removal of a contact.
ipcRenderer.once("removalFailure", (event, response) => {
    M.toast({"html": "There was an error removing the record associated to " + response + ".", "classes": "rounded"});
});



// Load all of the contacts as rows in the table once the page has loaded.
ipcRenderer.on("loadRows", event => {
    // Define the path for all items and get a list of all available records.
    const pathDir = path.join(localPath, "Trak", "data");
    let list = [];
    fs.existsSync(pathDir) ? list = fs.readdirSync(pathDir).filter(file => fs.statSync(path.join(pathDir, file)).isDirectory()) : list = [];
    // fs.existsSync(pathDir) ? list = JSON.parse(fs.readFileSync(pathDir)) : list = [];
    // Attach a row to the html table body for each contact.
    const tableBody = document.getElementById("tableBody");
    tableBody.textContent = "";
    document.getElementById("preloader").style.setProperty("display", "none", "important");
    // Hide the vertical scroll bar.
    document.body.style.overflowY = "hidden";
    // for(let n = 0; n < list.length; n++) {
    //     let tr = document.createElement("tr"),
    //     	tdName = document.createElement("td"),
    //     	tdNameDiv = document.createElement("div"),
    //     	tdUpdate = document.createElement("td"),
    //     	tdUpdateDiv = document.createElement("div"),
    //     	tdRemove = document.createElement("td"),
    //     	tdRemoveDiv = document.createElement("div"),
    //     	tdFiles = document.createElement("td"),
    //     	tdFilesDiv = document.createElement("div"),
    //     	updateButton = document.createElement("button"),
    //     	removeButton = document.createElement("button"),
    //     	filesButton = document.createElement("button"),
    //     	updateIcon = document.createElement("i"),
    //     	removeIcon = document.createElement("i"),
    //     	filesIcon = document.createElement("i"),
    //         checkLabel = document.createElement("label"),
    //         checkInput = document.createElement("input"),
    //         tdCheck = document.createElement("td"),
    //     	name = list[n].split("_"),
    //     	contactData = JSON.parse(fs.readFileSync(path.join(localPath, "BatHaTransportationApps", "data", "contacts", list[n], "data.json")));
    //     tdNameDiv.textContent = name[0] + ", " + name[1];
    //     tdNameDiv.classList.add("contactsNameRowDiv");
    //     if(contactData.phones.length > 0) {
	// 		let str = "";
	// 		for(let k = 0; k < contactData.phones.length; k++) {
	// 			str += "<div>" + contactData.phones[k].label + ": " + contactData.phones[k].number + "</div>";
	// 		}
	//         tdNameDiv.classList.add("tooltipped");
	//         tdNameDiv.setAttribute("data-position", "top");
	//         tdNameDiv.setAttribute("data-tooltip", str);
	// 	}
    //     tdName.append(tdNameDiv);
    //     updateButton.setAttribute("type", "submit");
    //     updateButton.setAttribute("id", "update-" + list[n]);
    //     updateButton.classList.add("btn", "waves-effect", "waves-light", "func");
    //     removeButton.setAttribute("type", "submit");
    //     removeButton.setAttribute("id", "remove-" + list[n]);
    //     removeButton.classList.add("btn", "waves-effect", "waves-light", "func");
    //     filesButton.setAttribute("type", "submit");
    //     filesButton.setAttribute("id", "remove-" + list[n]);
    //     filesButton.classList.add("btn", "waves-effect", "waves-light", "func");
    //     updateIcon.classList.add("material-icons", "center");
    //     updateIcon.textContent = "update";
    //     removeIcon.classList.add("material-icons", "center");
    //     removeIcon.textContent = "remove";
    //     filesIcon.classList.add("material-icons", "center");
    //     filesIcon.textContent = "folder_open";
    //     updateButton.append(updateIcon);
    //     removeButton.append(removeIcon);
    //     filesButton.append(filesIcon);
    //     tdUpdateDiv.append(updateButton);
    //     tdRemoveDiv.append(removeButton);
    //     tdFilesDiv.append(filesButton);
    //     tdUpdateDiv.classList.add("contactsButtonsRowDiv");
    //     tdUpdateDiv.setAttribute("id", "updateDiv-" + list[n]);
    //     tdRemoveDiv.classList.add("contactsButtonsRowDiv");
    //     tdRemoveDiv.setAttribute("id", "removeDiv-" + list[n]);
    //     tdFilesDiv.classList.add("contactsButtonsRowDiv");
    //     tdFilesDiv.setAttribute("id", "filesDiv-" + list[n]);
    //     checkInput.setAttribute("type", "checkbox");
    //     checkInput.classList.add("filled-in", "contactsChecks");
    //     checkInput.setAttribute("id", "check-" + list[n]);
    //     checkLabel.append(checkInput);
    //     tdCheck.append(checkLabel);
    //     tdUpdate.append(tdUpdateDiv);
    //     tdRemove.append(tdRemoveDiv);
    //     tdFiles.append(tdFilesDiv);
    //     tr.append(tdCheck, tdName, tdUpdate, tdRemove, tdFiles);
    //     contactsTableBody.append(tr);
    //     let difference = document.getElementById("contactsTableDiv").offsetWidth - document.getElementById("contactsTableDiv").clientWidth;
    //     document.getElementById("contactsHeadersTable").style.width = "calc(95% - " + difference + "px)";
    //     checkInput.addEventListener("change", () => {
    //         let btn = document.getElementById("contactsRemove");
    //         if(Array.from(document.querySelectorAll(".contactsChecks")).filter(elem => elem.checked).length > 0) {
    //             btn.style.display = "inherit";
    //         }
    //         else if(Array.from(document.querySelectorAll(".contactsChecks")).filter(elem => elem.checked).length == 0) {
    //             btn.style.display = "none";
    //         }
    //     });
    //     tdNameDiv.addEventListener("click", e => {
    //     	e.preventDefault();
    //     	ipcRenderer.send("contactCard", e.target.textContent.replace(", ", "_"));
    //     });
    //     updateButton.addEventListener("click", e => {
    //     	e.preventDefault();
    //     	ipcRenderer.send("contactUpdate", e.target.parentNode.id.split("-")[1]);
    //     });
    //     removeButton.addEventListener("click", e => {
    //     	e.preventDefault();
    //     	ipcRenderer.send("contactRemove", e.target.parentNode.id.split("-")[1]);
    //     });
    //     filesButton.addEventListener("click", e => {
    //     	e.preventDefault();
    //     	ipcRenderer.send("contactFiles", e.target.parentNode.id.split("-")[1]);
    //     });
    // }
    // Initialize the menu tooltips.
    const elems = document.querySelectorAll(".tooltipped");
        instances = M.Tooltip.init(elems);
});