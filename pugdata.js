const servers = ["mace", "dae", "bittah", "t1", "ta", ];

var state = {data: {}}; 
servers.forEach(server => 
	state.data[server] = window["data" + server]
	)
console.log("shazbucks", window["datashazbucks"] );
state.shazbucks = window["datashazbucks"];
document.addEventListener('DOMContentLoaded', (event) => {

const TA_Q = 1548704432021;
const MA_Q = 1558789281392;
const MAIN_QUEUES = [TA_Q, MA_Q];


state.teams = [{ name: "Team 1",
								 players: []},
							 { name: "Team 2",
								 players: []}
							];


state.queues = {};

// get all queue names, id's and matches played in that queue
matchcount = {};
Object.entries(state.data).forEach(([server, matches]) => {
	state.queues[server] = [];
	matches.forEach(function (match){
		// LTunrated t1 queue is split in two
		if (match.queue.id == 1579575609931 || match.queue.id == 1563330022431) {
			match.queue.id = "LTunrated";
		}
		// LTgold matches prior to 1/24/2019 are actually LTpug
		if (match.queue.id == 0) { 					// LTgold
			if (match.timestamp < 1548266401000) { 	// < 1/24/2019
				match.queue.id = 1548351881593;    	// 1548351881593 = LTpug queue
			}
		}
		// Casual pugs
		if (match.queue.id != 1599325324396) {
			matchcount[match.queue.id] = matchcount[match.queue.id] ? matchcount[match.queue.id] + 1 : 1;
			state.queues[server][match.queue.id] = match.queue.name;
		}
		
	})
})
state.matchcount = matchcount;
getSelectedSQ(); 





main();

//set selected server and queue`
function getSelectedSQ() {
	state.selectedS = [ "mace" ];
	state.selectedQ = Object.keys( state.queues["mace"]);
	if (getUrlServer() != null) {
		if (servers.includes(getUrlServer() ) ) {
			state.selectedS = getUrlServer();
			state.selectedQ = Object.keys( state.queues[getUrlServer()]);
		}
	}
}

//filter and return current data
function getData() {
	return state.currentData.filter(function(match){
	 	if (match.timestamp < state.datemin || match.timestamp > state.datemax) {
			return false;
		}
		
		if (! state.selectedQ.includes(match.queue.id.toString())){
			return false;
		}
		return true;
	});
}

function checkIfMultiplePlayers(){
	var multiplePlayers = false;
	state.teams.forEach(function(team){
		if (team.players.length > 1) {
			multiplePlayers = true;
		}
	})
	return multiplePlayers;
}

function main() {

	init(state);
	getData().forEach(function(match){
		if (match.winningTeam == 0) {

		}
	})

	console.log(state.data);
	state.compFn = compMatches;
	getUrlTeams();
	addDateOnChangeListener('datemin');
	addDateOnChangeListener('datemax');
	render();
	// displayIndexTable();

}

// state.chart1 = createChart("chart1");
console.log("crearte chart1");
// state.chart2 = createChart("chart2");

function init(state) {
	state.matchStats = [];
	state.matchStats.tie = 0;
	state.matchStats.red = 0;
	state.matchStats.blue = 0;

	state.playerArr = [];
	state.players = {};
	setCurrentData()
	console.log("matchstats", state.matchStats);

	state.player1 = {	htmlId: "p1" };
	state.player2 = {	htmlId: "p2" };


	// init player data
	Object.keys(state.players).forEach(function(key) {
		state.playerArr.push({ 	id: 				key, 
													 	name: 			state.players[key], 
													 	avgpick: [],
														matches: 		0, 
													 	captained: 	0,
													 	win: 				0,
									 				 	loss: 			0,
									 					cwin: 			0,
									 				 	closs: 			0,
									 				 	shazbucks:  0,
									 				 	
													});
	});

	// combined data for both compared players
	state.cData = {	matches: 							0,
									bothWin: 							0,
									bothLose: 						0,
									bothCaptain: 					0,
									ties: 								0,
									p1win: 0, p2win: 			0,
									p1cwin: 0, p2cwin: 		0,
								};
}

// re-render everything
function render() {
	init(state)

	var tot = state.matchStats.red + state.matchStats.blue + state.matchStats.tie;
	var red = state.matchStats.red / tot;
	var blue = state.matchStats.blue / tot;
	var tie = state.matchStats.tie / tot;

	document.getElementById("red") .innerHTML 		= "red " 	+ (red 	* 100).toFixed(0) + '%';
	document.getElementById("blue").innerHTML 		= "blue " + (blue * 100).toFixed(0) + '%';
	document.getElementById("tie") .innerHTML 		= "tie " 	+ (tie 	* 100).toFixed(0) + '%';
	// we have multiple players selected for one team
	//TODO Here


	getCompareStats(); // gets match stats per player too, necessary not only for compare stats
	state.playerArr = filterByMatches( document.getElementById("minMatchesInput").value );


	// shazbucks
	state.playerArr.forEach(function(player, i){
		var found = null;
		found = state.shazbucks.find(	function( shazbuck){
							return shazbuck.discord_id == player.id;
						})
		if( found){
			state.playerArr[i].shazbucks = found.balance;
		}
		else {
			state.playerArr[i].shazbucks = 0;
		}
	})
	
	getCPM(); 
	getWR( false);
	getWR( true);
	updateNavbarBtns();

	if(checkIfMultiplePlayers()){
		// document.getElementById("midh1").innerHTML ="VS";
		// document.getElementById("middiv").style.display ="none";
		// document.getElementById("chart1").style.display ="none";
		// document.getElementById("chart2").style.display ="none";
		var usrIds = state.teams[0].players.map(p => p.id)
		var oppIds = state.teams[1].players.map(p => p.id)
		var stats = getMultipleTogetherData(usrIds,oppIds);
		//clear pickordertables
		pickOrderTable(null, "pickOrderTable1");
		pickOrderTable(null, "pickOrderTable2");
		
		displayPlayer(state.teams[0], null, stats.win, stats.loss, "team1", stats.tie);
		displayPlayer(state.teams[1], null, stats.loss, stats.win, "team2", stats.tie);
		displayComparison(null)

		document.getElementById("team1").setAttribute("class","col-12");
		document.getElementById("team2").setAttribute("class","col-12");
	}

	else {
		// document.getElementById("midh1").innerHTML ="";
		// document.getElementById("middiv").style.display ="block";
		id1 = state.teams[0].players[0] ? state.teams[0].players[0].id : null;
		id2 = state.teams[1].players[0] ? state.teams[1].players[0].id : null;
		if (id1) {
			// document.getElementById("team1").setAttribute("class","col");
			// document.getElementById("chart1").style.display ="block";
			var player1Data = getPlayerData(state.teams[0].players[0].id)
			// var chartData = matchesToTimelineData(player1Data.matches, id1);
			pickOrderTable(player1Data.picks, "pickOrderTable1");
			// removeData(state.chart1);
			// addData(state.chart1, chartData);	
		}
		
		if (id2) {
			// document.getElementById("team2").setAttribute("class","col");
			// document.getElementById("chart2").style.display ="block";
			var player2Data = getPlayerData(id2)
			// chartData = matchesToTimelineData(player2Data.matches, id2);
			pickOrderTable(player2Data.picks, "pickOrderTable2");
			// removeData(state.chart1);
			// addData(state.chart2, chartData);
		}

		//TODO: clean up tihs spaghetti
		if (player1Data) {
			displayPlayer(state.teams[0], state.cData.p1cwin, state.cData.p1win, state.cData.p2win, "team1", null);
		} else {
			displayPlayer(state.teams[0], null, null, null, "team1", null);
			pickOrderTable(null, "pickOrderTable1");
		}
		if (player2Data) {
			displayPlayer(state.teams[1], state.cData.p2cwin, state.cData.p2win, state.cData.p1win, "team2", null);	
		}
		else {
			displayPlayer(state.teams[1], null, null, null, "team2", null);
			pickOrderTable(null, "pickOrderTable2");
		}
		

		if (id1 && id2) {	
			displayComparison(state.cData)
		} else {
			displayComparison(null)
		}
	}
	displayIndexTable();
}

function updateNavbarBtns() {
	$('button', '.btn-container').removeClass("btn-primary").addClass("btn-secondary")
	// state.selectedS.forEach(function(e){
	// 	$('#' + e).addClass("btn-primary").removeClass("btn-secondary");
	// })
	state.selectedQ.forEach(function(e){
		$('#' + e).addClass("btn-primary").removeClass("btn-secondary");
	})
}




/*	
 *	Data 
 */

// Find matches where all of usrIds participated
function getMultipleTogetherData(usrIds, oppIds) {
	var bothIds = usrIds.concat(oppIds);
	const matches = getData().filter(function(match) {
		return bothIds.every(function(usrId){
			return match.players.find(function(player){
				if(player.user.id === parseInt(usrId)) {
					return true;
				}
			})
		})
	})

	var win = 0, loss = 0, tie = 0;
	var matchesTogether = matches.filter(function(match){
		var team = null;
		var correctTeams = usrIds.every(function(usrId){ 
			var player = match.players.find(function(player){
				return (player.user.id == usrId);
			})
			if (team == null) {
				team = player.team;
			} 
			var corrOppTeam = oppIds.every(function(oppId){ 
				var opponent = match.players.find(function(opponent){
					return (opponent.user.id == oppId);
				})
				if (team == opponent.team) {
					return false
				} else {
					return true
				}
			});
			return player.team == team && corrOppTeam;
		})
		if(correctTeams) {
			if(match.winningTeam == team) {
				win++;
			} else if (match.winningTeam != 0) {
				loss++; 
			} else if (match.winningTeam == 0) {
				tie++;
			}
		}
		return correctTeams;
	})
	return { win: win, loss: loss, tie: tie}
 }

function getPlayerData(playerid) {
	var picks = [];
	var pickOrder = [];
	for(i=1;i<=13;i++){
		picks.push({win: 0, loss: 0, tie: 0});
	}
	const res = getData().filter(function(match) {
		const found = match.players.find(function(player){
			if(player.user.id === parseInt(playerid)) {
					if(player.pickOrder == null) {
						//player was subbed out - do nothing
					}
					else if (match.winningTeam == player.team) {
						picks[player.pickOrder].win++;
					} else if (match.winningTeam != 0) {
						picks[player.pickOrder].loss++;
					} else if (match.winningTeam == 0) {
						picks[player.pickOrder].tie++;
					}	
				return true;
			}
		// return (player.user.id === parseInt(playerid));
		})
		return found;
	})

	return 	{ matches: res,
			  		picks:   picks,
					};
}

function matchesToTimelineData(matches, userid) {
	var data = {	labels: [],
								datasets: []
							}

	var dataset = { label: "win/loss",
								  data: [],
									backgroundColor: "#A569BD"};
	var win = 0;
	var loss = 0;
	var pickOrder = [];
	var pickCount = 0;
	var pickData = [];
	matches.forEach(function (match) {
		var player = match.players.find(function(player){
			return player.user.id == userid;
		});
		//only collect pickorder when not captain
		if (player.captain == 0) {
			pickCount++;
			pickOrder.push(player.pickOrder);
			pickData.push({t: match.timestamp, y: pickOrder.reduce((a, b) => a + b, 0) / pickCount});
		}
		if (match.winningTeam == 0) {
			return;
		}
		if (player.team == match.winningTeam) {
			win++;
		} else {
			loss++;
		}
		if(loss == 0) {
			dataset.data.push({ t: match.timestamp, y: win });
		} else {
			dataset.data.push({ t: match.timestamp, y: win/loss}); 
		}
	})

	var pods = { label: "avg pickorder",
							 data: pickData,
							 backgroundColor: "#D7DBDD"
						 };

	

	data.datasets.push(dataset);
	data.datasets.push(pods);
	return data;
}


function getCompareStats(id1,id2) {
	var id1 = null, id2 = null;
	if (state.teams[0].players[0] && state.teams[1].players[0]) {
		id1 = state.teams[0].players[0].id;
		id2 = state.teams[1].players[0].id;
	}
	// Loop through every match/player and gather data
	getData().forEach(function(match){

		var matchPlayerArr = [];

		match.players.forEach(function(player){
			
			if(id1 && id2) { // if we are comparing two players
				matchPlayerArr.push({	id: player.user.id,
														 	name: player.user.name,
														 	team: player.team,
														 	captain: player.captain,
														 });
			}
			

			state.playerArr.find((stored,i) => {
				// console.log(stored);
				if(stored.id == player.user.id) {
					var avgpick = stored.avgpick;
					if( player.captain != 1 && player.pickOrder != null) 
					{	avgpick.push(player.pickOrder)
					}
						state.playerArr[i] = 
						{	id: 				stored.id, 
  							name: 			stored.name, 
  							avgpick: 		avgpick,
							matches: 		stored.matches + 1, 
							captained:  (player.captain == 1) ? stored.captained + 1 : stored.captained,
							win: 				(match.winningTeam == player.team) ? stored.win + 1 : stored.win,
							loss: 			(match.winningTeam == player.team || match.winningTeam == 0) ? stored.loss : stored.loss + 1,
							cwin: 			(player.captain && match.winningTeam==player.team) ? stored.cwin + 1 : stored.cwin,
							closs: 			(match.winningTeam != 0 && player.captain &&  match.winningTeam != player.team) ? stored.closs + 1 : stored.closs,
							
						}
						
						

				return true; // return true == .find() is done			
				}
			})
		});
		

		if(id1 && id2) {
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
				state.cData.matches = state.cData.matches + 1;
				//both captained
				if(fp1.captain && fp2.captain) {
					state.cData.bothCaptain = state.cData.bothCaptain + 1;
					if (fp1.team == match.winningTeam) {
						state.cData.p1cwin++;
					}
					if (fp2.team == match.winningTeam) {
						state.cData.p2cwin++;
					}
				}
				//both win together
				if(match.winningTeam == fp1.team && match.winningTeam == fp2.team) {
					state.cData.bothWin++;
				}
				//both lose
				if(match.winningTeam != fp1.team && match.winningTeam != fp2.team && match.winningTeam != 0) {
					state.cData.bothLose++;
				}
				//wins
				if(fp1.team != fp2.team && match.winningTeam == fp1.team) {
					state.cData.p1win++;
				}
				if(fp1.team != fp2.team && match.winningTeam == fp2.team) {
					state.cData.p2win++;
				}
				//ties
				if(match.winningTeam == 0) {
					state.cData.ties = state.cData.ties +1;
				}
			}
		}
	})

	state.playerArr.forEach(function(player){
		if (player.avgpick.length>0) {
			player.avgpick = Math.round( player.avgpick.reduce((a,b) => a + b) / player.avgpick.length * 100 ) / 100
		}
	})
}

/*
 * Click handlers
 */

function addDateOnChangeListener(htmlId) {
	document.getElementById(htmlId).addEventListener("change", function(e){
		state[htmlId] = new Date(e.target.value).getTime();
		render();
	})
}

function addPlayer(id,name,team) {
	team.players.push({id: id, name: name});
}


function playerClick(id,name,clicked,opposite) {
	if(clicked.players.length > 0 && clicked.players.find(player => player.id == id)) {
		clicked.players = clicked.players.filter(player => player.id != id)
	} else {
		addPlayer(id,name,clicked);
	}

	if(opposite.players.length > 0 && opposite.players.find(player => player.id == id)) {
		opposite.players = opposite.players.filter(player => player.id != id)
	}
}

function onPlayerClick(id){
	if (state.id1 == null){
		if(state.id2 == id){
			state.id1=null;
			state.id2=null;
		} else {
			state.id1=id;
		}
	}	else if (state.id1 == id){
		state.id1 = null;
		// state.id2 = null;
	} else if (state.id2 == id){
		state.id2 = null;
	} else if (state.id1 && ! state.id2){
		state.id2 = id;
	} else if (state.id1 && state.id2){
		state.id2 = id;}
	render();
}

function onTheadClick(key) {
	switch(key) {
  case "name":
  	state.compFn = compName;
    displayIndexTable();
    break;
  case "matches":
  	state.compFn = compMatches;
    displayIndexTable();
    break;

  case "avgpick":
  	state.compFn = compPick;
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
  case "cpm":
  	state.compFn = compCPM;
    displayIndexTable();
    break;
  case "cwr":
  	state.compFn = compCWR;
    displayIndexTable();
    break;
  case "wr":
  	state.compFn = compWR;
    displayIndexTable();
    break;
  case "cwin":
  	state.compFn = compcwin;
    displayIndexTable();
    break;
  case "closs":
		state.compFn = compcloss;
  	displayIndexTable();
  	break;
  case "shazbucks":
  	state.compFn = compShazbucks;
  	displayIndexTable();
  	break;
  default:
	}
}

function pickOrderTable(pickOrder,htmlId) {
	var table = document.getElementById(htmlId);
	table.innerHTML="";
	if (pickOrder == null) {
		return;
	}
	var thead = document.createElement("thead");
	thead.setAttribute("class", "text-center");
	var tr = thead.insertRow()
	var columnHeaders = ["pick", "win", "loss", "tie", "w/l"];
	columnHeaders.forEach(function(e) {
		var th = document.createElement("th");
		th.innerHTML = e;	
		tr.appendChild(th);
	})
	table.appendChild(thead);
	var tbody = document.createElement("tbody");
	pickOrder.forEach(function(po,i){
		var tr = tbody.insertRow();

		tr.insertCell().appendChild(document.createTextNode( i == 0 ? "cpt" : ('#' + i)  ));
		tr.insertCell().appendChild(document.createTextNode(po.win));
		tr.insertCell().appendChild(document.createTextNode(po.loss));
		tr.insertCell().appendChild(document.createTextNode(po.tie));
		tr.insertCell().appendChild(document.createTextNode(
			(po.loss == 0) ? po.win.toString().substring(0,4) :
			(po.win / po.loss ).toString().substring(0,4))
		);	
	})
	table.appendChild(tbody)

}

function getIds(team){
	if(team.players && team.players.length > 0) {
		return team.players.map(player => player.id);	
	}
	return null;
}

function button(btnClass, text, id) {
	return $('<button type="button" id="' + (id ? id : text) + '" class="btn ' + btnClass + ' btn-sm"> ' + text + '</button>');
}

populateServerButtons();

function setCurrentData() {
	var data = []
	servers.forEach(function(server){
		data = data.concat(state.data[server])
	})
	state.currentData = data;
	getData().forEach(function(match){
		// get all player names
		match.players.forEach(function(player){
			state.players[player.user.id] = player.user.name;
		})

		if( match.winningTeam == 0 ) {
			state.matchStats.tie = state.matchStats.tie + 1;
		}
		else if( match.winningTeam == 1) {
			state.matchStats.red = state.matchStats.red + 1;	
		}
		else if( match.winningTeam == 2) {
			state.matchStats.blue = state.matchStats.blue + 1;	
		}
		//ppl whos name is incorrect
		// const retards = { 223861431559258112: "Fisherman" };
		// state.players

		
		
	})
}

// function clickToArr(clicked, arrName) {
// 	if(state[arrName].indexOf(clicked) === -1) {
// 		state[arrName].push(clicked)
// 	} else {
// 		state[arrName] = state[arrName].filter(s => s !== clicked)
// 	}
// 	setCurrentData()
// 	// populateQueues()
// }

function populateServerButtons() {
	servers.forEach( function(server, i){
		var btn = $('<span class="">' + server + '</span>')
		btn.click(function () {
			// $('button', '#servers').removeClass("btn-primary").addClass("btn-secondary")
			// $(this).removeClass("btn-secondary")
			// $(this).addClass("btn-primary")
			// clickToArr(server, "selectedS")
			// render();
		})
		var col = $('<div class="col"></div>');
		var row1 = $('<div class="row d-flex justify-content-center"></div>');
		row1.append(btn);
		var row2 = $('<div class="row d-flex justify-content-center queues"></div>');
		
		var queues = state.queues[server];
		for (var key in queues) {
			var btnClass = "btn-secondary"
			if (state.selectedS == server && state.selectedQ.includes(key)) {
				btnClass = "btn-primary";
			}
			var qBtn = null;
			if (state.matchcount[key] > 20) {
				qBtn = button(btnClass, queues[key], key);
				qBtn.click(function() {
					state.selectedQ.indexOf($(this).attr('id')) === -1 ? state.selectedQ.push($(this).attr('id')) : 
														  				 state.selectedQ.splice( state.selectedQ.indexOf($(this).attr('id')), 1 );
					console.log(state.selectedQ)
					render();
					
				})
				row2.append(qBtn);
			}
		
		}
		$('#servers').append(col);
		$('#servers > div:last-child').append(col).append(row1).append(row2);
	})
}

// <div class="col">
// 	<div class="row d-flex justify-content-center">
// 		<button type="button" id="mace" class="btn btn-sm btn-primary"> mace</button>
// 	</div>
// 	<div class="row">
// 		<button type="button" id="mace" class="btn btn-sm btn-primary"> queu1</button>
// 		<button type="button" id="mace" class="btn btn-sm btn-primary"> queu2</button>
// 		<button type="button" id="mace" class="btn btn-sm btn-primary"> queu3</button>
// 	</div>
// </div>


function displayIndexTable() {
	var ids = state.teams.map(team => getIds(team));
	state.playerArr.sort(state.compFn);
	playersTable = document.getElementById("playersTable");
	playersTable.innerHTML = "";
	// Table head
	var thead = document.createElement('thead'); //(playersTable.getElementsByTagName('thead')[0];
	var tr = document.createElement('tr');
	console.log("playerArr", state.playerArr)
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
		if (ids[0] && ids[0].includes(player.id) ) {
			tr.className += "active";
		}
		if (ids[1] && ids[1].includes(player.id) ) {
			tr.className += "opponent";
		}
		Object.keys(player).forEach(function(key) {
			var td = document.createElement('td');
			// dont display id
			if(key == "id") {
				return;
			}
			// if(	key == "avgpick") {
			// 	if( player[key].length > 0) {
			// 		td.appendChild( document.createTextNode( Math.round( player[key].reduce((a,b) => a + b) / player[key].length * 100 ) / 100  ))
			// 	}
				
			// }
			else {
				td.appendChild(	document.createTextNode(player[key]));
			}
			tr.appendChild(td);
		})
		// right-click
		tr.addEventListener('contextmenu', function(ev) {
	    ev.preventDefault();
	    playerClick(player.id, player.name, state.teams[1], state.teams[0])
	    render();
	    return false;
		}, false);
		// left-click
		tr.onclick = function() { 
			playerClick(player.id, player.name, state.teams[0], state.teams[1])
			render();
			// onPlayerClick(player.id, player.name)
		}

		tbody.appendChild(tr);
	});
	playersTable.appendChild(thead);
	playersTable.appendChild(tbody);
}


