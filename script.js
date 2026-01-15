document.head.appendChild(Object.assign(document.createElement("style"), { innerHTML: "#thumb,body{touch-action:none}body{user-select:none;height:100%}@media only screen and (max-device-width:480px){body{touch-action:manipulation}}.header,.rightbar{display:none!important}.rounded{border:none;border-radius:50%}[view|=hidden]{display:none}[view|=visible]{display:flex;justify-content:center;align-items:center}[float]{position:absolute}svg{fill:#ecf0f3cc;width:30px;height:auto}#kick svg{width:50%}" }));
document.querySelector('.gameframe').contentWindow.document.head.appendChild(Object.assign(document.createElement("style"), { innerHTML: ".room-view,.roomlist-view{height:100%;margin-top:0}.game-view>.top-section,.room-view{margin-top:0}.settings-view{width:100%;max-height:none}.game-view>[data-hook=popups]{background-color:#1a212585}.disconnected-view .dialog,.disconnected-view .room-view>.container{width:450px}.create-room-view>.dialog,.room-view.create-room-view>.container{max-width:450px;width:100%}body{background:#1a2125}[data-hook=leave-btn]{background:#c13535!important}.file-btn,[data-hook=rec-btn]{display:none!important}h1{text-align:center}.room-view>.container>.header-btns{bottom:0;right:10px;top:auto}.room-view>.container{max-width:none;max-height:max-content}.room-view{position:absolute;width:100%}.roomlist-view>.dialog{max-width:max-content;max-height:max-content}.game-state-view .bar>.scoreboard{display:flex;align-items:center;margin-right:50px}.chatbox-view{position:absolute;left:10px;margin:0;top:5px;width:10%;pointer-events:none;font-size:0.5rem;display:contents}.chatbox-view-contents{flex-direction:column-reverse;background:0 0;pointer-events:none}.chatbox-view-contents>.input{margin-bottom:10px;pointer-events:auto}.chatbox-view-contents>.log{flex-direction:column;pointer-events:none;overflow-y:scroll;scrollbar-width:none}.settings-view .section.selected{display:flex;align-items:center}.log-contents{display:flex;flex-direction:column-reverse;text-shadow:1px 1px 5px #000000cc}.fade-out{opacity:0;transition:opacity 10s ease-out}thead tr{display:table-row!important}svg{width: 1em}.input-options{position: absolute;width: 100%;height: 100%;z-index: 20;background-color: #1a2125;}" }));

if(!localStorage.getItem('low_latency_canvas') || localStorage.getItem('low_latency_canvas') == 1){
    localStorage.setItem('low_latency_canvas',0)
    location.reload();
}

///////////////////////////////////////// CONSTANTS /////////////////////////////////////////
let gameFrame = document.querySelector('.gameframe').contentWindow;
let body;

const tips = [
    "Haxball Mobile Mod V1.1",
    
];

const constrolsStyleBase = "#joystick,#kick{z-index:100;bottom:CONTROLS_MARGINvw}.neo{opacity:CONTROLS_OPACITY;background-color:#c2c2c255;box-shadow:6px 6px 10px 0 #a5abb133,-5px -5px 9px 0 #a5abb133;color:#dedede55;font-weight:bolder;font-size:0.1rem}.sizer{width:CONTROLS_WIDTH%;aspect-ratio: 1 / 1;}#joystick{left:CONTROLS_MARGIN%;overflow:visible}#thumb{width:40%;height:40%;background-color:#ecf0f3cc}#kick{right:CONTROLS_MARGIN%}button.neo:active{opacity:KICK_OPACITY}";

const countryFilterHandler = document.createElement('style');
const hideButtons = document.createElement('style');

hideButtons.innerHTML = "button{display:none}";
gameFrame.document.head.appendChild(hideButtons);

const controlsHandler = document.createElement('style');
const copyrightHandler = document.createElement("span");
const aboutHandler = document.createElement("div");
const inputOptionsHandler = document.createElement("div");
const config = { childList: true, subtree: true };

