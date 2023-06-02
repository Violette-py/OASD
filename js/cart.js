
window.addEventListener('DOMContentLoaded', function () {

    // 发送GET请求获取购物车项并处理
    getCartItems();
});

// NOTE: 异步函数
async function getCartItems() {

    const url = 'http://localhost:3000/php/cart.php';

    const params = new URLSearchParams({
        requestType: 'getCart',
        userId: sessionStorage.getItem('userId')
    });

    try {
        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        // 动态生成购物车列表项
        const shoppingList = document.getElementById('shopping-list');
        const checkDiv = document.getElementById('check-cart');
        const deleteCartDiv = document.getElementById('delete-cart');

        if (data.length > 0) {

            // 购买按钮
            const checkButton = document.createElement('button');
            checkButton.type = 'submit';
            checkButton.textContent = 'check';
            checkButton.addEventListener('click', handleCartPurchase);
            checkDiv.appendChild(checkButton);

            // 删除按钮
            const deleteButton = document.createElement('button');
            deleteButton.type = 'submit';
            deleteButton.textContent = 'discard';
            deleteButton.addEventListener('click', handleCartDelete);
            deleteCartDiv.appendChild(deleteButton);

            data.forEach(item => {

                // 创建 li 元素
                const liContainer = document.createElement('li');
                liContainer.classList.add('cart-item');
                // liContainer.dataset.artworkId = item.artworkId;

                // 创建大的 div 元素，用于装商品详情信息
                const detailsDiv = document.createElement('div');
                detailsDiv.classList.add('item-details');

                // 创建小的 div 元素，用于装选择框
                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add('item-checkbox');

                const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox';
                checkboxInput.classList.add('item-checkbox-input');
                checkboxInput.dataset.price = item.price;  // NOTE: 设置价格属性（便于后续总价加和）
                checkboxInput.dataset.cartId = item.cartId;
                checkboxInput.dataset.artworkId = item.artworkId;
                checkboxInput.dataset.status = item.status; // NOTE: 已售出的商品不能购买

                // NOTE: 商品已售出时则无法选中复选框 - 无法购买
                if (item.status === '已售出') {
                    // checkboxInput.disabled = true; // 禁用复选框
                    // checkboxInput.checked = false; // 不选中复选框
                    // checkboxInput.title = '该商品已售出'; // 设置提示信息

                    const soldSpan = document.createElement('span');
                    soldSpan.classList.add('item-sold-message');
                    soldSpan.textContent = '已售出';
                    checkboxDiv.appendChild(soldSpan);

                } else {
                    checkboxInput.disabled = false; // 启用复选框
                    // checkboxInput.checked = true; // 选中复选框
                    checkboxInput.title = '点击选中该商品'; // 设置提示信息
                }

                checkboxDiv.appendChild(checkboxInput);

                // 创建小的 div 元素，用于装艺术品图片
                const imageDiv = document.createElement('div');
                imageDiv.classList.add('item-image');

                const image = document.createElement('img');
                const imagePath = '../resource/image/works/square-medium/' + item.imageFileName;
                image.src = imagePath;
                image.alt = 'Artwork Image';
                // image.dataset.artworkId = item.artworkId;
                imageDiv.appendChild(image);

                // NOTE: 点击商品图片跳转到详情界面
                image.addEventListener('click', () => {
                    // localStorage.setItem('selectedArtworkId', item.artworkId);  // image.dataset.artworkId
                    // window.location.href = '../html/detail.html';

                    const detailUrl = `../html/detail.html?artworkId=${item.artworkId}`;
                    window.location.href = detailUrl;
                });

                // 创建小的 div 元素，用于装艺术品名称、作者、价格
                const infoDiv = document.createElement('div');
                infoDiv.classList.add('item-info');

                const titleParagraph = document.createElement('p');
                titleParagraph.classList.add('title');
                titleParagraph.textContent = item.title;
                infoDiv.appendChild(titleParagraph);

                const artistParagraph = document.createElement('p');
                artistParagraph.classList.add('artist');
                artistParagraph.textContent = item.artist;
                infoDiv.appendChild(artistParagraph);

                const priceParagraph = document.createElement('p');
                priceParagraph.classList.add('price');
                priceParagraph.textContent = item.price;
                infoDiv.appendChild(priceParagraph);

                // 创建小的 div 元素，用于装艺术品简介
                const introDiv = document.createElement('div');
                introDiv.classList.add('item-intro');
                introDiv.style.overflow = 'auto';
                introDiv.textContent = item.introduction;

                // 将小的 div 元素添加为大的 div 元素的子元素
                detailsDiv.appendChild(checkboxDiv);
                detailsDiv.appendChild(imageDiv);
                detailsDiv.appendChild(infoDiv);
                detailsDiv.appendChild(introDiv);

                // 将大的 div 元素添加为 li 元素的子元素
                liContainer.appendChild(detailsDiv);

                // 将li元素添加为ul元素的子元素
                shoppingList.appendChild(liContainer);

            });
        } else {
            const emptyCartLi = document.createElement('li');
            emptyCartLi.textContent = '用户购物车当前为空';
            shoppingList.appendChild(emptyCartLi);
        }


    } catch (error) {
        console.error('Error:', error);
    }
}

