document.addEventListener("DOMContentLoaded", function () {

    // 动态生成侧栏内容
    var sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
            <h2 id="info-bar"><a href="../html/info.html">Basic Info</a></h2>
            <h2 id="issued-bar"><a href="../html/issued.html">Issued</a></h2>
            <h2 id="sold-bar"><a href="../html/sold.html">Sold</a></h2>
            <h2 id="purchased-bar"><a href="../html/purchased.html">Purchased</a></h2>
         `;

});