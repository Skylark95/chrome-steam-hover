<?php
header('Content-Type: application/json');
$key='';
$appid = $_GET["appid"];
$cc = $_GET["cc"];
isThereAnyDeal($appid, $key, $cc);

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

function isThereAnyDeal($appid, $key, $cc) {
    validateId($appid);
    validateCC($cc);
    $plainResponse = curl("https://api.isthereanydeal.com/v02/game/plain/?key=$key&shop=steam&game_id=app/$appid");
    $plain = $plainResponse->data->plain;
    $urls = array(
        "prices" => "https://api.isthereanydeal.com/v01/game/prices/?key=$key&plains=$plain",
        "lowest" => "https://api.isthereanydeal.com/v01/game/lowest/?key=$key&plains=$plain",
        "bundles" => "https://api.isthereanydeal.com/v01/game/bundles/?key=$key&plains=$plain"
    );
    $response = curlMulti($urls);
    // echo json_encode($price);
    echo json_encode([
        "current_low" => getCurrentLow($response["prices"], $plain),
        "historical_low" => getHistoricalLow($response["lowest"], $plain),
        "bundles" => getBundles($response["bundles"], $plain),
        ".meta" => getMeta($response["prices"], $appid, $cc),
        ".cache" => getCache()
    ]);
    exit();
}

function validateId($appid) {
    if (preg_match('/^[0-9]{1,9}$/', $appid) !== 1) {
        http_response_code(400);
        echo json_encode([
            "error" => "bad request",
            "error_description" => "invalid appid"
        ]);
        exit();
    }
}

function validateCC($cc) {
    if (preg_match('/^[A-Z]{2}$/', $cc) !== 1) {
        http_response_code(400);
        echo json_encode([
            "error" => "bad request",
            "error_description" => "invalid country code"
        ]);
        exit();
    }
}

function getCurrentLow($prices, $plain) {
    $list = $prices->data->$plain->list;
    return array_reduce($list, function($carry, $item) {
        if ($item->price_new < $carry->price_new) {
            return $item;
        }
        return $carry;
    }, (object) ["price_new" => PHP_INT_MAX]);
}

function getHistoricalLow($lowest, $plain) {
    return $lowest->data->$plain;
}

function getBundles($bundles, $plain) {
    return $bundles->data->$plain;
}

function getMeta($obj, $appid, $cc) {
    return array(
        "appid" => $appid,
        "cc" => $cc,
        "currency" => $obj->{'.meta'}->currency
    );
}

function getCache() {
    return array(
        "is_cached" => false
    );
}
