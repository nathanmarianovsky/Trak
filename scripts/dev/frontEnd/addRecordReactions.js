/*

BASIC DETAILS: This file handles all reactions on the addRecord.html page.

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



// // Display a notification whenever a contact already exists with a provided name.
// ipcRenderer.on("contactExists", (event, response) => {
//     M.toast({"html": "A contact with the name " + response + " already exists! You can remove or update this contact on a separate page.", "classes": "rounded"});
// });



// Display a notification if there was an issue in writing to the data file of a record.
ipcRenderer.on("addContactFailure", (event, response) => {
    M.toast({"html": "There was an issue in writing the data file associated to the " + response.replace("-", " ") + ".", "classes": "rounded"});
});



// // Display a notification if there was an issue in writing to the data file of a record.
// ipcRenderer.on("updateContactFailure", (event, response) => {
//     M.toast({"html": "There was an issue in updating the data file associated to the contact " + response.replace("-", " ") + ".", "classes": "rounded"});
// });



// Display a notification if there was an error in copying over a specific file.
ipcRenderer.on("copyFailure", (event, response) => {
    M.toast({"html": "There was an error in copying over the file " + response + ".", "classes": "rounded"});
});



// Display a notification for the successful addition of a record.
ipcRenderer.on("addRecordSuccess", (event, response) => {
    M.toast({"html": "The record associated to the " + response.replace("-", " ") + " has officially been created and saved. This window will now close!", "classes": "rounded"});
});



// // Display a notification for the successful update of a contact.
// ipcRenderer.on("updateContactSuccess", (event, response) => {
//     M.toast({"html": "The contact associated to the name " + response + " has officially been updated. This window will now close!", "classes": "rounded"});
// });



// // Display a notification if there was an error in renaming a contact's directory.
// ipcRenderer.on("contactFolderRenameFailure", (event, response) => {
//     M.toast({"html": "There was an error in renaming the contact folder " + response[0] + " to " + response[1] + ".", "classes": "rounded"});
// });



// Handle the load of record information on the update page.
ipcRenderer.on("recordUpdateInfo", (event, name) => {
    // Attempt to read a record's data file.
    fs.readFile(path.join(localPath, "Trak", "data", name, "data.json"), (err, file) => {
        // Display a notification if there was an error in reading the data file.
        if(err) {
            M.toast({"html": "There was an error opening the data file associated to the " + toastParse(name) + ".", "classes": "rounded"});
        }
        // If the file loaded without issues populate the page with a contact's information.
        else {
            const recordData = JSON.parse(file);
            console.log(recordData);
            if(recordData.category == "Anime") {
                document.getElementById("categoryAnime").click();
                document.getElementById("animeName").value = recordData.name;
                document.getElementById("animeJapaneseName").value = recordData.jname;
                document.getElementById("animeReview").value = recordData.review;
                document.getElementById("animeDirectors").value = recordData.directors;
                document.getElementById("animeProducers").value = recordData.producers;
                document.getElementById("animeWriters").value = recordData.writers;
                document.getElementById("animeMusicians").value = recordData.musicians;
                document.getElementById("animeStudio").value = recordData.studio;
                document.getElementById("animeLicense").value = recordData.license;
                for(let v = 0; v < recordData.genres[0].length; v++) {
                    document.getElementById("animeGenre" + recordData.genres[0][v]).checked = recordData.genres[1][v];
                }
                const rtngList = [];
                for(let u = 1; u < recordData.content.length + 1; u++) {
                    if(recordData.content[u-1].scenario == "Single") {
                        singleAddition();
                        document.getElementById("li_" + u + "_Single_Name").value = recordData.content[u-1].name;
                        document.getElementById("li_" + u + "_Single_Type").value = recordData.content[u-1].type;
                        document.getElementById("li_" + u + "_Single_Release").value = recordData.content[u-1].release;
                        document.getElementById("li_" + u + "_Single_LastWatched").value = recordData.content[u-1].watched;
                        document.getElementById("li_" + u + "_Single_Rating").value = recordData.content[u-1].rating;
                        document.getElementById("li_" + u + "_Single_Review").value = recordData.content[u-1].review;
                        rtngList.push(parseInt(recordData.content[u-1].rating));
                    }
                    else if(recordData.content[u-1].scenario == "Season") {
                        seasonAddition();
                        document.getElementById("li_" + u + "_Season_Name").value = recordData.content[u-1].name;
                        document.getElementById("li_" + u + "_Season_Start").value = recordData.content[u-1].start;
                        document.getElementById("li_" + u + "_Season_End").value = recordData.content[u-1].end;
                        document.getElementById("li_" + u + "_Season_Status").value = recordData.content[u-1].status;
                        let seasonRatingList = [];
                        for(let w = 1; w < recordData.content[u-1].episodes.length + 1; w++) {
                            episodeAddition(document.getElementById("li_" + u + "_Season"));
                            document.getElementById("li_" + u + "_Episode_Name_" + w).value = recordData.content[u-1].episodes[w-1].name;
                            document.getElementById("li_" + u + "_Episode_LastWatched_" + w).value = recordData.content[u-1].episodes[w-1].watched;
                            document.getElementById("li_" + u + "_Episode_Rating_" + w).value = recordData.content[u-1].episodes[w-1].rating;
                            document.getElementById("li_" + u + "_Episode_Review_" + w).value = recordData.content[u-1].episodes[w-1].review;
                            if(recordData.content[u-1].episodes[w-1].rating != "") { seasonRatingList.push(parseInt(recordData.content[u-1].episodes[w-1].rating)); }
                        }
                        let seasonRating = seasonRatingList.length > 0 ? (seasonRatingList.reduce((accum, cur) => accum + cur, 0) / seasonRatingList.length).toFixed(2) : "N/A";
                        document.getElementById("li_" + u + "_Season_AverageRating").value = seasonRating;
                        if(seasonRating != "N/A") { rtngList.push(parseFloat(seasonRating)); }
                        // Initialize the select tags.
                        initSelect();
                    }
                }
                console.log(rtngList);
                const animeRtng = rtngList.length > 0 ? (rtngList.reduce((accum, cur) => accum + cur, 0) / rtngList.length).toFixed(2) : "N/A";
                document.getElementById("animeRating").value = animeRtng;
            }



            // "directors": data[4],
            // "producers": data[5],
            // "writers": data[6],
            // "musicians": data[7],
            // "studio": data[8],
            // "license": data[9],
            // "genres": data[11],
            // "content": []



//             document.getElementById("firstName").value = contactData.firstName;
//             document.getElementById("firstName").parentNode.children[1].classList.add("active");
//             if(contactData.middleName != "") {
//                 document.getElementById("middleName").value = contactData.middleName;
//                 document.getElementById("middleName").parentNode.children[1].classList.add("active");
//             }
//             document.getElementById("lastName").value = contactData.lastName;
//             document.getElementById("lastName").parentNode.children[1].classList.add("active");
//             if(contactData.birthday != "") {
//                 document.getElementById("birthday").value = contactData.birthday;
//             }
//             if(contactData.notes != "") {
//                 document.getElementById("notes").value = contactData.notes;
//                 document.getElementById("notes").parentNode.children[1].classList.add("active");
//             }
//             for(let l = 0; l < contactData.phones.length; l++) {
//                 let outerDiv = document.createElement("div"),
//                     innerDiv1 = document.createElement("div"),
//                     innerDiv2 = document.createElement("div"),
//                     innerDiv3 = document.createElement("div"),
//                     input1 = document.createElement("input"),
//                     input2 = document.createElement("input"),
//                     btnDiv = document.createElement("div"),
//                     btn = document.createElement("button"),
//                     label1 = document.createElement("label"),
//                     label2 = document.createElement("label"),
//                     delIcon = document.createElement("icon");
//                 outerDiv.classList.add("row");
//                 outerDiv.setAttribute("id", "outerDiv-" + l);
//                 innerDiv1.classList.add("input-field", "col", "s6");
//                 innerDiv2.classList.add("input-field", "col", "s5");
//                 innerDiv3.classList.add("input-field", "col", "s1");
//                 input1.setAttribute("id", "phoneLabel_" + l);
//                 input1.setAttribute("type", "text");
//                 input1.setAttribute("data-length", "25");
//                 input1.classList.add("validate", "center", "characterCounter");
//                 input1.value = contactData.phones[l].label;
//                 input2.setAttribute("id", "phoneNumber_" + l);
//                 input2.setAttribute("type", "text");
//                 input2.setAttribute("data-length", "14");
//                 input2.classList.add("validate", "center", "characterCounter");
//                 input2.value = contactData.phones[l].number;
//                 btnDiv.classList.add("removePhoneButtonDiv");
//                 btn.setAttribute("type", "submit");
//                 btn.setAttribute("id", "remove-" + l);
//                 btn.classList.add("btn", "waves-effect", "waves-light", "removePhoneButton");
//                 label1.setAttribute("for", "phoneLabel_" + l);
//                 label1.textContent = "Phone # Label:";
//                 label1.classList.add("active");
//                 label2.setAttribute("for", "phoneNumber_" + l);
//                 label2.textContent = "Phone #:";
//                 label2.classList.add("active");
//                 delIcon.classList.add("material-icons", "center", "removePhoneIcon");
//                 delIcon.setAttribute("id", "removePhoneIcon-" + l);
//                 delIcon.textContent = "remove";
//                 innerDiv1.append(input1, label1);
//                 innerDiv2.append(input2, label2);
//                 btn.append(delIcon);
//                 btnDiv.append(btn);
//                 innerDiv3.append(btnDiv);
//                 outerDiv.append(innerDiv3, innerDiv1, innerDiv2);
//                 document.getElementById("contactsForm").append(outerDiv);
//                 btn.addEventListener("click", e => {
//                     e.preventDefault();
//                     let num = parseInt(e.target.id.split("-")[1]);
//                     document.getElementById("outerDiv-" + num).remove();
//                     num++;
//                     while(document.getElementById("outerDiv-" + num) != null) {
//                         let newNum = num - 1;
//                         document.getElementById("outerDiv-" + num).setAttribute("id", "outerDiv-" + newNum);
//                         document.getElementById("remove-" + num).setAttribute("id", "remove-" + newNum);
//                         document.getElementById("removePhoneIcon-" + num).setAttribute("id", "removePhoneIcon-" + newNum);
//                         document.getElementById("phoneNumber_" + num).nextElementSibling.setAttribute("for", "phoneNumber_" + newNum);
//                         document.getElementById("phoneNumber_" + num).setAttribute("id", "phoneNumber_" + newNum);
//                         document.getElementById("phoneLabel_" + num).nextElementSibling.setAttribute("for", "phoneLabel_" + newNum);
//                         document.getElementById("phoneLabel_" + num).setAttribute("id", "phoneLabel_" + newNum);
//                         num++;
//                     }
//                 });
//                 input2.addEventListener("keydown", event => {
//                     phoneNumberFormatter(input2);
//                 });
//             }
//             const oldInfo = document.createElement("div");
//             oldInfo.setAttribute("id", "infoDiv");
//             oldInfo.setAttribute("title", contactData.lastName + "_" + contactData.firstName);
//             oldInfo.style.display = "none";
//             document.body.append(oldInfo);
//             document.getElementById("pageTitle").textContent = "Update Contact";
//             document.title = "Update Contact";
        }
    });
});



// // Handle the load of contact information on the update page.
// ipcRenderer.on("contactUpdateInfo", (event, name) => {
//     // Attempt to read a contact's data file.
//     fs.readFile(path.join(localPath, "BatHaTransportationApps", "data", "contacts", name, "data.json"), (err, file) => {
//         // Display a notification if there was an error in reading the data file.
//         if(err) {
//             const nameArr = name.split("_");
//             M.toast({"html": "There was an error opening the data file associated to the contact with name " + nameArr[1] + " " + nameArr[0] + ".", "classes": "rounded"});
//         }
//         // If the file loaded without issues populate the page with a contact's information.
//         else {
//             const contactData = JSON.parse(file);
//             document.getElementById("firstName").value = contactData.firstName;
//             document.getElementById("firstName").parentNode.children[1].classList.add("active");
//             if(contactData.middleName != "") {
//                 document.getElementById("middleName").value = contactData.middleName;
//                 document.getElementById("middleName").parentNode.children[1].classList.add("active");
//             }
//             document.getElementById("lastName").value = contactData.lastName;
//             document.getElementById("lastName").parentNode.children[1].classList.add("active");
//             if(contactData.birthday != "") {
//                 document.getElementById("birthday").value = contactData.birthday;
//             }
//             if(contactData.notes != "") {
//                 document.getElementById("notes").value = contactData.notes;
//                 document.getElementById("notes").parentNode.children[1].classList.add("active");
//             }
//             for(let l = 0; l < contactData.phones.length; l++) {
//                 let outerDiv = document.createElement("div"),
//                     innerDiv1 = document.createElement("div"),
//                     innerDiv2 = document.createElement("div"),
//                     innerDiv3 = document.createElement("div"),
//                     input1 = document.createElement("input"),
//                     input2 = document.createElement("input"),
//                     btnDiv = document.createElement("div"),
//                     btn = document.createElement("button"),
//                     label1 = document.createElement("label"),
//                     label2 = document.createElement("label"),
//                     delIcon = document.createElement("icon");
//                 outerDiv.classList.add("row");
//                 outerDiv.setAttribute("id", "outerDiv-" + l);
//                 innerDiv1.classList.add("input-field", "col", "s6");
//                 innerDiv2.classList.add("input-field", "col", "s5");
//                 innerDiv3.classList.add("input-field", "col", "s1");
//                 input1.setAttribute("id", "phoneLabel_" + l);
//                 input1.setAttribute("type", "text");
//                 input1.setAttribute("data-length", "25");
//                 input1.classList.add("validate", "center", "characterCounter");
//                 input1.value = contactData.phones[l].label;
//                 input2.setAttribute("id", "phoneNumber_" + l);
//                 input2.setAttribute("type", "text");
//                 input2.setAttribute("data-length", "14");
//                 input2.classList.add("validate", "center", "characterCounter");
//                 input2.value = contactData.phones[l].number;
//                 btnDiv.classList.add("removePhoneButtonDiv");
//                 btn.setAttribute("type", "submit");
//                 btn.setAttribute("id", "remove-" + l);
//                 btn.classList.add("btn", "waves-effect", "waves-light", "removePhoneButton");
//                 label1.setAttribute("for", "phoneLabel_" + l);
//                 label1.textContent = "Phone # Label:";
//                 label1.classList.add("active");
//                 label2.setAttribute("for", "phoneNumber_" + l);
//                 label2.textContent = "Phone #:";
//                 label2.classList.add("active");
//                 delIcon.classList.add("material-icons", "center", "removePhoneIcon");
//                 delIcon.setAttribute("id", "removePhoneIcon-" + l);
//                 delIcon.textContent = "remove";
//                 innerDiv1.append(input1, label1);
//                 innerDiv2.append(input2, label2);
//                 btn.append(delIcon);
//                 btnDiv.append(btn);
//                 innerDiv3.append(btnDiv);
//                 outerDiv.append(innerDiv3, innerDiv1, innerDiv2);
//                 document.getElementById("contactsForm").append(outerDiv);
//                 btn.addEventListener("click", e => {
//                     e.preventDefault();
//                     let num = parseInt(e.target.id.split("-")[1]);
//                     document.getElementById("outerDiv-" + num).remove();
//                     num++;
//                     while(document.getElementById("outerDiv-" + num) != null) {
//                         let newNum = num - 1;
//                         document.getElementById("outerDiv-" + num).setAttribute("id", "outerDiv-" + newNum);
//                         document.getElementById("remove-" + num).setAttribute("id", "remove-" + newNum);
//                         document.getElementById("removePhoneIcon-" + num).setAttribute("id", "removePhoneIcon-" + newNum);
//                         document.getElementById("phoneNumber_" + num).nextElementSibling.setAttribute("for", "phoneNumber_" + newNum);
//                         document.getElementById("phoneNumber_" + num).setAttribute("id", "phoneNumber_" + newNum);
//                         document.getElementById("phoneLabel_" + num).nextElementSibling.setAttribute("for", "phoneLabel_" + newNum);
//                         document.getElementById("phoneLabel_" + num).setAttribute("id", "phoneLabel_" + newNum);
//                         num++;
//                     }
//                 });
//                 input2.addEventListener("keydown", event => {
//                     phoneNumberFormatter(input2);
//                 });
//             }
//             const oldInfo = document.createElement("div");
//             oldInfo.setAttribute("id", "infoDiv");
//             oldInfo.setAttribute("title", contactData.lastName + "_" + contactData.firstName);
//             oldInfo.style.display = "none";
//             document.body.append(oldInfo);
//             document.getElementById("pageTitle").textContent = "Update Contact";
//             document.title = "Update Contact";
//         }
//     });
// });







// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Initialize the select tags on the page.
    const elemsSelect = document.querySelectorAll("select"),
        instancesSelect = M.FormSelect.init(elemsSelect);
    // Initialize the floating action button on the page.
    const elemsFAB = document.querySelectorAll(".fixed-action-btn"),
        instancesFAB = M.FloatingActionButton.init(elemsFAB, { "hoverEnabled": false, "direction": "left" });
    // Initialize the menu tooltips.
    const elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
    // Initialize the modals.
    const elemsModal = document.querySelectorAll(".modal"),
        instancesModal = M.Modal.init(elemsModal);
    // Initialize the collapsible divs.
    const elemsCollapsible = document.querySelectorAll(".collapsible"),
        instancesCollapsible = M.Collapsible.init(elemsCollapsible);
    // Initialize the observer for the anime review.
    initAnimeReviewObserver();
});