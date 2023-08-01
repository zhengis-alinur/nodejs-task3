// Function for input handling
const readline = require("readline-sync");
// Class for displaying the game table in the console
const Table = require("cli-table");

import { HMACGenerator } from "./HMACGenerator";
import { MoveRules } from "./MoveRules";
import { RandomGenerator } from "./RandomGenerator";
import { ENTER_MOVE, HELP_DESCRIPTION, INVALID_INPUT, MENU_EXIT, MENU_HELP, MENU_TITLE, RESULTS } from "../constants";

// Game class
export class Game {
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

	// Function to display the main game menu
	private displayMenu() {
		console.log(MENU_TITLE);
		this.moves.forEach((move, index) => {
			console.log(`${index + 1} - ${move}`);
		});
		console.log(MENU_EXIT);
		console.log(MENU_HELP);

		console.log(`HMAC: ${this.hmac} \n`);
	}

	// Function to display the help menu, implemented using the cli-table library
	private displayHelp() {
		// Initialize the table, 1st row (header)
		const table = new Table({ head: ["PC\\USER", ...this.moves] });

		console.log(HELP_DESCRIPTION);

		// Explanations for the table
		// Take the first 3 moves for explanation (there should be at least three moves in the game)
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

		// Initialize subsequent rows
		// Each row describes the computer move and the game result relative to the user move
		this.moves.forEach((pcMove) => {
			const wins: RESULTS[] = [];
			this.moves.forEach((userMove) => {
				wins.push(this.moveRules.getWinner(userMove, pcMove));
			});
			table.push({ [pcMove]: wins });
		});
		console.log(table.toString());
	}

	// Function for reading the user's move
	private getPlayerMove(): string {
		const input = readline.question(ENTER_MOVE);
		const moveIndex = parseInt(input);
		// Handling incorrect input
		if (input !== "?" && (isNaN(moveIndex) || moveIndex < 0 || moveIndex > this.moves.length)) {
			console.log(INVALID_INPUT);
			return this.getPlayerMove();
		}
		// Display the help menu
		if (input === "?") {
			this.displayHelp();
			this.displayMenu();
			return this.getPlayerMove();
		}
		// Exit the game
		if (moveIndex === 0) {
			process.exit();
		}

		return this.moves[moveIndex - 1];
	}

	// Function to simulate the computer move
	private getRandomMove(): string {
		const randomIndex = Math.floor(Math.random() * this.moves.length);
		return this.moves[randomIndex];
	}

	// Function to generate a random 256-bit key
	private generateKey(): void {
		this.key = this.randomGenerator.generateRandomKey(32);
	}

	// Function to calculate HMAC
	private calculateHMAC(move: string): string {
		return this.hmacGenerator.generateHMAC(this.key, move);
	}

	// Function to print game results
	private printResult(playerMove: string, result: RESULTS) {
		console.log(`Player move: ${playerMove}`);
		console.log(`Computer move: ${this.computerMove}`);
		if (result === RESULTS.DRAW) {
			console.log("Draw!");
		} else {
			console.log(`${result === RESULTS.WIN ? "You" : "Computer"}  win!`);
		}
		console.log(`HMAC Key: ${this.key}`);
	}

	// Function implementing the game process
	playGame(): void {
		// Generate the key (key), a random computer move (message), and HMAC based on the data message and key
		this.generateKey(); //key
		this.computerMove = this.getRandomMove(); //message
		this.hmac = this.calculateHMAC(this.computerMove);

		// Ask the user to make their move, initially displaying the menu
		this.displayMenu();
		const playerMove = this.getPlayerMove();

		// Determine the winner
		const result = this.moveRules.getWinner(playerMove, this.computerMove);

		// Print the game results with the initial key (key)
		this.printResult(playerMove, result);
	}
}