///////////////////////////////////////// VARIABLES /////////////////////////////////////////

let firstTime = true;
let canResetJoystick = true;
let lastMessage;
let joystick;
let kickButton;

///////////////////////////////////////// MAIN /////////////////////////////////////////

var checkLoaderInterval = setInterval(checkLoader, 1000);

function checkLoader() {
    if (!gameFrame.document.body.querySelector(".loader-view") && gameFrame.document.body.querySelector('.choose-nickname-view')) {
        clearInterval(checkLoaderInterval);
        body = gameFrame.document.body.children[0];
        init();
    }
}

function init() {
    document.querySelector('.rightbar').remove();
    document.querySelector('.header').remove();
    document.querySelector("meta[name=viewport]").setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0');

    setupCountryFilter();
    setupControls();
    setupCopyright(true);
    hideButtons.remove();

    const observer = new MutationObserver(function(mutationsList, observer) {
        try {
            updateUI();
            updatedChat();
        } catch {}
    });
    try { updateUI() } catch {}
    observer.observe(body, config);

    gameFrame.head.innerHTML += "<style>button{display: }</style>";
    aboutHandler.setAttribute('data-hook', 'about');
    aboutHandler.style.cssText = 'background: #1a2125; position: absolute; width: 100%; height: 100%; display: none; justify-content: center; flex-direction: column; align-items: center; margin: 0;';
    aboutHandler.innerHTML = '<div class="dialog basic-dialog" style="max-width: 50%;"><h1>About us</h1><p>Vixel Dev Haxball Mobile Port.</p><div class="buttons"><button data-hook="closeabout">Close</button></div></div>';

    body.parentNode.appendChild(aboutHandler);
    body.parentNode.querySelector('[data-hook="closeabout"]').addEventListener("click", function() {
        aboutHandler.style.display = 'none';
    });

    console.log("PAGE_LOADED")
}

///////////////////////////////////////// UTILS /////////////////////////////////////////

function insertAfter(e, n) { e.parentNode.insertBefore(n, e.nextSibling); }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getByDataHook(dataHook) { return body.querySelector('[data-hook="' + dataHook + '"]'); }

function openHaxballURL(uri) {
    const code = uri.replace(/^https?:\/\/(www\.)?haxball\.com\/play\?c=/, "");
    if (code.length > 0) { window.location.replace("https://www.haxball.com/play?c=" + code); }
}

function searchRoomlist() {
    const searchValue = getByDataHook('search').value.toLowerCase();
    const rows = body.querySelectorAll('tr');
    rows.forEach(row => {
        const spanName = row.querySelector('span[data-hook="name"]');
        if (spanName && !spanName.textContent.toLowerCase().includes(searchValue)) {
            row.style.display = 'none'
        } else { row.removeAttribute("style"); }
    });
}

///////////////////////////////////////// UI /////////////////////////////////////////

function setupCountryFilter() {
    countryFilterHandler.innerHTML = "";
    countryFilterHandler.name = "stylesheet";
    gameFrame.document.head.appendChild(countryFilterHandler);
}

function setupCopyright() {
    copyrightHandler.setAttribute("data-hook", "copyright");
    copyrightHandler.setAttribute("style", "text-align:center;position:absolute;bottom:15px;width:100%; display: block");
    copyrightHandler.innerHTML = '2024 Vixel Dev. Original game by Mario Carbajal (@basro)';
    document.body.appendChild(copyrightHandler);
}

function copyright(s) { copyrightHandler.style.display = s ? "block" : "none"; }

