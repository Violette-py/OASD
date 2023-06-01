// 使用Fetch API请求URL
fetch(url)
    .then(response => {
        if (!response.ok) {
            // URL不存在，显示等待页面或异常页面
            displayErrorPage();
            throw new Error('URL不存在');
        }
        // 继续处理正常的页面加载流程
        return response.text();
    })
    .then(html => {
        // 在DOM中插入获取到的HTML内容
        document.getElementById('content').innerHTML = html;
    })
    .catch(error => {
        console.error(error);
    });

// 显示等待页面或异常页面的函数
function displayErrorPage() {
    var errorPageHTML = `
    <div>
      <h1>抱歉，页面不存在</h1>
      <p>请稍后再试或返回<a href="/">首页</a></p>
    </div>
  `;
    document.getElementById('content').innerHTML = errorPageHTML;
}


