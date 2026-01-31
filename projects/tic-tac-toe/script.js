const cellElements = document.querySelectorAll('.cell');
const board = document.getElementById('board');
const winningMessageElement = document.getElementById('winning-message');
const restartButton = document.getElementById('restart-btn');
const easyButton = document.getElementById('easy-btn');
const mediumButton = document.getElementById('medium-btn');
const hardButton = document.getElementById('hard-btn');
const pvpButton = document.getElementById('pvp-btn');
const go1Button = document.getElementById('go1-btn');
const go2Button = document.getElementById('go2-btn');
const winningMessageTextElement = document.querySelector('.data-winning-message-text');
const lineElement = document.getElementById('line');
const p1PieceElement = document.getElementById('p1-piece');
const p1ScoreElement = document.getElementById('p1-score');
const p2PieceElement = document.getElementById('p2-piece');
const p2ScoreElement = document.getElementById('p2-score');
const modeDropbtn = document.querySelector('.mode-drop-btn');
const orderDropbtn = document.querySelector('.order-drop-btn');
const dropDownContent = document.querySelector('.dropdown-content');
const confettiElement = document.getElementById('confetti');
let oTurn;
let goingFirst = true;
let randomAI = false;
let minimaxAI = false;
let minimaxAILimited = true;
let spots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let iter = 0;
let round = 0;
let match = 0;
let p1Score = 0;
let p2Score = 0;
let winInfo = {};
let animationPlay = false;
winningMessageElement.classList.add('show');


restartButton.addEventListener('click', startGame);
easyButton.addEventListener('click', () => { randomAI = true; minimaxAI = false; minimaxAILimited = false; modeDropbtn.innerText = 'vs Easy AI'; });
mediumButton.addEventListener('click', () => { randomAI = false; minimaxAI = false; minimaxAILimited = true;  modeDropbtn.innerText = 'vs Hard AI'; });
hardButton.addEventListener('click', () => { randomAI = false; minimaxAI = true; minimaxAILimited = false;  modeDropbtn.innerText = 'vs Impossible AI'; });
pvpButton.addEventListener('click', () => { randomAI = false; minimaxAI = false; minimaxAILimited = false;  modeDropbtn.innerText = 'vs Player'; });
go1Button.addEventListener('click', () => { goingFirst = true; orderDropbtn.innerText = 'Going First'; });
go2Button.addEventListener('click', () => { goingFirst = false; orderDropbtn.innerText = 'Going Second'; });

function startGame() {
  p1ScoreElement.innerText = `Score: ${p1Score}`;
  p2ScoreElement.innerText = `Score: ${p2Score}`;
  round = 0;
  spots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  oTurn = false;
  if (match < 1) restartButton.innerText = 'Restart'; // 1st match start, >1 restart
  match ++;
  lineElement.classList.remove(winInfo.line);
  confettiElement.classList.add('hide');
  winInfo = {};
  cellElements.forEach(cell => {
    cell.classList.remove('x');
    cell.classList.remove('o');
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick);
  })
  setBoardHoverClass();
  winningMessageElement.classList.remove('show');
  if (!goingFirst) {
    p1PieceElement.innerText = 'Player1: O';
    p2PieceElement.innerText = 'Player2: X';
    if (randomAI) {
      randomMove();
    } 
    else if (minimaxAI || minimaxAILimited) {
      minimaxMove();
    }
    setBoardHoverClass();
  }
}

function handleClick(e) {
  const cell = e.target.closest('.cell');
  if (cell.classList.contains('x') || cell.classList.contains('o') || animationPlay === true) return;
  animationPlay = true;
  const currentPlayer = oTurn ? 'o' : 'x';
  spots[cell.dataset.index] = currentPlayer;
  placeMark(cell, currentPlayer);
  round++;
  const gameOver = checkGameStatus();
  if (!gameOver && randomAI) {
    randomMove();
  } 
  else if (!gameOver && (minimaxAI || minimaxAILimited)) {
    minimaxMove();
  }
  setBoardHoverClass();
}

// check if current player status, stop the game if condition met, return boolean for game over
function checkGameStatus() {
  const currentPlayer = oTurn ? 'o' : 'x';
  winInfo = winning(spots, currentPlayer);
  if (winInfo.win) {
    lineElement.classList.add(winInfo.line);
    if ((currentPlayer === 'x' && goingFirst) || (currentPlayer === 'o' && !goingFirst)) p1Score ++;
    else p2Score ++;
    endGame(false);
    return true;
  } else if (round > 8) {
    endGame(true);
    return true;
  } else {
    swapTurns();
    return false;
  }
}

