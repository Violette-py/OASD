<?php
session_start();

// 检查会话中的用户名变量是否存在
if (isset($_SESSION['name'])) {
    // 用户已登录
    $name = $_SESSION['name'];
    $loginLink = '<li><a href="../html/home.html">Logout</a></li>';
    $welcomeMessage = '你好，' . $name;
} else {
    // 用户未登录
    $loginLink = '<li><a href="../html/login.html">Login</a></li>';
    $welcomeMessage = '';
}
?>

<nav>
    <div class="logo">
        <a href="#">LOGO</a>
    </div>
    <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Artwork</a></li>
        <li><a href="#">About us</a></li>
        <li><a href="#">Contact us</a></li>
        <?php echo $loginLink; ?>
    </ul>
</nav>

<div class="welcome">
    <?php echo $welcomeMessage; ?>
</div>
