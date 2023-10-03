/*

BASIC DETAILS: This file handles all buttons on the index.html page.

   - cleanFilter: Remove all active filters.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Remove all active filters.

   - bodyElem is the table body associated to the page records.

*/
var cleanFilter = bodyElem => {
    // Define the category and genre arrays along with the record rows.
    const pageTable = Array.from(bodyElem.children);
    // Iterate through the records rows.
    for(let x = 0; x < pageTable.length; x++) {
        // Show all record rows.
        pageTable[x].style.display = "table-row";
    }
    // Upon the submission of a filter clear the search bar.
    searchBar.parentNode.children[0].classList.remove("active");
    searchBar.parentNode.children[2].classList.remove("active");
    searchBar.classList.remove("valid");
    searchBar.value = "";
    // Clear the filter modal checkboxes.
    Array.from(document.getElementsByClassName("filterCheckbox")).forEach(elem => elem.checked = false);
};



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Define the buttons for all actions.
    const add = document.getElementById("add"),
        remove = document.getElementById("removeConfirm"),
        searchBar = document.getElementById("searchBar"),
        checkAll = document.getElementById("checkAll"),
        nameSort = document.getElementById("nameSort"),
        categorySort = document.getElementById("categorySort"),
        ratingSort = document.getElementById("ratingSort"),
        clearFilter = document.getElementById("clearFilter"),
        filterModalClear = document.getElementById("filterModalClear"),
        databaseCheckLabel = document.getElementById("databaseCheckLabel"),
        databaseExport = document.getElementById("databaseExport"),
        databaseImport = document.getElementById("databaseImport"),
        databaseExportBtn = document.getElementById("databaseExportBtn"),
        databaseImportBtn = document.getElementById("databaseImportBtn"),
        importOverideBtn = document.getElementById("importOverideBtn"),
        typeSwitch = document.getElementById("databaseSwitch"),
        XLSXTypeSwitch = document.getElementById("XLSXTypeSwitch"),
        importSampleZIP = document.getElementById("importSampleZIP"),
        importSampleSimpleXLSX = document.getElementById("importSampleSimpleXLSX"),
        importSampleDetailedXLSX = document.getElementById("importSampleDetailedXLSX");
    // Define all page components which will be utilized.
    const tableBody = document.getElementById("tableBody"),
        XLSXTypeSwitchDiv = document.getElementById("XLSXTypeSwitchDiv"),
        importXLSXContentSimple = document.getElementById("importXLSXContentSimple"),
        importXLSXContentDetailed = document.getElementById("importXLSXContentDetailed"),
        databaseExportContainer = document.getElementById("databaseExportContainer"),
        databaseImportContainer = document.getElementById("databaseImportContainer");
    // Listen for a click event on the add button in order to open a window whose inputs will generate a new record.
    add.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("addLoad", false);
    });
    // Listen for a click event on the remove button in order to open a confirmation window asking for the deletion of all checked records.
    remove.addEventListener("click", e => {
        const list = Array.from(document.querySelectorAll(".recordsChecks")).filter(elem => elem !== undefined && elem.checked).map(elem => elem.id.split("_-_")[1]);
        ipcRenderer.send("removeRecords", checkAll.checked ? list.slice(1) : list);
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
        // Define the collection of all record rows and the remove button.
        const bodyList = tableBody.children,
            btn = document.getElementById("remove");
        // If the checkAll is checked then check all records.
        if(checkAll.checked) {
            for(let i = 0; i < bodyList.length; i++) {
                bodyList[i].children[0].children[0].children[0].checked = true;
            }
            if(bodyList.length > 0) {
                btn.style.display = "inherit";
            }
        }
        // Otherwise, if the checkAll is unchecked then uncheck all records.
        else {
            for(let i = 0; i < bodyList.length; i++) {
                bodyList[i].children[0].children[0].children[0].checked = false;
            }
            btn.style.display = "none";
        }
    });
    // Listen for a click event on the name sorter to reorder the records.
    nameSort.addEventListener("click", e => {
        e.preventDefault();
        // Define the collection of all record rows and associated table body.
        const assortmentTable = tableBody;
        let assortment = Array.from(assortmentTable.children);
        // Sort the records only if at least two records exist.
        if(assortment.length > 1) {
            // Sort in alphabetical order from top to bottom based on the record name.
            if(e.target.textContent == "expand_less") {
                assortment.sort((lhs, rhs) => {
                    let lhsVal = lhs.id.substring(lhs.id.indexOf("-")),
                        rhsVal = rhs.id.substring(rhs.id.indexOf("-"));
                    return rhsVal.localeCompare(lhsVal);
                });
                e.target.textContent = "expand_more";
            }
            // Sort in alphabetical order from bottom to top based on the record name.
            else if(e.target.textContent == "expand_more") {
                assortment.sort((lhs, rhs) => {
                    let lhsVal = lhs.id.substring(lhs.id.indexOf("-")),
                        rhsVal = rhs.id.substring(rhs.id.indexOf("-"));
                    return lhsVal.localeCompare(rhsVal);
                });
                e.target.textContent = "expand_less";
            }
            // Clear the table and refill it with the ordered records.
            assortmentTable.innerHTML = "";
            for(let z = 0; z < assortment.length; z++) {
                assortmentTable.append(assortment[z]);
            }
        }
    });
    // Listen for a click event on the category sorter to reorder the records.
    categorySort.addEventListener("click", e => {
        e.preventDefault();
        // Define the collection of all record rows and associated table body.
        const assortmentTable = tableBody;
        let assortment = Array.from(assortmentTable.children);
        // Sort the records only if at least two records exist.
        if(assortment.length > 1) {
            // Sort in alphabetical order from top to bottom based on the record category.
            if(e.target.textContent == "expand_less") {
                assortment.sort((lhs, rhs) => {
                    let lhsVal = lhs.getAttribute("category"),
                        rhsVal = rhs.getAttribute("category");
                    return rhsVal.localeCompare(lhsVal);
                });
                e.target.textContent = "expand_more";
            }
            // Sort in alphabetical order from bottom to top based on the record category.
            else if(e.target.textContent == "expand_more") {
                assortment.sort((lhs, rhs) => {
                    let lhsVal = lhs.getAttribute("category"),
                        rhsVal = rhs.getAttribute("category");
                    return lhsVal.localeCompare(rhsVal);
                });
                e.target.textContent = "expand_less";
            }
            // Clear the table and refill it with the ordered records.
            assortmentTable.innerHTML = "";
            for(let z = 0; z < assortment.length; z++) {
                assortmentTable.append(assortment[z]);
            }
        }
    });
    // Listen for a click event on the rating sorter to reorder the records.
    ratingSort.addEventListener("click", e => {
        e.preventDefault();
        // Define the collection of all record rows and associated table body.
        const assortmentTable = tableBody;
        let assortment = Array.from(assortmentTable.children);
        // Sort the records only if at least two records exist.
        if(assortment.length > 0) {
            // Sort in alphabetical order from top to bottom based on the record rating.
            if(e.target.textContent == "expand_less") {
                assortment.sort((lhs, rhs) => {
                    let lhsVal = lhs.children[3].children[0].textContent != "" ? parseFloat(lhs.children[3].children[0].textContent) : -1,
                        rhsVal = rhs.children[3].children[0].textContent != "" ? parseFloat(rhs.children[3].children[0].textContent) : -1;
                    return lhsVal - rhsVal;
                });
                e.target.textContent = "expand_more";
            }
            // Sort in alphabetical order from bottom to top based on the record rating.
            else if(e.target.textContent == "expand_more") {
                assortment.sort((lhs, rhs) => {
                    let lhsVal = lhs.children[3].children[0].textContent != "" ? parseFloat(lhs.children[3].children[0].textContent) : -1,
                        rhsVal = rhs.children[3].children[0].textContent != "" ? parseFloat(rhs.children[3].children[0].textContent) : -1;
                    return rhsVal - lhsVal;
                });
                e.target.textContent = "expand_less";
            }
            // Clear the table and refill it with the ordered records.
            assortmentTable.innerHTML = "";
            for(let z = 0; z < assortment.length; z++) {
                assortmentTable.append(assortment[z]);
            }
        }
    });
    // Listen for a click event on the clear filter button in order to remove all active filters.
    clearFilter.addEventListener("click", e => { cleanFilter(tableBody); });
    // Listen for a click event on the clear filter button in order to remove all active filters.
    filterModalClear.addEventListener("click", e => { cleanFilter(tableBody); });
    // Listen for a click event on the database export tab in order to update the database modal view.
    databaseExport.addEventListener("click", e => {
        e.preventDefault();
        // Show the checkbox for the compression option.
        databaseCheckLabel.style.display = "initial";
        // Highlight the export tab and unhighlight the import tab.
        databaseExport.parentNode.classList.add("active");
        databaseImport.parentNode.classList.remove("active");
        // Show the database modal export content and associated buttons.
        databaseExportContainer.style.display = "initial";
        databaseImportContainer.style.display = "none";
        databaseExportBtn.style.display = "inline-block";
        databaseImportBtn.style.display = "none";
        if(typeSwitch.checked == true) {
            databaseCheckLabel.style.display = "none";
            XLSXTypeSwitchDiv.style.display = "initial";
        }
        else {
            databaseCheckLabel.style.display = "initial";
            XLSXTypeSwitchDiv.style.display = "none";
        }
    });
    // Listen for a click event on the database import tab in order to update the database modal view.
    databaseImport.addEventListener("click", e => {
        e.preventDefault();
        // Hide the checkbox for the compression option.
        databaseCheckLabel.style.display = "none";
        // Highlight the import tab and unhighlight the export tab.
        databaseExport.parentNode.classList.remove("active");
        databaseImport.parentNode.classList.add("active");
        // Show the database modal import content and associated buttons.
        databaseExportContainer.style.display = "none";
        databaseImportContainer.style.display = "initial";
        databaseExportBtn.style.display = "none";
        databaseImportBtn.style.display = "inline-block";
        if(typeSwitch.checked == true) {
            importZipContent.style.display = "none";
            XLSXTypeSwitchDiv.style.display = "initial";
            XLSXTypeSwitch.checked == true ? importXLSXContentDetailed.style.display = "block" : importXLSXContentSimple.style.display = "block";
        }
        else {
            importZipContent.style.display = "block";
            importXLSXContentSimple.style.display = "none";
            importXLSXContentDetailed.style.display = "none";
        }
    });
    // Listen for a click event on the importSampleZIP button in the import section in order to open a folder to it.
    importSampleZIP.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("importSampleZIP");
    });
     // Listen for a click event on the importSampleSimpleXLSX button in the import section in order to open a folder to it.
    importSampleSimpleXLSX.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("importSampleSimpleXLSX");
    });
     // Listen for a click event on the importSampleDetailedXLSX button in the import section in order to open a folder to it.
    importSampleDetailedXLSX.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("importSampleDetailedXLSX");
    });
    // Listen for a click event on the database export button in order to process an export of the chosen library records.
    databaseExportBtn.addEventListener("click", e => {
        // Define the list of records which the user desires to export.
        const list = Array.from(document.querySelectorAll(".recordsChecks")).filter(elem => elem !== undefined && elem.checked).map(elem => elem.id.split("_-_")[1]),
            submissionList = checkAll.checked ? list.slice(1) : list,
            exportPath = document.getElementById("exportPath");
        // Check that at least one record has been chosen by the user.
        if(submissionList.length > 0) {
            ipcRenderer.send("databaseExport", [exportPath.value, submissionList, typeSwitch.checked == true ? "XLSX" : "ZIP", XLSXTypeSwitch.checked, document.getElementById("exportCheck").checked]);
            exportPath.value = "";
        }
        else {
            M.toast({"html": "In order to export at least one record has to be checked.", "classes": "rounded"});
        }
    });
    // Listen for a click event on the database import button in order to process an import of the chosen zip files.
    databaseImportBtn.addEventListener("click", e => {
        // Define the list of zip of files which the user desires to import.
        const pathArr = Array.from(document.getElementById("importZipFile").files);
        // Make sure that at least one zip file has been chosen by the user.
        if(pathArr.length > 0) {
            ipcRenderer.send("databaseImport", [pathArr.map(elem => elem.path), typeSwitch.checked == true ? "XLSX" : "ZIP", XLSXTypeSwitch.checked]);
        }
        else {
            M.toast({"html": "In order to import at least one file must be chosen.", "classes": "rounded"});
        }
    });
    // Ensure that the export option is the default view in the database modal.
    databaseExport.click();
    // Listen for a click event on the import overide button in order to proceed with overwriting the requested library records in the import process.
    importOverideBtn.addEventListener("click", e => {
        const overwriteArr = [[], []];
        Array.from(document.querySelectorAll("#importModal .importModalCheckbox")).map(elem => {
            overwriteArr[0].push(elem.id);
            overwriteArr[1].push(elem.checked);
        })
        ipcRenderer.send("importOveride", overwriteArr);
    });
    // Listen for a change in the import data type to change the content accordingly.
    const originalSwitchBackground = "#00000061",
        newSwitchBackground = "#" + addAlpha(rgba2hex(getComputedStyle(databaseImportBtn).backgroundColor).substring(1), 0.6);
    typeSwitch.addEventListener("change", e => {
        const importZipContent = document.getElementById("importZipContent");
        if(e.target.checked == true) {
            document.querySelector("#databaseSwitchDiv label input[type=checkbox]:checked+.lever").style.backgroundColor = newSwitchBackground;
            XLSXTypeSwitchDiv.style.display = "initial";
            if(databaseImport.parentNode.classList.contains("active")) {
                importZipContent.style.display = "none";
                XLSXTypeSwitch.checked == true ? importXLSXContentDetailed.style.display = "block" : importXLSXContentSimple.style.display = "block";
            }
            else {
                databaseCheckLabel.style.left = "90px";
            }
        }
        else {
            document.querySelector("#databaseSwitchDiv label .lever").style.backgroundColor = originalSwitchBackground;
            XLSXTypeSwitchDiv.style.display = "none";
            if(databaseImport.parentNode.classList.contains("active")) {
                importZipContent.style.display = "block";
                importXLSXContentSimple.style.display = "none";
                importXLSXContentDetailed.style.display = "none";
            }
            else {
                databaseCheckLabel.style.left = "70px";
            }
        }
    });
    XLSXTypeSwitch.addEventListener("change", e => {
        if(e.target.checked == true) {
            document.querySelector("#XLSXTypeSwitchDiv label input[type=checkbox]:checked+.lever").style.backgroundColor = newSwitchBackground;
            importXLSXContentSimple.style.display = "none";
            importXLSXContentDetailed.style.display = "block";
        }
        else {
            document.querySelector("#XLSXTypeSwitchDiv label .lever").style.backgroundColor = originalSwitchBackground;
            importXLSXContentSimple.style.display = "block";
            importXLSXContentDetailed.style.display = "none";
        }
    });
});