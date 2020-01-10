const snippetCount = 5;
// snippet objects of a song
let snippets = [];
// randomize snippets each time
let colorSchemes = [
    ["#FFC19B", "#D3FF11", "#FF731E", "#04C7FF", "#D536FF"],
    ["#c2c1c5", "#a00068", "#26f4ff", "#0057FF", "#ff8cf1"],
    ["FF3B01", "316CF4", "FF5FDB", "000000", "FDDFE1"]
];
let containerNumbers = [0, 1, 2, 3, 4];
let circleBox = document.querySelector("#circle-box");

const gameStates = {
    initial: "start",
    listening: "listening",
    ordering: "ordering"
};
let gameState = gameStates.initial;
//beginning gameState

const modal = document.querySelector("#modal");

function hideModal() {
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
    modal.style.opacity = "0";
}

modal.addEventListener("click", function() {
    switch (gameState) {
        case gameStates.initial:
            changeGameState(gameStates.listening);
            break;
        case gameStates.listening:
            break;
        case gameStates.listening:
            break;
        default:
            break;
    }
});

function changeGameState(state) {
    gameState = state;
    switch (gameState) {
        case gameStates.initial:
            break;
        case gameStates.listening:
            hideModal();
            initSong(0, 0);
            startTimer(10000, 10000, gameStates.ordering);
            break;
        case gameStates.ordering:
            startOrderPhase();
            break;
        default:
            break;
        }
}
//after clicking on modal



function initSong(songNumber, colorSchemeNumber) {
    // remove old song
    snippets = [];
    // randomize containers of circles
    containerNumbers.sort(() => {
        return Math.random() >= 0.5 ? 1 : -1;
    });

    createSnippets(songNumber, colorSchemeNumber);

    const bar = document.querySelector("#progress-bar");
    bar.addEventListener("click", startOrderPhase)
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

    setCirclePositionAndSize(circle, createRandomPositionAndSize(boxContainer));

    circle.addEventListener("click", bounce)
    function bounce() {
            if (!snippet.isPlaying) {
            // stop playing audio
            for (let i = 0; i < snippets.length; i++) {
                snippets[i].audio.load()
                snippets[i].isPlaying = false;
                snippets[i].circle.style.animationName = "none";
            };
            snippet.audio.play();
            snippet.isPlaying = true;
            circle.style.animationName = "bounce";
            circle.style.animationDuration = "0.5s";
            circle.style.animationIterationCount = "infinite";
        }
    };
    boxContainer.append(circle);
    setTimeout(function(){ circle.style.transform = "scale(1)"; }, 300);
}

function buildAudio(snippet) {
    snippet.audio.addEventListener("ended", stopBouncingandPlaying)
    function stopBouncingandPlaying() {
        snippet.isPlaying = false;
        snippet.circle.style.animationName = "none";
    };
    snippet.audio.setAttribute("src", snippet.path);
    snippet.audio.setAttribute("class", "audio");
}

function setCirclePositionAndSize(circle, positionAndSize) {
    //circle.style.left = positionAndSize.x + "px";
    //circle.style.top = positionAndSize.y + "px";
    circle.style.height = positionAndSize.durchmesser + "px";
    circle.style.width = positionAndSize.durchmesser + "px";
}

function createRandomPositionAndSize(boxContainer) {
    const bounding = boxContainer.getBoundingClientRect();
    // random durchmesser
    let durchmesser = Math.random() * bounding.width;
    while (durchmesser < bounding.width * 0.4) {
        durchmesser = Math.random() * bounding.width;
    }
    
    return { durchmesser: durchmesser};
}

function startTimer(initTime, alertTime, targetState) {
    document.querySelector("#progress").style.width = "100%";
    let remainingTime = initTime;
    var interval = setInterval(() => {
        remainingTime -= 1000;
        document.querySelector("#progress").style.width = (remainingTime / initTime) * 100 + "%";
        if (remainingTime === alertTime - 1000) {
            document.querySelector("#progress").style.transition.property = "background";
            document.querySelector("#progress").style.transition.duration = "0.5s";
            document.querySelector("#progress").style.background = "red";
        }
        if (remainingTime === 0) {
            clearInterval(interval);
            setTimeout(() => { changeGameState(targetState); }, 1000);
        }
    }, 1000);
}

function startOrderPhase() {
    let rowLeft = document.querySelector("#row-left");
    let rowRight = document.querySelector("#row-right");
    let circles = document.querySelectorAll(".circle");

    circleBox.style.flexDirection = "column";
    circleBox.style.flexWrap = "nowrap";

    rowLeft.style.height = "60%";
    rowLeft.style.width = "100%";
    //3 circles, each 20%

    rowRight.style.height = "40%";
    rowRight.style.width = "100%";
    //2 circles, each 20%

    circles.forEach(c => {
        c.style.width = "25vw";
        c.style.height = "25vw";
    });

}