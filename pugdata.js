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

// init player objects for comparison (only used if id1 and id2 is set)
var player1 = {	cWins:  0,
								wins:   0,
								losses: 0,
								htmlId: "p1",
							};
var player2 = {	cWins: 	0,
								wins: 	0,
								losses: 0,
								htmlId: "p2",
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
			if(fp1.team != fp2.team && match.winningTeam == fp1.team) {
				player1.wins = player1.wins + 1;
				player2.losses = player2.losses + 1;
			}
			if(fp1.team != fp2.team && match.winningTeam == fp2.team) {
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

function display(player1, player2, compareTwo) {

}

if(id1) {
	displayPlayer(player1);
}
if(id2) {
	displayPlayer(player2);
}

if(compareTwo) {
	document.getElementById("noCompareDiv").style.display = "none";
	document.getElementById("compareDiv").style.display = "block";
		
	displayComparison(cData);
}

playerArr.forEach( function(player){
	var cpm = (player.captained / player.matches) * 100;
	cpm = cpm.toString().substring(0,4);
	player.captainPerMatch = cpm + "%";

})

function onTableClick(key,playerArr) {
	console.log("ontableclick" + key);
	switch(key) {
  case "name":
    displayIndexTable(playerArr, compName);
    break;
  case "matches":
    displayIndexTable(playerArr, compMatches);
    break;
  case "captained":
    displayIndexTable(playerArr, compCaptained);
    break;
  case "win":
    displayIndexTable(playerArr, compWin);
    break;
  case "loss":
    displayIndexTable(playerArr, compLoss);
    break;
  case "captainPerMatch":
    displayIndexTable(playerArr, compCPM);
    break;
  default:
    // code block
	}
}

displayIndexTable(playerArr, compMatches);

function displayIndexTable(playerArr, compFn) {
	playerArr.sort(compFn);
	playersTable = document.getElementById("playersTable");
	playersTable.innerHTML = "";
	// Table head
	var thead = document.createElement('thead'); //(playersTable.getElementsByTagName('thead')[0];
	var tr = document.createElement('tr');
	Object.keys(playerArr[0]).forEach(function(key) {
		if(key == "id") { return;}
		var th = document.createElement('th');
		th.appendChild(document.createTextNode( key));
		// th.setAttribute("id", 'thead' + key);
		th.onclick = function() { onTableClick(key,playerArr) };
		tr.appendChild(th);
	});
	thead.appendChild(tr);
	
	var tbody = document.createElement('tbody');
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
	playersTable.appendChild(thead);
	playersTable.appendChild(tbody);
}

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

// View stuff
function displayPlayer(player) {
	document.getElementById(player.htmlId + "Name")  
		.innerHTML =                                      player.name;
	document.getElementById(player.htmlId + "cWins") 
	  .innerHTML = "Capt vs Capt wins: "        + player.cWins;
	document.getElementById(player.htmlId + "Wins")  
		.innerHTML = "Wins: " 	+ player.wins;
	document.getElementById(player.htmlId + "Losses")
		.innerHTML = "Losses: " + player.losses;
}

function displayComparison(cData) {
	document.getElementById("matches").innerHTML 			= cData.matches;
	document.getElementById("bothWin").innerHTML 			= cData.bothWin;
	document.getElementById("bothLose").innerHTML 		= cData.bothLose;
	document.getElementById("bothCaptain").innerHTML 	= cData.bothCaptain;
	document.getElementById("ties").innerHTML 				= cData.ties;
}

});

// Utils
function captainPerMatch(player)
{	return (player.captained / player.matches);
}

function compName( a, b ) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}

function compCPM(a, b) {
	cpma = captainPerMatch(a);
	cpmb = captainPerMatch(b);
	
  return captainPerMatch(b) - captainPerMatch(a);
}

function compMatches(a,b){
	return b.matches - a.matches;
}

function compWin(a,b){
	return b.win - a.win;
}
function compLoss(a,b){
	return b.loss - a.loss;
}

function compCaptained(a,b) {
	return b.captained- a.captained;
}