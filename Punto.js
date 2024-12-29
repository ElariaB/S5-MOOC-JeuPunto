function setValue(i, j, value) {
    const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
    if (cell) {
        cell.textContent = value;
    }
}

function getValue(i, j) {
    const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
    return cell ? (cell.textContent || null) : null;
}


function setColor(i, j, color) {
    const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
    if (cell) {
        cell.className = `cell ${color}`;
    }
}


function getColor(i, j) {
    const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
    if (cell) {
        const classes = cell.className.split(' ');
        return classes.find(cls => ['red', 'green', 'yellow', 'blue'].includes(cls)) || null;
    }
    return null;
}

function setListeners() {
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        cell.addEventListener('click', () => clickedOnCell(cell));
    });
}


let currentColor = 'red';
let currentNumber;
let currentPlayer = 0;
const players = ['red', 'green', 'yellow', 'blue'];
let gameOver = false;


function clickedOnCell(cell) {
    if (gameOver) return;
    
    const coordinates = getCoordinates(cell);
    const {i, j} = coordinates;
    

    if (isWithinLimits(i, j) && isCorrectPlacement(i, j, currentNumber)) {
        setValue(i, j, currentNumber);
        setColor(i, j, currentColor);
        
  
        if (hasWin(currentColor)) {
            gameOver = true;
            alert(`Le joueur ${currentColor} a gagné !`);
            return;
        }
        
    
        nextPlayer();
    } else {
        alert("Placement invalide !");
    }
}


function nextPlayer() {
    currentPlayer = (currentPlayer + 1) % players.length;
    currentColor = players[currentPlayer];
    

    let currentList;
    switch(currentColor) {
        case 'red': currentList = red_list; break;
        case 'green': currentList = green_list; break;
        case 'yellow': currentList = yellow_list; break;
        case 'blue': currentList = blue_list; break;
    }
    

    currentNumber = getAndRemoveRandomCard(currentList);
    
  
    const carteActuelle = document.getElementById('carteActuelle');
    carteActuelle.textContent = currentNumber;
    carteActuelle.style.color = currentColor;
}
function getCoordinates(cell) {
    return {
        i: parseInt(cell.dataset.row),
        j: parseInt(cell.dataset.col)
    };
}


function isEmpty(i, j) {
    return getValue(i, j) === null;
}


function isCorrectAdjacency(i, j) {

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    return directions.some(([di, dj]) => {
        const newI = i + di;
        const newJ = j + dj;
        return !isEmpty(newI, newJ);
    });
}

function isCorrectPlacement(i, j, value) {
 
    if (isEmpty(i, j)) {
    
        if (document.querySelectorAll('td[class*="red"], td[class*="green"], td[class*="yellow"], td[class*="blue"]').length === 0) {
            return i === 5 && j === 5;
        }
        return isCorrectAdjacency(i, j);
    }
    

    const currentValue = parseInt(getValue(i, j));
    return value > currentValue;
}

const red_list = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];
const green_list = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];
const yellow_list = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];
const blue_list = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];

function getAndRemoveRandomCard(list) {
    if (list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list.splice(randomIndex, 1)[0];
}

function hasWin(color) {
  
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j <= 7; j++) {
            let count = 0;
            for (let k = 0; k < 4; k++) {
                if (getColor(i, j + k) === color) count++;
            }
            if (count === 4) return true;
        }
    }


    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j < 11; j++) {
            let count = 0;
            for (let k = 0; k < 4; k++) {
                if (getColor(i + k, j) === color) count++;
            }
            if (count === 4) return true;
        }
    }


    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            let count = 0;
            for (let k = 0; k < 4; k++) {
                if (getColor(i + k, j + k) === color) count++;
            }
            if (count === 4) return true;
        }
    }

    for (let i = 3; i < 11; i++) {
        for (let j = 0; j <= 7; j++) {
            let count = 0;
            for (let k = 0; k < 4; k++) {
                if (getColor(i - k, j + k) === color) count++;
            }
            if (count === 4) return true;
        }
    }

    return false;
}


function isWithinLimits(i, j) {
  
    if (i < 0 || i >= 11 || j < 0 || j >= 11) {
        return false;
    }
    
  
    let minI = 11, maxI = -1, minJ = 11, maxJ = -1;
    let hasNonEmptyCell = false;

    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
            if (!isEmpty(row, col)) {
                hasNonEmptyCell = true;
                minI = Math.min(minI, row);
                maxI = Math.max(maxI, row);
                minJ = Math.min(minJ, col);
                maxJ = Math.max(maxJ, col);
            }
        }
    }

    if (!hasNonEmptyCell) {
        return i === 5 && j === 5;
    }

   
    const newMinI = Math.min(minI, i);
    const newMaxI = Math.max(maxI, i);
    const newMinJ = Math.min(minJ, j);
    const newMaxJ = Math.max(maxJ, j);

    return (newMaxI - newMinI <= 5) && (newMaxJ - newMinJ <= 5);
}


function main() {
    setListeners();
    

    nextPlayer();
    
    console.log("=== Jeu initialisé ===");
}

document.addEventListener('DOMContentLoaded', main);