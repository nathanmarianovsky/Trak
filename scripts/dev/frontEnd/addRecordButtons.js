/*

BASIC DETAILS: This file handles all buttons on the addRecord.html page.

   - checkInput: Check that all input provided for record creation/update is of proper length.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



/*

Check that all input provided for contact creation/update is of proper length.

*/
var checkInput = () => {
    let val = false,
        index = 0;
    if(document.getElementById("firstName").value == "") {
        M.toast({"html": "The first name is empty. Please adjust prior to proceeding!", "classes": "rounded"});
        val = true;
    }
    else if(document.getElementById("lastName").value == "") {
        M.toast({"html": "The last name is empty. Please adjust prior to proceeding!", "classes": "rounded"});
        val = true;
    }
    else if(document.getElementById("firstName").value.length > 25) {
        M.toast({"html": "The first name is too long. Please adjust prior to proceeding!", "classes": "rounded"});
        val = true;
    }
    else if(document.getElementById("lastName").value.length > 25) {
        M.toast({"html": "The last name is too long. Please adjust prior to proceeding!", "classes": "rounded"});
        val = true;
    }
    while(document.getElementById("phoneNumber_" + index) != null) {
        if(document.getElementById("phoneLabel_" + index).value.length > 25) {
            M.toast({"html": "There exists a phone number label that is too long. Please adjust prior to proceeding!", "classes": "rounded"});
            val = true;
            break;
        }
        else if(document.getElementById("phoneNumber_" + index).value.length != 14) {
            M.toast({"html": "There exists a phone number that is of the incorrect length. Please adjust prior to proceeding!", "classes": "rounded"});
            val = true;
            break;
        }
        index++;
    }
    return val;
};



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Define the buttons for all actions.
    // const addPhoneNumber = document.getElementById("addPhoneNumber"),
    const categoryAnime = document.getElementById("categoryAnime"),
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
        // document.getElementById("directionsTitle").style.display = "none";
        // document.getElementById("directionsText").style.display = "none";
        // document.getElementsByClassName("categoryDiv").style.display = "none";
        // document.getElementById("categoryAnimeDiv").style.display = "initial";
    });

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