function updateUI() {
    if (body.querySelector('.choose-nickname-view')) {
        showControls(false);
        copyright(true);
    }
    if (body.querySelector('.roomlist-view')) {
        copyright(false);
        firstTime = true;
        if (!getByDataHook('search')) createSearchbar();
        if (!getByDataHook('url-room')) createURLButton();
        if (!getByDataHook('fil-cou')) createCountryButton();
        if (!getByDataHook('aboutbtn')) createAboutButton();
        if (!getByDataHook('discord-btn')) createDiscordButton(); // <--- Discord añadido
        if (getByDataHook('count')) getByDataHook('count').remove();
        showControls(false);
    } else if (body.querySelector('.create-room-view')) {
        copyright(true);
        showControls(false);
    } else if (body.querySelector('.settings-view')) {
        copyright(false);
        if (inputOptionsHandler.getAttribute("hidden") != null) { showControls(false); }
        if (!getByDataHook('newinputbtn')) createInputButton();
        canResetJoystick = true;
    } else if (body.querySelector('.game-view') && !body.querySelector('.room-view')) {
        if (canResetJoystick) {
            copyright(false);
            showControls(true);
            setupGameUI();
            resetJoystick();
            canResetJoystick = false;
        }
    } else if (body.querySelector('.game-view') && !body.querySelector('.room-link-view')) {
        copyright(false);
        showControls(false);
        if (!getByDataHook('store')) createStoreButton();
        setupGameUI();
        resetJoystick();
        canResetJoystick = true;
    }
}

function createInputButton() {
    var el = getByDataHook('inputbtn');
    var elClone = el.cloneNode(true);
    elClone.setAttribute("data-hook", "newinputbtn")
    elClone.addEventListener("click", function() {
        showControls(true);
        inputOptionsHandler.removeAttribute("hidden")
        resetJoystick();
    });
    el.parentNode.replaceChild(elClone, el);
}

function createStoreButton() {
    let store = document.createElement("button");
    store.setAttribute("data-hook", "store");
    store.innerHTML = '<svg viewBox="0 0 407 407" fill="white" style="height:0.85em; width: auto"><path d="M402 84 323 5c-3-3-7-5-12-5H17C8 0 0 8 0 17v373c0 9 8 17 17 17h373c9 0 17-8 17-17V96c0-4-2-9-5-12zm-101 80H67V39h234v125z"></path></svg> Store';
    insertAfter(getByDataHook('rec-btn'), store);
    store.addEventListener("click", function() { prefabMessage("/store") });
}

function createDiscordButton() {
    let button = document.createElement("button");
    button.setAttribute("data-hook", "discord-btn");
    button.innerHTML = '<i class="icon-link"></i><div>Discord</div>';
    button.style.backgroundColor = "#5865F2";
    button.style.color = "white";
    button.addEventListener("click", function() {
        window.open("https://discord.gg/TU_LINK", "_blank"); 
    });
    insertAfter(getByDataHook('aboutbtn'), button);
}

function createSearchbar() {
    const inputContainer = document.createElement("div");
    inputContainer.className = "label-input";
    inputContainer.innerHTML = '<label>Search a room:</label><input data-hook="search" type="text">';
    const dialog = body.querySelector("div.dialog");
    insertAfter(dialog.querySelector("p:nth-child(2)"), inputContainer);
    inputContainer.querySelector('input').addEventListener("input", searchRoomlist);
}

function createURLButton() {
    let button = document.createElement("button");
    button.setAttribute("data-hook", "url-room");
    button.innerHTML = '<i class="icon-link"></i><div>URL Room</div>';
    button.addEventListener("click", function() {
        let url = prompt("Paste URL:");
        if (url) openHaxballURL(url);
    });
    insertAfter(getByDataHook('join'), button);
}

function createAboutButton() {
    let button = document.createElement("button");
    button.setAttribute("data-hook", "aboutbtn");
    button.innerHTML = '<i class="icon-attention"></i><div>About us</div>';
    button.addEventListener("click", function() { aboutHandler.style.display = 'flex'; });
    insertAfter(body.querySelector(".buttons .spacer"), button)
}

function createCountryButton() {
    let button = document.createElement("span");
    button.setAttribute("class", "bool");
    button.setAttribute("data-hook", "fil-cou");
    button.innerHTML = 'Show other countries <i class="icon-ok"></i>';
    body.querySelector('.filters').prepend(button);
}

