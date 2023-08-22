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
        remove = document.getElementById("removeConfirm"),
        searchBar = document.getElementById("searchBar"),
        checkAll = document.getElementById("checkAll"),
        nameSort = document.getElementById("nameSort"),
        categorySort = document.getElementById("categorySort"),
        ratingSort = document.getElementById("ratingSort"),
        filterApply = document.getElementById("filterApply"),
        clearFilter = document.getElementById("clearFilter");
    // Listen for a click event on the add button in order to open a window whose inputs will generate a new record.
    add.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("addLoad");
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
    // Listen for a click event on the filter button in order to filter the list of records.
    filterApply.addEventListener("click", e => {
        // Define the category and genre arrays along with the record rows.
        const categoryList = ["Anime", "Book", "Film", "Manga", "Show"],
            genresList = filterGenreList(),
            catCheck = [],
            genreCheck = [],
            pageTable = Array.from(document.getElementById("tableBody").children);
        // Define the filtered categories collection.
        for(let i = 0; i < categoryList.length; i++) {
            if(document.getElementById("filterCategory" + categoryList[i]).checked == true) { catCheck.push(categoryList[i]); }
        }
        // Define the filtered genres collection.
        for(let j = 0; j < genresList.length; j++) {
            if(document.getElementById("filterGenre" + genresList[j]).checked == true) { genreCheck.push(genresList[j]); }
        }
        // Iterate through the records rows to determine if they pass the filter.
        for(let x = 0; x < pageTable.length; x++) {
            // Filter based on both categories and genres.
            if(catCheck.length > 0 && genreCheck.length > 0) {
                let genreOverall = true,
                    genreSplit = pageTable[x].getAttribute("genres").split(",");
                for(let y = 0; y < genreCheck.length; y++) {
                    if(!genreSplit.includes(genreCheck[y])) { genreOverall = false; }
                }
                genreOverall == true && catCheck.includes(pageTable[x].getAttribute("category")) ? pageTable[x].style.display = "table-row" : pageTable[x].style.display = "none";
            }
            // Filter based only on categories.
            else if(catCheck.length > 0 && genreCheck.length == 0) {
                catCheck.includes(pageTable[x].getAttribute("category")) ? pageTable[x].style.display = "table-row" : pageTable[x].style.display = "none";
            }
            // Filter based only genres.
            else if(catCheck.length == 0 && genreCheck.length > 0) {
                let genreOverall = true,
                    genreSplit = pageTable[x].getAttribute("genres").split(",");
                for(let y = 0; y < genreCheck.length; y++) {
                    if(!genreSplit.includes(genreCheck[y])) { genreOverall = false; }
                }
                genreOverall == true ? pageTable[x].style.display = "table-row" : pageTable[x].style.display = "none";
            }
            // If the empty filter is applied then show all record rows.
            else { pageTable[x].style.display = "table-row"; }
        }
        // Upon the submission of a filter clear the search bar.
        searchBar.parentNode.children[0].classList.remove("active");
        searchBar.parentNode.children[2].classList.remove("active");
        searchBar.classList.remove("valid");
        searchBar.value = "";
    });
    // Listen for a click event on the clear filter button in order to remove all active filters.
    clearFilter.addEventListener("click", e => {
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
    });
});