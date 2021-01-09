const snippetCount = 5;
// snippet objects of a song
let snippets = [];
// song meta data
let songs = [{
    title: "I See Fire",
    artist: "Ed Sheeran",
    coverSrc: "./songs/song_0/cover.jpg"
}, {
    title: "Don't Stop The Music",
    artist: "Rihanna",
    coverSrc: "./songs/song_1/cover.png"
}, {
    title: "Hips Don't Lie",
    artist: "Shakira",
    coverSrc: "./songs/song_2/cover.jpg"
}, {
    title: "Maria Maria",
    artist: "Santana",
    coverSrc: "./songs/song_3/cover.jpg"
}, {
    title: "Don't Cha",
    artist: "The Pussycat Dolls ft. Buste Rhymes",
    coverSrc: "./songs/song_4/cover.jpg"
}];
// randomize snippets each time
let colorSchemes = [
    ["#defe47", "#ff00a0", "#ff124f", "#0600ff", "#fe75fe"],
    ["#0000ff", "#e501d4", "#04ffaf", "#4985ff", "#ff080e"],
    ["#08deea", "#fd8090", "#c4ffff", "#bb14dd", "#1261d1"],
    ["#fdd164", "#36fdc6", "#e083d2", "#bb6cde", "#bced89"],
    ["#fc5f58", "#f73c6b", "#c04f8a", "#ef8143", "#0a1ef7"]
];
let containerNumbers = [0, 1, 2, 3, 4];
let circleBox = document.querySelector("#circle-box");

const gameStates = {
    initial: "start",
    listening: "listening",
    ordering: "ordering",
    evaluate: "evaluate",
    songpresentation: "songpresentation"
};
let gameState;
let currentSong = 0;
let draggable;

const game = document.querySelector("#game");
const modal = document.querySelector("#modal");
const modalText = document.querySelector("#modaltext");
const infoBox = document.querySelector("#info-box");
let progressBar = document.querySelector("#progress-bar");
let skipIcon = document.querySelector("#skip-icon");
const skipInfo = document.querySelector("#next-song");
const progress = document.querySelector("#progress");
const sortBar = document.querySelector("#sort-bar");
const arrow = document.querySelector("#arrow");

const intro = document.querySelector("#intro");


setTimeout(() => {
    intro.style.opacity = 0;
}, 2000);

setTimeout(() => {
    game.style.opacity = 1;
}, 2500);

setTimeout(() => {
    intro.parentNode.removeChild(intro);
}, 2700);


changeGameState(gameStates.initial);

function hideModal() {
    setTimeout(() => {
        modal.style.display = "none";
        modalText.innerHTML = "";
    }, 300);
    modal.style.opacity = "0";
}

function displayModal(html) {
    modal.style.display = "block";
    modalText.innerHTML = html;
    setTimeout(() => modal.style.opacity = "1", 0);
}

modal.addEventListener("click", function() {
    openFullscreen();
    switch (gameState) {
        case gameStates.initial:
            changeGameState(gameStates.listening);
            break;
        case gameStates.ordering:
            arrow.removeEventListener("click", resetProgressBarToOrdering)
            arrow.addEventListener("click", resetProgressBarToEvaluate);
            orderPhase();
            break;
        case gameStates.listening:
            break;
        default:
            break;
    }
});

function resetProgressBarToEvaluate() {
    resetProgressBar(gameStates.evaluate)
}

function resetProgressBarToOrdering() {
    resetProgressBar(gameStates.ordering)
}

function makeEmoji() {
    var emoji = document.createElement("img");
    emoji.src = "./assets/sad-face.png";
    emoji.className = "emoji";
    game.appendChild(emoji);
    var xpos = Math.floor(Math.random() * 100);
    emoji.style.left = xpos + "vw";
    return emoji;
}


