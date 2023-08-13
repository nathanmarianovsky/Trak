/*

BASIC DETAILS: This file handles all reactions on the index.html page.

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



var toastParse = folder => {
    let hldr = folder.split("-")[0];
    return nameStr = hldr.toLowerCase() + " " + folder.substring(hldr.length + 1);
};



// Display a notification for the successful removal of multiple records.
ipcRenderer.once("recordsRemovalSuccess", (event, response) => {
    M.toast({"html": "The checked records have been removed.", "classes": "rounded"});
});



// Display a notification if there was an error in the removal of a record.
ipcRenderer.once("removalFailure", (event, response) => {
    M.toast({"html": "There was an error removing the record associated to the " + toastParse(response) + ".", "classes": "rounded"});
});



// Display a notification for the successful opening of a record's assets directory.
ipcRenderer.on("recordFilesSuccess", (event, response) => {
    M.toast({"html": "The directory containg all files associated to the " + toastParse(response) + " has been opened.", "classes": "rounded"});
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
    
    for(let n = 0; n < list.length; n++) {
        let tr = document.createElement("tr"),
            tdName = document.createElement("td"),
            tdNameDiv = document.createElement("div"),
            tdCategory = document.createElement("td"),
            tdCategoryDiv = document.createElement("div"),
            tdGenres = document.createElement("td"),
            tdGenresDiv = document.createElement("div"),
            tdFiles = document.createElement("td"),
            tdFilesDiv = document.createElement("div"),
            filesButton = document.createElement("button"),
            filesIcon = document.createElement("i"),
            checkLabel = document.createElement("label"),
            checkInput = document.createElement("input"),
            tdCheck = document.createElement("td"),
            recordData = JSON.parse(fs.readFileSync(path.join(localPath, "Trak", "data", list[n], "data.json")));
        tdNameDiv.textContent = recordData.name != "" ? recordData.name : recordData.jname;
        tdNameDiv.classList.add("recordsNameRowDiv");
        tdName.append(tdNameDiv);
        tdCategoryDiv.textContent = recordData.category;
        tdCategoryDiv.classList.add("recordsRowDiv");
        tdCategory.append(tdCategoryDiv);
        tdGenresDiv.textContent = "";
        tdGenresDiv.classList.add("recordsRowDiv");
        tdGenres.append(tdGenresDiv);
        filesButton.setAttribute("type", "submit");
        filesButton.setAttribute("id", "remove_-_" + list[n]);
        filesButton.classList.add("btn", "waves-effect", "waves-light", "func");
        filesIcon.classList.add("material-icons", "center");
        filesIcon.textContent = "folder_open";
        filesIcon.setAttribute("id", "removeIcon_-_" + list[n]);
        filesButton.append(filesIcon);
        tdFilesDiv.append(filesButton);
        tdFilesDiv.classList.add("recordButtonsRowDiv");
        tdFilesDiv.setAttribute("id", "filesDiv-" + list[n]);
        checkInput.setAttribute("type", "checkbox");
        checkInput.classList.add("filled-in", "recordsChecks");
        checkInput.setAttribute("id", "check_-_" + list[n]);
        checkLabel.append(checkInput);
        tdCheck.append(checkLabel);
        tdFiles.append(tdFilesDiv);
        tr.setAttribute("id", list[n]);
        tr.append(tdCheck, tdName, tdCategory, tdGenres, tdFiles);
        tableBody.append(tr);
        let difference = document.getElementById("tableDiv").offsetWidth - document.getElementById("tableDiv").clientWidth;
        document.getElementById("headersTable").style.width = "calc(95% - " + difference + "px)";
        checkInput.addEventListener("change", () => {
            let btn = document.getElementById("remove"),
                checkAllBtn = document.getElementById("checkAll"),
                checkArr = Array.from(document.querySelectorAll(".recordsChecks")),
                checkTotal = checkArr.length,
                checkedNum = checkArr.filter(elem => elem.checked).length;
            checkedNum > 0 ? btn.style.display = "inherit" : btn.style.display = "none";
            checkTotal - 1 == checkedNum && !checkAllBtn.checked ? checkAllBtn.checked = true : checkAllBtn.checked = false;
        });
        tdNameDiv.addEventListener("click", e => {
            e.preventDefault();
            ipcRenderer.send("updateRecord", e.target.parentNode.parentNode.id);
        });
        filesButton.addEventListener("click", e => {
            e.preventDefault();
            let holder = e.target.id.split("_-_");
            holder.shift();
            ipcRenderer.send("recordFiles", holder.join(""));
        });
    }
    // Initialize the menu tooltips.
    const elems = document.querySelectorAll(".tooltipped");
        instances = M.Tooltip.init(elems);
});