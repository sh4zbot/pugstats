<?php

// $ma  = 581709467239055360;
// $ta  = 539495516581658645;
// $ce  = 681439528292057097;

$servers = 	[ "ta"   		=> 539495516581658645
						, "naTA"		=> 631438713183797258
		   			, "dae"  		=> 581709467239055360
						, "mace" 		=> 681439528292057097
						, "bittah"	=> 231050003500498945
						, "t1" 			=> 127155819698454529

						];

$url = "http://50.116.36.119/api/server/";
ini_set('default_socket_timeout', 15);
foreach( $servers as $name=>$id) {
	$json = @file_get_contents($url . $id . '/games');
	if( $json === FALSE)
	{
		echo "Can't access matches from $name";
		// error, do nothing
	}
	else {
		$data = "data" . $name . " = " . $json . ";";
		file_put_contents($name . ".json", $data);
	}
	

}

//shazbucks
$shazbucks = file_get_contents("https://club77.org/shazbuckbot/users.py");
if( $shazbucks === FALSE)
{	echo "Can't access shazbucks";
	// error, do nothing
}
else {
	file_put_contents("shazbucks.json", "datashazbucks = " . $shazbucks . ";");	
}
