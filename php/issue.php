<?php error_reporting(0); ?>
<?php
// session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: *");

// NOTE: 连接数据库
$mysql_server = 'localhost';
$mysql_name = 'root';
$mysql_password = 'gansui';
$mysql_database = 'myweb';

$conn = new mysqli($mysql_server, $mysql_name, $mysql_password, $mysql_database);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// NOTE: 数据验证（双重保障）

// NOTE: 保存图片

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 获取表单数据
    $requestType = $_POST['requestType'];

    $title = $_POST['title'];
    $artist = $_POST['artist'];
    $genre = $_POST['genre'];
    $year = $_POST['year'];
    $price = $_POST['price'];
    $width = $_POST['width'];
    $height = $_POST['height'];
    $introduction = $_POST['introduction'];

    $ownerId = $_POST['ownerId'];

    switch ($requestType) {

        // NOTE: 发布画作

        case 'issue':

            // 检查上传文件是否成功
            if ($_FILES['upload']['error'] === UPLOAD_ERR_OK) {

                // 生成唯一的文件名
                $filename = $_FILES['upload']['name']; // uniqid() . '_' .

                // 目标文件夹路径
                $targetDir = '../resource/image/artwork/';

                // header('Content-Type: application/json');

                // 将上传的文件移动到目标文件夹
                if (move_uploaded_file($_FILES['upload']['tmp_name'], $targetDir . $filename)) {

                    // 文件移动成功

                    // // NOTE: 插入数据
                    // $sql = "INSERT INTO artwork (`status`, ownerId, imageFileName, title, artist, genre, `year`, price, width, height, introduction)
                    // VALUES ('未售出', '$ownerId', '$filename', '$title', '$artist', '$genre', '$year', '$price', '$width', '$height', '$introduction')";

                    // if ($conn->query($sql) === TRUE) {
                    //     $response = ['success' => true, 'message' => '数据插入成功'];
                    // } else {
                    //     $response = ['success' => false, 'message' => '数据插入失败'];
                    // }

                    // NOTE: 当数据中有引号或斜杠等转义字符时，必须使用prepare语句防止SQL注入，否则无法正确插入数据库

                    // 准备预处理语句
                    $sql = "INSERT INTO artwork (`status`, ownerId, imageFileName, title, artist, genre, `year`, price, width, height, introduction)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                    // 创建预处理语句
                    $stmt = $conn->prepare($sql);

                    $status = '未售出';

                    // 绑定参数
                    $stmt->bind_param("sissssiddss", $status, $ownerId, $filename, $title, $artist, $genre, $year, $price, $width, $height, $introduction);

                    // 执行预处理语句
                    if ($stmt->execute()) {
                        $response = ['success' => true, 'message' => '成功发布艺术画作'];
                    } else {
                        $response = ['success' => false, 'message' => '数据插入失败'];
                    }

                } else {
                    $response = ['success' => false, 'message' => '文件移动失败'];
                }
            } else {
                $response = ['success' => false, 'message' => '文件上传失败'];
            }

            break;

        case 'changeInfo':

            $artworkId = $_POST['artworkId'];

            // 判断用户是否上传了新的图片
            if (!empty($_FILES['upload']['name'])) {

                // 检查上传文件是否成功
                if ($_FILES['upload']['error'] === UPLOAD_ERR_OK) {

                    // 生成唯一的文件名
                    $filename = $_FILES['upload']['name'];

                    // 目标文件夹路径
                    $targetDir = '../resource/image/artwork/';

                    // FIXME: 其实也可以不移动，直接使用它给的图片
                    // 将上传的文件移动到目标文件夹
                    if (move_uploaded_file($_FILES['upload']['tmp_name'], $targetDir . $filename)) {

                        // 文件移动成功

                        // 更新包含图片的字段和其他字段

                        // 准备SQL语句，使用占位符（?）代替实际的值
                        $sql = "UPDATE artwork SET
                                imageFileName = ?,
                                title = ?,
                                artist = ?,
                                genre = ?,
                                `year` = ?,
                                price = ?,
                                width = ?,
                                height = ?,
                                introduction = ?
                                WHERE artworkId = ?";

                        // 准备并绑定参数
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param("sssssiissi", $filename, $title, $artist, $genre, $year, $price, $width, $height, $introduction, $artworkId);

                        // 执行准备语句
                        if ($stmt->execute()) {
                            $response = ['success' => true, 'message' => '成功更新艺术画作信息'];
                        } else {
                            $response = ['success' => false, 'message' => '数据更新失败'];
                        }
                    } else {
                        $response = ['success' => false, 'message' => '文件移动失败'];
                    }
                } else {
                    $response = ['success' => false, 'message' => '文件上传失败'];
                }
            } else {

                // FIXME: 用户未上传新的图片，仅更新其他字段信息

                $sql = "UPDATE artwork SET
                        title = ?,
                        artist = ?,
                        genre = ?,
                        `year` = ?,
                        price = ?,
                        width = ?,
                        height = ?,
                        introduction = ?
                        WHERE artworkId = ?";

                // 创建准备语句
                $stmt = $conn->prepare($sql);

                // 绑定参数
                $stmt->bind_param("sssiiddsi", $title, $artist, $genre, $year, $price, $width, $height, $introduction, $artworkId);

                // 执行准备语句
                if ($stmt->execute()) {
                    $response = ['success' => true, 'message' => '成功更新艺术画作信息'];
                } else {
                    $response = ['success' => false, 'message' => '数据更新失败'];
                }

            }

            break;

        default:
            $response = ['success' => false, 'message' => 'Unknown requestType'];
            break;
    }

} else {
    $response = ['success' => false, 'message' => 'Unknown server type'];
}

// NOTE: 设置响应头为JSON格式，并返回响应数据
header('Content-Type: application/json');
echo json_encode($response);

// 关闭数据库连接
$conn->close();

?>