<?php error_reporting(0); ?>
<?php
session_start();

header('Access-Control-Allow-Origin: *');

$mysql_server = 'localhost';
$mysql_name = 'root';
$mysql_password = 'gansui';
$mysql_database = 'myweb';

$conn = new mysqli($mysql_server, $mysql_name, $mysql_password, $mysql_database);
if ($conn->connect_error) {
    die("数据库连接失败：" . $conn->connect_error);
}

// 获取登录表单数据
$name = $_POST['name'];
$password = $_POST['password'];

// // 数据再次校验
// if (empty($name) || empty($password)) {
//     echo "<script>alert('请填写完整的登录信息');</script>";
//     exit();
// }

// 查询数据库
$query = "SELECT * FROM user WHERE name = '$name'";
$result = mysqli_query($conn, $query);
$row = mysqli_fetch_array($result);

if ($row) {
    $salt = $row['salt'];
    if (password_verify($salt . $password, $row['password'])) {

        $response = [
            'success' => true,
            'message' => '登录成功',
            'name' => $row['name'],
            'userId' => $row['userId']
        ];

        // echo "<script>
        //         alert('登录成功');
        //         location = '../html/home.html';
        //         sessionStorage.setItem('name', '" . $name . "');
        //         sessionStorage.setItem('userId', '" . $row['userId'] . "');
        //     </script>";
    } else {

        $response = [
            'success' => false,
            'message' => '登录失败，用户名或密码错误'
        ];
        // echo "<script>alert('用户名或密码错误');history.back();</script>";
    }
} else {
    $response = [
        'success' => false,
        'message' => '登录失败，用户不存在'
    ];
    // echo "<script>alert('用户不存在');history.back();</script>";
}

// 返回响应
header('Content-Type: application/json');
echo json_encode($response);

// 关闭数据库连接
$conn->close();