
window.addEventListener('DOMContentLoaded', function () {

    // NOTE: GET 获取已发布的画作
    let url = 'http://localhost:3000/php/getArtwork.php';
    let requestType = 'getIssued';
    let ownerId = sessionStorage.getItem('userId');

    // 构建带参数的 URL
    let params = new URLSearchParams({
        requestType: requestType,
        ownerId: ownerId
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {
            // 根据返回的数据构建表格
            const table = document.createElement('table');
            table.classList.add('artwork-table');

            // 创建表头
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headerTitles = ["Title", "Artist", "Release Time", "Status", "Modify", "Detail"];

            // 创建表头项
            for (const title of headerTitles) {
                const th = document.createElement('th');
                th.textContent = title;
                headerRow.appendChild(th);
            }

            thead.appendChild(headerRow);
            table.appendChild(thead);

            // 创建表格内容
            const tbody = document.createElement('tbody');
            for (const artwork of data) {
                const row = document.createElement('tr');

                // 创建标题项
                const titleCell = document.createElement('td');
                titleCell.textContent = artwork.title;
                row.appendChild(titleCell);

                // 创建艺术家项
                const artistCell = document.createElement('td');
                artistCell.textContent = artwork.artist;
                row.appendChild(artistCell);

                // 创建发布时间项
                const timeReleasedCell = document.createElement('td');
                timeReleasedCell.textContent = artwork.timeReleased;
                row.appendChild(timeReleasedCell);

                // 创建售出状态项
                const statusCell = document.createElement('td');
                statusCell.textContent = artwork.status;
                row.appendChild(statusCell);

                // 创建修改超链接项
                const modifyCell = document.createElement('td');
                const modifyLink = document.createElement('a');
                modifyLink.textContent = 'Modify';
                modifyLink.href = '#';
                // FIXME: 只有未售出的商品可以修改
                modifyLink.dataset.artworkId = artwork.artworkId;
                modifyLink.addEventListener('click', handleModifyClick);
                modifyCell.appendChild(modifyLink);
                row.appendChild(modifyCell);

                // 创建详情超链接项
                const detailCell = document.createElement('td');
                // const detailCell = row.insertCell();
                const detailLink = document.createElement('a');
                detailLink.textContent = 'Detail';
                detailLink.href = '#';
                detailLink.dataset.artworkId = artwork.artworkId; // 设置自定义属性存储画作 ID
                detailLink.addEventListener('click', handleDetailClick); // 添加点击事件监听器
                detailCell.appendChild(detailLink);
                row.appendChild(detailCell);

                tbody.appendChild(row);
            }

            table.appendChild(tbody);

            // 将表格添加到页面中的某个元素
            const tableContainer = document.getElementById('issued-container'); // 替换成实际的表格容器元素
            tableContainer.appendChild(table);
        })
        .catch(error => {
            console.error('请求发生错误:', error);
            alert('请求发生错误');
        });

});

// NOTE: 处理Modify链接点击时间

function handleModifyClick(event) {
    event.preventDefault(); // 阻止默认的链接点击行为

    // 获取artworkId
    const artworkId = event.target.dataset.artworkId;

    // 构造修改页面的URL，并包含artworkId参数
    const modifyUrl = `../html/issue.html?artworkId=${artworkId}`;

    // 跳转到修改页面
    window.location.href = modifyUrl;
}

// NOTE: 处理Detail链接点击事件
function handleDetailClick(event) {
    event.preventDefault();

    let artworkId = event.target.dataset.artworkId;
    // getArtworkDetail(artworkId);

    // FIXME: 统一换成带参数的url方式？ cart中点击跳转详情也需要变动

    // 将 artworkId 存储到 localStorage
    localStorage.setItem('selectedArtworkId', artworkId);
    // 跳转到详情页面     
    window.location.href = '../html/detail.html';

    console.log('Clicked on artwork with ID:', artworkId);
}




