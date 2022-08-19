import { Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { LetterWrapper } from 'src/app/models/LetterWrapper';
import { WORDS } from './words';

@Component({
  selector: 'app-game-area',
  templateUrl: './game-area.component.html',
  styleUrls: ['./game-area.component.scss']
})
export class GameAreaComponent implements OnInit {
  // STATUS
  readonly RIGHT_PLACE = 0;
  readonly WRONG_PLACE = 1;
  readonly WRONG_LETTER = 2
  readonly EMPTY = 3;

  // Keyboard key codes
  readonly ENTER_KEY_CODE = 13;
  readonly BACKSPACE_KEY_CODE = 8;

  readonly VALID_LETTER_INPUT = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  readonly WORD_LENGTH = 5;
  readonly NUM_COLS = this.WORD_LENGTH;
  readonly NUM_ROWS = 6;

  winningWord = '';

  grid: LetterWrapper[][] = [];

  currentRow = 0;
  currentCol = 0;
  playerLost = false;
  playerWin = false;
  errorMessage = '';

  highlightInterval: any;

  constructor() { }

  ngOnInit(): void {
    this.listenToKeyboard();
    this.pickWinningWord();
    this.prefillGrid();
  }

  prefillGrid() {
    for (let i = 0; i < this.NUM_ROWS; i++) {
      this.grid.push([]);
      for (let j = 0; j < this.NUM_COLS; j++) {
        this.grid[i].push({ letter: '', status: this.EMPTY });
      }
    }
  }

  listenToKeyboard() {
    fromEvent(document, 'keydown').subscribe((event: any) => {
      if (this.isGameDone())
        return;

      const key: string = event.key?.toUpperCase();

      if (event.keyCode === this.ENTER_KEY_CODE)
        this.verifyWord();
      else if (event.keyCode === this.BACKSPACE_KEY_CODE)
        this.removeLetter();
      else if (this.VALID_LETTER_INPUT.includes(key))
        this.addLetter(key);
    });
  }

  verifyWord(): void {
    const word = this.getCurrentWord();
    
    if (!this.isValidWord(word))
     return this.showErrorMessage('Not in word list');

    const statusUpdates: number[] = [];

    for (let i = 0; i < word.length; i++) {
      if (word[i] === this.winningWord[i]) 
        statusUpdates.push(this.RIGHT_PLACE);
      else if (this.winningWord.includes(word[i]))
        statusUpdates.push(this.WRONG_PLACE);
      else 
        statusUpdates.push(this.WRONG_LETTER);
    }

    this.highlightResponse(statusUpdates, () => {
      if (this.isWinningWord(word)) {
        setTimeout(() => this.playerWin = true, 300);
        return;
      }
  
      this.moveToNextRow();
    });
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 2000);
  }

  moveToNextRow() {
    this.currentRow += 1;
    this.currentCol = 0;

    if (this.currentRow === this.NUM_ROWS)
      this.playerLost = true;
  }

  getCurrentWord(): string {
    let word = this.grid[this.currentRow].reduce(
      (word, letterW) => word += letterW.letter, '');
    return word.trim().toLowerCase();
  }

  addLetter(letter: string) {
    if (!letter)
      return;

    if (this.currentCol < this.NUM_COLS) {
      this.grid[this.currentRow][this.currentCol].letter = letter;
      this.currentCol = this.currentCol + 1;
    }
  }

  removeLetter() {
    this.currentCol = Math.max(0, this.currentCol - 1);
    this.grid[this.currentRow][this.currentCol].letter = '';``
  }

  pickWinningWord() {
    const length = WORDS.length - 1;
    const randomIndex = Math.round(Math.random() * length);
    this.winningWord = WORDS[randomIndex];
    console.log(this.winningWord);
  }

  isWinningWord(word: string): boolean {
    return word === this.winningWord;
  }

  isValidWord(word: string = ''): boolean {
    return WORDS.includes(word);
  }

  isWordLengthValid(word: string = ''): boolean {
    return word.length === this.WORD_LENGTH;
  }

  isCurrentGuessCompleteWord() {
    return this.currentCol === this.NUM_COLS - 1;
  }

  isGameDone(): boolean {
    return this.playerLost || this.playerWin;
  }

  highlightResponse(statusUpdates: number[], callback: () => void) {
    let col = 0;

    this.highlightInterval = setInterval(() => {
      this.grid[this.currentRow][col].status = statusUpdates[col];
      col++;

      if (col === this.NUM_COLS) {
        clearInterval(this.highlightInterval);
        callback();
      }
    }, 200);
  }
}

