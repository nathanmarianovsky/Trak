/*

BASIC DETAILS: This file handles all buttons on the index.html page.

   - cleanFilter: Remove all active filters.
   - bottomScrollRequest: Provides the request to load more chunks, if available, on a content search when the bottom of the page has been reached.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Remove all active filters.

*/
const cleanFilter = () => {
    const homeIcon = document.getElementById("indexHome");
    // Define the category and genre arrays along with the record rows.
    const pageTable = homeIcon.style.display == "none" || homeIcon.style.display == ""
        ? Array.from(document.getElementById("tableBody").children)
        : Array.from(document.getElementById("animeSearchContainer").children).concat(
            Array.from(document.getElementById("bookSearchContainer").children),
            Array.from(document.getElementById("mangaSearchContainer").children)
        );
    // Iterate through the records rows.
    for(let z = 0; z < pageTable.length; z++) {
        // Show all record rows.
        if(homeIcon.style.display == "none" || homeIcon.style.display == "") {
            pageTable[z].style.display = "table-row";
            pageTable[z].setAttribute("genreFiltered", "1");
        }
        else {
            pageTable[z].style.display = "inline-block";
        }
    }
    // Clear the filter modal checkboxes.
    Array.from(document.getElementsByClassName("filterCheckbox")).forEach(elem => elem.checked = false);
    if(homeIcon.style.display == "none" || homeIcon.style.display == "") {
        // Upon the submission of a filter clear the search bar.
        searchBar.parentNode.children[0].classList.remove("active");
        searchBar.parentNode.children[2].classList.remove("active");
        searchBar.classList.remove("valid");
        searchBar.value = "";
        document.getElementById("homeCounterModified").style.display = "none";
        document.getElementById("homeCounter").style.display = "block";
    }
};



