<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: *");

ini_set('display_errors', 1);
error_reporting(E_ALL);

// NOTE: 建立数据库连接
$mysql_server = 'localhost';
$mysql_name = 'root';
$mysql_password = 'gansui';
$mysql_database = 'myweb';

$conn = new mysqli($mysql_server, $mysql_name, $mysql_password, $mysql_database);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // $requestType = $_GET['requestType']; // 暂时不需要switch-case
    // $artworkId = $_GET['artworkId'];

    // $searchSql = "SELECT * FROM artwork WHERE artworkId = '$artworkId'";
    // $result = $conn->query($searchSql);

    // // 检查查询结果
    // if ($result->num_rows > 0) {

    //     // 提取查询结果中的数据
    //     $artwork = $result->fetch_assoc();

    //     // 构建响应数据
    //     $artworkDetail = array(
    //         'ownerId' => $artwork['ownerId'],
    //         'status' => $artwork['status'],
    //         'view' => $artwork['view'],
    //         'imageFileName' => $artwork['imageFileName'],
    //         'title' => $artwork['title'],
    //         'artist' => $artwork['artist'],
    //         'introduction' => $artwork['introduction'],
    //         'price' => $artwork['price'],
    //         'genre' => $artwork['genre'],
    //         'year' => $artwork['year'],
    //         'width' => $artwork['width'],
    //         'height' => $artwork['height'],
    //         'releasedTime' => $artwork['timeReleased']
    //     );

    //     $response = [
    //         'success' => true,
    //         'data' => $artworkDetail
    //     ];

    $requestType = $_GET['requestType']; // 暂时不需要 switch-case
    $artworkId = $_GET['artworkId'];

    $searchSql = "SELECT * FROM artwork WHERE artworkId = ?";
    $stmt = $conn->prepare($searchSql);
    $stmt->bind_param('s', $artworkId);
    $stmt->execute();

    $result = $stmt->get_result();

    // 检查查询结果
    if ($result->num_rows > 0) {

        // 提取查询结果中的数据
        $artwork = $result->fetch_assoc();

        // 获取 ownerId
        $ownerId = $artwork['ownerId'];

        // 查询 user 表获取 owner 的信息
        $userSql = "SELECT name FROM user WHERE userId = ?";
        $stmt = $conn->prepare($userSql);
        $stmt->bind_param('s', $ownerId);
        $stmt->execute();

        $userResult = $stmt->get_result();

        if ($userResult->num_rows > 0) {
            $user = $userResult->fetch_assoc();
            $ownerName = $user['name'];

            // 构建响应数据
            $artworkDetail = array(
                'ownerId' => $ownerId,
                'ownerName' => $ownerName,
                'status' => $artwork['status'],
                'view' => $artwork['view'],
                'imageFileName' => $artwork['imageFileName'],
                'title' => $artwork['title'],
                'artist' => $artwork['artist'],
                'introduction' => $artwork['introduction'],
                'price' => $artwork['price'],
                'genre' => $artwork['genre'],
                'year' => $artwork['year'],
                'width' => $artwork['width'],
                'height' => $artwork['height'],
                'releasedTime' => $artwork['timeReleased']
            );

            $response = [
                'success' => true,
                'data' => $artworkDetail
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Owner information not found.'
            ];
        }
    } else {

        $response = [
            'success' => false,
            'message' => 'Artwork not found'
        ];
    }

}

// 返回响应
header('Content-Type: application/json');
echo json_encode($response);

// 关闭数据库连接
$conn->close();

?>