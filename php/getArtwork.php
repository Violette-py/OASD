<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");

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

    $requestType = $_GET['requestType'];

    switch ($requestType) {

        // NOTE: 已发布

        case 'getIssued':

            $ownerId = $_GET['ownerId'];
            $searchSql = "SELECT * FROM artwork WHERE ownerId = '$ownerId'";
            $result = $conn->query($searchSql);

            // 将画作信息组织为数组
            $response = array();
            while ($row = $result->fetch_assoc()) {
                $artwork = array(
                    'artworkId' => $row['artworkId'],
                    'title' => $row['title'],
                    'artist' => $row['artist'],
                    'timeReleased' => $row['timeReleased'],
                    'status' => $row['status']
                    // FIXME: 只返回必要的信息吗？还是返回所有？后面还需要重新请求详情吗？
                );
                $response[] = $artwork;
            }

            break;

        // NOTE: 已售出

        case 'getSold':

            $ownerId = $_GET['ownerId'];

            $sql = "SELECT a.title, a.price, o.timeCreated
                    FROM `artwork` a
                    INNER JOIN `order` o ON o.artworkId = a.artworkId
                    WHERE a.ownerId = '$ownerId' AND a.status = '已售出'";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                $response = array();
                while ($row = $result->fetch_assoc()) {
                    $artwork = array(
                        'title' => $row['title'],
                        'price' => $row['price'],
                        'timeSaled' => $row['timeCreated']
                    );

                    $response[] = $artwork;
                }
            } else {
                $response = [];
            }

            break;

        // NOTE：已下单

        case 'getPurchased':

            $userId = $_GET['userId'];

            $sql = "SELECT o.orderId, a.title, a.price, o.timeCreated
                    FROM `order` o
                    INNER JOIN `artwork` a ON o.artworkId = a.artworkId
                    WHERE o.userId = '$userId'";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {

                $response = array();
                while ($row = $result->fetch_assoc()) {
                    $order = array(
                        'orderId' => $row['orderId'],
                        'title' => $row['title'],
                        'price' => $row['price'],
                        'timeCreated' => $row['timeCreated']
                    );

                    $response[] = $order;
                }
            } else {
                $response = [];
            }

            break;

        // NOTE: 展示推荐商品
        case 'getRecommended':

            // // NOTE: 目前是根据view排序
            // $sql = "SELECT artworkId, introduction, imageFileName FROM artwork ORDER BY view DESC LIMIT 5";
            // $result = $conn->query($sql);

            // $response = array();
            // while ($row = $result->fetch_assoc()) {
            //     $response[] = $row;
            // }

            // FIXME: 用户未登录时，需要有一定的推荐项
            // FIXME: 当用户为新注册的，尚未操作过任何商品时，防止冷启动需要按照view降序推荐
            // FIXME: 当genres数组中对应的画作已经全部被用户操作过了，应该有预案处理

            // FIXME: 或者先挑选，最后再检查用户是否操作过

            $userId = $_GET['userId'] ?? null;

            if (!$userId) {

                // NOTE：用户未登录 -- 根据热度推荐
                $sql = "SELECT * FROM artwork ORDER BY view DESC LIMIT 4";
                $result = $conn->query($sql);

                $topArtworks = [];

                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        $topArtworks[] = $row;
                    }
                }
            } else {

                // NOTE: 用户已登录 -- 根据用户行为推荐

                // 获取用户操作过的商品id数组
                $userOperations = [];
                $sql = "SELECT * FROM operation WHERE userId = '$userId'";
                $result = $conn->query($sql);

                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        $userOperations[] = $row;
                    }
                }

                // 计算得分
                $artworkScores = [];
                foreach ($userOperations as $operation) {
                    $artworkId = $operation['artworkId'];
                    $operationType = $operation['operationType'];

                    $score = 0;
                    if ($operationType == 1) {
                        $score = 1;
                    } elseif ($operationType == 2) {
                        $score = 3;
                    } elseif ($operationType == 3) {
                        $score = 5;
                    }

                    if (isset($artworkScores[$artworkId])) {
                        $artworkScores[$artworkId] += $score;
                    } else {
                        $artworkScores[$artworkId] = $score;
                    }
                }

                // 选出得分最高的3件商品
                arsort($artworkScores);
                $topArtworkIds = array_slice(array_keys($artworkScores), 0, 3);

                // 根据topArtworkIds查询genre字段
                $genres = [];
                foreach ($topArtworkIds as $artworkId) {
                    $genre = getGenreForArtwork($conn, $artworkId);
                    if (!in_array($genre, $genres)) { // NOTE: genre数组中各元素不相同
                        $genres[] = $genre;
                    }
                }

                // 在artwork表中查询genre字段存在于genres数组中的所有记录，并根据view字段进行降序排序
                $artworks = [];
                if (!empty($genres)) {
                    $genresString = "'" . implode("','", $genres) . "'";
                    $sql = "SELECT * FROM artwork WHERE genre IN ($genresString) ORDER BY view DESC";
                    $result = $conn->query($sql);

                    if ($result->num_rows > 0) {
                        while ($row = $result->fetch_assoc()) {
                            $artworkId = $row['artworkId'];

                            // 检查该商品是否在用户操作过的商品中
                            $isUserOperation = false;
                            foreach ($userOperations as $operation) {
                                if ($operation['artworkId'] == $artworkId) {
                                    $isUserOperation = true;
                                    break;
                                }
                            }

                            // 如果该商品不在用户操作过的商品中，则将其添加到结果数组中
                            if (!$isUserOperation) {
                                $artworks[] = $row;
                            }
                        }
                    }
                }

                // 截取排名前四的商品
                $topArtworks = array_slice($artworks, 0, 4);

                // NOTE: 用户行为较少时 -- 使用热度推荐进行填充
                if (count($topArtworks) < 4) {
                    $remainingCount = 4 - count($topArtworks);
                    $sql = "SELECT * FROM artwork ORDER BY view DESC LIMIT $remainingCount";
                    $result = $conn->query($sql);

                    if ($result->num_rows > 0) {
                        while ($row = $result->fetch_assoc()) {
                            $topArtworks[] = $row;
                        }
                    }
                }
            }

            $response = $topArtworks;

            // FIXME: 推荐是否需要考虑售出状态？

            break;

        // NOTE: 最新发布的画作
        case 'getLatestReleased':

            $sql = "SELECT * FROM artwork ORDER BY timeReleased DESC LIMIT 6";
            $result = $conn->query($sql);

            $response = array();
            while ($row = $result->fetch_assoc()) {
                $response[] = $row;
            }

            break;

        // NOTE: 展示所有（搜索的初始界面）

        case 'getAll':

            // 查询所有商品数据
            $sql = "SELECT * FROM artwork";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                $artworks = array();
                while ($row = $result->fetch_assoc()) {
                    $artworks[] = $row;
                }
            } else {
                $artworks = [];
            }

            $response = array(
                'results' => $artworks,
                'length' => $result->num_rows
            );

            break;

        // NOTE: 展示用户搜索结果

        case 'search':

            // 获取搜索关键词、搜索方式和排序方式
            $keyword = $_GET['keyword'];
            $sortBy = $_GET['sortBy'];
            $searchBy = $_GET['searchBy'];

            // 构建 SQL 查询语句
            $sql = "SELECT * FROM artwork WHERE ";
            if ($searchBy == 'title') {
                $sql .= "title LIKE '%$keyword%'";
            } elseif ($searchBy == 'artist') {
                $sql .= "artist LIKE '%$keyword%'";
            }

            // 添加排序方式
            if ($sortBy == 'timeReleased') {
                $sql .= " ORDER BY timeReleased DESC";
            } elseif ($sortBy == 'year') {
                $sql .= " ORDER BY year DESC";
            } elseif ($sortBy == 'view') {
                $sql .= " ORDER BY view DESC";
            } elseif ($sortBy == 'priceDesc') {
                $sql .= " ORDER BY price DESC";
            } elseif ($sortBy == 'priceAsc') {
                $sql .= " ORDER BY price ASC";
            }

            // NOTE: 分页展示（先在前端实现）

            // $page = isset($_GET['page']) ? $_GET['page'] : 1; // Get the requested page number

            // $limit = 6; // Number of results per page
            // $offset = ($page - 1) * $limit; // Calculate the offset

            // // Add the limit and offset to the query
            // $sql .= " LIMIT $limit OFFSET $offset";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                $artworks = array();
                while ($row = mysqli_fetch_assoc($result)) {
                    $artworks[] = $row;
                }
            } else {
                $artworks = [];
            }

            $response = array(
                'results' => $artworks,
                'length' => $result->num_rows
            );

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


// NOTE: 获取artwork的genre
function getGenreForArtwork($conn, $artworkId)
{
    $sql = "SELECT genre FROM artwork WHERE artworkId = '$artworkId'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['genre'];
    }
    return null;
}

// NOTE: 获取随机的artworks
function getRandomArtworks($conn, $genres, $count)
{
    $genresString = "'" . implode("','", $genres) . "'";
    $sql = "SELECT * FROM artwork WHERE genre IN ($genresString) ORDER BY RAND() LIMIT $count";
    $result = $conn->query($sql);
    $artworks = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $artworks[] = $row;
        }
    }
    return $artworks;
}

?>