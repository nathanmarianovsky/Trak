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
    // Listen for a click event on the add button in order to open a window whose inputs will generate a new contact.
    add.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("addLoad");
    });
    // Listen for a click event on the remove button in order to open a confirmation window asking for the deletion of all checked contacts.
    remove.addEventListener("click", e => {
        e.preventDefault();
        const list = Array.from(document.querySelectorAll(".checks")).filter(elem => elem !== undefined && elem.checked).map(elem => elem.id.split("-")[1]);
        ipcRenderer.send("remove", document.getElementById("checkAll").checked ? list.slice(1) : list);
    });
    // Listen for a input change event on the search bar in order to filter the contacts table.
    searchBar.addEventListener("input", e => {
        // Define the collection of all contact rows and the current string being searched.
        const rowList = document.querySelectorAll("#tableBody tr"),
            curSearch = e.target.value.toLowerCase();
        // Iterate through all of the rows and check whether the contact name contains the desired search string.
        for(let i = 0; i < rowList.length; i++) {
            let rowDiv = rowList[i].children[1].children[0];
            // Show a row if it contains the desired string and hide it otherwise.
            !rowDiv.textContent.toLowerCase().includes(curSearch) ? rowList[i].style.display = "none" : rowList[i].style.display = "table-row";
        }
    });
    // Listen for a click event on the check all checkbox in order to check or uncheck all contact checkboxes.
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