const board = document.querySelector(".board");
const scoreDisplay = document.querySelector("#score");
const levelDisplay = document.querySelector("#level");
const pauseButton = document.querySelector("#pauseButton");
const nextPieceDisplay = document.querySelector(".next-piece");

const gameOverDisplay = document.querySelector("#gameOver");
const restartButton = document.querySelector("#restartButton");

const winScreen = document.querySelector("#winScreen");
const winRestartButton = document.querySelector("#winRestartButton");

let gameOver = false;
let paused = false;

const cells = [];
const locked = Array(200).fill(0);

let score = 0;
let level = 1;
let dropSpeed = 1000;

for (let i = 0; i < 200; i++) {
    const cell = document.createElement("div");

    cell.classList.add("cell");

    board.appendChild(cell);
    cells.push(cell);
}

const pieces = [
    {
        shape: [
            [1, 1, 1, 1]
        ],
        color: "cyan"
    },

    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: "yellow"
    },

    {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: "purple"
    },

    {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: "green"
    },

    {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: "orange"
    }
];

function getRandomPiece() {
    return pieces[Math.floor(Math.random() * pieces.length)];
}

let piece = getRandomPiece();
let nextPiece = getRandomPiece();

let pieceX = Math.floor(
    (10 - piece.shape[0].length) / 2
);

let pieceY = 0;

function drawPiece() {

    for (let i = 0; i < 200; i++) {

        cells[i].className = "cell";

        if (locked[i] !== 0) {

            cells[i].classList.add("filled");
            cells[i].classList.add(locked[i]);
        }
    }

    for (let y = 0; y < piece.shape.length; y++) {

        for (let x = 0; x < piece.shape[y].length; x++) {

            if (piece.shape[y][x] === 1) {

                const boardX = pieceX + x;
                const boardY = pieceY + y;

                if (
                    boardX >= 0 &&
                    boardX < 10 &&
                    boardY >= 0 &&
                    boardY < 20
                ) {

                    const cell =
                        cells[boardY * 10 + boardX];

                    cell.classList.add("filled");
                    cell.classList.add(piece.color);
                }
            }
        }
    }
}

function drawNextPiece() {

    nextPieceDisplay.innerHTML = "";

    const shape = nextPiece.shape;

    nextPieceDisplay.style.gridTemplateColumns =
        `repeat(${shape[0].length}, 20px)`;

    nextPieceDisplay.style.gridTemplateRows =
        `repeat(${shape.length}, 20px)`;

    for (let y = 0; y < shape.length; y++) {

        for (let x = 0; x < shape[y].length; x++) {

            const cell = document.createElement("div");

            if (shape[y][x] === 1) {

                cell.classList.add("preview-cell");
                cell.classList.add(nextPiece.color);

            } else {

                cell.classList.add("preview-empty");
            }

            nextPieceDisplay.appendChild(cell);
        }
    }
}

function canMove(dx, dy, shape) {

    for (let y = 0; y < shape.length; y++) {

        for (let x = 0; x < shape[y].length; x++) {

            if (shape[y][x] === 1) {

                const boardX = pieceX + x + dx;
                const boardY = pieceY + y + dy;

                if (boardX < 0 || boardX >= 10) {
                    return false;
                }

                if (boardY >= 20) {
                    return false;
                }

                if (
                    boardY >= 0 &&
                    locked[boardY * 10 + boardX] !== 0
                ) {
                    return false;
                }
            }
        }
    }

    return true;
}

function moveDown() {

    if (paused || gameOver) {
        return;
    }

    if (canMove(0, 1, piece.shape)) {

        pieceY++;

        drawPiece();

    } else {

        lockPiece();
    }
}

function lockPiece() {

    for (let y = 0; y < piece.shape.length; y++) {

        for (let x = 0; x < piece.shape[y].length; x++) {

            if (piece.shape[y][x] === 1) {

                const boardX = pieceX + x;
                const boardY = pieceY + y;

                if (
                    boardX >= 0 &&
                    boardX < 10 &&
                    boardY >= 0 &&
                    boardY < 20
                ) {

                    locked[boardY * 10 + boardX] =
                        piece.color;
                }
            }
        }
    }

    clearLines();

    if (gameOver) {
        return;
    }

    piece = nextPiece;
    nextPiece = getRandomPiece();

    pieceX = Math.floor(
        (10 - piece.shape[0].length) / 2
    );

    pieceY = 0;

    if (!canMove(0, 0, piece.shape)) {

        gameOver = true;
        paused = true;

        gameOverDisplay.style.display = "block";

        return;
    }

    drawNextPiece();
    drawPiece();
}

