/*

BASIC DETAILS: This file handles all buttons on the index.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Define the buttons for all actions.
    const add = document.getElementById("add"),
        remove = document.getElementById("remove"),
        searchBar = document.getElementById("searchBar"),
        checkAll = document.getElementById("checkAll");
    // Listen for a click event on the add button in order to open a window whose inputs will generate a new record.
    add.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("addLoad");
    });
    // Listen for a click event on the remove button in order to open a confirmation window asking for the deletion of all checked records.
    remove.addEventListener("click", e => {
        e.preventDefault();
        const list = Array.from(document.querySelectorAll(".recordsChecks")).filter(elem => elem !== undefined && elem.checked).map(elem => elem.id.split("_-_")[1]);
        ipcRenderer.send("removeRecords", document.getElementById("checkAll").checked ? list.slice(1) : list);
    });
    // Listen for an input change event on the search bar in order to filter the records table.
    searchBar.addEventListener("input", e => {
        // Define the collection of all record rows and the current string being searched.
        const rowList = document.querySelectorAll("#tableBody tr"),
            curSearch = e.target.value.toLowerCase();
        // Iterate through all of the rows and check whether the record name contains the desired search string.
        for(let i = 0; i < rowList.length; i++) {
            let rowDiv = rowList[i].children[1].children[0];
            // Show a row if it contains the desired string and hide it otherwise.
            !rowDiv.textContent.toLowerCase().includes(curSearch) ? rowList[i].style.display = "none" : rowList[i].style.display = "table-row";
        }
    });
    // Listen for a click event on the check all checkbox in order to check or uncheck all record checkboxes.
    checkAll.addEventListener("click", e => {
        const bodyList = document.getElementById("tableBody").children,
            btn = document.getElementById("remove");
        if(checkAll.checked) {
            for(let i = 0; i < bodyList.length; i++) {
                bodyList[i].children[0].children[0].children[0].checked = true;
            }
            if(bodyList.length > 0) {
                btn.style.display = "inherit";
            }
        }
        else {
            for(let i = 0; i < bodyList.length; i++) {
                bodyList[i].children[0].children[0].children[0].checked = false;
            }
            btn.style.display = "none";
        }
    });
});