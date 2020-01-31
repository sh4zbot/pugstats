var state = {data: data}; 

document.addEventListener('DOMContentLoaded', (event) => {

// Uncomment to handl URL id parameters

// var url_string = window.location.href
// var url = new URL(url_string);
// state.id1 = url.searchParams.get("id1");
// state.id2 = url.searchParams.get("id2");
// var compareTwo = state.id1 ? state.id2 ? true : false : false;

// if (state.id1 && state.id2) {	
// 	displayComparison(state.cData);
// }

// if(state.id1) {
// 	displayPlayer(state.player1.name, state.cData.p1cwin, state.cData.p1win, state.cData.p2win, state.player1.htmlId);
// }
// if(state.id2) {
// 	displayPlayer(state.player2.name, state.cData.p2cwin, state.cData.p2win, state.cData.p1win, state.player2.htmlId);
// }
team = {players: []}
state.teams = [{ name: "Diamond Sword",
								 players: []},
							 { name: "Blood Eagle",
								 players: []}
							];

main();

function moreThanOne(){
	state.teams.forEach(function(team){
		if (team.players > 1) {
			return true;
		}
	})
	return false;
}


function main() {
	init(state);
	addDateOnChangeListener('datemin');
	addDateOnChangeListener('datemax');
	getCompareStats(state);
	getCPM();
	getCWR();
	state.compFn = compMatches;
	displayIndexTable();
}

// re-render everything
function render() {
	init(state)
	// we have multiple players selected for one team
	//TODO Here
	if(moreThanOne()){
		state.teams.map(function(team) {
			var stats = getMultipleTogetherData(state.teams[0].players.map(p => p.id));
		})
		var stats = getMultipleTogetherData(state.teams[0].players.map(p => p.id));
	}
	else {
		var playerData = getPlayerData(state.id1)
		var chartData = matchesToTimelineData(playerData.matches, state.id1);
		pickOrderTable(playerData.picks, "pickOrderTable1");
		addData(state.chart1, chartData);
	}

	if(Array.isArray(state.id2)) {
		var stats = getMultipleTogetherData(state.id2);
	} else {
		var playerData = getPlayerData(state.id2)
		var chartData = matchesToTimelineData(playerData.matches, state.id2);
		pickOrderTable(playerData.picks, "pickOrderTable2");
		addData(state.chart2, chartData);
	}


	getCompareStats(state);
	getCPM(); 
	getCWR();
	displayPlayer(state.player2.name, state.cData.p2cwin, state.cData.p2win, state.cData.p1win, state.player2.htmlId);
	displayPlayer(state.player1.name, state.cData.p1cwin, state.cData.p1win, state.cData.p2win, state.player1.htmlId);
	displayIndexTable();
	if (state.id1 && state.id2) {	
		displayComparison(state.cData)
	}
}

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
									 				 cwin: 0,
									 				 closs: 0,
									});
	
	});

	state.player1 = {	htmlId: "p1" };
	state.player2 = {	htmlId: "p2" };

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

	
	state.chart1 = createChart("chart1");
	state.chart2 = createChart("chart2");
}



/*	
 *	Data 
 */
 console.log(state);