// TODO: fix and make for multiple
function displayPlayer(team, cWins, wins, losses, htmlId, ties) {
	var root = document.getElementById(htmlId);
	root.innerHTML = "";
	var nameDiv = document.createElement("h1")
	nameDiv.innerHTML = team.players.map(player => player.name).join(", ");
	root.appendChild(nameDiv);
	root.appendChild(document.createElement("br"));

	var cWinsDiv = document.createElement("span")
	console.log( "cwins", cWins);
	if(cWins == null) {
		cWinsDiv.innerHTML = "";
	} else {
		cWinsDiv.innerHTML = "Capt vs Capt wins: "  + cWins;
		root.appendChild(cWinsDiv);
		root.appendChild(document.createElement("br"));
	}
	
	var winsDiv = document.createElement("span")
	winsDiv.innerHTML = "Wins: " 							+ wins;
	if(wins == null ) {
		winsDiv.innerHTML = "";
	}
	root.appendChild(winsDiv);
	root.appendChild(document.createElement("br"));

	var lossesDiv = document.createElement("span")
	lossesDiv.innerHTML = "Losses: " 						+ losses;
	if(losses == null ) {
		lossesDiv.innerHTML = "";
	}
	root.appendChild(lossesDiv);
	root.appendChild(document.createElement("br"));

	var tiesDiv = document.createElement("span")
	if(ties) {
		tiesDiv.innerHTML = "Ties: " 						+ ties;	
		root.appendChild(tiesDiv);
	}
}

