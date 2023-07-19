/*

BASIC DETAILS: This file handles all buttons on the contacts.html page.

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
    const contactsAdd = document.getElementById("contactsAdd"),
        contactsRemove = document.getElementById("contactsRemove"),
        contactsSearchBar = document.getElementById("contactsSearchBar"),
        contactsCheckAll = document.getElementById("contactsCheckAll");
    // Listen for a click event on the add button in order to open a window whose inputs will generate a new contact.
    contactsAdd.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("contactsAddLoad");
    });
    // Listen for a click event on the remove button in order to open a confirmation window asking for the deletion of all checked contacts.
    contactsRemove.addEventListener("click", e => {
        e.preventDefault();
        const list = Array.from(document.querySelectorAll(".contactsChecks")).filter(elem => elem !== undefined && elem.checked).map(elem => elem.id.split("-")[1]);
        ipcRenderer.send("contactsRemove", document.getElementById("contactsCheckAll").checked ? list.slice(1) : list);
    });
    // Listen for a input change event on the search bar in order to filter the contacts table.
    contactsSearchBar.addEventListener("input", e => {
        // Define the collection of all contact rows and the current string being searched.
        const rowList = document.querySelectorAll("#contactsTableBody tr"),
            curSearch = e.target.value.toLowerCase();
        // Iterate through all of the rows and check whether the contact name contains the desired search string.
        for(let i = 0; i < rowList.length; i++) {
            let rowDiv = rowList[i].children[1].children[0];
            // Show a row if it contains the desired string and hide it otherwise.
            !rowDiv.textContent.toLowerCase().includes(curSearch) ? rowList[i].style.display = "none" : rowList[i].style.display = "table-row";
        }
    });
    // Listen for a click event on the check all checkbox in order to check or uncheck all contact checkboxes.
    contactsCheckAll.addEventListener("click", e => {
        const contactsBodyList = document.getElementById("contactsTableBody").children,
            btn = document.getElementById("contactsRemove");
        if(contactsCheckAll.checked) {
            for(let i = 0; i < contactsBodyList.length; i++) {
                contactsBodyList[i].children[0].children[0].children[0].checked = true;
            }
            if(contactsBodyList.length > 0) {
                btn.style.display = "inherit";
            }
        }
        else {
            for(let i = 0; i < contactsBodyList.length; i++) {
                contactsBodyList[i].children[0].children[0].children[0].checked = false;
            }
            btn.style.display = "none";
        }
    });
});