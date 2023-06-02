<?php error_reporting(0); ?>
<?php
// session_start();

// 允许来自任何源的跨域请求 (可以将*替换为相应的具体的源)
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: *");

// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type");

// 获取表单数据
$name = $_POST['name'];
$password = $_POST['password'];
$balance = 0;
$gender = $_POST['gender'];
$birthdate = $_POST['birthdate'];
$email = $_POST['email'];
$telephone = $_POST['telephone'];
$address = $_POST['address'];

// 进行数据验证
if (empty($name) || empty($password)) {
    // 某个字段为空，返回错误响应
    // echo 'Error: Missing required fields. [in PHP]';
    exit();
}

// echo 'here is test  ';

// 进行进一步的数据验证，例如验证电子邮件格式、密码强度等（需要假设前端什么校验都没做过？？）

// NOTE: 连接数据库

// 数据验证通过，将数据存入数据库
$mysql_server = 'localhost';
$mysql_name = 'root';
$mysql_password = 'gansui';
$mysql_database = 'myweb';

// 创建MySQL连接
$conn = new mysqli($mysql_server, $mysql_name, $mysql_password, $mysql_database);

// 检查连接是否成功
if ($conn->connect_error) {
    die("数据库连接失败：" . $conn->connect_error);
}

// echo 'sql connection successfully  ';

// NOTE: 用户名不得与已有用户名重复 

// 查询数据库中是否存在相同的用户名
$query = "SELECT COUNT(*) FROM user WHERE name = '$name'";
$result = mysqli_query($conn, $query);
$row = mysqli_fetch_array($result);

// 如果查询结果大于 0，表示存在重复的用户名
if ($row[0] > 0) {
    echo "<script>alert('用户名已存在，请选择一个不同的用户名！');</script>";
    // echo "用户名已存在，请选择一个不同的用户名！";
} else {
    // echo "用户名可用";

    // NOTE: 对用户密码进行哈希加盐（需要存储盐值）

    // 生成随机盐值
    $salt = bin2hex(random_bytes(16)); // 生成一个16字节的随机盐值

    // 将盐值与密码组合

    // 使用 bcrypt 进行哈希
    $hashedPassword = password_hash($salt . $password, PASSWORD_BCRYPT);

    // $hashedPassword = hash('sha256', $salt . $password);

    // $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // NOTE: 插入数据
    $sql = "INSERT INTO user (name, password, salt, balance, gender, birthdate, email, telephone, address) VALUES ('$name', '$hashedPassword', '$salt', '$balance', '$gender', '$birthdate', '$email', '$telephone', '$address')";

    if ($conn->query($sql) === TRUE) {
        echo 'Registration successful.';
        // header("Location: login.html"); // 重定向到登录界面
        echo "<script>
                    alert('注册成功');
                    location='../html/login.html'
                </script>";
        exit();
    } else {
        echo 'Error: ' . $conn->error;
    }
}

// 关闭数据库连接
$conn->close();

?>