function displayNoPlayer()
{

}

function displayComparison(cData) {
	if(cData == null) {
		document.getElementById('ctable').style.display = "none";
		document.getElementById("matches").innerHTML 			= "n/a";
		document.getElementById("bothWin").innerHTML 			= "n/a"
		document.getElementById("bothLose").innerHTML 		= "n/a"
		document.getElementById("bothCaptain").innerHTML 	= "n/a"
		document.getElementById("ties").innerHTML 				= "n/a"
	}
	else {
		document.getElementById('ctable').style.display = "block";
		document.getElementById("matches").innerHTML 			= cData.matches;
		document.getElementById("bothWin").innerHTML 			= cData.bothWin;
		document.getElementById("bothLose").innerHTML 		= cData.bothLose;
		document.getElementById("bothCaptain").innerHTML 	= cData.bothCaptain;
		document.getElementById("ties").innerHTML 				= cData.ties;
	}
}

function createChart(htmlId) {
	var ctx = document.getElementById(htmlId).getContext('2d');
	return new Chart(ctx, {
	    type: 'line',
	    data: getData(),
	    options: {
        scales: {
        		yAxes: [{ 
        				// ticks: {min: 0, max: 2}
        		}],

            xAxes: [{
                type: 'time',
                // time: {
                // 	unit: 'day'
                // }
                
            }]
        },
        responsive: true
    }
	});
}

