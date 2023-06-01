// 在客户端使用 JavaScript 判断登录状态
// 并生成相应的导航栏内容
document.addEventListener("DOMContentLoaded", function () {

    var name = sessionStorage.getItem('name');
    var userId = sessionStorage.getItem('userId');

    console.log('name in session:' + name);
    console.log('id in session:' + userId);

    if (name) {
        // 用户已登录
        var loginLink = '<li id="logout"><a href="#">Logout</a></li>';
        var welcomeMessage = 'Hello, ' + name;
        var mySpaceLink = '<li id="myspace"><a href="../html/info.html">My Space</a></li>';
        var cartLink = '<li id="cart"><a href="../html/cart.html">Shopping Cart</a></li>';
        var issueLink = '<li id="issue"><a href="../html/issue.html">Issue</a></li>';
    } else {
        // 用户未登录
        var loginLink = '<li id="login"><a href="../html/login.html">Login</a></li>';
        var welcomeMessage = '';
        var mySpaceLink = '';
        var cartLink = '';
        var issueLink = '';
    }

    // NOTE: 动态生成导航栏内容
    var navigation = document.getElementById('navigation');
    navigation.innerHTML = `
        <nav>
            <ul>
                <li id="home"><a href="../html/home.html">Home</a></li>
                <li id="search"><a href="../html/search.html">Search</a></li>
                ${mySpaceLink}
                ${cartLink}
                ${issueLink}
            </ul>
            <ul id="welcome-log">
                <li id="welcome">${welcomeMessage}</li>
                ${loginLink}
            </ul>
        </nav>            
    `;

    // NOTE: 动态生成底部版权信息
    var footer = document.getElementById('footer');
    footer.innerHTML = `
                <footer>
                    &copy; PeiyiChen Copyright Reserved
                 </footer>
    `;

    // 为 "Logout" 添加点击事件处理程序  —— 先等上面的导航栏加载完啊！！！
    var logout = document.getElementById('logout');
    if (logout !== null) {
        // console.log('logout is not null');
        logout.getElementsByTagName('a')[0].addEventListener('click', function (event) {
            event.preventDefault(); // 阻止默认的链接行为
            sessionStorage.clear(); // 清空 sessionStorage
            window.location.href = "../html/home.html"; // 重定向到 home.html
        });
    }

});