function setupGameUI() {
    const chat = body.querySelector('.chatbox-view');
    if (!getByDataHook('chat-toggle')) {
        const button = document.createElement("button");
        button.setAttribute("data-hook", "chat-toggle");
        button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 20 20"><path fill="white" d="M5.8 12.2V6H2C.9 6 0 6.9 0 8v6c0 1.1.9 2 2 2h1v3l3-3h5c1.1 0 2-.9 2-2v-1.82a.943.943 0 0 1-.2.021h-7zM18 1H9c-1.1 0-2 .9-2 2v8h7l3 3v-3h1c1.1 0 2-.899 2-2V3c0-1.1-.9-2-2-2"/></svg>';
        button.addEventListener("click", chatToggle);
        body.querySelector('.sound-button-container').parentNode.prepend(button);
    }
    if (firstTime) {
        body.querySelector('.drag').remove();
        getByDataHook('log-contents').firstChild.remove();
        const inputStyle = chat.querySelector('.input').style;
        inputStyle.display = 'none';
        chat.querySelector('input').addEventListener('blur', function() { inputStyle.display = 'none'; });
        firstTime = false;
    }
}

///////////////////////////////////////// CHAT /////////////////////////////////////////

function prefabMessage(msg) {
    const chatbox = body.querySelector('.chatbox-view');
    const input = chatbox.querySelector('input');
    input.focus();
    input.value = msg;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, keyCode: 13 }));
}

function updatedChat() {
    const log = getByDataHook('log');
    if (log && log.firstChild && lastMessage !== log.firstChild.lastChild) {
        const lastChild = log.firstChild.lastChild;
        lastChild.style.opacity = 1;
        setTimeout(() => { lastChild.classList.add("fade-out"); }, 500);
        lastMessage = lastChild;
    }
}

function chatToggle() {
    const chat = body.querySelector('.chatbox-view');
    const inputStyle = chat.querySelector('.input').style;
    inputStyle.display = inputStyle.display === 'none' ? 'block' : 'none';
    if (inputStyle.display == 'block') chat.querySelector('input').focus();
}

///////////////////////////////////////// CONTROLS /////////////////////////////////////////

function showControls(v) {
    if (joystick && kickButton) {
        joystick.setAttribute("view", v ? "visible" : "hidden");
        kickButton.setAttribute("view", v ? "visible" : "hidden");
    }
}

function updateControlsOptions(w, m, o, f = false) {
    localStorage.setItem("controls", JSON.stringify([w, m, o]));
    controlsHandler.innerHTML = constrolsStyleBase.replace(/CONTROLS_WIDTH/g, w.toString()).replace(/CONTROLS_MARGIN/g, m.toString()).replace(/CONTROLS_OPACITY/g, o.toString()).replace(/KICK_OPACITY/g, (o / 2).toString());
    resetJoystick();
}

function handleTouchStart(e) { isTouching = true; updateJoystick(e.touches[0]); }
function handleTouchMove(e) { if (isTouching) updateJoystick(e.touches[0]); }
function handleTouchEnd() { isTouching = false; resetJoystick(); }

function kick(str) { try { gameFrame.document.dispatchEvent(new KeyboardEvent(str, { code: "KeyX" })); } catch {} }

function updateJoystick(touch) {
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(joystick.clientWidth / 2, Math.hypot(deltaX, deltaY));
    const thumbX = centerX + distance * Math.cos(angle);
    const thumbY = centerY + distance * Math.sin(angle);
    thumb.style.left = thumbX - rect.left - thumb.clientWidth / 2 + 'px';
    thumb.style.top = thumbY - rect.top - thumb.clientHeight / 2 + 'px';
    const sector = Math.round(((angle + 2 * Math.PI) % (2 * Math.PI) * 180 / Math.PI) / 45) % 8;
    const dirs = ["d", "sd", "s", "sa", "a", "wa", "w", "wd"];
    emulateKeys(dirs[sector]);
}

function resetJoystick() {
    if (!joystick) return;
    thumb.style.left = joystick.clientWidth / 2 - thumb.clientWidth / 2 + 'px';
    thumb.style.top = joystick.clientHeight / 2 - thumb.clientHeight / 2 +
}