// display game result
function endGame(draw) {
  if (draw) {
    winningMessageTextElement.innerText = `Draw!`;
  } else if ((!oTurn && goingFirst && (randomAI || minimaxAILimited || minimaxAI)) ||
   (oTurn && !goingFirst && (randomAI || minimaxAILimited || minimaxAI))) {
    winningMessageTextElement.innerText = 'You Win!';
    confettiElement.classList.remove('hide');

  }else if (randomAI || minimaxAILimited || minimaxAI) {
    winningMessageTextElement.innerText = 'You Lose!';
  } else {
    winningMessageTextElement.innerText = `${(!oTurn && goingFirst) ||(oTurn && !goingFirst) ? "Player1" : "Player2"} Wins!`;
    confettiElement.classList.remove('hide');
  }
  p1ScoreElement.innerText = `Score: ${p1Score}`;
  p2ScoreElement.innerText = `Score: ${p2Score}`;
  animationPlay = true;
  setTimeout(() => { winningMessageElement.classList.add('show'); animationPlay = false; }, 1000);
}

// change the actual board
function placeMark(cell, currentClass) {
  if(cell) cell.classList.add(currentClass);
  setTimeout(() => { animationPlay = false; }, 1000);
}

function swapTurns() {
  oTurn = !oTurn;
}

// reset board
function setBoardHoverClass() {
  board.classList.remove('x');
  board.classList.remove('o');
  if (oTurn) {
    board.classList.add('o');
  } else {
    board.classList.add('x');
  }
}

// random move using RNG and available spots array
function randomMove() {
  const currentPlayer = oTurn ? 'o' : 'x';
  // another way: const availableCells = [...cellElements].filter(cell => !cell.classList.contains('x') && !cell.classList.contains('o'));
  const availableCells = availableSpots(spots);
  if (availableCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const randomCell = availableCells[randomIndex];
    spots[randomCell] = currentPlayer;
    placeMark(cellElements[randomCell], currentPlayer);
    round++;
    checkGameStatus();
  }
}

// look for available spots
function availableSpots(board) {
  return board.filter(cell => cell != 'x' && cell != 'o');
}

// check if passed player wins, return boolean for win and classname for strike line
function winning(board, player) {
  const status = {};
  status.win = true;
  if (board[0] == player && board[1] == player && board[2] == player) status.line = 'line-row1';
  else if (board[3] == player && board[4] == player && board[5] == player) status.line = 'line-row2';
  else if (board[6] == player && board[7] == player && board[8] == player) status.line = 'line-row3';
  else if (board[0] == player && board[3] == player && board[6] == player) status.line = 'line-column1';
  else if (board[1] == player && board[4] == player && board[7] == player) status.line = 'line-column2';
  else if (board[2] == player && board[5] == player && board[8] == player) status.line = 'line-column3';
  else if (board[0] == player && board[4] == player && board[8] == player) status.line = 'line-diagonal1';
  else if (board[2] == player && board[4] == player && board[6] == player) status.line = 'line-diagonal2';
  else status.win = false;
  return status;
}

// making move using minimax algorithm
function minimaxMove() {
  const currentClass = oTurn ? 'o' : 'x';
  let index = minimax(spots, currentClass, 0).index;
  spots[index] = currentClass;
  placeMark(cellElements[index], currentClass);
  round++;
  checkGameStatus();
}

// recursive funciton for minimax algorithm
function minimax(newboard, player, depth) {
  iter++;
  let availSpots = availableSpots(newboard);
  // base case 
  if (winning(newboard, 'x').win) {
    return {
      score: -10,
      depth: depth
    };
  } else if (winning(newboard, 'o').win) {
    return {
      score: 10,
      depth: depth
    };
  } else if (availSpots.length === 0 || (minimaxAILimited && depth > 2)) { // if hard ai, reduce calculation amount
    return {
      score: 0,
      depth: depth
    };
  } 
    
  // recursive call that look into every possible move
  let moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    let move = {};
    move.index = newboard[availSpots[i]];
    newboard[availSpots[i]] = player;

    if (player == 'o') {
      let g = minimax(newboard, 'x', depth + 1);
      move.score = g.score;
      move.depth = g.depth;
    } else {
      let g = minimax(newboard, 'o', depth + 1);
      move.score = g.score;
      move.depth = g.depth;
    }
    newboard[availSpots[i]] = move.index;
    moves.push(move);
  }


  let bestMove;
  let bestMoves = [];
  // o look for max score
  if (player === 'o') {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) { 
      if (moves[i].score > bestScore) { 
        bestScore = moves[i].score;
        bestMove = i;
        bestMoves = [];
        bestMoves.push(bestMove);
      } else if (moves[i].score === bestScore) {
        bestMoves.push(i);
      }
    }
  } else { // x look for min score
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
        bestMoves = [];
        bestMoves.push(bestMove);
      } else if (moves[i].score === bestScore) {
        bestMoves.push(i);
      }
    }
  }
  // if there are multiple best moves, pick one randomly instead of choose by order
  if (depth === 0 && bestMoves.length > 1) {
    bestMove = (Math.floor(Math.random() * bestMoves.length));
  }
  return moves[bestMove];
}