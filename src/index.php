<?php
header('Content-Type: application/json');
$key='';
$id = $_GET["id"];
isThereAnyDeal($id, $key);

/*
 * Functions
 */
function curl($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, FALSE);

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response);
}

function curlMulti($urls) {
    $ch = array();
    $mh = curl_multi_init();
    $result = array();
    foreach ($urls as $key => $url) {
        $ch[$key] = curl_init();
        curl_setopt($ch[$key], CURLOPT_URL, $url);
        curl_setopt($ch[$key], CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch[$key], CURLOPT_HEADER, FALSE);
        curl_multi_add_handle($mh, $ch[$key]);
    }

    $running = null;
    do {
        curl_multi_exec($mh, $running);
    } while ($running > 0);

    foreach ($ch as $key => $c) {
        $result[$key] = json_decode(curl_multi_getcontent($c));
        curl_multi_remove_handle($mh, $c);
    }

    curl_multi_close($mh);
    return $result;
}

function isThereAnyDeal($id, $key) {
    validateId($id);
    $plainResponse = curl("https://api.isthereanydeal.com/v02/game/plain/?key=$key&shop=steam&game_id=app/$id");
    $plain = $plainResponse->data->plain;
    $urls = array(
        "info" => "https://api.isthereanydeal.com/v01/game/info/?key=$key&plains=$plain",
        "prices" => "https://api.isthereanydeal.com/v01/game/prices/?key=$key&plains=$plain",
        "lowest" => "https://api.isthereanydeal.com/v01/game/lowest/?key=$key&plains=$plain",
        "bundles" => "https://api.isthereanydeal.com/v01/game/bundles/?key=$key&plains=$plain"
    );
    $response = curlMulti($urls);
    echo json_encode($response);
    exit();
}

function validateId($id) {
    if (preg_match('/^[0-9]{1,9}$/', $id) !== 1) {
        http_response_code(400);
        echo json_encode(array(
            "error" => "bad request",
            "error_description" => "invalid id"
        ));
        exit();
    }
}
