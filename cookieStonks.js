// ==UserScript==
// @name         Cookie Stonks
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Cookie Clicker Stock Market Helper
// @author       Sui
// @match        https://orteil.dashnet.org/cookieclicker/
// @homepageURL  https://github.com/suicidejerk/Cookie-Stonks
// @supportURL   https://github.com/suicidejerk/Cookie-Stonks/issues
// @updateURL    https://raw.githubusercontent.com/suicidejerk/Cookie-Stonks/master/Letterboxd_Rating_Base_10.user.js
// @icon         https://raw.githubusercontent.com/suicidejerk/Cookie-Stonks/master/img/letterboxd_icon.png
// @license      MIT
// @grant        none
// ==/UserScript==

let styleSheet = `
.restingElement {
    background-color: grey;
    padding: 5px;
    font-size: 12px;
}
`;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRestingValue(id, bankLevel) {
    return (10 * (id + 1) + bankLevel - 1);
}

function getRestingDifference(id, value, bankLevel) {
    let restingValue = getRestingValue(id, bankLevel);
    let difference = (parseFloat(value.replace('$', '')) / restingValue * 100).toFixed(0);

    return difference;
}

function getColorMode(value, mode) {
    if (value > 100) { value = 100; }
    value = parseInt(value * 2.55);

    switch (mode) {
        case "positive1":
            return [0, 255, value];
        case "positive2":
            return [0, 255 - value, 255];
        case "negative1":
            return [255, 255 - value, 0];
        case "negative2":
            return [value*20, 255, 0];
        default:
            return [8, 8, 8];
    }
}

function addRestingElement(ele, id, bankLevel) {
    let restingElement = document.createElement("span");
    restingElement.innerText = "/$" + getRestingValue(id, bankLevel) + " ";
    restingElement.className = "bankSymbol";
    restingElement.style = "font-weight:bold;color:#BBB;background:linear-gradient(to left,transparent,#333,#333,transparent);";
    ele.append(document.createElement('br'), ele.childNodes[0]);
    ele.append(restingElement, ele.childNodes[0]);

    let restingElementDiff = document.createElement("span");
    let difference = getRestingDifference(id, ele.innerText, bankLevel);
    restingElementDiff.innerText = difference + "%";
    restingElementDiff.className = "restingElement";

    let bgR, bgG, bgB;
    if (difference >= 150) {
        [bgR, bgG, bgB] = getColorMode(difference - 100, "positive2");
        restingElementDiff.style = "font-weight:bold;color:#FFF;background-color:rgb(" + bgR + "," + bgG + "," + bgB + ")";
    } else if (difference >= 100) {
        [bgR, bgG, bgB] = getColorMode(difference - 100, "positive1");
        restingElementDiff.style = "font-weight:bold;color:#FFF;background-color:rgb(" + bgR + "," + bgG + "," + bgB + ")";
    } else if (difference >= 95) {
        [bgR, bgG, bgB] = getColorMode(100 - difference, "negative2");
        restingElementDiff.style = "font-weight:bold;color:#FFF;background-color:rgb(" + bgR + "," + bgG + "," + bgB + ")";
    } else {
        [bgR, bgG, bgB] = getColorMode(100 - difference, "negative1");
        restingElementDiff.style = "font-weight:bold;color:#FFF;background-color:rgb(" + bgR + "," + bgG + "," + bgB + ")";
    }

    restingElement.append(document.createElement('br'), restingElement.childNodes[0]);
    restingElement.append(restingElementDiff, restingElement.childNodes[0]);
}

// Callback function to execute when mutations are observed
var callback = function(mutationsList) {
    let bankLevel = parseInt(document.getElementById("productLevel5").innerText.replace("lvl ", ""));
    for (let i = 0; i <= 15; i++) {
        observer[i].disconnect(); // So the change we make isn't detected as a mutation and we enter an infinite loop

        let elemToEdit = document.getElementById("bankGood-" + i + "-val");
        addRestingElement(elemToEdit, i, bankLevel);

        observer[i].observe(elemToEdit, config);
    }
};

// Options for the observer (which mutations to observe)
var config = { attributes: true, childList: true };

// Mutation observers
var observer = [];

(async function() {
    'use strict';

    let s = document.createElement('style');
    s.type = "text/css";
    s.innerHTML = styleSheet;
    (document.head || document.documentElement).appendChild(s);

    window.addEventListener('load', async function() {
        'use strict';

        await sleep(2000);

        let bankLevel = parseInt(document.getElementById("productLevel5").innerText.replace("lvl ", ""));
        for (let i = 0; i <= 15; i++) {
            let elemToEdit = document.getElementById("bankGood-" + i + "-val");
            addRestingElement(elemToEdit, i, bankLevel);

             // Create an observer instance linked to the callback function
            observer[i] = new MutationObserver(callback);

            // Start observing the target node for configured mutations
            observer[i].observe(elemToEdit, config);
        }

    });
})();
