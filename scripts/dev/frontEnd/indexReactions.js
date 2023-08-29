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
    basePath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
if(!fs.existsSync(path.join(basePath, "Trak", "config", "configuration.json"))) {
    var localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
}
else {
    let configObj = JSON.parse(fs.readFileSync(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8"));
    var localPath = configObj.current != undefined
        ? configObj.current.path.substring(0, configObj.current.path.length - 10)
        : configObj.original.path.substring(0, configObj.original.path.length - 10);
}



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
ipcRenderer.on("loadRows", (event, tableDiff) => {
    // Define the path for all items and get a list of all available records.
    const pathDir = path.join(localPath, "Trak", "data");
    let list = [];
    fs.existsSync(pathDir) ? list = fs.readdirSync(pathDir).filter(file => fs.statSync(path.join(pathDir, file)).isDirectory()) : list = [];
    if(list.length > 0) {
        list = list.sort((lhs, rhs) => {
            let lhsVal = lhs.substring(lhs.indexOf("-")),
                rhsVal = rhs.substring(lhs.indexOf("-"));
            return lhsVal.localeCompare(rhsVal);
        });
    }
    // Attach a row to the html table body for each contact.
    const tableDiv = document.getElementById("tableDiv"),
        tableBody = document.getElementById("tableBody");
    tableDiv.style.height = (tableDiff + 467) + "px";
    tableBody.textContent = "";
    document.getElementById("preloader").style.setProperty("display", "none", "important");
    // Hide the vertical scroll bar.
    document.body.style.overflowY = "hidden";
    // Iterate through each saved record and add a row for each one containing the name, category, and genres of the record.
    for(let n = 0; n < list.length; n++) {
        // Define the items needed to construct the row.
        let tr = document.createElement("tr"),
            tdName = document.createElement("td"),
            tdNameDiv = document.createElement("div"),
            tdCategory = document.createElement("td"),
            tdCategoryDiv = document.createElement("div"),
            tdRating = document.createElement("td"),
            tdRatingDiv = document.createElement("div"),
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
        // Modify the name portion.
        tdNameDiv.textContent = recordData.name != "" ? recordData.name : recordData.jname;
        tdNameDiv.classList.add("recordsNameRowDiv");
        tdName.append(tdNameDiv);
        // Modify the category portion.
        tdCategoryDiv.textContent = recordData.category;
        tdCategoryDiv.classList.add("recordsRowDiv");
        tdCategory.append(tdCategoryDiv);
        // Modify the rating portion.
        let displayRating = "",
            displayRatingArr = [];
        for(let a = 0; a < recordData.content.length; a++) {
            if(recordData.content[a].scenario == "Single") {
                if(recordData.content[a].rating != "") {
                    displayRatingArr.push(parseInt(recordData.content[a].rating));
                }
            }
            else if(recordData.content[a].scenario == "Season") {
                let ratingHolder = 0,
                    ratingHolderArr = [];
                for(let b = 0; b < recordData.content[a].episodes.length; b++) {
                    if(recordData.content[a].episodes[b].rating != "") {
                        ratingHolderArr.push(parseInt(recordData.content[a].episodes[b].rating));
                    }
                }
                if(ratingHolderArr.length > 0) {
                    ratingHolder = (ratingHolderArr.reduce((accum, cur) => accum + cur, 0) / ratingHolderArr.length).toFixed(2);
                    displayRatingArr.push(ratingHolder);
                }
            }
        }
        if(displayRatingArr.length > 0) { displayRating = (displayRatingArr.reduce((accum, cur) => accum + cur, 0) / displayRatingArr.length).toFixed(2); }
        tdRatingDiv.textContent = displayRating;
        tdRatingDiv.classList.add("recordsRowDiv");
        tdRating.append(tdRatingDiv);
        // Modify the genres portion.
        let count = 0,
            rowGenreStr = "",
            rowGenreInfo = "";
        for(let y = 0; y < recordData.genres[0].length; y++) {
            if(recordData.genres[1][y] == true) {
                rowGenreInfo.length == 0 ? rowGenreInfo = recordData.genres[0][y] : rowGenreInfo += "," + recordData.genres[0][y];
                if(count <= 2) {
                    if(rowGenreStr.length > 0) { rowGenreStr += ", "; }
                    if(count == 2) { rowGenreStr += "..."; }
                    else {
                        if(recordData.genres[0][y] == "CGDCT") {
                            rowGenreStr += "CGDCT";
                        }
                        else if(recordData.genres[0][y] == "ComingOfAge") {
                            rowGenreStr += "Coming-of-Age";
                        }
                        else if(recordData.genres[0][y] == "PostApocalyptic") {
                            rowGenreStr += "Post-Apocalyptic";
                        }
                        else if(recordData.genres[0][y] == "SciFi") {
                            rowGenreStr += "Sci-Fi";
                        }
                        else if(recordData.genres[0][y] == "SliceOfLife") {
                            rowGenreStr += "Slice of Life";
                        }
                        else {
                            rowGenreStr += recordData.genres[0][y].split(/(?=[A-Z])/).join(" ");
                        }
                    }
                    count++;
                }
            }
        }
        tdGenresDiv.textContent = rowGenreStr;
        tdGenresDiv.classList.add("recordsRowDiv");
        tdGenres.append(tdGenresDiv);
        // Modify the files button to be used for opening the assets folder of a record.
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
        // Modify the checks associated to each row.
        checkInput.setAttribute("type", "checkbox");
        checkInput.classList.add("filled-in", "recordsChecks");
        checkInput.setAttribute("id", "check_-_" + list[n]);
        checkLabel.append(checkInput);
        tdCheck.append(checkLabel);
        tdFiles.append(tdFilesDiv);
        // Append all portions of the row.
        tr.setAttribute("id", list[n]);
        tr.setAttribute("category", recordData.category);
        tr.setAttribute("directors", recordData.directors);
        tr.setAttribute("genres", rowGenreInfo);
        tr.setAttribute("jname", recordData.jname);
        tr.setAttribute("license", recordData.license);
        tr.setAttribute("musicians", recordData.musicians);
        tr.setAttribute("name", recordData.name);
        tr.setAttribute("producers", recordData.producers);
        tr.setAttribute("studio", recordData.studio);
        tr.setAttribute("writers", recordData.writers);
        tr.append(tdCheck, tdName, tdCategory, tdRating, tdGenres, tdFiles);
        tableBody.append(tr);
        // Reset the width of the headers table. 
        let difference = document.getElementById("tableDiv").offsetWidth - document.getElementById("tableDiv").clientWidth;
        document.getElementById("headersTable").style.width = "calc(95% - " + difference + "px)";
        // Listen for a change in the input associated to each row checkbox.
        checkInput.addEventListener("change", () => {
            let btn = document.getElementById("remove"),
                checkAllBtn = document.getElementById("checkAll"),
                checkArr = Array.from(document.querySelectorAll(".recordsChecks")),
                checkTotal = checkArr.length,
                checkedNum = checkArr.filter(elem => elem.checked).length;
            checkedNum > 0 ? btn.style.display = "inherit" : btn.style.display = "none";
            checkTotal - 1 == checkedNum && !checkAllBtn.checked ? checkAllBtn.checked = true : checkAllBtn.checked = false;
        });
        // Listen for a click on the name of a record in order to open the update page.
        tdNameDiv.addEventListener("click", e => {
            e.preventDefault();
            ipcRenderer.send("updateRecord", e.target.parentNode.parentNode.id);
        });
        // Listen for a click on the files button in order to open the associated assets folder of a record.
        filesButton.addEventListener("click", e => {
            e.preventDefault();
            let holder = e.target.id.split("_-_");
            holder.shift();
            ipcRenderer.send("recordFiles", holder.join(""));
        });
    }
    // Initialize the menu tooltips.
    initTooltips();
    // Define the filter form, list of genres, and number of columns and rows.
    const filterForm = document.getElementById("filterForm"),
        genresLst = filterGenreList(),
        columns = 5,
        rows = Math.ceil(genresLst.length / columns);
    // Iterate through all rows needed.
    for(let r = 0; r < rows; r++) {
        // Construct a div to contain the row.
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("genreRow");
        // Iterate through all columnds needed.
        for(let s = 0; s < columns; s++) {
            // Define the text associated to the genre.
            let filterGenreStr = "";
            if(genresLst[(s * rows) + r] == "CGDCT") {
                filterGenreStr = "CGDCT";
            }
            else if(genresLst[(s * rows) + r] == "ComingOfAge") {
                filterGenreStr = "Coming-of-Age";
            }
            else if(genresLst[(s * rows) + r] == "PostApocalyptic") {
                filterGenreStr = "Post-Apocalyptic";
            }
            else if(genresLst[(s * rows) + r] == "SciFi") {
                filterGenreStr = "Sci-Fi";
            }
            else if(genresLst[(s * rows) + r] == "SliceOfLife") {
                filterGenreStr = "Slice of Life";
            }
            else if(genresLst[(s * rows) + r] != undefined) {
                filterGenreStr = genresLst[(s * rows) + r].split(/(?=[A-Z])/).join(" ");
            }
            else { filterGenreStr = ""; }
            // Define the checkbox, label, and span associated to the genre.
            let genreCheckLabel = document.createElement("label"),
                genereCheckInput = document.createElement("input"),
                genereCheckSpan = document.createElement("span");
            // Modify the page elements.
            genreCheckLabel.classList.add("col", "s2");
            genereCheckInput.setAttribute("type", "checkbox");
            filterGenreStr != "" ? genereCheckInput.setAttribute("id", "filterGenre" + genresLst[(s * rows) + r]) : genreCheckLabel.style.visibility = "hidden";
            genereCheckInput.classList.add("filled-in", "filterCheckbox");
            genereCheckSpan.textContent = filterGenreStr;
            genereCheckSpan.classList.add("checkboxText");
            // Append the checkbox and text to the row.
            genreCheckLabel.append(genereCheckInput, genereCheckSpan);
            rowDiv.append(genreCheckLabel);
        }
        // Append the row to the filter form.
        filterForm.append(rowDiv);
    }
    // Initialize the page modals.
    initModal();
});