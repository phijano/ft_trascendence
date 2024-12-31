/*
class Player {
	constructor(nick, id) {
		this.nick = nick;
		this.id = id;
	}
}
*/
class Match {

	winner = "";

	constructor(player1, player2) {
		this.player1 = player1;
		this.player2 = player2;
	}

	addResult(winner, lScore, rScore){
		this.winner = winner;
		this.lScore = lScore;
		this.rScore = rScore;
	}

	get winner() {
		return this.winner;
	}

	get players() {
		return [this.player1 , this.player2];
	}
	
}

class Round {

	constructor(array) {
		this.matches = Array(array.length / 2);

		let playerIndex = 0;
		for (var i = 0; i < this.matches.length; i++) {
			this.matches[i] = new Match(array[playerIndex], array[playerIndex + 1])
			playerIndex += 2;
		}
		this.currentMatch = 0;
	}

	advance() {
		this.currentMatch++;
	}

	addResult(winner, lScore, rScore)
	{
		this.matches[this.currentMatch].addResult(winner, lScore, rScore);
	}

	get length() {
		return this.matches.length;
	}

	get matchPlayers() {
		return this.matches[this.currentMatch].players;
	}

	get winners() {
		const winners = Array();
		
		for (var i = 0 ; i < this.matches.length; i++) {
			winners.push(this.matches[i].winner);
		}
		return winners;
	}
}

export default class Tournament {
	
	constructor() {

		this.rounds = Array();
		this.players = Array();
		this.currentRound = 0;
	}
	
	reset () {
		this.players.splice(0, this.players.length);
		this.rounds.splice(0, this.rounds.length);
		this.currentRound = 0;
	}

	addPlayer (player) {
		if (this.players.find((element) => element == player))
			return false;
		this.players.push(player);
		return true;
	}

	startTournament () {
		shuffle(this.players);
		const round = new Round(this.players)
		this.rounds.push(round);
	}

	advance () {
		if (this.rounds[this.currentRound].length == 1)
			return false;
		if (this.rounds[this.currentRound].currentMatch + 1 == this.rounds[this.currentRound].length)
			this.nextRound();
		else
			this.rounds[this.currentRound].advance();
		return true;
	}

	nextRound() {
		let winners = this.rounds[this.currentRound].winners;
		const round = new Round(winners);
		
		this.rounds.push(round);
		this.currentRound++;	
	}

	addResult(winner, lScore, rScore){
		this.rounds[this.currentRound].addResult(winner, lScore, rScore);
	}

	get length() {
		return this.players.length;
	}

	get matchPlayers() {
		return this.rounds[this.currentRound].matchPlayers;
	}

	get champion()
	{
		if (this.rounds[this.currentRound].length == 1)
			return this.rounds[this.currentRound].winners[0];
		else
			return "";
	}
	get roundName()
	{
		switch (this.rounds[this.currentRound].length) {
			case 1:
				return "Final";
				break;
			case 2:
				return "Semifinal";
				break;
			case 4:
				return "Quarter-final";
				break;
			case 8:
				return "Round of 16";
				break;
			default:
				return "Match"
				break;
		}
	}
}

function shuffle(array) {
	let currentIndex = array.length;

	while (currentIndex != 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
}
