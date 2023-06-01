window.addEventListener('DOMContentLoaded', function () {

    // NOTE: GET 获取已下单的商品

    const url = 'http://localhost:3000/php/getArtwork.php';

    const params = new URLSearchParams({
        requestType: 'getPurchased',
        userId: sessionStorage.getItem('userId')
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {

            // 根据返回的数据构建表格
            const table = document.createElement('table');
            table.classList.add('artwork-table');  // FIXME: 类属性名 -- 统一？

            // 创建表头
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headerTitles = ["Order Id", "Title", "Price", "Create Time"];

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

            for (const order of data) {
                const row = document.createElement('tr');

                // 创建订单编号项
                const orderIdCell = document.createElement('td');
                orderIdCell.textContent = order.orderId;
                row.appendChild(orderIdCell);
                
                // 创建标题项
                const titleCell = document.createElement('td');
                titleCell.textContent = order.title;
                row.appendChild(titleCell);

                // 创建价格项
                const priceCell = document.createElement('td');
                priceCell.textContent = order.price;
                row.appendChild(priceCell);

                // 创建下单时间项
                const timeCreatedCell = document.createElement('td');
                timeCreatedCell.textContent = order.timeCreated;
                row.appendChild(timeCreatedCell);

                tbody.appendChild(row);
            }

            table.appendChild(tbody);

            // 将表格添加到页面中的某个元素
            const tableContainer = document.getElementById('purchased-container');
            tableContainer.appendChild(table);
        })
        .catch(error => {
            console.error('请求发生错误:', error);
            alert('请求发生错误');
        });

});