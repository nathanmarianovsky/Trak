/*

BASIC DETAILS: This file handles all buttons on the addRecord.html page.

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
    // const addPhoneNumber = document.getElementById("addPhoneNumber"),
    const categoryAnime = document.getElementById("categoryAnime"),
        animeAddSeason = document.getElementById("animeAddSeason"),
        submit = document.getElementById("submit");

    // Define the relevant portions of the page that are in the rotation of record forms.
    const directionsTitle = document.getElementById("directionsTitle"),
        directionsText = document.getElementById("directionsText"),
        categoryDivs = document.getElementsByClassName("categoryDiv"),
        categoryAnimeDiv = document.getElementById("categoryAnimeDiv");

    // Listen for a click event on the categoryAnime button on the top bar to display the form corresponding to an anime record.
    categoryAnime.addEventListener("click", e => {
        e.preventDefault();
        if(directionsTitle.style.display != "none") {
            directionsTitle.style.display = "none";
            directionsText.style.display = "none";
        }
        else if(!categoryAnime.parentNode.classList.contains("active")) {
            categoryDivs.style.display = "none";
        }
        categoryAnimeDiv.style.display = "initial";
        categoryAnime.parentNode.classList.add("active");
    });

    // Listen for a click event on the animeAddSeason button on the anime associated modal to add a season listing.
    animeAddSeason.addEventListener("click", e => {
        // Remove the menu tooltips.
        let elemsTooltips = document.querySelectorAll(".tooltipped"),
            instancesTooltips = M.Tooltip.init(elemsTooltips);
        for(let j = 0; j < instancesTooltips.length; j++) { instancesTooltips[j].destroy(); }

        const animeList = document.getElementById("animeList");
        let itemLI = document.createElement("li"),
            itemDivHeader = document.createElement("div"),
            divName = document.createElement("div"),
            inputName = document.createElement("input"),
            labelName = document.createElement("label"),
            divStartDate = document.createElement("div"),
            inputStartDate = document.createElement("input"),
            labelStartDate = document.createElement("label"),
            divEndDate = document.createElement("div"),
            inputEndDate = document.createElement("input"),
            labelEndDate = document.createElement("label"),
            divStatus = document.createElement("div"),
            selectStatus = document.createElement("select"),
            option1Status = document.createElement("option"),
            option2Status = document.createElement("option"),
            option3Status = document.createElement("option"),
            option4Status = document.createElement("option"),
            option5Status = document.createElement("option"),
            option6Status = document.createElement("option"),
            labelStatus = document.createElement("label"),
            divAverageRating = document.createElement("div"),
            inputAverageRating = document.createElement("input"),
            labelAverageRating = document.createElement("label"),
            divAdd = document.createElement("div"),
            spanAdd = document.createElement("span"),
            iconAdd = document.createElement("i"),
            divDelete = document.createElement("div"),
            spanDelete = document.createElement("span"),
            iconDelete = document.createElement("i"),
            itemDivBody = document.createElement("div"),
            itemDivBodyForm = document.createElement("form");
        divName.classList.add("input-field");
        divName.style.width = "20%";
        inputName.classList.add("validate", "center");
        inputName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Name");
        inputName.setAttribute("type", "text");
        labelName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Name");
        labelName.textContent = "Season Name:";
        divStartDate.classList.add("input-field");
        divStartDate.style.width = "12.5%";
        divStartDate.style.marginLeft = "25px";
        inputStartDate.classList.add("validate", "center");
        inputStartDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Start");
        inputStartDate.setAttribute("type", "date");
        labelStartDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Start");
        labelStartDate.textContent = "Start Date:";
        divEndDate.classList.add("input-field");
        divEndDate.style.width = "12.5%";
        divEndDate.style.marginLeft = "25px";
        inputEndDate.classList.add("validate", "center");
        inputEndDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_End");
        inputEndDate.setAttribute("type", "date");
        labelEndDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_End");
        labelEndDate.textContent = "End Date:";

        divStatus.classList.add("input-field");
        divStatus.style.width = "15%";
        divStatus.style.marginLeft = "25px";
        option1Status.setAttribute("value", "");
        option1Status.textContent = "N/A";
        option2Status.setAttribute("value", "Watching");
        option2Status.textContent = "Watching";
        option3Status.setAttribute("value", "Completed");
        option3Status.textContent = "Completed";
        option4Status.setAttribute("value", "On-Hold");
        option4Status.textContent = "On-Hold";
        option5Status.setAttribute("value", "Dropped");
        option5Status.textContent = "Dropped";
        option6Status.setAttribute("value", "Plan To Watch");
        option6Status.textContent = "Plan To Watch";
        selectStatus.append(option1Status, option2Status, option3Status, option4Status, option5Status, option6Status);
        labelStatus.textContent = "Status:";

        divAverageRating.classList.add("input-field");
        divAverageRating.style.width = "15%";
        divAverageRating.style.marginLeft = "25px";
        inputAverageRating.classList.add("center");
        inputAverageRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
        inputAverageRating.setAttribute("type", "text");
        inputAverageRating.readOnly = "true";
        inputAverageRating.value = "N/A";
        labelAverageRating.classList.add("active");
        labelAverageRating.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
        labelAverageRating.textContent = "Average Rating:";

        divAdd.classList.add("input-field");
        divAdd.style.width = "5%";
        divAdd.style.marginLeft = "25px";
        spanAdd.classList.add("center", "tooltipped");
        spanAdd.setAttribute("data-position", "top");
        spanAdd.setAttribute("data-tooltip", "+ Episode");
        spanAdd.classList.add("modalContentButtons", "modalContentAdd");
        iconAdd.textContent = "add";
        iconAdd.classList.add("material-icons");
        iconAdd.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_AddEpisode")

        divDelete.classList.add("input-field");
        divDelete.style.width = "5%";
        divDelete.style.marginLeft = "25px";
        spanDelete.classList.add("center", "tooltipped");
        spanDelete.setAttribute("data-position", "top");
        spanDelete.setAttribute("data-tooltip", "Delete");
        spanDelete.classList.add("modalContentButtons", "modalContentDelete");
        iconDelete.textContent = "delete_sweep";
        iconDelete.classList.add("material-icons");
        // spanAverageRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Delete");
        // spanAverageRating.setAttribute("type", "text");
        // spanAverageRating.readOnly = "true";
        // spanAverageRating.value = "N/A";
        // labelAverageRating.classList.add("active");
        // labelAverageRating.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
        // labelAverageRating.textContent = "Average Rating";

        // <span class="solution_del edit-tooltipped" data-position="top" data-tooltip="Delete Box" data-tooltip-id="bba77981-1736-8185-2eb3-a7c53ba14d6c"><i class="material-icons del-box">delete_sweep</i></span>

        itemDivHeader.classList.add("collapsible-header");
        itemDivBody.classList.add("collapsible-body");
        divName.append(inputName, labelName);
        divStartDate.append(inputStartDate, labelStartDate);
        divEndDate.append(inputEndDate, labelEndDate);
        divAverageRating.append(inputAverageRating, labelAverageRating);
        spanAdd.append(iconAdd);
        divAdd.append(spanAdd);
        spanDelete.append(iconDelete);
        divDelete.append(spanDelete);
        divStatus.append(selectStatus, labelStatus);
        itemDivHeader.append(divName, divStartDate, divEndDate, divStatus, divAverageRating, divAdd, divDelete);



        // <form class="col s12" id="categoryAnimeForm2">
        //     <div class="genreRow">
        //         <label class="col s2">
        //             <input type="checkbox" id="animeGenreAction" class="filled-in"/>
        //             <span class="checkboxText">Action</span>
        //         </label>
        //         <label class="col s2">
        //             <input type="checkbox" id="animeGenreAdventure" class="filled-in"/>
        //             <span class="checkboxText">Adventure</span>
        //         </label>
        //         <label class="col s2">
        //             <input type="checkbox" id="animeGenreComedy" class="filled-in"/>
        //             <span class="checkboxText">Comedy</span>
        //         </label>
        //         <label class="col s2">
        //             <input type="checkbox" id="animeGenreCyberpunk" class="filled-in"/>
        //             <span class="checkboxText">Cyberpunk</span>
        //         </label>
        //         <label class="col s2">
        //             <input type="checkbox" id="animeGenreDemon" class="filled-in"/>
        //             <span class="checkboxText">Demon</span>
        //         </label>
        //         <label class="col s2">
        //             <input type="checkbox" id="animeGenreDrama" class="filled-in"/>
        //             <span class="checkboxText">Drama</span>
        //         </label>
        //     </div>

        // <div class="input-field col s4">
        //     <input id="animeName" type="text" class="validate center">
        //     <label for="animeName">English Name:</label>
        // </div>

        // <div class="input-field col s2">
        //     <select>
        //         <option value="" selected>N/A</option>
        //         <option value="0">0/10</option>
        //         <option value="1">1/10</option>
        //         <option value="2">2/10</option>
        //         <option value="3">3/10</option>
        //         <option value="4">4/10</option>
        //         <option value="5">5/10</option>
        //         <option value="6">6/10</option>
        //         <option value="7">7/10</option>
        //         <option value="8">8/10</option>
        //         <option value="9">9/10</option>
        //         <option value="10">10/10</option>
        //     </select>
        //     <label>Rating:</label>
        // </div>

        itemDivBodyForm.classList.add("col", "s12");
        itemDivBody.append(itemDivBodyForm);



        itemLI.append(itemDivHeader, itemDivBody);
        animeList.append(itemLI);

        inputName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
        inputStartDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
        inputEndDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
        // divAverageRating.addEventListener("click", e => e.target.parentNode.parentNode.children[1].style.display = "none");
        inputAverageRating.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
        iconDelete.addEventListener("click", e => { 
            let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
            setTimeout(() => delTarget.children[1].style.display = "none", 1);
            elemsTooltips = document.querySelectorAll(".tooltipped");
            instancesTooltips = M.Tooltip.init(elemsTooltips);
            for(let j = 0; j < instancesTooltips.length; j++) { instancesTooltips[j].destroy(); }
            delTarget.remove();
            instancesTooltips = M.Tooltip.init(elemsTooltips);
        });
        iconAdd.addEventListener("click", e => {
            // Remove the menu tooltips.
            let elemsTooltips = document.querySelectorAll(".tooltipped"),
                instancesTooltips = M.Tooltip.init(elemsTooltips);
            for(let j = 0; j < instancesTooltips.length; j++) { instancesTooltips[j].destroy(); }

            let addTarget = e.target.parentNode.parentNode.parentNode.parentNode,
                addTargetNum = e.target.id.split("_")[1];
            addTarget.classList.remove("active");
            let rowDiv = document.createElement("div"),
                seasonEpisodeNameDiv = document.createElement("span"),
                seasonEpisodeNameLabel = document.createElement("label"),
                seasonEpisodeNameInput = document.createElement("input"),
                seasonEpisodeLastWatchedDiv = document.createElement("div"),
                seasonEpisodeLastWatchedInput = document.createElement("input"),
                seasonEpisodeLastWatchedLabel = document.createElement("label"),
                seasonEpisodeRatingDiv = document.createElement("div"),
                seasonEpisodeRatingSelect = document.createElement("select"),
                seasonEpisodeRatingLabel = document.createElement("label"),
                seasonEpisodeRatingDefOption = document.createElement("option"),
                seasonEpisodeReviewDiv = document.createElement("span"),
                seasonEpisodeReviewLabel = document.createElement("label"),
                seasonEpisodeReviewInput = document.createElement("textarea"),
                seasonEpisodeDeleteDiv = document.createElement("div"),
                seasonEpisodeDeleteSpan = document.createElement("span"),
                seasonEpisodeDeleteIcon = document.createElement("i");
            seasonEpisodeNameInput.setAttribute("type", "text");
            seasonEpisodeNameInput.setAttribute("id", "li_" + addTargetNum + "_EpisodeName_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeNameInput.classList.add("validate", "center");
            seasonEpisodeNameLabel.setAttribute("for", "li_" + addTargetNum + "_EpisodeName_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeNameLabel.textContent = "Episode Name:";
            seasonEpisodeNameDiv.classList.add("input-field", "col", "s2");

            seasonEpisodeLastWatchedInput.classList.add("validate", "center");
            seasonEpisodeLastWatchedInput.setAttribute("id", "li_" + addTargetNum + "_EpisodeLastWatched_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeLastWatchedInput.setAttribute("type", "date");
            seasonEpisodeLastWatchedLabel.setAttribute("for", "li_" + addTargetNum + "_EpisodeLastWatched_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeLastWatchedLabel.textContent = "Last Watched:";
            seasonEpisodeLastWatchedDiv.classList.add("input-field", "col", "s2");

            seasonEpisodeRatingDefOption.setAttribute("value", "");
            seasonEpisodeRatingDefOption.setAttribute("selected", "true");
            seasonEpisodeRatingDefOption.textContent = "N/A";
            seasonEpisodeRatingSelect.append(seasonEpisodeRatingDefOption);
            for(let t = 0; t < 11; t++) {
                let newOption = document.createElement("option");
                newOption.setAttribute("value", t);
                newOption.textContent = t + "/10";
                seasonEpisodeRatingSelect.append(newOption);
            }
            seasonEpisodeRatingLabel.textContent = "Rating:";
            seasonEpisodeRatingDiv.classList.add("input-field", "col", "s2");

            seasonEpisodeReviewInput.setAttribute("id", "li_" + addTargetNum + "_EpisodeReview_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeReviewInput.classList.add("validate", "materialize-textarea");
            seasonEpisodeReviewLabel.setAttribute("for", "li_" + addTargetNum + "_EpisodeReview_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeReviewLabel.textContent = "Review:";
            seasonEpisodeReviewDiv.classList.add("input-field", "col", "s5");

            seasonEpisodeDeleteDiv.classList.add("input-field", "col", "s1", "modalContentEpisodeDelete");
            seasonEpisodeDeleteSpan.classList.add("center", "tooltipped");
            seasonEpisodeDeleteSpan.setAttribute("data-position", "top");
            seasonEpisodeDeleteSpan.setAttribute("data-tooltip", "Delete");
            seasonEpisodeDeleteSpan.classList.add("modalContentDelete");
            seasonEpisodeDeleteIcon.textContent = "delete";
            seasonEpisodeDeleteIcon.classList.add("material-icons");

            rowDiv.classList.add("row");
            seasonEpisodeNameDiv.append(seasonEpisodeNameInput, seasonEpisodeNameLabel);
            seasonEpisodeLastWatchedDiv.append(seasonEpisodeLastWatchedInput, seasonEpisodeLastWatchedLabel);
            seasonEpisodeRatingDiv.append(seasonEpisodeRatingSelect, seasonEpisodeRatingLabel);
            seasonEpisodeReviewDiv.append(seasonEpisodeReviewInput, seasonEpisodeReviewLabel);
            seasonEpisodeDeleteSpan.append(seasonEpisodeDeleteIcon);
            seasonEpisodeDeleteDiv.append(seasonEpisodeDeleteSpan);
            rowDiv.append(seasonEpisodeNameDiv, seasonEpisodeLastWatchedDiv, seasonEpisodeRatingDiv, seasonEpisodeReviewDiv, seasonEpisodeDeleteDiv);
            addTarget.children[1].children[0].append(rowDiv);

            // Initialize the select tags on the page.
            const elemsSelect = document.querySelectorAll("select"),
                instancesSelect = M.FormSelect.init(elemsSelect);
            // Initialize the menu tooltips.
            elemsTooltips = document.querySelectorAll(".tooltipped");
            instancesTooltips = M.Tooltip.init(elemsTooltips);

        });
        // labelAverageRating.addEventListener("click", e => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none");

        // Initialize the select tags on the page.
        const elemsSelect = document.querySelectorAll("select"),
            instancesSelect = M.FormSelect.init(elemsSelect);
        // Initialize the menu tooltips.
        elemsTooltips = document.querySelectorAll(".tooltipped");
        instancesTooltips = M.Tooltip.init(elemsTooltips);

        let observer = new MutationObserver(mutations => {
            let target = mutations[0].target.parentNode.parentNode.parentNode.parentNode;
            setTimeout(() => target.children[1].style.display = "none", 1);
            // target.children[1].style.display = "none";
        });

        // var target = selectStatus.parentNode.children[1];

        let lst = document.querySelectorAll(".modal .dropdown-content");
        for(let i = 0; i < lst.length; i++) {
            observer.observe(lst[i], { "attributes": true, "attributeFilter": ["style"] });
        }

        // console.log(lst);
        // observer.observe(selectStatus.parentNode.children[1], { "attributes": true, "attributeFilter": ["style"] });

        // let lst = selectStatus.parentNode.children[1].children;
        // for(let i = 0; i < lst.length; i++) {
        //     lst[i].addEventListener("click", e => e.target.parentNode.parentNode.parentNode.classList.add("active"));
        // }
    });

    // <div class="input-field col s2">
    //     <select>
    //         <option value="" selected>N/A</option>
    //         <option value="0">0/10</option>
    //         <option value="1">1/10</option>
    //         <option value="2">2/10</option>
    //         <option value="3">3/10</option>
    //         <option value="4">4/10</option>
    //         <option value="5">5/10</option>
    //         <option value="6">6/10</option>
    //         <option value="7">7/10</option>
    //         <option value="8">8/10</option>
    //         <option value="9">9/10</option>
    //         <option value="10">10/10</option>
    //     </select>
    //     <label>Rating:</label>
    // </div>

    // // Listen for a click event on the add button in order to add a phone number input.
    // addPhoneNumber.addEventListener("click", e => {
    //     e.preventDefault();
    //     const row = document.createElement("div"),
    //         div1 = document.createElement("div"),
    //         div2 = document.createElement("div"),
    //         div3 = document.createElement("div"),
    //         labelInput = document.createElement("input"),
    //         numberInput = document.createElement("input"),
    //         btnDiv = document.createElement("div"),
    //         btn = document.createElement("button"),
    //         labelLabel = document.createElement("label"),
    //         numberLabel = document.createElement("label"),
    //         delIcon = document.createElement("icon");
    //     row.classList.add("row");
    //     div1.classList.add("input-field", "col", "s6");
    //     div2.classList.add("input-field", "col", "s5");
    //     div3.classList.add("input-field", "col", "s1");
    //     const form = document.getElementById("contactsForm"),
    //         formRow = form.children[form.children.length - 1],
    //         newIdentifier = formRow.id != "contactFilesDiv" ? parseInt(formRow.children[0].children[0].children[0].id.split("-")[1]) + 1 : 0;
    //     row.setAttribute("id", "outerDiv-" + newIdentifier);
    //     labelInput.setAttribute("id", "phoneLabel_" + newIdentifier);
    //     labelInput.setAttribute("type", "text");
    //     labelInput.setAttribute("data-length", "25");
    //     labelInput.classList.add("validate", "center", "characterCounter");
    //     labelLabel.setAttribute("for", "phoneLabel_" + newIdentifier);
    //     labelLabel.textContent = "Phone # Label:";
    //     numberInput.setAttribute("id", "phoneNumber_" + newIdentifier);
    //     numberInput.setAttribute("type", "text");
    //     numberInput.setAttribute("data-length", "14");
    //     numberInput.classList.add("validate", "center", "characterCounter");
    //     numberLabel.setAttribute("for", "phoneNumber_" + newIdentifier);
    //     numberLabel.textContent = "Phone #:";
    //     btnDiv.classList.add("removePhoneButtonDiv");
    //     btn.setAttribute("type", "submit");
    //     btn.setAttribute("id", "remove-" + newIdentifier);
    //     btn.classList.add("btn", "waves-effect", "waves-light", "removePhoneButton");
    //     delIcon.classList.add("material-icons", "center", "removePhoneIcon");
    //     delIcon.setAttribute("id", "removePhoneIcon-" + newIdentifier);
    //     delIcon.textContent = "remove";
    //     btn.append(delIcon);
    //     btnDiv.append(btn);
    //     div1.append(labelInput, labelLabel);
    //     div2.append(numberInput, numberLabel);
    //     div3.append(btnDiv);
    //     row.append(div3, div1, div2);
    //     form.append(row);
    //     btn.addEventListener("click", e => {
    //         e.preventDefault();
    //         let num = parseInt(e.target.id.split("-")[1]);
    //         document.getElementById("outerDiv-" + num).remove();
    //         num++;
    //         while(document.getElementById("outerDiv-" + num) != null) {
    //             let newNum = num - 1;
    //             document.getElementById("outerDiv-" + num).setAttribute("id", "outerDiv-" + newNum);
    //             document.getElementById("remove-" + num).setAttribute("id", "remove-" + newNum);
    //             document.getElementById("removePhoneIcon-" + num).setAttribute("id", "removePhoneIcon-" + newNum);
    //             document.getElementById("phoneNumber_" + num).nextElementSibling.setAttribute("for", "phoneNumber_" + newNum);
    //             document.getElementById("phoneNumber_" + num).setAttribute("id", "phoneNumber_" + newNum);
    //             document.getElementById("phoneLabel_" + num).nextElementSibling.setAttribute("for", "phoneLabel_" + newNum);
    //             document.getElementById("phoneLabel_" + num).setAttribute("id", "phoneLabel_" + newNum);
    //             num++;
    //         }
    //     });
    //     numberInput.addEventListener("keydown", event => {
    //         phoneNumberFormatter(numberInput);
    //     });
    // });
    // // Listen for a click event on the submit button in order to create a new contact.
    // submit.addEventListener("click", e => {
    //     e.preventDefault();
    //     if(!checkInput()) {
    //         const firstName = document.getElementById("firstName").value,
    //             middleName = document.getElementById("middleName").value,
    //             lastName = document.getElementById("lastName").value;
    //         let phoneLabelArr = [],
    //             phoneNumberArr = [],
    //             iter = 0;
    //         while(document.getElementById("phoneNumber_" + iter) != null) {
    //             if(document.getElementById("phoneLabel_" + iter).value != "" && document.getElementById("phoneNumber_" + iter).value != "") {
    //                 phoneLabelArr.push(document.getElementById("phoneLabel_" + iter).value);
    //                 phoneNumberArr.push(document.getElementById("phoneNumber_" + iter).value);
    //             }
    //             iter++;
    //         }
    //         let submissionArr = [
    //             firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
    //             middleName.charAt(0).toUpperCase() + middleName.slice(1).toLowerCase(),
    //             lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase(),
    //             document.getElementById("birthday").value,
    //             document.getElementById("notes").value,
    //             Array.from(document.getElementById("contactsFormFiles").files).map(elem => elem.path),
    //             phoneLabelArr,
    //             phoneNumberArr
    //         ];
    //         if(document.getElementById("MAVTDate") != null) {
    //             submissionArr.push(
    //                 document.getElementById("MAVTDate").value,
    //                 document.getElementById("CPRDate").value,
    //                 document.getElementById("employmentDate").value,
    //                 document.getElementById("terminationDate").value,
    //                 document.getElementById("driverCheckbox").checked
    //             );
    //             if(document.getElementById("infoDiv") != null) {
    //                 submissionArr.push(document.getElementById("infoDiv").title);
    //                 ipcRenderer.send("updateDriverSubmission", submissionArr);
    //             }
    //             else {
    //                 ipcRenderer.send("addDriverSubmission", submissionArr);
    //             }
    //         }
    //         else {
    //             if(document.getElementById("infoDiv") != null) {
    //                 submissionArr.push(document.getElementById("infoDiv").title);
    //                 ipcRenderer.send("updateContactSubmission", submissionArr);
    //             }
    //             else {
    //                 ipcRenderer.send("addContactSubmission", submissionArr);
    //             }
    //         }
    //     }
    // });
});