window.addEventListener('DOMContentLoaded', function () {

    // 从 localStorage 中读取 artworkId
    // var artworkId = localStorage.getItem('selectedArtworkId');
    // if (artworkId) {
    //     getArtworkDetail(artworkId);
    // }

    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    var artworkId;

    // 检查URL参数中是否包含artworkId
    if (urlParams.has('artworkId')) {
        artworkId = urlParams.get('artworkId');
        this.localStorage.setItem('selectedArtworkId', artworkId);
        getArtworkDetail(artworkId);
    } else {
        // NOTE: 不合法url，重定向到error界面
        this.window.location.href = '../html/error.html';
    }

    console.log('artworkId: ' + artworkId);

    // NOTE: 购物车按钮
    const shoppingButton = document.getElementById('shopping');
    shoppingButton.addEventListener('click', confirmAddToCart);

    // NOTE: 评论按钮
    var commentButton = document.getElementById('comment-button');
    commentButton.addEventListener('click', handleCommentSubmit);

    var userId = this.sessionStorage.getItem('userId');
    if (userId !== null) {
        // NOTE: 记录用户行为
        recordUserOperation(artworkId, 1);
    } else {
        // NOTE: 禁用购物车按钮
        shoppingButton.disabled = true;
        shoppingButton.title = '您尚未登录';

        // NOTE: 禁用评论按钮
        commentButton.disabled = true;
        commentButton.title = '您尚未登录';
    }

    // NOTE: 图片局部放大

    var imgContainer = document.querySelector('.img-container');
    var zoomBox = document.querySelector('.zoom-box');
    var zoomedImage = document.querySelector('#artworkImage');

    // 图片加载完成后执行初始化
    zoomedImage.addEventListener('load', function () {
        imgContainer.addEventListener('mousemove', function (e) {
            var containerRect = imgContainer.getBoundingClientRect();
            var x = e.clientX - containerRect.left;
            var y = e.clientY - containerRect.top;

            showZoomBox(x, y);
        });

        imgContainer.addEventListener('mouseleave', function () {
            hideZoomBox();
        });
    });

    function showZoomBox(x, y) {
        var zoomBoxSize = 200; // 调整为局部放大框的大小
        var containerSize = imgContainer.offsetWidth;
        var zoomedImageSize = zoomedImage.offsetWidth;
        var zoomRatio = zoomedImageSize / containerSize;
        var bgPosX = -x * zoomRatio + zoomBoxSize / 2;
        var bgPosY = -y * zoomRatio + zoomBoxSize / 2;

        zoomBox.style.backgroundImage = 'url(' + zoomedImage.src + ')';
        zoomBox.style.backgroundPosition = bgPosX + 'px ' + bgPosY + 'px';
        zoomBox.style.display = 'block';
    }

    function hideZoomBox() {
        zoomBox.style.display = 'none';
    }

    // FIXME: 同步更新artwork的view字段 -- 能否应用trigger实现？ -- 已经实现了！

    // NOTE: 获取评论列表
    fetchComments();

});

