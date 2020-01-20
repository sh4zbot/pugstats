var state = {};

document.addEventListener('DOMContentLoaded', (event) => {
var url_string = window.location.href
var url = new URL(url_string);
state.id1 = url.searchParams.get("id1");
state.id2 = url.searchParams.get("id2");
// var id1 = url.searchParams.get("id1");
// var id2 = url.searchParams.get("id2");
var compareTwo = state.id1 ? state.id2 ? true : false : false;
console.log(state.id1)
console.log(state.id2)
console.log(compareTwo);

// var players = {};
// Put all id's and usernames into players



// For each player init a player object and push it
// to playerArr
init(state);

function init(state) {
	state.playerArr = [];
	state.players = {};

	data.forEach(function(match){
		match.players.forEach(function(player){
			state.players[player.user.id] = player.user.name;
		})
	})

	Object.keys(state.players).forEach(function(key) {
		state.playerArr.push({ id: key, 
													 name: state.players[key], 
													 matches: 0, 
													 captained: 0,
													 win: 0,
									 				 loss: 0,
									});
	
	});

	// init player objects for comparison (only used if id1 and id2 is set)
	state.player1 = {	//cWins:  0,
										// wins:   0,
										// losses: 0,
										htmlId: "p1",
									};
	state.player2 = {	//cWins: 	0,
										// wins: 	0,
										// losses: 0,
										htmlId: "p2",
									};

  // init player names
	state.playerArr.find((stored,i) => {
		if(stored.id == state.id1) {
			state.player1.name = stored.name;
		}
		if(stored.id == state.id2) {
			state.player2.name = stored.name;
		}
	});
	
	// combined data for both compared players
	state.cData = {	matches: 				0,
									bothWin: 				0,
									bothLose: 			0,
									bothCaptain: 		0,
									ties: 					0,
									p1win: 0, p2win: 0,
									p1cwin: 0, p2cwin: 0,
								};

}

// todo: remove all params
state.cData = getCompareStats(state.id1,state.id2,data,state.player1,state.player2);
function getCompareStats(id1, id2, data, player1, player2) {
	cData = {	matches: 				0,
						bothWin: 				0,
						bothLose: 			0,
						bothCaptain: 		0,
						ties: 					0,
						p1win: 0, p2win: 0,
						p1cwin: 0, p2cwin: 0
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
			

			state.playerArr.find((stored,i) => {
				if(stored.id == player.user.id) {
						state.playerArr[i] = {  id: 				stored.id, 
															name: 			stored.name, 
															matches: 		stored.matches + 1, 
															captained:  (player.captain == 1) ? stored.captained + 1 : stored.captained,
															win: (match.winningTeam == player.team) ? stored.win + 1 : stored.win,
															loss: (match.winningTeam == player.team || match.winningTeam == 0) ? stored.loss : stored.loss + 1,
														}
				return true; // return true == .find() is done			
				}
			})
		});
		
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
				cData.matches = cData.matches + 1;
				//both captained
				if(fp1.captain && fp2.captain) {
					cData.bothCaptain = cData.bothCaptain + 1;
					if (fp1.team == match.winningTeam) {
						cData.p1cwin++;
					}
					if (fp2.team == match.winningTeam) {
						cData.p2cwin++;
					}
				}
				//both win together
				if(match.winningTeam == fp1.team && match.winningTeam == fp2.team) {
					cData.bothWin++;
				}
				//both lose
				if(match.winningTeam != fp1.team && match.winningTeam != fp2.team && match.winningTeam != 0) {
					cData.bothLose++;
				}
				//wins & losses
				if(fp1.team != fp2.team && match.winningTeam == fp1.team) {
					cData.p1win++;
				}
				if(fp1.team != fp2.team && match.winningTeam == fp2.team) {
					cData.p2win++;
				}
				if(match.winningTeam == 0) {
					cData.ties = cData.ties +1;
				}
			}

		}
		// console.log(matchPlayerArr);
	})
	return cData;
}

// displayPlayers();