// Find matches where all of usrIds participated
function getMultipleTogetherData(usrIds) {
	const matches = state.data.filter(function(match) {
		if (match.queue.id != 1548704432021)
		{ return false;}
		if (match.timestamp < state.datemin || match.timestamp > state.datemax) 
		{ return false;}
		return usrIds.every(function(usrId){
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
		var sameTeam = usrIds.every(function(usrId){ 
			var player = match.players.find(function(player){
				return (player.user.id == usrId);
			})
			if (team == null) {
				team = player.team;
				return true;
			} else {
				if(player.team == team) {
					if(match.winningTeam == team) {
						win++;
					} else if (match.winningTeam != 0) {
						loss++; 
					} else if (match.winningTeam == 0) {
						tie++;
					}
					return true;
				}
				return player.team == team;
			}
		})
		// console.log(sameTeam);
		return sameTeam;
	})
	console.log("wins: " + win + "ties: " + tie + "loss: " + loss)
	console.log("matchesTogether");
	console.log(matchesTogether);
	return { win: win, loss: loss, tie: tie}
 }

 console.log(getMultipleTogetherData([ "88450928457322500", "88439166618062850", "347125254050676740", "214799031677747200"]));

function getPlayerData(playerid) {

	var picks = [];
	for(i=1;i<=12;i++){
		picks.push({win: 0, loss: 0, tie: 0});
	}
	const res = state.data.filter(function(match) {
		if (match.queue.id != 1548704432021)
		{ return false;}
		if (match.timestamp < state.datemin || match.timestamp > state.datemax) {
			return;
		}
		const found = match.players.find(function(player){
			if(player.user.id === parseInt(playerid)) {
				if(player.captain != 1) {
					if(player.pickOrder == null) {
						//player was subbed out - do nothing
					}
					else if (match.winningTeam == player.team) {
						picks[player.pickOrder-1].win++;
					} else if (match.winningTeam != 0) {
						picks[player.pickOrder-1].loss++;
					} else if (match.winningTeam == 0) {
						picks[player.pickOrder-1].tie++;
					}	
				}
				return true;
			}
			// return (player.user.id === parseInt(playerid));
		})
		return found;
	})
	return {matches: res,
					picks:   picks};
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
			pickData.push({t: match.timestamp, y: pickOrder.reduce((a, b) => a + b, pickOrder[0]) / pickCount});
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


function getCompareStats(state) {
	// Loop through every match/player and gather data
	data.forEach(function(match){
		// Only looking at stats for PUG queue
	 	if (match.queue.id != 1548704432021) {
	 		return;
	 	}
	 	if (match.timestamp < state.datemin || match.timestamp > state.datemax) {
			return;
		}
		var matchPlayerArr = [];

		match.players.forEach(function(player){
			
			if(state.id1 && state.id2) { // if we are comparing two players
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
																		cwin: (player.captain && match.winningTeam==player.team) ? stored.cwin + 1 : stored.cwin,
																		closs: (match.winningTeam != 0 && player.captain &&  match.winningTeam != player.team) ? stored.closs + 1 : stored.closs
														}
				return true; // return true == .find() is done			
				}
			})
		});
		
		if(state.id1 && state.id2) {
			var found1 = false, found2 = false;
			matchPlayerArr.forEach((player) => {
				if (parseInt(player.id) === parseInt(state.id1)) {
					found1 = true;
					fp1 = player;
				}
				if (parseInt(player.id) === parseInt(state.id2)) {
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

function playerClick(id,name,team) {
	if(team.players.length > 0 && team.players.find(player => player.id == id)) {
		team.players = team.players.filter(player => player.id != id)
	} else {
		team.players.push({id: id, name: name});
	}
	console.log(team);
	return team;
}

console.log("ck");
console.log(playerClick(1,"sh4z",{players: [{id: 1, name: "sh4z"},  {id: 2, name: "jp"}]}))

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
  case "cwin":
  	state.compFn = compcwin;
    displayIndexTable();
    break;
  case "closs":
		state.compFn = compcloss;
  	displayIndexTable();
  	break;
  default:
	}
}

function pickOrderTable(pickOrder,htmlId) {
	var table = document.getElementById(htmlId);
	table.innerHTML="";
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
		tr.insertCell().appendChild(document.createTextNode('#' + (i+1)  ));
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
				return;
			}
			if(key == "name") {
				td.appendChild( document.createTextNode(player[key]))
			}
			else {
				td.appendChild(document.createTextNode( player[key]));
			}
			tr.appendChild(td);
		})
		// right-click
		tr.addEventListener('contextmenu', function(ev) {
	    ev.preventDefault();
	    playerClick(player.id, player.name, state.teams[1])
	    return false;
		}, false);
		// left-click
		tr.onclick = function() { 
			playerClick(player.id, player.name, state.teams[0])
			// onPlayerClick(player.id, player.name)
		}

		tbody.appendChild(tr);
	});
	playersTable.appendChild(thead);
	playersTable.appendChild(tbody);
}

// View stuff
function displayPlayer(name, cWins, wins, losses, htmlId) {
	document.getElementById(htmlId + "Name")  
		.innerHTML = name;
	document.getElementById(htmlId + "cWins") 
	  .innerHTML = "Capt vs Capt wins: "  + cWins;
	document.getElementById(htmlId + "Wins")  
		.innerHTML = "Wins: " 							+ wins;
	document.getElementById(htmlId + "Losses")
		.innerHTML = "Losses: " 						+ losses;
}

function displayComparison(cData) {
	document.getElementById("matches").innerHTML 			= cData.matches;
	document.getElementById("bothWin").innerHTML 			= cData.bothWin;
	document.getElementById("bothLose").innerHTML 		= cData.bothLose;
	document.getElementById("bothCaptain").innerHTML 	= cData.bothCaptain;
	document.getElementById("ties").innerHTML 				= cData.ties;
}

function createChart(htmlId) {
	var ctx = document.getElementById(htmlId).getContext('2d');
	return new Chart(ctx, {
	    type: 'line',
	    data: data,
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
			console.log("matcehs == 0")
		} else {
			var cpm = (player.captained / player.matches) * 100;
			cpm = cpm.toString().substring(0,4);
			player.cpm = cpm + "%";
		}
		
	})
}

function getCWR() {
	state.playerArr.forEach( function(player){
		if( player.closs == 0) {
			player.cwr = player.cwin;
		}
		else {
			var cwr = (player.cwin / player.closs) /// 2 * 100;
			cwr = cwr.toString().substring(0,4);
			player.cwr = cwr //+ "%";
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

function compcwin(a,b) {
	return b.cwin- a.cwin;
}

function compcloss(a,b) {
	return b.closs- a.closs;
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

});














// relic code; url parameter navigation

// function getIdLink(id,name) {
// 	var url_string = window.location.href
// 	var url = new URL(url_string);
// 	var noParams = window.location.href.split('?')[0];
// 	var a = document.createElement('a');
// 	var linkText = document.createTextNode(name);
// 	a.appendChild(linkText);

// 	// shitty "routing" state machine
// 	if ( url.searchParams.get("id2")) {
// 		if( url.searchParams.get("id1") === id || 
// 				url.searchParams.get("id2") === id ) { 
// 			a.href = noParams;
// 		} else {
// 			a.href = window.location.href.split('&')[0] + "&id2=" + id;
// 		}
		
// 	}
// 	else if ( url.searchParams.get("id1")) {
// 		if( url.searchParams.get("id1") === id) {
// 			a.href = noParams;
// 		} else {
// 			a.href = window.location + "&id2=" + id;
// 		}
// 	}
// 	else {
// 		a.href = noParams + "?id1=" + id;
// 	}
// 	return a;
// }