document.addEventListener("DOMContentLoaded", function () {

    // NOTE: 主页设置默认音乐不播放
    // localStorage.setItem('isMusicPlaying', 'false');

    // NOTE: 展示最新发布的6件画作
    getLatestReleased();

    // NOTE: 图片轮播

    // getRecommended();

    var length,
        currentIndex = 0,
        interval,
        hasStarted = true, // 是否已经开始轮播
        t = 3000; // 轮播时间间隔

    // 获取轮播面板数量
    var sliderMain = document.querySelector('.slider-main');
    var sliderPanels = []; // 存储轮播面板的数组

    const url = 'http://localhost:3000/php/getArtwork.php';

    const params = new URLSearchParams({
        requestType: 'getRecommended',
        userId: sessionStorage.getItem('userId')
    });

    // NOTE: 请求推荐数据
    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {

            console.log(data);

            // 根据获取到的数据动态创建轮播项
            for (var i = 0; i < data.length; i++) {
                (function () {  // NOTE: 函数闭包
                    var item = data[i];
                    var li = document.createElement('li');
                    li.className = 'slider-panel';

                    var img = document.createElement('img');
                    img.src = '../resource/image/artwork/' + item.imageFileName;

                    img.addEventListener('click', function () {
                        const detailUrl = `../html/detail.html?artworkId=${item.artworkId}`;
                        console.log(item.artworkId);
                        window.location.href = detailUrl;
                    });

                    li.appendChild(img);

                    sliderPanels.push(li);
                    sliderMain.appendChild(li);
                })();
            }

            // 初始化轮播
            length = sliderPanels.length;
            sliderPanels[0].style.display = 'block';
            document.querySelector('.slider-item').classList.add('slider-item-selected');
            document.querySelector('.slider-page').style.display = 'none';  // NOTE: 这里为什么要设置页数为none

            // 鼠标悬停事件
            var slider = document.querySelector('.slider');
            slider.addEventListener('mouseenter', function () {
                stop();
                document.querySelector('.slider-page').style.display = 'block';
            });

            slider.addEventListener('mouseleave', function () {
                start();
                document.querySelector('.slider-page').style.display = 'none';
            });

            // 上一页按钮点击事件
            var preBtn = document.querySelector('.slider-pre');
            preBtn.addEventListener('click', function () {
                pre();
            });

            // 下一页按钮点击事件
            var nextBtn = document.querySelector('.slider-next');
            nextBtn.addEventListener('click', function () {
                next();
            });

            // 底部导航项点击事件
            var sliderItems = document.querySelectorAll('.slider-item');
            for (var i = 0; i < sliderItems.length; i++) {
                (function (i) {
                    sliderItems[i].addEventListener('click', function () {
                        var preIndex = currentIndex;
                        currentIndex = i;
                        play(preIndex, currentIndex);
                    });
                })(i);
            }

            // 向前翻页
            function pre() {
                var preIndex = currentIndex;
                currentIndex = (currentIndex - 1 + length) % length;
                play(preIndex, currentIndex);
            }

            // 向后翻页
            function next() {
                var preIndex = currentIndex;
                currentIndex = (currentIndex + 1) % length;
                play(preIndex, currentIndex);
            }

            /**
             * 从 preIndex 页翻到 currentIndex 页
             * @param {number} preIndex - 起始页索引
             * @param {number} currentIndex - 目标页索引
             */
            function play(preIndex, currentIndex) {
                sliderPanels[preIndex].style.display = 'none';
                sliderPanels[currentIndex].style.display = 'block';

                sliderItems[preIndex].classList.remove('slider-item-selected');
                sliderItems[currentIndex].classList.add('slider-item-selected');
            }

            /**
             * 开始轮播
             */
            function start() {
                if (!hasStarted) {
                    hasStarted = true;
                    interval = setInterval(next, t);
                }
            }

            /**
             * 停止轮播
             */
            function stop() {
                clearInterval(interval);
                hasStarted = false;
            }

            // NOTE: 开始轮播
            start();
        })
        .catch(error => {
            console.log('获取轮播数据时出错:', error);
        });



});

// NOTE: 获取向用户推荐的4件商品
function getRecommended() {

    const url = 'http://localhost:3000/php/getArtwork.php';

    const params = new URLSearchParams({
        requestType: 'getRecommended',
        userId: sessionStorage.getItem('userId')
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {

            console.log(data);

            // displayResults(data.slice(0, 6));

        })
        .catch(error => {
            console.error('Error:', error);
        });

}

// NOTE: 获取最新发布的6件商品
function getLatestReleased() {

    const latestReleasedDiv = document.getElementById('latestReleased');

    const url = 'http://localhost:3000/php/getArtwork.php';

    const params = new URLSearchParams({
        requestType: 'getLatestReleased',
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {

            // latestReleasedDiv.innerHTML = '';

            displayResults(data.slice(0, 6));

            // data.slice(0, 6).forEach(artwork => {
            //     const artworkElement = document.createElement('div');
            //     artworkElement.textContent = artwork.title;
            //     latestReleasedDiv.appendChild(artworkElement);
            // });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// NOTE: 展示搜索结果
function displayResults(results) {
    var resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = "";

    results.forEach(function (result) {

        var artworkDiv = document.createElement("div");
        artworkDiv.classList.add("artworkDiv");

        var topDiv = document.createElement("div");
        topDiv.classList.add("topDiv");

        var imageDiv = document.createElement("div");
        imageDiv.classList.add("imageDiv");
        var image = document.createElement("img");
        var imagePath = '../resource/image/works/square-medium/' + result.imageFileName;
        image.src = imagePath;
        image.alt = result.title;
        imageDiv.appendChild(image);

        // NOTE: 点击商品图片跳转到详情界面
        // FIXME: 把设置localstorage换成GET发送参数
        image.addEventListener('click', () => {

            // localStorage.setItem('selectedArtworkId', result.artworkId);
            // window.location.href = '../html/detail.html';

            // 构造Detail页面的URL，并包含artworkId参数
            const detailUrl = `../html/detail.html?artworkId=${result.artworkId}`;
            // 跳转到修改页面
            window.location.href = detailUrl;

        });

        var infoDiv = document.createElement("div");
        infoDiv.classList.add("infoDiv");
        var title = document.createElement("h3");
        title.classList.add("title");
        title.textContent = result.title;
        infoDiv.appendChild(title);

        var artist = document.createElement("p");
        artist.classList.add("artist");
        artist.textContent = "by " + result.artist;
        infoDiv.appendChild(artist);

        var price = document.createElement("p");
        price.classList.add("price");
        price.textContent = "Price: " + result.price;
        infoDiv.appendChild(price);

        topDiv.appendChild(imageDiv);
        topDiv.appendChild(infoDiv);

        var introduction = document.createElement("p");
        introduction.classList.add('intro');
        introduction.textContent = result.introduction;

        artworkDiv.appendChild(topDiv);
        artworkDiv.appendChild(introduction);

        resultsContainer.appendChild(artworkDiv);
    });
}
