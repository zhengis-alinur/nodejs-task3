import { RESULTS } from "../constants";

// Class with game rules
export class MoveRules {
	private moves: string[];

	constructor(moves: string[]) {
		this.moves = moves;
	}

	// Function to determine the winner
	// Implemented based on the calculation of the difference (diff) between the indexes of two moves (user and computer)
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