/*

Provides the request to load more chunks, if available, on a content search when the bottom of the page has been reached.

   - animeSearch is the search bar input for anime content searches.
   - bookSearch is the search bar input for book content searches.
   - filmSearchBar is the search bar input for film content searches.
   - mangaSearchBar is the search bar input for manga content searches.
   - showSearchBar is the search bar input for film content searches.

*/
const bottomScrollRequest = (animeSearch, bookSearch, filmSearch, mangaSearch, showSearch) => {
    window.addEventListener("scroll", ev => {
        if((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
            let tabs = Array.from(document.getElementsByClassName("tabSearchLink")).filter(elem => elem.classList.contains("active")),
                chunkPreloader = document.getElementById("chunkPreloader");
            if(tabs.length > 0 && chunkPreloader.style.display == "none") {
                let type = tabs[0].textContent;
                if(chunkPreloader.getAttribute(type.toLowerCase() + "Check") == "0") {
                    chunkPreloader.style.display = "block";
                    window.scrollTo(0, document.body.scrollHeight);
                    if(type == "Anime" && chunkPreloader.getAttribute("animeCheck") == "0") {
                        ipcRenderer.send("animeFetchSearch", [animeSearch.value, Math.floor(document.getElementById("animeSearchContainer").children.length / 50) + 1]);
                    }
                    else if(type == "Book" && chunkPreloader.getAttribute("bookCheck") == "0") {
                        ipcRenderer.send("bookFetchSearch", [bookSearch.value, Math.floor(document.getElementById("bookSearchContainer").children.length / 20) + 1]);
                    }
                    else if(type == "Film" && chunkPreloader.getAttribute("filmCheck") == "0") {
                        ipcRenderer.send("filmFetchSearch", [filmSearch.value, document.getElementById("filmSearchContainer").children.length > 0 ? 2 : 1]);
                    }
                    else if(type == "Manga" && chunkPreloader.getAttribute("mangaCheck") == "0") {
                        ipcRenderer.send("mangaFetchSearch", [mangaSearch.value, Math.floor(document.getElementById("mangaSearchContainer").children.length / 50) + 1]);
                    }
                    else if(type == "Show" && chunkPreloader.getAttribute("showCheck") == "0") {
                        ipcRenderer.send("showFetchSearch", [showSearch.value, document.getElementById("showSearchContainer").children.length > 0 ? 2 : 1]);
                    }
                }
            }
        }
    });
};



/*

Returns the list of checked items on the index home page.

*/
const checkList = () => Array.from(document.querySelectorAll(".recordsChecks")).filter(elem => elem !== undefined && elem.checked).map(elem => elem.id.split("_-_")[1]);



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Define the buttons for all actions.
    const add = document.getElementById("add"),
        remove = document.getElementById("removeConfirm"),
        open = document.getElementById("openRecords"),
        searchBar = document.getElementById("searchBar"),
        merge = document.getElementById("merge"),
        mergeConfirm = document.getElementById("mergeConfirm"),
        checkAll = document.getElementById("checkAll"),
        notificationsCheckAll = document.getElementById("notificationsCheckAll"),
        notificationsClear = document.getElementById("notificationsClear"),
        notificationsSnoozeList = Array.from(document.getElementsByClassName("snoozeOption")),
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
        importFetchExit = document.getElementById("importFetchExit"),
        importFetchNo = document.getElementById("importFetchNo"),
        importFetchYes = document.getElementById("importFetchYes"),
        typeSwitch = document.getElementById("databaseSwitch"),
        XLSXTypeSwitch = document.getElementById("XLSXTypeSwitch"),
        importSampleZIP = document.getElementById("importSampleZIP"),
        importSampleSimpleXLSX = document.getElementsByClassName("importSampleSimpleXLSX"),
        importSampleDetailedXLSX = document.getElementsByClassName("importSampleDetailedXLSX"),
        contentSearch = document.getElementById("contentSearch"),
        indexHome = document.getElementById("indexHome"),
        animeSearchSubmission = document.getElementById("animeSearchSubmission"),
        animeSearchSwitch = document.getElementById("animeSearchSwitch"),
        tabSearchLinks = Array.from(document.getElementsByClassName("tabSearchLink")),
        bookSearchSubmission = document.getElementById("bookSearchSubmission"),
        filmSearchSubmission = document.getElementById("filmSearchSubmission"),
        mangaSearchSubmission = document.getElementById("mangaSearchSubmission"),
        clearNotifications = document.getElementById("clearNotifications"),
        updateCurrent = document.getElementById("updateCurrent"),
        updateChangelog = document.getElementById("updateChangelog"),
        addBookmark = document.getElementById("addBookmark"),
        removeBookmark = document.getElementById("removeBookmark");
    // Define all page components which will be utilized.
    const tableBody = document.getElementById("tableBody"),
        XLSXTypeSwitchDiv = document.getElementById("XLSXTypeSwitchDiv"),
        importXLSXContentSimple = Array.from(document.getElementsByClassName("importXLSXContentSimple")),
        importXLSXContentDetailed = Array.from(document.getElementsByClassName("importXLSXContentDetailed")),
        databaseExportContainer = document.getElementById("databaseExportContainer"),
        databaseImportContainer = document.getElementById("databaseImportContainer"),
        outerLayer = document.getElementById("outerLayer"),
        contentSearchDiv = document.getElementById("contentSearchDiv"),
        animeSeasonSearchYear = document.getElementById("animeSeasonSearchYear"),
        animeSeasonSearchSeason = document.getElementById("animeSeasonSearchSeason"),
        animeSeasonSearchType = document.getElementById("animeSeasonSearchType"),
        preloader = document.getElementById("preloader"),
        animeNameSearchInnerDiv1 = document.getElementById("animeNameSearchInnerDiv1"),
        animeSeasonSearchInnerDiv = document.getElementById("animeSeasonSearchInnerDiv"),
        filterModalGenreHeading = document.getElementById("filterModalGenreHeading"),
        filterModalGenreHeadingSiblings = filterModalGenreHeading.parentNode.children,
        defaultSearchDiv = document.getElementById("defaultSearchDiv"),
        tabDivs = Array.from(document.getElementsByClassName("tabDiv")),
        animeSearchBar = document.getElementById("animeSearchBar"),
        bookSearchBar = document.getElementById("bookSearchBar"),
        filmSearchBar = document.getElementById("filmSearchBar"),
        mangaSearchBar = document.getElementById("mangaSearchBar"),
        showSearchBar = document.getElementById("showSearchBar"),
        databaseModalExit = document.getElementById("databaseModalExit"),
        exportPath = document.getElementById("exportPath"),
        databaseTabs = document.getElementById("databaseTabs"),
        importXLSXContent = document.getElementById("importXLSXContent"),
        databaseModal = document.getElementById("databaseModal"),
        chunkLoad = document.getElementById("chunkPreloader"),
        notifications = document.getElementById("notifications"),
        notificationsCollection = document.getElementById("notificationsCollection"),
        updateCurrentDiv = document.getElementById("updateCurrentDiv"),
        updateChangelogDiv = document.getElementById("updateChangelogDiv"),
        updateBookmark = document.getElementById("updateBookmark"),
        mergeDiv = document.getElementById("mergeListDiv");
        mergePreloader = document.getElementById("mergePreloader");
    let submissionList = [],
        tabsLoader = false;
    // Listen for a click event on the add bookmark button in order to send a request to bookmark all checked records.
    addBookmark.addEventListener("click", e => {
        const list = checkList();
        if(list.length > 0) {
            ipcRenderer.send("addBookmark", checkAll.checked ? list.slice(1) : list);
        }
        else {
            M.toast({"html": "In order to bookmark library records at least one record has to be checked.", "classes": "rounded"});
        }
    });
    // Listen for a click event on the remove bookmark button in order to send a request to unbookmark all checked records.
    removeBookmark.addEventListener("click", e => {
        const list = checkList();
        if(list.length > 0) {
            ipcRenderer.send("removeBookmark", checkAll.checked ? list.slice(1) : list);
        }
        else {
            M.toast({"html": "In order to bookmark library records at least one record has to be checked.", "classes": "rounded"});
        }
    });
    // Listen for a click on any search tab in order to hide the default search div.
    tabSearchLinks.forEach(tab => tab.addEventListener("click", e => defaultSearchDiv.style.display = "none"));
    // Listen for a click event on the content search button.
    contentSearch.addEventListener("click", e => {
        // Hide the local records table.
        outerLayer.style.display = "none";
        // Hide the content search button.
        contentSearch.style.display = "none";
        // Hide the bookmarks button.
        updateBookmark.style.display = "none";
        // Display the home button.
        indexHome.style.display = "inline-block";
        // Display the content search inputs.
        contentSearchDiv.style.display = "block";
        tabDivs.forEach(div => div.style.display = "none");
        defaultSearchDiv.style.display = "block";
        // Initialize the content search tabs.
        initTabs();
        let tabIndicator = document.querySelector("#contentSearchDiv .indicator"),
            tabs = document.querySelector("#contentSearchDiv .tabs");
        tabs.style.backgroundColor = "#" + addAlpha(rgba2hex(getComputedStyle(databaseImportBtn).backgroundColor).substring(1), 0.6);
        tabIndicator.style.display = "none";
        tabSearchLinks.forEach(tab => tab.classList.remove("active"));
        // Reset the genres/tags filter.
        clearFilter.click();
        // Show the body scroll if necessary.
        document.body.style.overflowY = "auto";
        // Hide the categories and status portions of the filter.
        for(let r = 0; r < 4; r++) {
            filterModalGenreHeadingSiblings[r].style.display = "none";
        }
        filterModalGenreHeading.style.setProperty("margin-top", "0px", "important");
    });
    // Listen for a click event on the current update tab.
    updateCurrent.addEventListener("click", e => {
        // Show the content for the current update tab.
        updateCurrentDiv.style.display = "block";
        updateCurrent.parentNode.classList.add("active");
        // Hide the content for the update changelog tab.
        updateChangelogDiv.style.display = "none";
        updateChangelog.parentNode.classList.remove("active");
    });
    // Listen for a click event on the update changelog tab.
    updateChangelog.addEventListener("click", e => {
        // Hide the content for the current update tab.
        updateCurrentDiv.style.display = "none";
        updateCurrent.parentNode.classList.remove("active");
        // Show the content for the update changelog tab.
        updateChangelogDiv.style.display = "block";
        updateChangelog.parentNode.classList.add("active");
    });
    // Listen for a click event on the home button.
    indexHome.addEventListener("click", e => {
        window.scrollTo(0,0);
        // Display the local records table.
        outerLayer.style.display = "block";
        // Display the content search button.
        contentSearch.style.display = "inline-block";
        if(document.getElementById("tableBody").children.length > 0) {
            // Display the bookmarks button.
            updateBookmark.style.display = "inline-block";
        }
        // Hide the home button.
        indexHome.style.display = "none";
        // Hide the content search inputs.
        contentSearchDiv.style.display = "none";
        // Reset the genres/tags filter.
        genreListLoad("All", 5, true);
        // Hide the body scroll.
        document.body.style.overflowY = "hidden";
        // Display the categories and status portions of the filter.
        for(let r = 0; r < 4; r++) {
            filterModalGenreHeadingSiblings[r].style.display = "block";
        }
        filterModalGenreHeading.style.setProperty("margin-top", "25px", "important");
    })
    // Listen for a click event on the anime search submission button.
    animeSearchSubmission.addEventListener("click", e => {
        // Define the anime search container and the search type.
        const searchCase = animeSearchSwitch.children[0].textContent,
            animeResultsContainer = document.getElementById("animeSearchContainer");
        // Proceed with the following if searching for content by season.
        if(searchCase == "toggle_off") {
            // Define the anime season search parameters.
            let curYear = animeSeasonSearchYear.value,
                curSeason = animeSeasonSearchSeason.value;
            // If no year has been chosen notify the user.
            if(curYear == "") {
                M.toast({"html": "A year must be selected in order to search for anime.", "classes": "rounded"});
            }
            // If no season has been chosen notify the user.
            else if(curSeason == "") {
                M.toast({"html": "A season must be selected in order to search for anime.", "classes": "rounded"});
            }
            else {
                // Reset the anime search container.
                animeResultsContainer.innerHTML = "";
                // Reset the sort select tag.
                document.getElementById("animeSeasonSearchSort").value = "";
                initSelect();
                window.scrollTo(0, 0);
                // Display the preloader.
                preloader.style.display = "block";
                chunkLoad.setAttribute("animeCheck", "0");
                // Send a request to the back-end in order to fetch a season's anime releases.
                ipcRenderer.send("animeFetchSeason", [curYear, curSeason, Array.from(animeSeasonSearchType.selectedOptions).map(({ value }) => value)]);
            }
        }
        // Proceed with the following if searching for content by a query.
        else if(searchCase == "toggle_on") {
            // Proceed only if the query is non-empty.
            if(animeSearchBar.value.length > 0) {
                // Reset the anime search container.
                animeResultsContainer.innerHTML = "";
                // Reset the sort select tag.
                document.getElementById("animeNameSearchSort").value = "";
                initSelect();
                window.scrollTo(0, 0);
                // Display the preloader.
                preloader.style.display = "block";
                chunkLoad.setAttribute("animeCheck", "0");
                // Send a request to the back-end in order to retrieve the search results for the provided query.
                ipcRenderer.send("animeFetchSearch", [animeSearchBar.value, 1]);
            }
            // If no query has been provided notify the user.
            else { M.toast({"html": "In order to search for anime based on a written query it has to be of non-zero length.", "classes": "rounded"}); }
        }
        // Reset the genres/tags filter.
        clearFilter.click();
    });
    // Listen for a click event on the anime search switch button.
    animeSearchSwitch.addEventListener("click", e => {
        // Define the search type.
        const chk = animeSearchSwitch.children[0].textContent;
        // If the anime search is currently by query switch it to be by season.
        if(chk == "toggle_off") {
            // Update the switch button.
            animeSearchSwitch.children[0].textContent = "toggle_on";
            // Update the associated tooltip.
            animeSearchSwitch.setAttribute("data-tooltip", "Search by Season");
            // Display the anime search by query inputs.
            animeNameSearchInnerDiv1.style.display = "initial";
            // Hide the anime search by season inputs.
            animeSeasonSearchInnerDiv.style.display = "none";
        }
        // If the anime search is currently by season switch it to be by query.
        else if(chk == "toggle_on") {
            // Update the switch button.
            animeSearchSwitch.children[0].textContent = "toggle_off";
            // Update the associated tooltip.
            animeSearchSwitch.setAttribute("data-tooltip", "Search by Query");
            // Hide the anime search by query inputs.
            animeNameSearchInnerDiv1.style.display = "none";
            // Display the anime search by season inputs.
            animeSeasonSearchInnerDiv.style.display = "initial";
        }
        // Reset the page tooltips.
        clearTooltips();
        initTooltips();
    });
    // Listen for a click event on the book search submission button.
    bookSearchSubmission.addEventListener("click", e => {
        // Define the book search container.
        const bookResultsContainer = document.getElementById("bookSearchContainer");
        // Proceed only if the query is non-empty.
        if(bookSearchBar.value.length > 0) {
            // Reset the book search container.
            bookResultsContainer.innerHTML = "";
            // Reset the sort select tag.
            document.getElementById("bookNameSearchSort").value = "";
            initSelect();
            window.scrollTo(0, 0);
            // Display the preloader.
            preloader.style.display = "block";
            chunkLoad.setAttribute("bookCheck", "0");
            // Send a request to the back-end in order to retrieve the search results for the provided query.
            ipcRenderer.send("bookFetchSearch", [bookSearchBar.value, 1]);
        }
        // If no query has been provided notify the user.
        else { M.toast({"html": "In order to search for books based on a written query it has to be of non-zero length.", "classes": "rounded"}); }
        // Reset the genres/tags filter.
        clearFilter.click();
    });
    // Listen for a click event on the film search submission button.
    filmSearchSubmission.addEventListener("click", e => {
        // Define the film search container.
        const filmResultsContainer = document.getElementById("filmSearchContainer");
        // Proceed only if the query is non-empty.
        if(filmSearchBar.value.length > 0) {
            // Reset the film search container.
            filmResultsContainer.innerHTML = "";
            // Reset the sort select tag.
            document.getElementById("filmNameSearchSort").value = "";
            initSelect();
            window.scrollTo(0, 0);
            // Display the preloader.
            preloader.style.display = "block";
            chunkLoad.setAttribute("filmCheck", "0");
            // Send a request to the back-end in order to retrieve the search results for the provided query.
            ipcRenderer.send("filmFetchSearch", [filmSearchBar.value, 1]);
        }
        // If no query has been provided notify the user.
        else { M.toast({"html": "In order to search for films based on a written query it has to be of non-zero length.", "classes": "rounded"}); }
        // Reset the genres/tags filter.
        clearFilter.click();
    });
    // Listen for a click event on the manga search submission button.
    mangaSearchSubmission.addEventListener("click", e => {
        // Define the manga search container.
        const mangaResultsContainer = document.getElementById("mangaSearchContainer");
        // Proceed only if the query is non-empty.
        if(mangaSearchBar.value.length > 0) {
            // Reset the manga search container.
            mangaResultsContainer.innerHTML = "";
            // Reset the sort select tag.
            document.getElementById("mangaNameSearchSort").value = "";
            initSelect();
            window.scrollTo(0, 0);
            // Display the preloader.
            preloader.style.display = "block";
            chunkLoad.setAttribute("mangaCheck", "0");
            // Send a request to the back-end in order to retrieve the search results for the provided query.
            ipcRenderer.send("mangaFetchSearch", [mangaSearchBar.value, 1]);
        }
        // If no query has been provided notify the user.
        else { M.toast({"html": "In order to search for manga based on a written query it has to be of non-zero length.", "classes": "rounded"}); }
        // Reset the genres/tags filter.
        clearFilter.click();
    });
    // Listen for a click event on the show search submission button.
    showSearchSubmission.addEventListener("click", e => {
        // Define the show search container.
        const showResultsContainer = document.getElementById("showSearchContainer");
        // Proceed only if the query is non-empty.
        if(showSearchBar.value.length > 0) {
            // Reset the show search container.
            showResultsContainer.innerHTML = "";
            // Reset the sort select tag.
            document.getElementById("showNameSearchSort").value = "";
            initSelect();
            window.scrollTo(0, 0);
            // Display the preloader.
            preloader.style.display = "block";
            chunkLoad.setAttribute("showCheck", "0");
            // Send a request to the back-end in order to retrieve the search results for the provided query.
            ipcRenderer.send("showFetchSearch", [showSearchBar.value, 1]);
        }
        // If no query has been provided notify the user.
        else { M.toast({"html": "In order to search for shows based on a written query it has to be of non-zero length.", "classes": "rounded"}); }
        // Reset the genres/tags filter.
        clearFilter.click();
    });
    // Listen for a click event on the add button in order to open a window whose inputs will generate a new record.
    add.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("addRecord", [false, ""]);
    });
    // Listen for a click event on the remove button in order to send a request for the deletion of all checked records.
    remove.addEventListener("click", e => {
        const list = checkList();
        ipcRenderer.send("removeRecords", checkAll.checked ? list.slice(1) : list);
    });
    // Listen for a click event on the open button in order to send a request for the opening of all checked records.
    open.addEventListener("click", e => {
        let openList = checkList();
        if(checkAll.checked == true) { openList = openList.slice(1); }
        openList.forEach(item => ipcRenderer.send("updateRecord", [false, item]));
    });
    // Listen for a click event on the merge button in order to start the process of merging multiple records together.
    merge.addEventListener("click", e => {
        // Define the list of records the user wants to merge.
        let mergeList = Array.from(document.querySelectorAll(".recordsChecks"))
                .filter(elem => elem !== undefined && elem.checked && elem.id != "checkAll")
                .map(elem => [
                    elem.parentNode.parentNode.parentNode.id,
                    elem.parentNode.parentNode.parentNode.getAttribute("name"),
                    elem.parentNode.parentNode.parentNode.getAttribute("category")]);
        // Proceed only if all checked records have the same category.
        if(mergeList.every((val, i, arr) => val[2] === arr[0][2])) {
            // Proceed only if the checked records do not correspond to books and films.
            if(mergeList[0][2] != "Book" && mergeList[0][2] != "Film") {
                // Reset the list of record names to choose from in the merge modal.
                mergeDiv.innerHTML = "";
                // Attach a radio button for each checked record.
                for(let u = 0; u < mergeList.length; u++) {
                    let par = document.createElement("p"),
                        lab = document.createElement("label"),
                        inp = document.createElement("input"),
                        spa = document.createElement("span");
                    inp.setAttribute("type", "radio");
                    inp.setAttribute("name", "nameGroup");
                    inp.setAttribute("value", mergeList[u][0]);
                    inp.classList.add("with-gap");
                    spa.textContent = mergeList[u][1];
                    lab.append(inp, spa);
                    par.append(lab);
                    mergeDiv.append(par);
                }
                // Open the merge modal.
                M.Modal.getInstance(document.getElementById("mergeModal")).open();
            }
            // If the user choose books to merge notify them that it is not supported.
            else if(mergeList[0][2] == "Book") {
                M.toast({"html": "The merging of books is not supported.", "classes": "rounded"});
            }
            // If the user choose films to merge notify them that it is not supported.
            else if(mergeList[0][2] == "Film") {
                M.toast({"html": "The merging of films is not supported.", "classes": "rounded"});
            }
        }
        // If there is at least one checked record with a different category notify the user of this.
        else {
            M.toast({"html": "In order to merge library records the selected choices must be of the same category.", "classes": "rounded"});
        }
    });
    // Listen for a click event on the merge confirmation button in order to send a request to the back-end for a merger.
    mergeConfirm.addEventListener("click", e => {
        // Define the currently selected record name choice, if it exists.
        let radioChoice = document.querySelector('input[name="nameGroup"]:checked');
        // Proceed only if a name for the merged record has been chosen.
        if(radioChoice !== null) {
            // Hide the list of record name choices and display the preloader to indicate that the process has officially started.
            mergeDiv.style.display = "none";
            mergePreloader.style.display = "block";
            // Send a request to the back-end to merge the desired records.
            ipcRenderer.send("mergeRequest", [radioChoice.value, checkAll.checked ? checkList().slice(1) : checkList()]);
        }
        // If no name has been chosen notify the user that it is required for the merge process.
        else {
            M.toast({"html": "In order to proceed a choice must be made above for the merged record's name.", "classes": "rounded"});
        }
    });
    // Listen for an input change event on the search bar in order to filter the records table.
    searchBar.addEventListener("input", e => {
        // Define the collection of all record rows and the current string being searched.
        const rowList = Array.from(document.querySelectorAll("#tableBody tr")),
            curSearch = e.target.value.toLowerCase(),
            countersFiltered = [0, 0, 0, 0, 0];
        // Iterate through all of the rows and check whether the record name contains the desired search string.
        for(let i = 0; i < rowList.length; i++) {
            let rowDiv = rowList[i].children[1].children[0];
            // Show a row if it contains the desired parameters and hide it otherwise.
            if(curSearch.includes("@")) {
                // Define the list of parameters the user wishes to be satisfied.
                let searchArr = curSearch.split(","),
                    searchCheck = true;
                // Iterate through the parameters.
                for(let g = 0; g < searchArr.length; g++) {
                    // Define the parameter options and associated queries under the & operator.
                    let searchOption = searchArr[g].split(":")[0].substring(1).toLowerCase(),
                        searchParamsAND = searchArr[g].split(":").slice(1).join(":").split("&").map(param => param.toLowerCase());
                    let checkArrAND = [];
                    // Proceed only if a non-empty query has been provided for the parameter.
                    if(!(searchParamsAND.length == 1 && searchParamsAND[0] == "")) {
                        // Iterate through the list of queries under the & operator.
                        for(let h = 0; h < searchParamsAND.length; h++) {
                            // Proceed only if at least one query has been provided.
                            if(searchParamsAND.length > 0) {
                                let searchParamsOR = searchParamsAND[h].split("|").map(param => param.trim()),
                                    checkArrOR = [];
                                // Iterate through the queries under the | operator.
                                for(let j = 0; j < searchParamsOR.length; j++) {
                                    // Proceed only if at least one query has been provided.
                                    if(searchParamsOR[j] != "") {
                                        // Check if the category of the record satisfied the current query.
                                        const orPushFunc = (orArr, outerArr, item, innerArr) => orArr.push(outerArr[i].getAttribute(item).toLowerCase().includes(innerArr[j]));
                                        if(searchOption == "category") {
                                            orPushFunc(checkArrOR, rowList, "category", searchParamsOR);
                                        }
                                        // Check if the name of the record satisfied the current query.
                                        else if(searchOption == "name") {
                                            orPushFunc(checkArrOR, rowList, "name", searchParamsOR);
                                        }
                                        // Check if the genres of the record satisfied the current query.
                                        else if(searchOption == "genres") {
                                            orPushFunc(checkArrOR, rowList, "genres", searchParamsOR);
                                        }
                                        // Check if the japanese name of the record satisfied the current query.
                                        else if(searchOption == "jname") {
                                            if(rowList[i].getAttribute("jname") != null) {
                                                orPushFunc(checkArrOR, rowList, "jname", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the original name of the record satisfied the current query.
                                        else if(searchOption == "ogname") {
                                            if(rowList[i].getAttribute("originalName") != null) {
                                                orPushFunc(checkArrOR, rowList, "originalName", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the demographic of the record satisfied the current query.
                                        else if(searchOption == "demographic") {
                                            if(rowList[i].getAttribute("demographic") != null) {
                                                orPushFunc(checkArrOR, rowList, "demographic", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the writers or authors of the record satisfied the current query.
                                        else if(searchOption == "writers" || searchOption == "authors") {
                                            if(rowList[i].getAttribute("writers") != null || rowList[i].getAttribute("authors") != null) {
                                                if(rowList[i].getAttribute("writers") != null) {
                                                    orPushFunc(checkArrOR, rowList, "writers", searchParamsOR);
                                                }
                                                else if(rowList[i].getAttribute("authors") != null) {
                                                    orPushFunc(checkArrOR, rowList, "authors", searchParamsOR);
                                                }
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the illustrators of the record satisfied the current query.
                                        else if(searchOption == "illustrators") {
                                            if(rowList[i].getAttribute("illustrators") != null) {
                                                orPushFunc(checkArrOR, rowList, "illustrators", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the directors of the record satisfied the current query.
                                        else if(searchOption == "directors") {
                                            if(rowList[i].getAttribute("directors") != null) {
                                                orPushFunc(checkArrOR, rowList, "directors", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the producers of the record satisfied the current query.
                                        else if(searchOption == "producers") {
                                            if(rowList[i].getAttribute("producers") != null) {
                                                orPushFunc(checkArrOR, rowList, "producers", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the musicians of the record satisfied the current query.
                                        else if(searchOption == "musicians") {
                                            if(rowList[i].getAttribute("musicians") != null) {
                                                orPushFunc(checkArrOR, rowList, "musicians", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the studio of the record satisfied the current query.
                                        else if(searchOption == "studio") {
                                            if(rowList[i].getAttribute("studio") != null) {
                                                orPushFunc(checkArrOR, rowList, "studio", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the publisher of the record satisfied the current query.
                                        else if(searchOption == "publisher") {
                                            if(rowList[i].getAttribute("publisher") != null) {
                                                orPushFunc(checkArrOR, rowList, "publisher", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the japanese publisher of the record satisfied the current query.
                                        else if(searchOption == "jpublisher") {
                                            if(rowList[i].getAttribute("jpublisher") != null) {
                                                orPushFunc(checkArrOR, rowList, "jpublisher", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the license of the record satisfied the current query.
                                        else if(searchOption == "license") {
                                            if(rowList[i].getAttribute("license") != null) {
                                                orPushFunc(checkArrOR, rowList, "license", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the asin/isbn of the record satisfied the current query.
                                        else if(searchOption == "isbn") {
                                            if(rowList[i].getAttribute("isbn") != null) {
                                                orPushFunc(checkArrOR, rowList, "isbn", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }
                                        // Check if the media type of the record satisfied the current query.
                                        else if(searchOption == "media") {
                                            if(rowList[i].getAttribute("media") != null) {
                                                orPushFunc(checkArrOR, rowList, "media", searchParamsOR);
                                            }
                                            else { checkArrOR.push(false); }
                                        }

                                    }
                                }
                                if(checkArrOR.length > 0 && !checkArrOR.includes(true)) {
                                    checkArrAND.push(false);
                                }
                            }
                        }
                    }
                    if(checkArrAND.length > 0 && checkArrAND.includes(false)) {
                        searchCheck = false;
                    }
                }
                searchCheck == true ? rowList[i].style.display = "table-row" : rowList[i].style.display = "none";
            }
            // Show a row if it contains the desired query and hide it otherwise.
            else {
                rowList[i].getAttribute("genreFiltered") == "1" && rowDiv.textContent.toLowerCase().includes(curSearch) ? rowList[i].style.display = "table-row" : rowList[i].style.display = "none";
            }
            if(rowList[i].style.display == "table-row") {
                if(rowList[i].getAttribute("category") == "Anime") { countersFiltered[0] += 1; }
                else if(rowList[i].getAttribute("category") == "Book") { countersFiltered[1] += 1; }
                else if(rowList[i].getAttribute("category") == "Film") { countersFiltered[2] += 1; }
                else if(rowList[i].getAttribute("category") == "Manga") { countersFiltered[3] += 1; }
                else if(rowList[i].getAttribute("category") == "Show") { countersFiltered[4] += 1; }
            }
        }
        // Reset the checkAll listener.
        checkAll.removeEventListener("click", checkAllFunc);
        checkAll.addEventListener("click", checkAllFunc);
        // Reset the record checkboxes.
        Array.from(document.getElementsByClassName("recordsChecks")).forEach(checkElem => {
            if(checkElem.id != "checkAll") {
                checkElem.removeEventListener("change", recordCheckFunc);
                checkElem.addEventListener("change", recordCheckFunc);
            }
        });
        // Update the bottom message corresponding to record totals.
        updateCountString(rowList.length, countersFiltered);
        // Update the checkAll checkbox accordingly.
        const checksArr = Array.from(document.querySelectorAll(".recordsChecks")),
            arrVisible = checksArr.filter(item => item.parentNode.parentNode.parentNode.style.display != "none" && item.id != "checkAll").map(filItem => filItem.id).sort().join(","),
            arrChecked = checksArr.filter(item => item.checked == true && item.id != "checkAll").map(filItem => filItem.id).sort().join(",");
        console.log(arrVisible);
        console.log(arrChecked);
        checkAll.checked = (arrVisible == arrChecked);
    });
    // Listen for a click event on the check all checkbox in order to check or uncheck all record checkboxes.
    checkAll.addEventListener("click", checkAllFunc);
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
    // Listen for a click event on the notifications check all checkbox in order to check or uncheck all notification checkboxes.
    notificationsCheckAll.addEventListener("click", e => {
        // If the notificationsCheckAll is checked then check all notifications, otherwise uncheck.
        Array.from(document.getElementsByClassName("notificationCheck")).forEach(elem => notificationsCheckAll.checked ? elem.checked = true : elem.checked = false);
    });
    // Listen for a click event on the notifications clear button in order to clear the selected notifications permanently.
    notificationsClear.addEventListener("click", e => {
        ipcRenderer.send("notificationsSave", Array.from(document.getElementsByClassName("notificationCheck")).filter(elem => elem.checked).map(iter => {
            let infoElem = iter.closest("li");
            return [
                infoElem.getAttribute("notificationId") != null ? infoElem.getAttribute("notificationId") : "",
                infoElem.getAttribute("notificationCategory") != null ? infoElem.getAttribute("notificationCategory") : "",
                infoElem.getAttribute("notificationTitle") != null ? infoElem.getAttribute("notificationTitle") : "",
                infoElem.getAttribute("notificationScenario") != null ? infoElem.getAttribute("notificationScenario") : "",
                infoElem.getAttribute("notificationRelease") != null ? infoElem.getAttribute("notificationRelease") : "",
                infoElem.children[0].getAttribute("src") != null ? infoElem.children[0].getAttribute("src") : "",
                true,
                infoElem.getAttribute("notificationSnooze") != null ? infoElem.getAttribute("notificationSnooze") : "",
                false
            ];
        }));
    });
    // Listen for a click event on the first notifications snooze button in order to snooze the selected notifications.
    notificationsSnoozeList.forEach(notificationSnooze => {
        notificationSnooze.addEventListener("click", e => {
            ipcRenderer.send("notificationsSave", Array.from(document.getElementsByClassName("notificationCheck")).filter(elem => elem.checked).map(iter => {
                let infoElem = iter.closest("li"),
                    snoozeDate = (new Date());
                snoozeDate.setDate(snoozeDate.getDate() + parseInt(e.target.getAttribute("id").split("_")[1]));
                return [
                    infoElem.getAttribute("notificationId") != null ? infoElem.getAttribute("notificationId") : "",
                    infoElem.getAttribute("notificationCategory") != null ? infoElem.getAttribute("notificationCategory") : "",
                    infoElem.getAttribute("notificationTitle") != null ? infoElem.getAttribute("notificationTitle") : "",
                    infoElem.getAttribute("notificationScenario") != null ? infoElem.getAttribute("notificationScenario") : "",
                    infoElem.getAttribute("notificationRelease") != null ? infoElem.getAttribute("notificationRelease") : "",
                    infoElem.children[0].getAttribute("src") != null ? infoElem.children[0].getAttribute("src") : "",
                    false,
                    snoozeDate.getFullYear() + "-" + (snoozeDate.getMonth() + 1) + "-" + snoozeDate.getDate(),
                    false
                ];
            }));
        });
    });
    // Listen for a click event on the clear filter button in order to remove all active filters.
    clearFilter.addEventListener("click", e => { cleanFilter(); });
    // Listen for a click event on the clear filter button in order to remove all active filters.
    filterModalClear.addEventListener("click", e => { cleanFilter(); });
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
        databaseTabs.style.display = "none";
        typeSwitch.checked == true ? XLSXTypeSwitchDiv.style.display = "initial" : XLSXTypeSwitchDiv.style.display = "none";
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
        // Initialize the xlsx import tabs.
        if(tabsLoader == false) {
            initTabs(1);
            let tabIndicator = document.querySelector("#databaseModal .indicator"),
                tabs = document.querySelector("#databaseModal .tabs");
            tabs.style.backgroundColor = "#" + addAlpha(rgba2hex(getComputedStyle(databaseImportBtn).backgroundColor).substring(1), 0.6);
            tabIndicator.style.display = "none";
            tabsLoader = true;
        }
        tabSearchLinks.forEach(tab => tab.classList.remove("active"));
        // If the user opts for a xlsx import then show the xlsx content and hide the zip content.
        if(typeSwitch.checked == true) {
            importZipContent.style.display = "none";
            XLSXTypeSwitchDiv.style.display = "initial";
            XLSXTypeSwitch.checked == true ? importXLSXContentDetailed.forEach(p => p.style.display = "block") : importXLSXContentSimple.forEach(p => p.style.display = "block");
            databaseTabs.style.display = "block";
            document.querySelector("#databaseModal .indicator").style.display = "none";
            importXLSXContent.style.display = "block";
        }
        // If the user opts for a zip import then show the zip content and hide the xlsx content.
        else {
            importZipContent.style.display = "block";
            importXLSXContent.style.display = "none";
        }
        // Hide all record xlsx import messages by default.
        Array.from(document.getElementsByClassName("importDiv")).forEach(div => div.style.display = "none");
    });
    // Listen for a click event on the importSampleZIP button in the import section in order to open a folder to it.
    importSampleZIP.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("importSampleZIP");
    });
    // Listen for a click event on the importSampleSimpleXLSX button in the import section in order to open a folder to it.
    for(let y = 0; y < importSampleSimpleXLSX.length; y++) {
        importSampleSimpleXLSX[y].addEventListener("click", e => {
            e.preventDefault();
            ipcRenderer.send("importSampleSimpleXLSX");
        });
    }
    // Listen for a click event on the importSampleDetailedXLSX button in the import section in order to open a folder to it.
    for(let z = 0; z < importSampleDetailedXLSX.length; z++) {
        importSampleDetailedXLSX[z].addEventListener("click", e => {
            e.preventDefault();
            ipcRenderer.send("importSampleDetailedXLSX");
        });
    }
    // Listen for a click event on the database export button in order to process an export of the chosen library records.
    databaseExportBtn.addEventListener("click", e => {
        // Define the list of records which the user desires to export.
        const list = checkList();
        submissionList = checkAll.checked ? list.slice(1) : list;
        // Check that at least one record has been chosen by the user.
        if(submissionList.length > 0) {
            if(exportPath.value.length > 0) {
                ipcRenderer.send("checkPathValidity", exportPath.value);
            }
            else {
                M.toast({"html": "In order to export a valid path must be provided.", "classes": "rounded"});
            }
        }
        else {
            databaseModalExit.click();
            M.toast({"html": "In order to export at least one record has to be checked.", "classes": "rounded"});
        }
    });
    // React accordingly if a user provided export path is valid or not.
    ipcRenderer.on("checkPathResult", (event, chk) => {
        // If the export path is valid then proceed with the export process.
        if(chk == true) {
            document.getElementById("databasePreloader").style.display = "block";
            window.scrollTo(0, databaseModal.scrollHeight);
            ipcRenderer.send("databaseExport", [exportPath.value, submissionList, typeSwitch.checked == true ? "XLSX" : "ZIP", XLSXTypeSwitch.checked, document.getElementById("exportCheck").checked]);
            exportPath.value = "";
        }
        // Otherwise notify the user that the export path is not valid.
        else {
            M.toast({"html": "In order to export a valid path must be provided.", "classes": "rounded"});
        }
    });
    // Listen for a click event on the database import button in order to process an import of the chosen zip files.
    databaseImportBtn.addEventListener("click", e => {
        // Define the list of zip of files which the user desires to import.
        const pathArr = Array.from(document.getElementById("importZipFile").files);
        // Make sure that at least one zip file has been chosen by the user.
        if(pathArr.length > 0) {
            document.getElementById("databasePreloader").style.display = "block";
            window.scrollTo(0, databaseModal.scrollHeight);
            ipcRenderer.send("databaseImport", [pathArr.map(elem => elem.path), typeSwitch.checked == true ? "XLSX" : "ZIP", XLSXTypeSwitch.checked]);
        }
        else {
            M.toast({"html": "In order to import at least one file must be chosen.", "classes": "rounded"});
        }
    });
    // Ensure that the export option is the default view in the database modal.
    databaseExport.click();
    // Listen for a click event on the import fetch exit button in order to abandon the import process.
    importFetchExit.addEventListener("click", e => {
        ipcRenderer.send("importFetchDenial");
    });
    // Listen for a click event on the import fetch denial button in order to continue the import process without fetching details.
    importFetchNo.addEventListener("click", e => {
        ipcRenderer.send("importFetchConfirm", false);
    });
    // Listen for a click event on the import fetch confirmation button in order to continue the import process with fetching details.
    importFetchYes.addEventListener("click", e => {
        document.getElementById("importPreloader").style.visibility = "visible";
        ipcRenderer.send("importFetchConfirm", true);
    });
    // Listen for a change in the import data type to change the content accordingly.
    const originalSwitchBackground = "#00000061",
        newSwitchBackground = "#" + addAlpha(rgba2hex(getComputedStyle(databaseImportBtn).backgroundColor).substring(1), 0.6);
    typeSwitch.addEventListener("change", e => {
        const importZipContent = document.getElementById("importZipContent");
        // Proceed if the user chooses for xlsx file type.
        if(e.target.checked == true) {
            // Modify the coloring of the switch background.
            document.querySelector("#databaseSwitchDiv label input[type=checkbox]:checked+.lever").style.backgroundColor = newSwitchBackground;
            // Show the xlsx type switch.
            XLSXTypeSwitchDiv.style.display = "initial";
            // Proceed if dealing with data import.
            if(databaseImport.parentNode.classList.contains("active")) {
                // Display the default xlsx import message.
                databaseTabs.style.display = "block";
                importZipContent.style.display = "none";
                XLSXTypeSwitch.checked == true ? importXLSXContentDetailed.forEach(p => p.style.display = "block") : importXLSXContentSimple.forEach(p => p.style.display = "block");
                importXLSXContent.style.display = "block";
            }
            else {
                databaseCheckLabel.style.left = "90px";
            }
        }
        // Proceed if the user chooses for zip file type.
        else {
            // Hide the xlsx import tabs.
            databaseTabs.style.display = "none";
            // Modify the coloring of the switch background.
            document.querySelector("#databaseSwitchDiv label .lever").style.backgroundColor = originalSwitchBackground;
            // Hide the xlsx type switch.
            XLSXTypeSwitchDiv.style.display = "none";
            // Proceed if dealing with data import.
            if(databaseImport.parentNode.classList.contains("active")) {
                // Hide the xlsx content and show the zip content.
                importZipContent.style.display = "block";
                importXLSXContentSimple.forEach(p => p.style.display = "none");
                importXLSXContentDetailed.forEach(p => p.style.display = "none");
                importXLSXContent.style.display = "none";
            }
            else {
                databaseCheckLabel.style.left = "70px";
            }
        }
    });
    // Listen for a change in the xlsx import type to change the directions accordingly.
    XLSXTypeSwitch.addEventListener("change", e => {
        // Proceed if a user chooses a detailed xlsx import.
        if(e.target.checked == true) {
            // Modify the coloring of the switch background.
            document.querySelector("#XLSXTypeSwitchDiv label input[type=checkbox]:checked+.lever").style.backgroundColor = newSwitchBackground;
            // Hide the simple content and show the detailed content.
            importXLSXContentSimple.forEach(p => p.style.display = "none");
            importXLSXContentDetailed.forEach(p => p.style.display = "block");
        }
        // Proceed if a user chooses a simple xlsx import.
        else {
            // Modify the coloring of the switch background.
            document.querySelector("#XLSXTypeSwitchDiv label .lever").style.backgroundColor = originalSwitchBackground;
            // Show the simple content and hide the detailed content.
            importXLSXContentSimple.forEach(p => p.style.display = "block");
            importXLSXContentDetailed.forEach(p => p.style.display = "none");
        }
    });
    // Populate the list of years available for an anime season content search.
    const maxYear = new Date().getFullYear() + 1;
    for(let curYear = maxYear; curYear >= 1917; curYear--) {
        let curYearOption = document.createElement("option");
        curYearOption.value = curYear;
        curYearOption.textContent = curYear;
        animeSeasonSearchYear.append(curYearOption);
    }
    // Initialize all select tags.
    initSelect();
    // Initialize the floating action button on the page.
    initFAB("right");
    // Listen for a scroll to the bottom in order to load chunks, if available, for any type of content search.
    bottomScrollRequest(animeSearchBar, bookSearchBar, filmSearchBar, mangaSearchBar, showSearchBar);
});