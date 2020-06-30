<?php

// $ma  = 581709467239055360;
// $ta  = 539495516581658645;
// $ce  = 681439528292057097;

$servers = 	[ "ta"   	=> 539495516581658645
		   	, "dae"  	=> 581709467239055360
			, "mace" 	=> 681439528292057097
			, "bittah" 	=> 231050003500498945
			, "t1" 		=> 127155819698454529
			];

$url = "http://50.116.36.119/api/server/";

foreach( $servers as $name=>$id) {
	$json = file_get_contents($url . $id . '/games');
	$data = "data" . $name . " = " . $json . ";";
	file_put_contents($name . ".json", $data);
}