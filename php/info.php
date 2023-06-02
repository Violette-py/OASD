<?php error_reporting(0); ?>
<?php
// session_start();

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: *"); // GET, POST, PUT, OPTIONS

// NOTE: 建立数据库连接
$mysql_server = 'localhost';
$mysql_name = 'root';
$mysql_password = 'gansui';
$mysql_database = 'myweb';

$conn = new mysqli($mysql_server, $mysql_name, $mysql_password, $mysql_database);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 使用预处理语句绑定参数和执行查询
// $stmt = $conn->prepare('SELECT * FROM user WHERE name = ?'); // 防SQL注入
// $stmt->bind_param('s', $name);
// $stmt->execute();
// 获取查询结果
// $result = $stmt->get_result();

// NOTE: GET请求

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $requestType = $_GET['requestType'];
    $userId = $_GET['userId'];

    switch ($requestType) {
        case 'getInfo':

            // 查询数据库中对应的用户记录
            $searchSql = "SELECT * FROM user WHERE userId = '$userId'";
            $result = $conn->query($searchSql);

            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $response = [
                    'success' => true,
                    'data' => $row
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
            break;

        default:
            // 处理未知请求类型
            break;
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // NOTE: POST请求

} else {

    // NOTE: PUT请求

    // $requestType = $_POST['requestType'];
    // $userId = $_POST['userId'];

    $jsonData = file_get_contents('php://input'); // 获取请求参数
    $data = json_decode($jsonData, true); // 解析 JSON 数据为关联数组

    $requestType = $data['requestType'];
    $userId = $data['userId'];

    $searchSql = "SELECT * FROM user WHERE userId = '$userId'";
    $result = $conn->query($searchSql);

    // 检查查询结果
    if ($result && $result->num_rows > 0) {

        // 获取用户记录
        $row = $result->fetch_assoc();

        switch ($requestType) {

            // NOTE: 更新余额
            case 'updateBalance':
                $amount = $data['amount'];
                $currentBalance = $row['balance'];
                $newBalance = $currentBalance + $amount;

                $updateSql = "UPDATE user SET balance = $newBalance WHERE userId = '$userId'";

                if ($conn->query($updateSql) === TRUE) {
                    $response = [
                        'success' => true,
                        'message' => '充值成功',
                    ];
                } else {
                    $response = [
                        'success' => false,
                        'message' => '充值失败: ' . $conn->error
                    ];
                }
                break;

            // NOTE: 修改基本信息
            case 'updateBasicInfo':
                $name = $data['name'];
                $gender = $data['gender'];
                $birthdate = $data['birthdate'];
                $email = $data['email'];
                $telephone = $data['telephone'];
                $address = $data['address'];

                // 更新用户信息
                $updateSql = "UPDATE user SET name = '$name', gender = '$gender', birthdate = '$birthdate', email = '$email', telephone = '$telephone', address = '$address' WHERE userId = '$userId'";

                if ($conn->query($updateSql) === TRUE) {
                    $response = [
                        'success' => true,
                        'message' => '信息更改成功'
                    ];
                } else {
                    $response = [
                        'success' => false,
                        'message' => '信息更改失败: ' . $conn->error
                    ];
                }
                break;

            // NOTE: 修改密码
            case 'changePassword':

                $oldPassword = $data['oldPassword'];
                $newPassword = $data['newPassword'];

                // 检查旧密码是否匹配
                $storedPassword = $row['password'];
                $salt = $row['salt'];
                // $hashedPassword = password_hash($salt . $oldPassword, PASSWORD_BCRYPT);
                // password_verify($hashedPassword, $storedPassword)

                if (password_verify($salt . $oldPassword, $storedPassword)) {

                    // 生成新的盐值和哈希密码
                    $newSalt = bin2hex(random_bytes(16));
                    $newHashedPassword = password_hash($newSalt . $newPassword, PASSWORD_BCRYPT);

                    // 更新用户密码
                    $updateSql = "UPDATE user SET password = '$newHashedPassword', salt = '$newSalt' WHERE userId = '$userId'";

                    if ($conn->query($updateSql) === TRUE) {
                        $response = [
                            'success' => true,
                            'message' => '密码修改成功'
                        ];
                    } else {
                        $response = [
                            'success' => false,
                            'message' => '密码修改失败: ' . $conn->error
                        ];
                    }
                } else {
                    $response = [
                        'success' => false,
                        'message' => '旧密码输入错误'
                    ];
                }
                break;

            default:
                $response = [
                    'success' => false,
                    'message' => 'Unknown requestType'
                ];
                break;
        }
    } else {
        $response = [
            'userId' => $userId,
            'success' => false,
            'message' => 'User Not Found'
        ];
    }
}

// 返回响应
header('Content-Type: application/json');
echo json_encode($response);

// 关闭数据库连接
$conn->close();

?>