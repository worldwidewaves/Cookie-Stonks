// ==UserScript==
// @name         Cookie Stonks
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Cookie Clicker Stock Market Helper
// @author       Sui
// @match        https://orteil.dashnet.org/cookieclicker/
// @homepageURL  https://github.com/suicidejerk/Cookie-Stonks
// @supportURL   https://github.com/suicidejerk/Cookie-Stonks/issues
// @updateURL    https://raw.githubusercontent.com/suicidejerk/Cookie-Stonks/master/cookieStonks.user.js
// @icon         https://raw.githubusercontent.com/suicidejerk/Cookie-Stonks/main/cookieDollar.png
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

function getColorMode(value, owned, ownedMax, mode, gradient) {
    if (value > 100) { value = 100; }

    switch (gradient) {
        case "deal":
            value = parseInt(value * 1.28 + 50);
            if (parseInt(owned) > 0 && (mode == "positive1" || mode == "positive2")) {
                return [128 - value, 128, 128 - value];
            } else if (parseInt(owned) < parseInt(ownedMax) && (mode == "negative1" || mode == "negative2")) {
                return [128, 128 - value, 128];
            } else {
                return [128, 128, 128];
            }
            break;
        default:
            value = parseInt(value * 2.55);
            switch (mode) {
                case "positive1":
                    return [0, 255, value];
                case "positive2":
                    return [0, 255 - value, 255];
                case "negative1":
                    return [255, 255 - value, 0];
                case "negative2":
                    return [value * 20, 255, 0];
                default:
                    return [8, 8, 8];
            }
    }
}

function addRestingElement(ele, owned, ownedMax, id, bankLevel) {
    let restingElement = document.createElement("span");
    restingElement.innerText = "/$" + getRestingValue(id, bankLevel) + " ";
    restingElement.className = "bankSymbol";
    restingElement.id = "restingElement-" + id;
    restingElement.style = "font-weight:bold;color:#BBB;background:linear-gradient(to left,transparent,#333,#333,transparent);padding:0px;";

    ele.append(document.createElement('br'), ele.childNodes[0]);
    ele.append(restingElement, ele.childNodes[0]);

    let restingElementDiff = document.createElement("span");
    let difference = getRestingDifference(id, ele.innerText, bankLevel);
    restingElementDiff.innerText = difference + "%";
    restingElementDiff.className = "restingElement";
    restingElementDiff.id = "restingElementDiff-" + id;

    let bgR, bgG, bgB;
    if (difference >= 150) {
        [bgR, bgG, bgB] = getColorMode(difference - 100, owned, ownedMax, "positive2", gradient);
        restingElementDiff.style = "font-weight:bold;color:#FFF;background-color:rgb(" + bgR + "," + bgG + "," + bgB + ")";
    } else if (difference >= 100) {
        [bgR, bgG, bgB] = getColorMode(difference - 100, owned, ownedMax, "positive1", gradient);
        restingElementDiff.style = "font-weight:bold;color:#FFF;background-color:rgb(" + bgR + "," + bgG + "," + bgB + ")";
    } else if (difference >= 95) {
        [bgR, bgG, bgB] = getColorMode(100 - difference, owned, ownedMax, "negative2", gradient);
        restingElementDiff.style = "font-weight:bold;color:#FFF;background-color:rgb(" + bgR + "," + bgG + "," + bgB + ")";
    } else {
        [bgR, bgG, bgB] = getColorMode(100 - difference, owned, ownedMax, "negative1", gradient);
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
        let elemStockAmount = document.getElementById("bankGood-" + i + "-stock").innerText.replace(',', '');
        let elemStockMax = document.getElementById("bankGood-" + i + "-stockMax").innerText.replace('/', '').replace(',', '');
        addRestingElement(elemToEdit, elemStockAmount, elemStockMax, i, bankLevel);

        observer[i].observe(elemToEdit, config);
    }
};

var callbackMenu = function(mutationsList) {
    observerMenu.disconnect(); // So the change we make isn't detected as a mutation and we enter an infinite loop

    let menu = document.getElementById("bankBrokers").parentElement;

    // Gradient Button
    let buttonGradient = document.createElement("a");
    buttonGradient.className = "option";
    buttonGradient.innerText = "Switch Gradient";
    buttonGradient.id = "buttonDealGradient";
    buttonGradient.onclick = function(){
        if (gradient == "default") {
            gradient = "deal";
        } else {
            gradient = "default";
        }
        localStorage["gradient"] = gradient;

        for (let i = 0; i <= 15; i++) {
            document.getElementById("bankGood-" + i + "-val").innerHTML = document.getElementById("bankGood-" + i + "-val").innerHTML.replace(/<br>/g, '');
            document.getElementById("restingElement-" + i).remove();
        }
    };

    //menu.append(document.createElement('br'), menu.childNodes[0]);
    menu.append(buttonGradient, menu.childNodes[0]);

    observerMenu.observe(menu, config);
};

// Options for the observer (which mutations to observe)
var config = { attributes: true, childList: true };

// Mutation observers
var observer = [];

// Create an observer instance linked to the callback function
let observerMenu = new MutationObserver(callbackMenu);
let gradient = localStorage["gradient"] || "default";

(async function() {
    'use strict';

    let s = document.createElement('style');
    s.type = "text/css";
    s.innerHTML = styleSheet;
    (document.head || document.documentElement).appendChild(s);

    window.addEventListener('load', async function() {
        'use strict';

        await sleep(2000);

        // Add options menu
        let menu = document.getElementById("bankBrokers").parentElement;

        // Gradient Button
        let buttonGradient = document.createElement("a");
        buttonGradient.className = "option";
        buttonGradient.innerText = "Switch Gradient";
        buttonGradient.id = "buttonDealGradient";
        buttonGradient.onclick = function(){
            if (gradient == "default") {
                gradient = "deal";
            } else {
                gradient = "default";
            }
            localStorage["gradient"] = gradient;

            for (let i = 0; i <= 15; i++) {
                document.getElementById("bankGood-" + i + "-val").innerHTML = document.getElementById("bankGood-" + i + "-val").innerHTML.replace(/<br>/g, '');
                document.getElementById("restingElement-" + i).remove();
            }
        };

        //menu.append(document.createElement('br'), menu.childNodes[0]);
        menu.append(buttonGradient, menu.childNodes[0]);

        // Start observing the target node for configured mutations
        observerMenu.observe(menu, config);

        let bankLevel = parseInt(document.getElementById("productLevel5").innerText.replace("lvl ", ""));
        for (let i = 0; i <= 15; i++) {
            let elemToEdit = document.getElementById("bankGood-" + i + "-val");
            let elemStockAmount = document.getElementById("bankGood-" + i + "-stock").innerText.replace(',', '');
            let elemStockMax = document.getElementById("bankGood-" + i + "-stockMax").innerText.replace('/', '').replace(',', '');
            addRestingElement(elemToEdit, elemStockAmount, elemStockMax, i, bankLevel);

            // Create an observer instance linked to the callback function
            observer[i] = new MutationObserver(callback);

            // Start observing the target node for configured mutations
            observer[i].observe(elemToEdit, config);
        }

    });
})();