function changeGameState(state) {
    let prevState = gameState;
    gameState = state;
    progress.style.background = "linear-gradient(to right, #ebbd00, #f16e00)";
    switch (gameState) {
        case gameStates.initial:
            displayModal(`<div class="title"> Level ${currentSong + 1}</div>
            <div class="start-button">
            <div class="intro-circle-start"></div>
            <div class="title white">Start </div>
            </div>`);


            arrow.style.opacity = "0";

            break;
        case gameStates.listening:
            arrow.style.opacity = "1";
            skipInfo.innerHTML = "skip";
            skipInfo.style.opacity = "1";
            skipInfo.classList.add("skip");
            arrow.classList.remove("arrow-round");
            skipIcon.style.opacity = "0";
            arrow.addEventListener("click", resetProgressBarToOrdering);
            hideModal();
            initSong(currentSong, currentSong);
            startTimer(90000, 10000, gameStates.ordering);
            break;
        case gameStates.ordering:
            for (let i = 0; i < snippets.length; i++) {
                snippets[i].audio.load();
                snippets[i].isPlaying = false;
                snippets[i].circle.style.animationName = "none";
            };
            document.querySelectorAll(".circle").forEach(c => {
                c.style.transform = "scale(0)";
            });
            displayModal(`<div class = "title">Now drag </br> and drop </div> <div class="modaltext"> the circles in the fitting order on the numbers</div>`);
            progress.style.width = "100%";
            sortBar.style.display = "flex";
            break;
        case gameStates.evaluate:
            evaluate();
            break;
        default:
            break;
    }
}


function initSong(songNumber, colorSchemeNumber) {
    // remove old song
    snippets = [];

    // randomize containers of circles
    containerNumbers.sort(() => {
        return Math.random() >= 0.5 ? 1 : -1;
    });

    createSnippets(songNumber, colorSchemeNumber);
}

function createSnippets(songNumber, colorSchemeNumber) {
    // random colors
    colorSchemes[colorSchemeNumber].sort(() => {
        return Math.random() >= 0.5 ? 1 : -1;
    });
    //random container row
    circleBox.style.flexDirection = Math.random() >= 0.5 ? "row-reverse" : "row";
    // create snippet objects
    const boxContainers = document.querySelectorAll(".box-container");
    for (let i = 0; i < snippetCount; i++) {
        let circle = document.createElement("div");
        let audio = document.createElement("audio");
        const path = `./songs/song_${songNumber}/snippet_${i}.mp3`;
        snippets.push({
            order: i,
            path: path,
            circle: circle,
            audio: audio,
            isPlaying: false,
        });
        let snippet = snippets[i];
        buildCircle(circle, //id 
            colorSchemes[colorSchemeNumber][i], //color
            boxContainers[containerNumbers[i]], //order
            snippet); //
        buildAudio(snippet);
    }
}

function buildCircle(circle, color, boxContainer, snippet) {
    circle.setAttribute("class", "circle");
    circle.setAttribute("style", "background:" + color);
    setCircleSize(circle, createRandomDiameter(boxContainer));
    circle.addEventListener("click", bounce);

    boxContainer.append(circle);
    setTimeout(() => { circle.style.transform = "scale(1)"; }, Math.random() * 300);

    function bounce() {
        if (gameState == gameStates.listening) {
            if (!snippet.isPlaying) {
                // stop playing audio
                for (let i = 0; i < snippets.length; i++) {
                    snippets[i].audio.load();
                    snippets[i].isPlaying = false;
                    snippets[i].circle.style.animationName = "none";
                };
                snippet.audio.play();
                snippet.isPlaying = true;
                circle.style.animationName = "bounce";
                circle.style.animationDuration = "0.5s";
                circle.style.animationIterationCount = "infinite";
            }
        }
    }
}

function buildAudio(snippet) {
    snippet.audio.addEventListener("ended", function stopBouncingandPlaying() {
        snippet.isPlaying = false;
        snippet.circle.style.animationName = "none";
    });
    snippet.audio.setAttribute("src", snippet.path);
    snippet.audio.setAttribute("class", "audio");
}

function setCircleSize(circle, diameter) {
    circle.style.height = diameter + "px";
    circle.style.width = diameter + "px";
}

function createRandomDiameter(boxContainer) {
    const bounding = boxContainer.getBoundingClientRect();
    // random durchmesser
    let diameter = Math.random() * bounding.width;
    while (diameter < bounding.width * 0.4) {
        diameter = Math.random() * bounding.width;
    }
    return diameter;
}

