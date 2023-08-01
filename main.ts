import { Game } from "./classes/Game";
import { showInitError } from "./utils";

function main() {
	// Read arguments as moves
	const args = process.argv.slice(2);
	const argLen = args.length;
	// In case of incorrect initialization, stop the game and report an error
	if (argLen < 3 || argLen % 2 === 0 || new Set(args).size !== argLen) {
		showInitError();
		return;
	}

	// Initialize the game with the provided parameters
	const moves = args.map((arg) => arg.trim());
	const game = new Game(moves);
	game.playGame();
}

main();
