document.addEventListener('DOMContentLoaded', (event) => {
var url_string = window.location.href
var url = new URL(url_string);
var id1 = url.searchParams.get("id1");
var id2 = url.searchParams.get("id2");
var compareTwo = id1 ? id2 ? true : false : false;
console.log(id1)
console.log(id2)

console.log(compareTwo);

// function 

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

// Loop through every match/player and gather data
data.forEach(function(match){
	match.players.forEach(function(player){
		let obj = playerArr.find((stored,i) => {
			
			// if ()

			if(stored.id == player.user.id) {
					playerArr[i] = {  id: 				stored.id, 
														name: 			stored.name, 
														matches: 		stored.matches + 1, 
														captained:  (player.captain == 1) ? stored.captained + 1 : stored.captained,
														win: (match.winningTeam == player.team) ? stored.win + 1 : stored.win,
														loss: (match.winningTeam == player.team) ? stored.loss : stored.loss + 1,
													}
			return true; // = .find finishes						
			}
		})
	})
})

playerArr.forEach( function(player){
	player.captWinP = player.captained / player.matches;
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
// tbl.appendChild(tbdy)
// playersDiv.appendChild(tbl)

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

function compareCaptWinP(a, b) {
  return a.captWinP - b.captWinP;
}

})

function getIdLink(id,name) {
	var url_string = window.location.href
	var url = new URL(url_string);
	var noParams = window.location.href.split('?')[0];
	var a = document.createElement('a');
	var linkText = document.createTextNode(name);
	a.appendChild(linkText);

	// "Routing"
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
	// a.title = "my title text";
	return a;
}