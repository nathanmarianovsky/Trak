/*

BASIC DETAILS: This file handles all buttons on the index.html page.

   - cleanFilter: Remove all active filters.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Remove all active filters.

*/
var cleanFilter = () => {
    // Define the category and genre arrays along with the record rows.
    const pageTable = Array.from(document.getElementById("tableBody").children);
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
        databaseExport = document.getElementById("databaseExport"),
        databaseImport = document.getElementById("databaseImport"),
        databaseExportBtn = document.getElementById("databaseExportBtn"),
        databaseImportBtn = document.getElementById("databaseImportBtn"),
        importOverideBtn = document.getElementById("importOverideBtn");
    // Listen for a click event on the add button in order to open a window whose inputs will generate a new record.
    add.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("addLoad", false);
    });
    // Listen for a click event on the remove button in order to open a confirmation window asking for the deletion of all checked records.
    remove.addEventListener("click", e => {
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
        // Define the collection of all record rows and the remove button.
        const bodyList = document.getElementById("tableBody").children,
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
        const assortmentTable = document.getElementById("tableBody");
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
        const assortmentTable = document.getElementById("tableBody");
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
        const assortmentTable = document.getElementById("tableBody");
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
    clearFilter.addEventListener("click", e => { cleanFilter(); });
    // Listen for a click event on the clear filter button in order to remove all active filters.
    filterModalClear.addEventListener("click", e => { cleanFilter(); });
    databaseExport.addEventListener("click", e => {
       e.preventDefault();
       databaseExport.parentNode.classList.add("active");
       databaseImport.parentNode.classList.remove("active");
       document.getElementById("databaseExportContainer").style.display = "initial";
       document.getElementById("databaseImportContainer").style.display = "none";
       document.getElementById("databaseExportBtn").style.display = "inline-block";
       document.getElementById("databaseImportBtn").style.display = "none";
    });
    databaseImport.addEventListener("click", e => {
       e.preventDefault();
       databaseExport.parentNode.classList.remove("active");
       databaseImport.parentNode.classList.add("active");
       document.getElementById("databaseExportContainer").style.display = "none";
       document.getElementById("databaseImportContainer").style.display = "initial";
       document.getElementById("databaseExportBtn").style.display = "none";
       document.getElementById("databaseImportBtn").style.display = "inline-block";
    });
    databaseExportBtn.addEventListener("click", e => {
        const list = Array.from(document.querySelectorAll(".recordsChecks")).filter(elem => elem !== undefined && elem.checked).map(elem => elem.id.split("_-_")[1]),
            submissionList = document.getElementById("checkAll").checked ? list.slice(1) : list;
        if(submissionList.length > 0) {
            ipcRenderer.send("databaseExport", [document.getElementById("exportPath").value, submissionList]);
            document.getElementById("exportPath").value = "";
        }
        else {
            M.toast({"html": "In order to export at least one record has to be checked.", "classes": "rounded"});
        }
    });
    databaseImportBtn.addEventListener("click", e => {
        const pathArr = Array.from(document.getElementById("importZipFile").files);
        if(pathArr.length > 0) {
            ipcRenderer.send("databaseImport", pathArr.map(elem => elem.path));
        }
        else {
            M.toast({"html": "In order to import at least one zip file must be chosen.", "classes": "rounded"});
        }
    });
    importOverideBtn.addEventListener("click", e => {
        ipcRenderer.send("importOveride", Array.from(document.querySelectorAll("#importModal .importModalCheckbox")).map(elem => { return { "record": elem.id, "overwrite": elem.checked }}));
    });
    databaseExport.click();
});