// NOTE: 展示艺术画作详情
function getArtworkDetail(artworkId) {

    const url = 'http://localhost:3000/php/detail.php';

    // 构建带参数的 URL
    const params = new URLSearchParams({
        requestType: 'getDetail',
        artworkId: artworkId
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {

            if (data.success) {

                // window.location.href = '../html/detail.html';
                // 由于该代码位于异步请求的回调函数中，页面的跳转会在异步请求结束后立即执行，导致无法传递数据给 ../html/detail.html 页面

                // NOTE: 动态填充页面
                let imagePath = '../resource/image/artwork/' + data.data.imageFileName;
                let image = document.getElementById("artworkImage");
                image.src = imagePath;

                // NOTE: 设置zoomedImage
                const zoomedImage = document.querySelector('#artworkImage');
                zoomedImage.src = imagePath;

                document.querySelector('.title').textContent = data.data.title;

                // FIXME:
                document.querySelector('.artist').textContent = data.data.artist;
                // document.querySelector('.artist').innerHTML = data.data.artist;
                console.log(data.data.artist);

                document.querySelector('.introduction p').textContent = data.data.introduction;
                document.querySelector('#filled-price').textContent = data.data.price;
                document.querySelector('#filled-status').textContent = data.data.status;
                document.querySelector('#filled-view').textContent = data.data.view;
                document.querySelector('#genre').textContent = data.data.genre;
                document.querySelector('#year').textContent = data.data.year;
                document.querySelector('#width').textContent = data.data.width;
                document.querySelector('#height').textContent = data.data.height;
                document.querySelector('#owner-name').textContent = data.data.ownerName;
                document.querySelector('#released-time').textContent = data.data.releasedTime;

                // NOTE: 检查shoppingButton的状态
                const shoppingButton = document.getElementById('shopping');

                var userId = sessionStorage.getItem('userId');

                // console.log('ownerId is ' + data.data.ownerId); // number
                // console.log('userId is ' + userId);  // string

                if (!userId) {
                    shoppingButton.disabled = true;
                    shoppingButton.title = '您尚未登录';
                } else if (data.data.ownerId == userId) { // 不是全等的
                    shoppingButton.disabled = true;
                    shoppingButton.title = '您不能购买自己发布的艺术品';
                } else if (data.data.status === '已售出') {
                    shoppingButton.disabled = true;
                    shoppingButton.title = '该画作已售出';
                } else {
                    checkIfHasAddedToCart();
                }

            } else {
                // NOTE: 不合法url（未找到对应的artwork），重定向到error界面
                this.window.location.href = '../html/error.html';
            }

        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// NOTE: 图片局部放大

function Zoom(imgbox, hoverbox, l, t, x, y, h_w, h_h, showbox, zoomedImage) {
    var moveX = x - l - (h_w / 2);
    var moveY = y - t - (h_h / 2);

    // 判断鼠标使其不跑出图片框
    moveX = Math.max(0, Math.min(moveX, imgbox.offsetWidth - h_w));
    moveY = Math.max(0, Math.min(moveY, imgbox.offsetHeight - h_h));

    // 求图片比例
    var zoomX = zoomedImage.offsetWidth / imgbox.offsetWidth;
    var zoomY = zoomedImage.offsetHeight / imgbox.offsetHeight;

    showbox.style.left = -(moveX * zoomX + 60) + 'px';
    showbox.style.top = -(moveY * zoomY + 10) + 'px';
    hoverbox.style.left = moveX + 105 + 'px';
    hoverbox.style.top = moveY + 300 + 'px';
}

function Zoomhover(imgbox, hoverbox, showbox, zoomedImage) {
    var l = imgbox.offsetLeft;
    var t = imgbox.offsetTop;
    var w = hoverbox.offsetWidth;
    var h = hoverbox.offsetHeight;

    imgbox.addEventListener('mouseenter', function (e) {
        var x = e.pageX;
        var y = e.pageY;

        // 计算图片比例
        var zoomX = zoomedImage.offsetWidth / imgbox.offsetWidth;
        var zoomY = zoomedImage.offsetHeight / imgbox.offsetHeight;

        hoverbox.style.opacity = '0.3';
        showbox.style.display = 'block';
        showbox.style.backgroundImage = 'url(' + zoomedImage.src + ')';
        showbox.style.backgroundRepeat = 'no-repeat';
        showbox.style.backgroundSize = imgbox.offsetWidth * zoomX + 'px ' + imgbox.offsetHeight * zoomY + 'px';
        showbox.style.backgroundPosition = -(x - l - w / 2) * zoomX + 'px ' + -(y - t - h / 2) * zoomY + 'px';
    });

    imgbox.addEventListener('mousemove', function (e) {
        var x = e.pageX;
        var y = e.pageY;

        // 计算图片比例
        var zoomX = zoomedImage.offsetWidth / imgbox.offsetWidth;
        var zoomY = zoomedImage.offsetHeight / imgbox.offsetHeight;

        showbox.style.backgroundPosition = -(x - l - w / 2) * zoomX + 'px ' + -(y - t - h / 2) * zoomY + 'px';
    });

    imgbox.addEventListener('mouseleave', function () {
        hoverbox.style.opacity = '0';
        showbox.style.display = 'none';
    });
}

// NOTE: 检查用户是否已将该商品添加到购物车
function checkIfHasAddedToCart() {

    const shoppingButton = document.getElementById('shopping');

    const url = 'http://localhost:3000/php/cart.php';

    const params = new URLSearchParams({
        requestType: 'ifHasAddedToCart',
        userId: sessionStorage.getItem('userId'),
        artworkId: localStorage.getItem('selectedArtworkId')
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                shoppingButton.disabled = true;
                shoppingButton.title = '您已将该商品加入过购物车';
            } else {
                shoppingButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// 确认添加到购物车
function confirmAddToCart() {
    if (confirm('确定要将该商品添加到购物车吗？')) {
        addToCart();
        // recordUserOperation(localStorage.getItem('selectedArtworkId'), 2);
    }
}

// NOTE: 添加购物车
function addToCart() {

    const cartData = {
        requestType: 'addCart',
        userId: sessionStorage.getItem('userId'),
        artworkId: localStorage.getItem('selectedArtworkId')
    };

    const url = 'http://localhost:3000/php/cart.php';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartData)
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            // window.location.href = '../html/detail.html';
            const detailUrl = `../html/detail.html?artworkId=${localStorage.getItem('selectedArtworkId')}`;
            window.location.href = detailUrl;
            // FIXME: 修改所有跳转到detail界面的请求
        })
        .catch(error => {
            console.error('请求出错:', error);
        });
}

// NOTE: 直接添加评论
function handleCommentSubmit(event) {
    console.log('here is submit');
    event.preventDefault(); // 阻止表单的默认提交行为

    const content = document.getElementById('comment-input').value;
    console.log(content);

    // FIXME: 检查不为空再提交

    if (!content.trim()) {
        alert('请输入内容！');
        return false;
    }

    const commentData = {
        requestType: 'addComment',
        userId: sessionStorage.getItem('userId'),
        artworkId: localStorage.getItem('selectedArtworkId'),
        parentCommentId: -1,  // FIXME: 死数据，后续动态修改
        content: content
    };

    addComment(commentData);

}

// NOTE: 获取评论列表
function fetchComments() {

    const url = 'http://localhost:3000/php/comment.php';

    const params = new URLSearchParams({
        requestType: 'getCommentList',
        artworkId: localStorage.getItem('selectedArtworkId')
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {
            // 处理获取评论列表的逻辑
            console.log('获取评论列表成功', data);

            // 清空评论列表
            const commentList = document.getElementById('comment-list');
            commentList.innerHTML = '';

            // FIXME: 用于存储评论框的映射关系（父子评论-回复内容）
            const commentMap = {};

            // 逐个添加评论到列表
            // NOTE: data.data
            data.data.forEach(comment => {

                const parentCommentId = comment.parentCommentId;

                if (parentCommentId > 0) {
                    const parentCommentContainer = commentMap[parentCommentId.toString()];
                    if (parentCommentContainer) {

                        // FIXME: 只盖一层楼中楼即可

                        let parentUl = parentCommentContainer.querySelector('ul');

                        // 如果父评论区域中不存在ul元素，则创建一个新的ul元素
                        if (!parentUl) {
                            parentUl = document.createElement('ul');
                            parentUl.classList.add('child-list'); // 添加评论列表的样式类
                            parentCommentContainer.appendChild(parentUl);
                        }
                        createCommentItem(comment, parentUl, commentMap, 'append');
                    }
                } else {
                    createCommentItem(comment, commentList, commentMap, 'normal');
                }

            });

        })
        .catch(error => {
            console.error('获取评论列表失败', error);
        });
}

// NOTE: 直接添加评论
function addComment(requestData) {

    const url = 'http://localhost:3000/php/comment.php';

    console.log(requestData);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            // 处理成功发送评论的逻辑
            alert(data.message);

            // 清空输入框
            document.getElementById('comment-input').value = '';

            // 刷新评论列表
            fetchComments();
        })
        .catch(error => {
            console.error('评论发送失败', error);
        });
}

// NOTE: 回复他人评论
// 当用户点击回复按钮时，如果回复框已经可见且内容不为空，那么就将其内容作为回复提交；
// 否则，显示回复框供用户输入新的回复内容。
// 这样，用户可以在同一个回复按钮上进行连续的回复提交操作
document.addEventListener('click', function (event) {

    if (event.target.classList.contains('reply-button')) {
        const commentId = event.target.getAttribute('data-comment-id');
        console.log('you try to reply comment:' + commentId);

        const replyInput = document.querySelector(`.reply-input[data-comment-id="${commentId}"]`);

        if (replyInput.style.display === 'block' && replyInput.value.trim() !== '') {
            // 回复框可见且有内容，提交回复

            const replyData = {
                requestType: 'addComment',
                userId: sessionStorage.getItem('userId'),
                artworkId: localStorage.getItem('selectedArtworkId'),
                parentCommentId: commentId,  // FIXME: 回复的评论ID
                content: replyInput.value
            };

            addComment(replyData);
        } else {
            // 显示回复框
            replyInput.style.display = 'block';
        }
    }
});

// NOTE: 创建评论项
function createCommentItem(comment, parentElement, commentMap, type) {

    const commentItem = document.createElement('li');

    // 创建包裹所有元素的容器
    const liContainer = document.createElement('div');
    liContainer.classList.add('li-container'); // 添加 li-container 的样式类

    // 创建评论内容元素
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('comment-content'); // 添加评论内容的样式类
    contentDiv.textContent = comment.content;
    // contentDiv.innerHTML = `<p>haha</p>`;
    // FIXME:
    // contentDiv.innerHTML = "haha";
    // contentDiv.innerHTML = "\<script\>\n" + "alert('xss') \n" + "\<\/script\>";
    console.log(comment.content);
    liContainer.appendChild(contentDiv);

    // 创建评论者和评论时间、回复按钮、回复框的容器
    const commenterInfoContainer = document.createElement('div');
    commenterInfoContainer.classList.add('commenter-info-container'); // 添加容器的样式类

    // 创建评论者和评论时间元素
    const commenterTimeDiv = document.createElement('div');
    commenterTimeDiv.classList.add('comment-commenter-time'); // 添加评论者和时间的样式类

    if (type === 'append') {
        commenterTimeDiv.textContent = `—— commented by ${comment.name} to reply ${comment.parentCommenterName} at ${comment.createTime}`;
    } else {
        commenterTimeDiv.textContent = `—— commented by ${comment.name} at ${comment.createTime}`;
    }
    commenterInfoContainer.appendChild(commenterTimeDiv);

    // 创建点赞数量元素
    const likeCountSpan = document.createElement('span');
    likeCountSpan.classList.add('like-count');
    likeCountSpan.textContent = 'Total likes: 123';
    commenterInfoContainer.appendChild(likeCountSpan);

    // 创建点赞按钮
    const likeButton = document.createElement('button');
    likeButton.classList.add('like-button');
    likeButton.textContent = 'like';
    commenterInfoContainer.appendChild(likeButton);

    // NOTE: 定义点赞状态和初始点赞数量（都需要从后端获得）
    var isLiked = getLikeStatus();  // 用户是否点赞该评论
    var likeCount = getLikeCount();  // 该评论的总点赞数

    // 点击点赞按钮
    likeButton.addEventListener('click', () => {
        if (isLiked) {
            unlikeComment(comment);  // 取消点赞
        } else {
            likeComment(comment);  // 点赞
        }
    });

    // 创建删除按钮
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.setAttribute('data-comment-id', comment.commentId); // 设置评论ID
    deleteButton.textContent = 'delete';

    // NOTE: 只有自己的评论才能删除
    // 判断是否是自己发布的评论
    const isOwnComment = comment.userId === sessionStorage.getItem('userId');

    commenterInfoContainer.appendChild(deleteButton);
    // 监听删除按钮的点击事件
    deleteButton.addEventListener('click', () => {
        if (confirm('确定要删除该评论吗？')) {
            deleteComment(comment.commentId);
        }
    });

    // 创建回复按钮
    const replyButton = document.createElement('button');
    replyButton.classList.add('reply-button');
    replyButton.setAttribute('data-comment-id', comment.commentId); // 设置评论ID
    replyButton.textContent = 'reply';
    commenterInfoContainer.appendChild(replyButton);

    // 创建回复框
    const replyInput = document.createElement('textarea');
    replyInput.classList.add('reply-input');
    replyInput.setAttribute('data-comment-id', comment.commentId); // 设置评论ID
    replyInput.placeholder = 'reply here...';
    replyInput.style.display = 'none'; // 初始隐藏
    commenterInfoContainer.appendChild(replyInput);

    // NOTE: 判断评论状态
    if (!sessionStorage.getItem('userId')) {
        likeButton.disabled = true;
        likeButton.title = '您尚未登录';
        deleteButton.disabled = true;
        deleteButton.title = '您尚未登录';
        replyButton.disabled = true;
        replyButton.title = '您尚未登录';
        replyInput.disabled = true;
    } else if (comment.status === '正常') {
        // FIXME:
        contentDiv.textContent = comment.content;
        // contentDiv.innerHTML = `<script>alert('here is xss');</script>`;
        // contentDiv.innerHTML = `\<script\>\n" + "alert('xss') \n" + "\<\/script\>`;
        likeButton.disabled = false;
        // deleteButton.disabled = !isOwnComment;
        if (isOwnComment) {
            deleteButton.disabled = false;
        } else {
            deleteButton.disabled = true;
            deleteButton.title = '您无权删除其他人的评论';
        }
        replyButton.disabled = false;
        replyInput.disabled = false;
    } else if (comment.status === '已删除') {
        contentDiv.textContent = '该评论已删除';
        likeButton.disabled = true;
        likeButton.title = '该评论已被删除，无法继续点赞';
        deleteButton.disabled = true;
        deleteButton.title = '该评论已被删除';
        replyButton.disabled = true;
        replyButton.title = '该评论已被删除，无法继续回复';
        replyInput.disabled = true;
    }

    // 将评论者和评论时间、回复按钮、回复框的容器添加到评论项容器中
    liContainer.appendChild(commenterInfoContainer);

    commentItem.appendChild(liContainer);
    parentElement.appendChild(commentItem);

    // 将评论容器映射关系存入 commentMap
    commentMap[comment.commentId.toString()] = commentItem;

    // NOTE: 删除评论
    function deleteComment(commentId) {

        const url = 'http://localhost:3000/php/comment.php';

        const deleteData = {
            requestType: 'deleteComment',
            commentId: commentId
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
                if (data.success) {
                    // 在前端执行删除操作成功后的逻辑
                    // commentItem.remove(); // 删除评论项
                    contentDiv.textContent = '该评论已删除';
                    likeButton.disabled = true;
                    deleteButton.disabled = true;
                    replyButton.disabled = true;
                    replyInput.disabled = true;
                    console.log('删除评论成功');
                } else {
                    console.log('删除评论失败');
                }
            })
            .catch(error => {
                console.error('请求出错:', error);
            });
    }

    // NOTE: 点赞评论
    function likeComment(comment) {

        const url = 'http://localhost:3000/php/comment.php';

        const likeData = {
            requestType: 'likeComment',
            userId: sessionStorage.getItem('userId'),
            commentId: comment.commentId
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(likeData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    isLiked = getLikeStatus();
                    likeCount = getLikeCount();
                    console.log('点赞成功')
                } else {
                    console.log('点赞失败');
                }
            })
            .catch(error => {
                console.error('请求出错:', error);
            });
    }

    // NOTE: 取消点赞评论
    function unlikeComment(comment) {

        const url = 'http://localhost:3000/php/comment.php';

        const unlikeData = {
            requestType: 'unlikeComment',
            userId: sessionStorage.getItem('userId'),  //comment.userId
            commentId: comment.commentId
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unlikeData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 更新点赞状态和点赞数量
                    isLiked = getLikeStatus();
                    likeCount = getLikeCount();
                    console.log('取消点赞成功');
                } else {
                    console.log('取消点赞失败');
                }
            })
            .catch(error => {
                console.error('请求出错:', error);
            });
    }

    // NOTE: 获取点赞状态
    function getLikeStatus() {

        const url = 'http://localhost:3000/php/comment.php';

        const params = new URLSearchParams({
            requestType: 'getLikeStatus',
            userId: sessionStorage.getItem('userId'),
            commentId: comment.commentId
        });

        return fetch(`${url}?${params}`)
            .then(response => response.json())
            .then(data => {
                isLiked = data.isLiked;
                updateLikeStatus();  // NOTE: 这里会更新点赞状态
                return isLiked;
            })
            .catch(error => {
                console.error('获取点赞状态出错:', error);
            });
    }

    // NOTE: 获取点赞数量
    function getLikeCount() {

        const url = 'http://localhost:3000/php/comment.php';

        const params = new URLSearchParams({
            requestType: 'getLikeCount',
            commentId: comment.commentId
        });

        return fetch(`${url}?${params}`)
            .then(response => response.json())
            .then(data => {
                likeCount = data.likeCount;
                updateLikeCount();
                return likeCount;
            })
            .catch(error => {
                console.error('获取点赞数出错:', error);
            });
    }

    // NOTE: 更新点赞状态
    function updateLikeStatus() {
        if (isLiked) {
            likeButton.classList.add('liked');
            likeButton.textContent = 'liked';
        } else {
            likeButton.classList.remove('liked');
            likeButton.textContent = 'like';
        }
    }

    // NOTE: 更新点赞数量
    function updateLikeCount() {
        likeCountSpan.textContent = 'Total likes: ' + likeCount;
    }

}

