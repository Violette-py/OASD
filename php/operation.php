<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");


ini_set('display_errors', 1);
error_reporting(E_ALL);

// header("Access-Control-Allow-Origin: http://localhost:3000");

// NOTE: 建立数据库连接
$mysql_server = 'localhost';
$mysql_name = 'root';
$mysql_password = 'gansui';
$mysql_database = 'myweb';

$conn = new mysqli($mysql_server, $mysql_name, $mysql_password, $mysql_database);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);

    $userId = $data['userId'];
    $artworkId = $data['artworkId'];
    $operationType = $data['operationType'];

    $insertSql = "INSERT INTO operation (userId, artworkId, operationType) VALUES ('$userId', '$artworkId', '$operationType')";

    if ($conn->query($insertSql) === TRUE) {
        $response = [
            'success' => 'true',
            'message' => '记录用户行为成功'
        ];
    } else {
        $response = [
            'success' => 'false',
            'message' => '记录用户行为失败: ' . $conn->error
        ];
    }

} else {
    $response = [
        'success' => 'false',
        'message' => 'Unknown REQUEST_METHOD'
    ];
}

// 返回响应
header('Content-Type: application/json');
echo json_encode($response);

// 关闭数据库连接
$conn->close();

?>