let remainingTime;
let interval;

function startTimer(initTime, alertTime, targetState) {
    progress.style.width = "100%";
    remainingTime = initTime;
    interval = setInterval(() => {
        remainingTime -= 1000;
        document.querySelector("#progress").style.width = (remainingTime / initTime) * 100 + "%";
        if (remainingTime === alertTime - 1000) {
            progress.style.transition.property = "background";
            progress.style.transition.duration = "0.5s";
            progress.style.background = "red";
        }
        if (remainingTime === 0) {
            clearInterval(interval);
            setTimeout(() => { changeGameState(targetState); }, 1000);
        }
    }, 1000);
}



function orderPhase() {
    hideModal();
    document.querySelectorAll(".circle").forEach(c => c.style.transform = "scale(1)");
    let rowLeft = document.querySelector("#row-left");
    let rowRight = document.querySelector("#row-right");
    let circles = document.querySelectorAll(".circle");

    // change to new circle layout

    circleBox.classList.add("dice");

    circles.forEach(c => circleBox.appendChild(c));
    circleBox.removeChild(rowLeft);
    circleBox.removeChild(rowRight);

    circles.forEach(c => {
        c.style.width = "25vw";
        c.style.height = "25vw";
    });

    circles.forEach((c, i) => {
        c.style.transition = "none";
        c.style.position = "fixed";
        c.style.top = "0";
        c.style.left = "0";
        // pentagon
        switch (i) {
            case 0:
                c.style.transform = "translate3d(50vw, 20vh, 0px) translateX(-50%)";
                break;
            case 1:
                c.style.transform = "translate3d(5vw, 48vh, 0px) translateY(-50%)";
                break;
            case 2:
                c.style.transform = "translate3d(70vw, 48vh, 0px) translateY(-50%)";
                break;
            case 3:
                c.style.transform = "translate3d(20vw, 75vh, 0px) translateY(-50%)";
                break;
            case 4:
                c.style.transform = "translate3d(55vw, 75vh, 0px) translateY(-50%)";
                break;
            default:
                break;
        }
    });

    draggable = new Draggable.Draggable(document.querySelectorAll("#game"), {
        draggable: ".circle",
        delay: 0
    });

    let targetSortContainer;
    draggable.on("drag:move", e => {
        // draggable.js throws useless TypeErrors if you move out of the screen, thus we catch and ignore them
        try {
            let target = e.data.sensorEvent.data.target;
            if (target.getAttribute("class") == "sort-container") {
                targetSortContainer = target;
                target.append(draggable.mirror);
            } else {
                circleBox.append(draggable.mirror);
                targetSortContainer = null;
            }
        } catch (error) {
            // do nothing
        }
    });

    draggable.on("drag:stop", e => {
        let circle = e.data.source;
        if (targetSortContainer != null) {
            circle.style += "z-index: -1;";
            targetSortContainer.append(circle);
        } else {
            circleBox.append(circle);
            // use background as key (draggable.js somehow destroys the source/originalSource elements)
            let c = [...document.querySelectorAll('.circle')].filter(c => c.style.background == circle.style.background)[0];
            c.style.transform = draggable.mirror.style.transform;
        }
    });

    startTimer(30000, 5000, gameStates.evaluate);

}


