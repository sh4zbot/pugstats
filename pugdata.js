document.addEventListener('DOMContentLoaded', (event) => {
var url_string = window.location.href
var url = new URL(url_string);
var id1 = url.searchParams.get("id1");
var id2 = url.searchParams.get("id2");
var compareTwo = id1 ? id2 ? true : false : false;
console.log(id1)
console.log(id2)

console.log(compareTwo);

var players = {};
// Put all id's and usernames into players
data.forEach(function(match){
	match.players.forEach(function(player){
		players[player.user.id] = player.user.name;
	})
})

var playerArr = [];
// For each player init a player object and push it
// to playerArr
Object.keys(players).forEach(function(key) {
	playerArr.push({ id: key, 
									 name: players[key], 
									 matches: 0, 
									 captained: 0,
									 win: 0,
								   loss: 0,
								});
});
playerArr.sort(compareName);

// init player objects for comparison (only used if id1 and id2 is set)
var player1 = {	cWins:  0,
								wins:   0,
								losses: 0,
							};
var player2 = {	cWins: 	0,
								wins: 	0,
								losses: 0,
							};

playerArr.find((stored,i) => {
	if(stored.id == id1) {
		player1.name = stored.name;
	}
	if(stored.id == id2) {
		player2.name = stored.name;
	}
});

// combined data for both compared players
var cData = {	matches: 				0,
							bothWin: 				0,
							bothLose: 			0,
							bothCaptain: 		0,
							ties: 					0,
						};


// Loop through every match/player and gather data
data.forEach(function(match){
	// Only looking at stats for PUG queue
 	if (match.queue.id != 1548704432021) {
 		return;
 	}
	var matchPlayerArr = [];

	match.players.forEach(function(player){
		
		if(compareTwo) { // if we are comparing two players
			matchPlayerArr.push({	id: player.user.id,
													 	name: player.user.name,
													 	team: player.team,
													 	captain: player.captain,
													 });
		}
		

		playerArr.find((stored,i) => {
			if(stored.id == player.user.id) {
					playerArr[i] = {  id: 				stored.id, 
														name: 			stored.name, 
														matches: 		stored.matches + 1, 
														captained:  (player.captain == 1) ? stored.captained + 1 : stored.captained,
														win: (match.winningTeam == player.team) ? stored.win + 1 : stored.win,
														loss: (match.winningTeam == player.team || match.winningTeam == 0) ? stored.loss : stored.loss + 1,
													}
			return true; // return true == .find() is done			
			}
		})

	})

	if(compareTwo) {

		var found1 = false, found2 = false;
		matchPlayerArr.forEach((player) => {
			if (parseInt(player.id) === parseInt(id1)) {
				found1 = true;
				fp1 = player;
			}
			if (parseInt(player.id) === parseInt(id2)) {
				found2 = true;
				fp2 = player;
			}
		});
		if(found1 && found2) {
			console.log("found both")
			cData.matches = cData.matches + 1;
			//both captained
			if(fp1.captain && fp2.captain) {
				cData.bothCaptain = cData.bothCaptain + 1;
				if (fp1.team == match.winningTeam) {
					player1.cWins = player1.cWins + 1;
				}
				if (fp2.team == match.winningTeam) {
					player2.cWins = player2.cWins + 1;
				}
			}
			//both win
			if(match.winningTeam == fp1.team && match.winningTeam == fp2.team) {
				cData.bothWin = cData.bothWin + 1;
			}
			//both lose
			if(match.winningTeam != fp1.team && match.winningTeam != fp2.team && match.winningTeam != 0) {
				cData.bothLose = cData.bothLose + 1;
			}
			//wins & losses
			if(match.winningTeam == fp1.team) {
				player1.wins = player1.wins + 1;
				player2.losses = player2.losses + 1;
			}
			if(match.winningTeam == fp2.team) {
				player2.wins = player2.wins + 1;
				player1.losses = player1.losses + 1;
			}
			if(match.winningTeam == 0) {
				cData.ties = cData.ties +1;
			}
		}

	}
	// console.log(matchPlayerArr);
})

if(compareTwo) {
	document.getElementById("matches").innerHTML = cData.matches;
	document.getElementById("bothWin").innerHTML = cData.bothWin;
	document.getElementById("bothLose").innerHTML = cData.bothLose;
	document.getElementById("bothCaptain").innerHTML = cData.bothCaptain;

	document.getElementById("p1Name").innerHTML = player1.name;
	document.getElementById("p2Name").innerHTML = player2.name;

	document.getElementById("p1cWins").innerHTML = "Captain vs Captain wins: " + player1.cWins;
	document.getElementById("p2cWins").innerHTML = "Captain vs Captain wins: " + player2.cWins;

	document.getElementById("p1Wins").innerHTML = "Wins vs " + player2.name  + ": " + player1.wins;
	document.getElementById("p1Losses").innerHTML = "Losses vs " + player2.name  + ": " + player1.losses;

	document.getElementById("p2Wins").innerHTML = "Wins vs " + player1.name  + ": " + player2.wins;
	document.getElementById("p2Losses").innerHTML = "Losses vs " + player1.name  + ": " + player2.losses;

	document.getElementById("ties").innerHTML = cData.ties;

}

playerArr.forEach( function(player){
	player.captainPerMatch = player.captained / player.matches;
})


playersTable = document.getElementById("playersTable");
// Table head
var thead = playersTable.getElementsByTagName('thead')[0];
var tr = document.createElement('tr');
Object.keys(playerArr[0]).forEach(function(key) {
	if(key == "id") { return;}
	var th = document.createElement('th');
	th.appendChild(document.createTextNode( key));
	tr.appendChild(th);
});
thead.appendChild(tr);

// Table body
var tbody = playersTable.getElementsByTagName('tbody')[0];
playerArr.forEach( function( player) {
	var tr = document.createElement('tr');
	if ( id1 == player.id) {
		tr.className += "active";
	}
	if (id2 == player.id) {
		tr.className += "opponent";
	}
	Object.keys(player).forEach(function(key) {
		if(key == "id") {
			return;
		}
		var td = document.createElement('td');
		if(key == "name") {
			td.appendChild( getIdLink( player['id'], player[key]));
		}
		else {
			td.appendChild(document.createTextNode( player[key]));
		}
		tr.appendChild(td);
	})
	tbody.appendChild(tr);
});

// Utils
function compareName( a, b ) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}

function comparecaptainPerMatch(a, b) {
  return a.captainPerMatch - b.captainPerMatch;
}

})

function getIdLink(id,name) {
	var url_string = window.location.href
	var url = new URL(url_string);
	var noParams = window.location.href.split('?')[0];
	var a = document.createElement('a');
	var linkText = document.createTextNode(name);
	a.appendChild(linkText);

	// shitty "routing" state machine
	if ( url.searchParams.get("id2")) {
		if( url.searchParams.get("id1") === id || 
				url.searchParams.get("id2") === id ) { 
			a.href = noParams;
		} else {
			a.href = window.location.href.split('&')[0] + "&id2=" + id;
		}
		
	}
	else if ( url.searchParams.get("id1")) {
		if( url.searchParams.get("id1") === id) {
			a.href = noParams;
		} else {
			a.href = window.location + "&id2=" + id;
		}
	}
	else {
		a.href = noParams + "?id1=" + id;
	}
	return a;
}