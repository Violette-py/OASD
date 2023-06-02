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

        // NOTE: 添加评论

        case 'addComment':

            $userId = $data['userId'];
            $artworkId = $data['artworkId'];
            $parentCommentId = $data['parentCommentId'];
            $content = $data['content'];

            // $insertSql = "INSERT INTO comment (userId, artworkId, parentCommentId, content, `status`) VALUES ('$userId', '$artworkId', '$parentCommentId', '$content', '正常')";

            // if ($conn->query($insertSql) === TRUE) {

            $insertSql = "INSERT INTO comment (userId, artworkId, parentCommentId, content, `status`) VALUES (?, ?, ?, ?, '正常')";

            $stmt = $conn->prepare($insertSql);
            $stmt->bind_param("iiis", $userId, $artworkId, $parentCommentId, $content);
            if ($stmt->execute()) {
                $response = [
                    'status' => 'success',
                    'message' => '评论成功'
                ];
            } else {
                $response = [
                    'status' => 'error',
                    'message' => '评论失败: ' . $conn->error
                ];
            }

            break;

        // NOTE: 点赞评论

        case 'likeComment':

            $userId = $data['userId'];
            $commentId = $data['commentId'];

            $insertSql = "INSERT INTO `like` (userId, commentId) VALUES ('$userId', '$commentId')";

            if ($conn->query($insertSql) === TRUE) {
                $response = [
                    'success' => true,
                    'message' => 'CommentLike inserted successfully'
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Failed to insert commentLike: ' . $conn->error
                ];
            }

            break;

        // NOTE: 取消点赞评论

        case 'unlikeComment':

            $userId = $data['userId'];
            $commentId = $data['commentId'];

            $deleteSql = "DELETE FROM `like` WHERE userId = '$userId' AND commentId = '$commentId'";

            if ($conn->query($deleteSql) === TRUE) {
                $response = [
                    'success' => true,
                    'message' => 'Unlike comment success'
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Failed to unlike comment: ' . $conn->error
                ];
            }

            break;

        // NOTE: 删除评论
        case 'deleteComment':

            $commentId = $data['commentId'];

            $updateSql = "UPDATE comment SET status = '已删除' WHERE commentId = '$commentId'";

            if ($conn->query($updateSql) === TRUE) {
                $response = [
                    'success' => true,
                    'message' => 'Delete comment success'
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Failed to delete comment: ' . $conn->error
                ];
            }

            break;

        default:
            $response = [
                'success' => 'error',
                'message' => 'Unknown requestType ' . $conn->error
            ];
            break;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // NOTE: GET

    $requestType = $_GET['requestType'];
    switch ($requestType) {

        // NOTE: 获取评论列表

        case 'getCommentList':
            $artworkId = $_GET['artworkId'];

            // 查询评论列表
            // $selectSql = "SELECT * FROM comment WHERE artworkId = '$artworkId'";

            // NOTE: 查询评论列表及对应的用户信息（关联查表）
            // $selectSql = "SELECT c.*, u.name FROM comment c JOIN user u ON c.userId = u.userId WHERE c.artworkId = '$artworkId'";
            // $result = $conn->query($selectSql);

            $selectSql = "SELECT c.*, u.userId AS `userId`, u.name AS `name`,
                          CASE WHEN c.parentCommentId > 0 THEN u2.name ELSE '' END AS parentCommenterName
                          FROM comment c
                          JOIN user u ON c.userId = u.userId
                          LEFT JOIN comment c2 ON c.parentCommentId = c2.commentId
                          LEFT JOIN user u2 ON c2.userId = u2.userId
                          WHERE c.artworkId = '$artworkId'";

            $result = $conn->query($selectSql);

            if ($result->num_rows > 0) {
                $comments = array();
                while ($row = $result->fetch_assoc()) {
                    $comments[] = $row;
                }

                // 返回评论列表数据
                $response = [
                    'status' => 'success',
                    'message' => '获取评论列表成功',
                    'data' => $comments
                ];
            } else {
                $response = [
                    'status' => 'success',
                    'message' => '暂无评论',
                    'data' => []
                ];
            }
            break;

        // NOTE: 获取点赞状态
        case 'getLikeStatus':

            $userId = $_GET['userId'];
            $commentId = $_GET['commentId'];

            $selectSql = "SELECT * FROM `like` WHERE userId = '$userId' AND commentId = '$commentId'";
            $result = $conn->query($selectSql);

            // 判断是否存在记录，如果存在，设置$isLiked为true，否则设置为false
            $isLiked = $result->num_rows > 0;

            $response = [
                'isLiked' => $isLiked
            ];

            break;

        // NOTE: 获取点赞数量
        case 'getLikeCount':

            $commentId = $_GET['commentId'];

            $selectSql = "SELECT COUNT(*) AS count FROM `like` WHERE commentId = '$commentId'";
            $result = $conn->query($selectSql);
            $row = $result->fetch_assoc();
            $likeCount = $row['count'];

            $response = [
                'likeCount' => $likeCount
            ];
            break;

        default:
            $response = [
                'status' => 'error',
                'message' => 'Unknown requestType'
            ];
            break;
    }

} else {

}

// 返回响应
header('Content-Type: application/json');
echo json_encode($response);

// 关闭数据库连接
// $stmt->close();
$conn->close();

?>