function clearLines() {

    let linesCleared = 0;

    for (let y = 19; y >= 0; y--) {

        let full = true;

        for (let x = 0; x < 10; x++) {

            if (locked[y * 10 + x] === 0) {

                full = false;

                break;
            }
        }

        if (full) {

            for (let row = y; row > 0; row--) {

                for (let x = 0; x < 10; x++) {

                    locked[row * 10 + x] =
                        locked[(row - 1) * 10 + x];
                }
            }

            for (let x = 0; x < 10; x++) {

                locked[x] = 0;
            }

            linesCleared++;

            y++;
        }
    }

    score += linesCleared * 10;

    scoreDisplay.textContent = score;

    nextlevel();

    if (score >= 1000) {

        gameOver = true;
        paused = true;

        winScreen.style.display = "block";

        return;
    }
}

function rotatePiece() {

    const rotated =
        piece.shape[0].map((_, index) =>
            piece.shape
                .map(row => row[index])
                .reverse()
        );

    if (canMove(0, 0, rotated)) {

        piece.shape = rotated;

        drawPiece();
    }
}

function nextlevel() {

    if (score >= 0 && score < 100) {

        level = 1;

    } else if (score >= 100 && score < 200) {

        level = 2;

    } else if (score >= 200 && score < 300) {

        level = 3;

    } else if (score >= 300 && score < 400) {

        level = 4;

    } else if (score >= 400 && score < 500) {

        level = 5;

    } else if (score >= 500 && score < 600) {

        level = 6;

    } else if (score >= 600 && score < 700) {

        level = 7;

    } else if (score >= 700 && score < 800) {

        level = 8;

    } else if (score >= 800 && score < 900) {

        level = 9;

    } else if (score >= 900 && score < 1000) {

        level = 10;

    } else {

        level = 10;
    }

    levelDisplay.textContent = level;

    dropSpeed = Math.max(
        120,
        1000 - ((level - 1) * 100)
    );

    restartGameLoop();
}

let gameLoop;

function restartGameLoop() {

    clearInterval(gameLoop);

    gameLoop = setInterval(() => {

        if (!paused && !gameOver) {

            moveDown();
        }

    }, dropSpeed);
}

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        if (gameOver) {
            return;
        }

        paused = !paused;

        if (paused) {

            pauseButton.textContent = "RESUME";

        } else {

            pauseButton.textContent = "PAUSE";
        }

        return;
    }

    if (paused || gameOver) {
        return;
    }

    if (event.key === "ArrowLeft") {

        if (canMove(-1, 0, piece.shape)) {

            pieceX--;

            drawPiece();
        }
    }

    if (event.key === "ArrowRight") {

        if (canMove(1, 0, piece.shape)) {

            pieceX++;

            drawPiece();
        }
    }

    if (event.key === "ArrowDown") {

        moveDown();
    }

    if (
        event.key === "Whitespace" ||
        event.key === "ArrowUp"
    ) {

        rotatePiece();
    }
});

pauseButton.addEventListener("click", () => {

    if (gameOver) {
        return;
    }

    paused = !paused;

    if (paused) {

        pauseButton.textContent = "RESUME";

    } else {

        pauseButton.textContent = "PAUSE";
    }
});

restartButton.addEventListener("click", () => {

    restartGame();
});

winRestartButton.addEventListener("click", () => {

    restartGame();
});

function restartGame() {

    for (let i = 0; i < 200; i++) {

        locked[i] = 0;
    }

    score = 0;
    level = 1;
    dropSpeed = 1000;

    scoreDisplay.textContent = "0";
    levelDisplay.textContent = "1";

    paused = false;
    gameOver = false;

    pauseButton.textContent = "PAUSE";

    gameOverDisplay.style.display = "none";
    winScreen.style.display = "none";

    piece = getRandomPiece();
    nextPiece = getRandomPiece();

    pieceX = Math.floor(
        (10 - piece.shape[0].length) / 2
    );

    pieceY = 0;

    drawNextPiece();
    drawPiece();

    restartGameLoop();
}

drawPiece();
drawNextPiece();
restartGameLoop();