//Utils

function getCPM() 
{	state.playerArr.forEach( function(player){
		if( player.matches == 0) {
			player.cpm = "0%";
		} else {
			var cpm = (player.captained / player.matches) * 100;
			cpm = cpm.toString().substring(0,4);
			player.cpm = cpm + "%";
		}
		
	})
}

function getWR( captain) {
	state.playerArr.forEach( function(player){
		var wr;
		var winKey  = captain ? "cwin"  : "win";
		var lossKey = captain ? "closs" : "loss";
		var wrKey   = captain ? "cwr"   : "wr";

		if( player[lossKey] == 0) {
			player[wrKey] = player[winKey];
		}
		else {
			var wr = (player[winKey] / (player[lossKey] + player[winKey]) ) * 100
			wr = wr.toString().substring(0,4);
			player[wrKey] = wr + "%";
		}
		
	})
}

function cpm(player)
{	if(player.matches == 0 ){
	return 0;
	}
	else{
		return (player.captained / player.matches);
	}
}

// function CWR(player){}

// Filter functions
function filterByMatches( minMatches) {
	return state.playerArr.filter(function( player){ 
		return ( player.matches >= minMatches);
	})
}

// Compare functions for sorting
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
	cpma = cpm(a);
	cpmb = cpm(b);
	
  return cpm(b) - cpm(a);
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