function evaluate() {
    arrow.removeEventListener("click", resetProgressBarToEvaluate);
    clearInterval(interval);
    document.querySelector("#progress").style.width = "0px";
    draggable.destroy();
    try {
        if (verifyOrder()) {
            let song = songs[currentSong];
            displayInfoBox(renderSong(song.title, song.artist, song.coverSrc));
            let currentSnippet = 0;
            snippets.forEach(s => {
                s.audio.addEventListener("ended", () => {
                    if (++currentSnippet > 4) return;
                    playAudio(snippets[currentSnippet]);
                });
            });
            playAudio(snippets[0]);



            skipInfo.innerHTML = "next song";
            skipIcon.style.opacity = 1;
            skipInfo.classList.remove("skip");
            arrow.classList.add("arrow-round");
            skipInfo.style.opacity = 1;

            arrow.addEventListener("click", nextSong);
        } else {
            displayInfoBox(`<div style="text-align:center" class="correct">wrong order</div>`);
            snippets.map(s => s.circle).forEach(c => c.style.transform = "scale(0)");
            skipInfo.innerHTML = "try  </br> again";
            sortBar.style.display = "none";
            skipIcon.style.opacity = 1;
            skipInfo.classList.remove("skip");
            arrow.classList.add("arrow-round");
            skipInfo.style.opacity = 1;
            for (let i = 0; i < 16; i++) {
                setTimeout(() => {
                    let emoji = makeEmoji();
                    setTimeout(() => emoji.remove(), 2300);
                }, 200 * i);
            }
            arrow.addEventListener("click", nextSong);
        }
    } catch (e) {
        displayInfoBox("Time is up :(");
        snippets.map(s => s.circle).forEach(c => c.style.transform = "scale(0)")
        skipInfo.innerHTML = "try again";
        skipIcon.style.opacity = 1;
        skipInfo.classList.remove("skip");
        arrow.classList.add("arrow-round");
        skipInfo.style.opacity = 1;
        arrow.addEventListener("click", nextSong);
    }

    function playAudio(snippet) {
        let circle = snippet.circle;
        snippet.audio.play();
        snippet.isPlaying = true;
        circle.style.animationName = "riseAndShine";
        circle.style.animationDuration = "0.63s";
        circle.style.animationIterationCount = "infinite";
    }

    function renderSong(title, artist, coverSrc) {
        return `
        <div class="song-meta">
            <div class="correct title">Nice job!</div>
            <br>
            <div class="song-title"><h2>${title}</h2></div>
            <div class="artist"><h3>${artist}</h3></div>
            <div class="cover">
                <img src="${coverSrc}"/>
            </div>
        </div>`;

    }
}


function verifyOrder() {
    let correct = true;
    let containers = document.querySelectorAll(".sort-container");
    try {
        for (let i = 0; i < 5; i++) {
            if (containers[i].children[0].style.background != snippets[i].circle.style.background) {
                correct = false;
            }
        }
    } catch (e) {
        return false;
    }
    return correct;
}

function nextSong() {
    if (verifyOrder()) currentSong++;

    if (currentSong > 4) currentSong = 0;

    arrow.removeEventListener("click", nextSong);
    for (let i = 0; i < snippets.length; i++) {
        snippets[i].audio.load();
        snippets[i].isPlaying = false;
        snippets[i].circle.style.animationName = "none";
    };
    circleBox.classList.remove("dice");
    sortBar.style.display = "none";

    let leftRow = document.createElement("div");
    leftRow.setAttribute("id", "row-left");
    [document.createElement("div"), document.createElement("div"), document.createElement("div")]
    .forEach(b => {
        b.setAttribute("class", "box-left box-container");
        leftRow.appendChild(b);
    });
    let rightRow = document.createElement("div");
    rightRow.setAttribute("id", "row-right");
    [document.createElement("div"), document.createElement("div")].forEach(b => {
        b.setAttribute("class", "box-right box-container");
        rightRow.appendChild(b);
    });

    circleBox.appendChild(leftRow);
    circleBox.appendChild(rightRow);

    document.querySelectorAll(".circle").forEach(c => c.parentNode.removeChild(c));
    hideInfoBox();
    skipInfo.style.opacity = 0;
    arrow.style.opacity = 0;
    changeGameState(gameStates.initial);
}

function clearEventListeners(node) {
    return node.parentNode.replaceChild(node.cloneNode(true), node);
}

function displayInfoBox(html) {
    infoBox.innerHTML = html;
    infoBox.style.opacity = 1;
}

function hideInfoBox() {
    infoBox.style.opacity = 0;
}

function resetProgressBar(targetState) {
    clearInterval(interval);
    changeGameState(targetState);
}


// FULLSCREEN FROM https://www.w3schools.com/jsref/met_element_requestfullscreen.asp
/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    } else {

    }
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
}