if(state.id1) {
	displayPlayer(state.player1.name, state.cData.p1cwin, state.cData.p1win, state.cData.p2win, state.player1.htmlId);
}
if(state.id2) {
	displayPlayer(state.player2.name, state.cData.p2cwin, state.cData.p2win, state.cData.p1win, state.player2.htmlId);
}

if(compareTwo) {
	document.getElementById("noCompareDiv").style.display = "none";
	document.getElementById("compareDiv").style.display = "block";
		
	displayComparison(state.cData);
}

state.playerArr.forEach( function(player){
	var cpm = (player.captained / player.matches) * 100;
	cpm = cpm.toString().substring(0,4);
	player.captainPerMatch = cpm + "%";

})

function onPlayerClick(id){
	if (state.id1 == null){
		state.id1=id;
	}
	else if (state.id1 == id) {
		state.id1 = null;
		state.id2 = null;
	}
	else if (state.id2 == id){
		state.id2 = null;
	}
	else if (state.id1 && ! state.id2) {
		state.id2 = id;
	}
	else if (state.id1 && state.id2) {
		state.id2 = id;
	}

	cData = getCompareStats(state.id1,state.id2,data,state.player1,state.player2);
	if(state.id1) {
		displayPlayer(state.player1.name, cData.p1cwin, cData.p1win, cData.p2win, state.player1.htmlId);
	}
	if(state.id2) {
		displayPlayer(state.player2.name, cData.p2cwin, cData.p2win, cData.p1win, player2.htmlId);
	}
	displayIndexTable();

}

function onTheadClick(key) {
	console.log("ontableclick" + key);
	switch(key) {
  case "name":
  	state.compFn = compName;
    displayIndexTable();
    break;
  case "matches":
  	state.compFn = compMatches;
    displayIndexTable();
    break;
  case "captained":
  	state.compFn = compCaptained;
    displayIndexTable();
    break;
  case "win":
 		state.compFn = compWin;
    displayIndexTable();
    break;
  case "loss":
 		state.compFn = compLoss;
    displayIndexTable();
    break;
  case "captainPerMatch":
  	state.compFn = compCPM;
    displayIndexTable();
    break;
  default:
	}
}

state.compFn = compMatches;
displayIndexTable();

function displayIndexTable() {
	state.playerArr.sort(state.compFn);
	playersTable = document.getElementById("playersTable");
	playersTable.innerHTML = "";
	// Table head
	var thead = document.createElement('thead'); //(playersTable.getElementsByTagName('thead')[0];
	var tr = document.createElement('tr');
	Object.keys(state.playerArr[0]).forEach(function(key) {
		if(key == "id") { return;}
		var th = document.createElement('th');
		th.appendChild(document.createTextNode( key));
		// th.setAttribute("id", 'thead' + key);
		th.onclick = function() { onTheadClick(key) };
		tr.appendChild(th);
	});
	thead.appendChild(tr);
	
	var tbody = document.createElement('tbody');
	state.playerArr.forEach( function( player) {
		var tr = document.createElement('tr');
		if ( state.id1 == player.id) {
			tr.className += "active";
		}
		if (state.id2 == player.id) {
			tr.className += "opponent";
		}
		Object.keys(player).forEach(function(key) {
			var td = document.createElement('td');
			// dont display id
			if(key == "id") {
				// maybe need this further on
				// tr.setAttribute("id", player[key]);
				return;
			}
			if(key == "name") {
				td.appendChild( getIdLink( player['id'], player[key]));
			}
			else {
				td.appendChild(document.createTextNode( player[key]));
			}
			tr.appendChild(td);
		})
		tr.onclick = function() { onPlayerClick(player.id)}
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
function displayPlayer(name, cWins, wins, losses, htmlId) {
	document.getElementById(htmlId + "Name")  
		.innerHTML =                                      name;
	document.getElementById(htmlId + "cWins") 
	  .innerHTML = "Capt vs Capt wins: "        + cWins;
	document.getElementById(htmlId + "Wins")  
		.innerHTML = "Wins: " 	+ wins;
	document.getElementById(htmlId + "Losses")
		.innerHTML = "Losses: " + losses;
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