function compCWR(a,b) {
	return parseFloat( b.cwr ) - parseFloat( a.cwr );
}

function compWR(a,b) {
	return parseFloat( b.wr ) - parseFloat( a.wr );
}

function compPick(a,b) {
	return parseFloat( a.avgpick ) - parseFloat( b.avgpick );
}

function compcwin(a,b) {
	return b.cwin- a.cwin;
}

function compcloss(a,b) {
	return b.closs- a.closs;
}

function compShazbucks(a,b) {
	return b.shazbucks - a.shazbucks;
}

function addData(chart, data) {
    chart.data = data;
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}


// URL stuff
function getUrl() {
	var url_string = window.location.href
	return new URL(url_string);
}

function getUrlTeams() {
	var url = getUrl();
	var teams = [url.searchParams.get("team1"), url.searchParams.get("team2")];
	teams.forEach(function(team,i){
		if(team) {
			ids = team.split(',');
			ids.forEach(function(id){
				addPlayer(id, state.players[id], state.teams[i]);
			})
		}
	})
	console.log(teams);
}

function getUrlServer() {
	var url = getUrl();
	var server = url.searchParams.get("server");
	return server;
}

function teamsToUrl(){
	var url_string = window.location.href;
	var urlTeams = [];
	state.teams.forEach(function(team,i){
		urlTeams.push(team.players.map(player => player.id).join(",") );
	})
	
	return location.protocol + '//' + location.host + location.pathname 
					+ "?team1=" + urlTeams[0] + "&team2=" + urlTeams[1];
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position="fixed";  //avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

$('#minMatchesInput').on('change', function(){
	render();
})

// borked	
// var copyUrlBtn = document.querySelector('.copy-url-btn')
// copyUrlBtn.addEventListener('click', function(event) {
//   copyTextToClipboard(teamsToUrl());
// });

});

