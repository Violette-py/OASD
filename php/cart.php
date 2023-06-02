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

// NOTE: POST

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 获取请求体中的数据
    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);

    $requestType = $data['requestType'];

    switch ($requestType) {

        // NOTE: 添加购物车

        case 'addCart':

            $userId = $data['userId'];
            $artworkId = $data['artworkId'];

            $insertSql = "INSERT INTO cart (userId, artworkId) VALUES ('$userId', '$artworkId')";

            if ($conn->query($insertSql) === TRUE) {
                $response = [
                    'status' => 'success',
                    'message' => '添加到购物车成功'
                ];
            } else {
                $response = [
                    'status' => 'error',
                    'message' => '添加到购物车失败: ' . $conn->error
                ];
            }

            break;

        // NOTE: 删除购物车

        case 'deleteCart':

            $cartIds = $data['cartIds'];

            $cartIdsStr = implode(',', $cartIds);
            $deleteSql = "DELETE FROM `cart` WHERE cartId IN ($cartIdsStr)";

            if ($conn->query($deleteSql) === TRUE) {
                $response = [
                    'success' => true,
                    'message' => '删除购物车记录成功'
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => '删除购物车记录失败: ' . $conn->error
                ];
            }

            break;

        // NOTE: 购买下单

        case 'checkCart':

            $userId = $data['userId'];
            $totalPrice = $data['totalPrice'];
            $cartIds = $data['cartIds'];
            $artworkIds = $data['artworkIds'];

            // 检查用户余额是否充足
            $userQuery = "SELECT balance FROM user WHERE userId = '$userId'";
            $userResult = $conn->query($userQuery);

            if ($userResult->num_rows > 0) {

                $userData = $userResult->fetch_assoc();
                $balance = $userData['balance'];

                if ($balance >= $totalPrice) {
                    // 用户余额充足，进行购买操作

                    // 开启事务
                    $conn->begin_transaction();

                    try {
                        // order表单 -- 插入订单记录
                        foreach ($artworkIds as $artworkId) {
                            $orderQuery = "INSERT INTO `order` (userId, artworkId) VALUES ('$userId', '$artworkId')";
                            $conn->query($orderQuery);
                        }

                        // NOTE: 以下功能通过数据库的trigger实现

                        // // artwork表单 -- 修改商品状态为"已售出"
                        // foreach ($artworkIds as $artworkId) {
                        //     $updateSql = "UPDATE artwork SET status = '已售出' WHERE artworkId = '$artworkId'";
                        //     $conn->query($updateSql);
                        // }

                        // // artwork表单 -- 更新卖方用户余额
                        // $sellerQuery = "SELECT ownerId, price FROM artwork WHERE artworkId IN (" . implode(',', $artworkIds) . ")";
                        // $sellerResult = $conn->query($sellerQuery);

                        // while ($row = $sellerResult->fetch_assoc()) {
                        //     $artworkOwner = $row['ownerId'];
                        //     $artworkPrice = $row['price'];

                        //     $sellerUpdateQuery = "UPDATE user SET balance = balance + $artworkPrice WHERE userId = '$artworkOwner'";
                        //     $conn->query($sellerUpdateQuery);
                        // }

                        // // cart表单 -- 删除已购买的商品
                        // $cartIdsString = implode(',', $cartIds);
                        // $cartDeleteQuery = "DELETE FROM cart WHERE cartId IN ($cartIdsString)";
                        // $conn->query($cartDeleteQuery);

                        // // user表单 -- 更新买方用户余额
                        // $newBalance = $balance - $totalPrice;
                        // $userUpdateQuery = "UPDATE user SET balance = $newBalance WHERE userId = '$userId'";
                        // $conn->query($userUpdateQuery);

                        // 提交事务
                        $conn->commit();

                        // 返回购买成功信息
                        $response = [
                            'success' => true,
                            'message' => '购买成功！'
                        ];
                    } catch (Exception $e) {
                        // 出现异常，回滚事务
                        $conn->rollback();

                        $response = [
                            'success' => false,
                            'message' => '购买失败：' . $e->getMessage()
                        ];
                    }
                } else {
                    // 用户余额不足，返回错误信息
                    $response = [
                        'success' => false,
                        'message' => '余额不足，购买失败！'
                    ];
                }
            } else {
                // 用户不存在或查询错误，返回错误信息
                $response = [
                    'success' => false,
                    'message' => '用户不存在或查询错误！'
                ];
            }

            break;

        default:

            break;
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // NOTE: GET

    $requestType = $_GET['requestType'];

    switch ($requestType) {

        // NOTE: 展示购物车列表

        case 'getCart':

            $userId = $_GET['userId'];

            // 查询cart表中符合userId条件的记录
            $cartSql = "SELECT * FROM cart WHERE userId = '$userId'";
            $cartResult = $conn->query($cartSql);

            // 构建结果数组
            $response = array();

            if ($cartResult->num_rows > 0) {
                while ($cartRow = $cartResult->fetch_assoc()) {
                    $artworkId = $cartRow['artworkId'];

                    // 查询artwork表中对应的艺术品信息
                    $artworkSql = "SELECT * FROM artwork WHERE artworkId = '$artworkId'";
                    $artworkResult = $conn->query($artworkSql);

                    if ($artworkResult->num_rows > 0) {
                        while ($artworkRow = $artworkResult->fetch_assoc()) {
                            $item = array(
                                'cartId' => $cartRow['cartId'],  // NOTE: 注意这里是cartRow
                                'artworkId' => $artworkRow['artworkId'],
                                'status' => $artworkRow['status'],
                                'imageFileName' => $artworkRow['imageFileName'],
                                'title' => $artworkRow['title'],
                                'artist' => $artworkRow['artist'],
                                'price' => $artworkRow['price'],
                                'introduction' => $artworkRow['introduction']
                            );
                            array_push($response, $item);
                        }
                    }
                }
            }

            // 检查购物车项是否为空
            if (empty($response)) {
                // 用户购物车当前为空
                $response = array('message' => '用户购物车当前为空');
            }

            break;

        // NOTE: 检查用户是否已将某商品添加到购物车

        case 'ifHasAddedToCart':

            $userId = $_GET['userId'];
            $artworkId = $_GET['artworkId'];

            $query = "SELECT * FROM cart WHERE userId = '$userId' AND artworkId = '$artworkId'";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $response = [
                    'exists' => true // 用户已将商品加入购物车
                ];
            } else {
                $response = [
                    'exists' => false
                ];
            }

            break;


        default:
            break;
    }

}

// 返回响应
header('Content-Type: application/json');
echo json_encode($response);

// 关闭数据库连接
$conn->close();

?>