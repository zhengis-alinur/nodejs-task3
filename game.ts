// функции для аутентификации хода компьютера
import { createHmac, randomBytes } from "crypto";
// функция для работы с вводом
const readline = require("readline-sync");
// класс для вывода таблицы в консоль
const Table = require("cli-table");

// enum с результатами игры
enum RESULTS {
	WIN = "Win",
	LOSE = "Lose",
	DRAW = "Draw",
}

// текстовые константы
const MENU_TITLE = "Available moves:";
const MENU_EXIT = "0 - Exit";
const MENU_HELP = "? - Help";
const ENTER_MOVE = "Enter your move: ";
const INVALID_INPUT = "Invalid input. Please enter a valid move number.";
const MOVENUMBER_ERROR = "Error: Please provide an odd number of distinct moves (>=3) or check if you provide the same move twice";
const GAMEINIT_EXPAMLE = "Example usage: ts-node game.ts Rock Paper Scissors";
const HELP_DESCRIPTION = "\n Help Menu \n The table is shown for user.";

// Класс с правилами игры
class MoveRules {
	private moves: string[];

	constructor(moves: string[]) {
		this.moves = moves;
	}

	// Функция определения победителя
	// Реализована на основе вычисления разницы(diff) индексов двух ходов (пользователя и компьютера)
	getWinner(playerMove: string, computerMove: string): RESULTS {
		const playerIndex = this.moves.indexOf(playerMove);
		const computerIndex = this.moves.indexOf(computerMove);

		const numMoves = this.moves.length;
		const half = numMoves / 2;
		const diff = playerIndex - computerIndex;
		const absoluteDiff = Math.abs(diff);

		if (playerIndex === computerIndex) {
			return RESULTS.DRAW;
		}
		if ((diff < 0 && absoluteDiff > half) || (diff > 0 && absoluteDiff < half)) {
			return RESULTS.WIN;
		} else {
			return RESULTS.LOSE;
		}
	}
}

// Класс генерации случайного ключа
class RandomGenerator {
	generateRandomKey(length: number): string {
		const randomBytesBuffer = randomBytes(length);
		return randomBytesBuffer.toString("hex");
	}
}

// Класс для генерации HMAC
class HMACGenerator {
	generateHMAC(key: string, data: string): string {
		const hmac = createHmac("sha256", key);
		hmac.update(data);
		return hmac.digest("hex");
	}
}

// Класс игры
class Game {
	private moves: string[];
	private moveRules: MoveRules;
	private randomGenerator: RandomGenerator;
	private hmacGenerator: HMACGenerator;
	private computerMove: string;
	private key: string;
	private hmac: string;

	constructor(moves: string[]) {
		this.moves = moves;
		this.moveRules = new MoveRules(moves);
		this.randomGenerator = new RandomGenerator();
		this.hmacGenerator = new HMACGenerator();
		this.computerMove = "";
		this.key = "";
		this.hmac = "";
	}

	// Функция показа основного меню игры
	private displayMenu() {
		console.log(MENU_TITLE);
		this.moves.forEach((move, index) => {
			console.log(`${index + 1} - ${move}`);
		});
		console.log(MENU_EXIT);
		console.log(MENU_HELP);

		console.log(`HMAC: ${this.hmac} \n`);
	}

	// Функция вывода меню помощи, реализованная с использованием библиотеки cli-table
	private displayHelp() {
		// Инициализация таблицы, 1-я строка (заголовок)
		const table = new Table({ head: ["PC\\USER", ...this.moves] });

		console.log(HELP_DESCRIPTION);

		// Пояснения для таблицы
		// Берем первые 3 хода для пояснения (должно быть как минимум три хода в игре)
		const move1 = this.moves[0];
		const move2 = this.moves[1];
		const move3 = this.moves[2];
		console.log(
			`If you choose ${move1} and the computer chooses ${move2}, you ${this.moveRules.getWinner(
				move1,
				move2
			)}`
		);
		console.log(
			`Or if you choose ${move1} and the computer chooses ${move3}, you ${this.moveRules.getWinner(
				move1,
				move3
			)}`
		);

		// Инициализация последующих строк
		// Каждая строка описывает ход компьютера и результат игры относительно хода пользователя
		this.moves.forEach((pcMove) => {
			const wins: RESULTS[] = [];
			this.moves.forEach((userMove) => {
				wins.push(this.moveRules.getWinner(userMove, pcMove));
			});
			table.push({ [pcMove]: wins });
		});
		console.log(table.toString());
	}

	// функция считывания хода пользователя
	private getPlayerMove(): string {
		const input = readline.question(ENTER_MOVE);
		const moveIndex = parseInt(input);
		// обработка неправильного ввода
		if (input !== "?" && (isNaN(moveIndex) || moveIndex < 0 || moveIndex > this.moves.length)) {
			console.log(INVALID_INPUT);
			return this.getPlayerMove();
		}
		// Вывод меню помощи
		if (input === "?") {
			this.displayHelp();
			this.displayMenu();
			return this.getPlayerMove();
		}
		// Выход из игры
		if (moveIndex === 0) {
			process.exit();
		}

		return this.moves[moveIndex - 1];
	}

	// функция симуляции хода компьютера
	private getRandomMove(): string {
		const randomIndex = Math.floor(Math.random() * this.moves.length);
		return this.moves[randomIndex];
	}

	// функция генерации случайного 256-битного ключа
	private generateKey(): void {
		this.key = this.randomGenerator.generateRandomKey(32);
	}

	// функция вычисления HMAC
	private calculateHMAC(move: string): string {
		return this.hmacGenerator.generateHMAC(this.key, move);
	}

	// функция вывода результатов игры
	private printResult(playerMove: string, result: RESULTS) {
		console.log(`Player move: ${playerMove}`);
		console.log(`Computer move: ${this.computerMove}`);
		if (result === RESULTS.DRAW) {
			console.log('Draw!');
		} else {
			console.log(`${result === RESULTS.WIN ? 'You' : 'Computer'}  win!`);
		}
		console.log(`HMAC Key: ${this.key}`);
	}

	// функция имплементации игрового процесса
	playGame(): void {
		// Генерация ключа (key), случайного хода компьютера (message) и HMAC на основе данных message и key
		this.generateKey(); //key
		this.computerMove = this.getRandomMove(); //message
		this.hmac = this.calculateHMAC(this.computerMove);

		// Предлагаем пользователю сделать свой ход, изначально показав ему меню
		this.displayMenu();
		const playerMove = this.getPlayerMove();

		// Определение победителя
		const result = this.moveRules.getWinner(playerMove, this.computerMove);

		// Вывод результатов игры с исходным ключом (key)
		this.printResult(playerMove, result);
	}
}

function main() {
	// Считываем аргументы в качестве ходов
	const args = process.argv.slice(2);

	// В случае неправильной инициализации, останавливаем игру и сообщаем об ошибке
	if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
		console.log(MOVENUMBER_ERROR);
		console.log(GAMEINIT_EXPAMLE);
		return;
	}

	// Инициализируем игру с переданными параметрами
	const moves = args.map((arg) => arg.trim());
	const game = new Game(moves);
	game.playGame();
}

main();
