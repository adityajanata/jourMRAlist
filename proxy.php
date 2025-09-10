<?php
// Ambil URL target dari query
if (!isset($_GET['url'])) {
    http_response_code(400);
    echo "URL tidak ditemukan";
    exit;
}

$url = $_GET['url'];

// Validasi biar aman (optional bisa ditambah whitelist domain)
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo "URL tidak valid";
    exit;
}

// Ambil isi web dengan cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0");
$html = curl_exec($ch);
curl_close($ch);

// Balikin ke browser
echo $html;
