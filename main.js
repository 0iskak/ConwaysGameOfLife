const onRedraw = (size = document.getElementById('gridSize').value) => {
    if (started)
        return alert('Stop before redraw');

    size = Number(size);

    Grid.cells = new Array(size).fill(null)
        .map(() =>
            new Array(size).fill(null)
                .map(() => new Cell())
        );
}

class Grid {
    static #element = document.getElementById('grid');
    static #cells = [];

    static set cells(cells) {
        this.#cells = cells;

        this.#element.style.gridTemplateColumns = `repeat(${cells.length}, 1fr)`;
        this.#element.replaceChildren(...cells.flatMap(row => row.map(cell => cell.element)));

        for (let row = 0; row < cells.length; row++)
            for (let col = 0; col < cells[row].length; col++)
                cells[row][col].findNeighbors(row, col, cells);
    }

    static nextGeneration() {
        for (let row of this.#cells)
            for (let cell of row)
                cell.calculateNextGeneration();
        for (let row of this.#cells)
            for (let cell of row)
                cell.doNextGeneration();
    }
}

class Cell {
    #element = document.createElement('div');
    #alive = false;
    #neighbors = [];
    #futureAliveness = null;

    set alive(aliveness) {
        this.#alive = aliveness;

        if (aliveness)
            this.#element.classList.add('alive');
        else
            this.#element.classList.remove('alive');
    }

    constructor() {
        this.#element.classList.add('cell');

        this.#element.onmouseenter = (ev) => {
            if (started) return;
            this.#element.classList.add('hovered');

            if (ev.buttons !== 1) return;
            this.#element.onmousedown(undefined);
        }
        this.#element.onmouseleave = () => {
            if (started) return;
            this.#element.classList.remove('hovered');
        }
        this.#element.onmousedown = () => {
            if (started) return;

            this.alive = !this.#alive;
        }
    }

    get element() {
        return this.#element;
    }

    findNeighbors(cellRow, cellCol, cells) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let row = cellRow + i - 1;
                let col = cellCol + j - 1;

                if (row < 0)
                    row += cells.length;
                if (col < 0)
                    col += cells[i].length;

                if (row >= cells.length)
                    row -= cells.length;
                if (col >= cells[i].length)
                    col -= cells[i].length;

                if (row === cellRow && col === cellCol)
                    continue;

                this.#neighbors.push(cells[row][col]);
            }
        }
    }

    calculateNextGeneration() {
        const aliveNeighborsCount = this.#neighbors.filter(cell => cell.#alive).length;
        if (this.#alive)
            this.#futureAliveness = aliveNeighborsCount === 2 || aliveNeighborsCount === 3;
        else
            this.#futureAliveness = aliveNeighborsCount === 3;
    }

    doNextGeneration() {
        if (this.#futureAliveness == null)
            alert('Error occurred');

        this.alive = this.#futureAliveness;
        this.#futureAliveness = null;
    }
}


let timeout;
let started = false;
const startStopButton = document.getElementById('startStop');
const switchStartStopButton = () => {
    startStopButton.innerText = started ? 'Stop' : 'Start';
}
switchStartStopButton();

const onStartStop = () => {
    started = !started;
    switchStartStopButton();

    if (started) {
        const update = () => {
            Grid.nextGeneration();
            timeout = setTimeout(() => requestAnimationFrame(update), 100);
        }
        requestAnimationFrame(update);
    } else clearTimeout(timeout);
}