// NOTE: 购买
function handleCartPurchase() {

    const userId = sessionStorage.getItem('userId');
    const selectedItems = Array.from(document.querySelectorAll('.cart-item input[type="checkbox"]:checked'));
    const cartIds = selectedItems.map(item => item.dataset.cartId); // 获取选中的cartId数组
    const artworkIds = selectedItems.map(item => item.dataset.artworkId); // cartId对应的artworkId数组
    const artworkStatuses = selectedItems.map(item => item.dataset.status); // cartId对应的status数组

    if (selectedItems.length === 0) {
        alert('请选择要购买的商品！');
        return;
    }

    if(artworkStatuses.includes('已售出')){
        alert('无法购买已售出的商品！');
        window.location.href = '../html/cart.html';
        return;
    }

    const totalPrice = selectedItems.reduce((sum, item) => sum + parseFloat(item.dataset.price), 0);

    const confirmPurchase = confirm(`您选中的商品总价为：${totalPrice.toFixed(2)} 元，确认要购买吗？`);
    if (confirmPurchase) {

        const url = 'http://localhost:3000/php/cart.php';

        const checkData = {
            requestType: 'checkCart',
            totalPrice: totalPrice,
            userId: userId,
            cartIds: cartIds,
            artworkIds: artworkIds
        };

        console.log(checkData);

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkData)
        })
            .then(response => response.json())
            .then(data => {

                // NOTE: 记录用户行为用trigger实现

                // if (data.success) {
                //     artworkIds.forEach(function (artworkId) {
                //         recordUserOperation(artworkId, 3);
                //     });
                // }
                alert(data.message);
                // 刷新用户购物车界面
                window.location.href = '../html/cart.html';
            })
            .catch(error => {
                console.error('请求出错:', error);
            });

    }
}

function handleCartDelete() {
    const selectedItems = Array.from(document.querySelectorAll('.cart-item input[type="checkbox"]:checked'));

    if (selectedItems.length === 0) {
        alert('请选择要删除的商品！');
        return;
    }

    // 弹出确认框，确认是否删除选中的商品
    const confirmDelete = confirm('确定要删除选中的商品吗？');
    if (confirmDelete) {

        const url = 'http://localhost:3000/php/cart.php';

        const deleteData = {
            requestType: 'deleteCart',
            // 要删除的cartId数组
            cartIds: selectedItems.map(item => item.dataset.cartId)  // 获取选中的cartId数组
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deleteData)
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                // 刷新用户购物车界面
                window.location.href = '../html/cart.html';
            })
            .catch(error => {
                console.error('请求出错:', error);
            });
    }
}



// NOTE: 同步函数
// function getCartItems() {

//     const url = 'http://localhost:3000/php/cart.php';

//     const params = new URLSearchParams({
//         requestType: 'getCart',
//         userId: sessionStorage.getItem('userId')
//     });

//     return fetch(`${url}?${params}`)
//         .then(response => response.json())
//         .then(data => {

//             // 动态生成购物车列表项
//             const cartItemsDiv = document.getElementById('cartItems');
//             data.forEach(item => {
//                 const itemDiv = document.createElement('div');
//                 itemDiv.textContent = `Product: ${item.product}, Quantity: ${item.quantity}`;
//                 cartItemsDiv.appendChild(itemDiv);
//             });

//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
// }

