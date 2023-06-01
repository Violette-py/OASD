document.addEventListener("DOMContentLoaded", function () {

    // NOTE: 主页设置默认音乐不播放
    // localStorage.setItem('isMusicPlaying', 'false');

    var currentIndex = 0,
        interval,
        hasStarted = true, //是否已经开始轮播
        t = 3000; //轮播时间间隔

    var sliderMain = document.querySelector('.slider-main');
    var sliderNav = document.querySelector('.slider-nav');
    // var length; // 声明 length 变量

    const url = 'http://localhost:3000/php/getArtwork.php';

    // 构建带参数的 URL
    const params = new URLSearchParams({
        requestType: 'getRecommended'
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(function (data) {
            console.log(data);
            length = data.length; // 赋值 length 变量

            // 构建轮播图
            data.forEach(function (item, index) {
                var panel = document.createElement('li');
                panel.classList.add('slider-panel');

                var img = document.createElement('img');
                img.src = '../resource/image/artwork/' + item.imageFileName;
                panel.appendChild(img);

                // var p = document.createElement('p');
                // p.id = 'workDescrip';
                // p.textContent = item.introduction;
                // panel.appendChild(p);

                sliderMain.appendChild(panel);

                var navItem = document.createElement('li');
                navItem.classList.add('slider-item');
                navItem.textContent = index + 1;
                navItem.dataset.index = index;

                sliderNav.appendChild(navItem);
            });

            // 将除了第一张图片隐藏
            var panels = document.querySelectorAll('.slider-panel');
            panels.forEach(function (panel, index) {
                if (index !== 0) {
                    panel.style.display = 'none';
                }
            });

            // 将第一个slider-item设为激活状态
            var sliderItems = document.querySelectorAll('.slider-item');
            sliderItems[0].classList.add('slider-item-selected');

            // 隐藏向前、向后翻按钮
            var sliderPage = document.querySelector('.slider-page');
            sliderPage.style.display = 'none';

            // 鼠标上悬时显示向前、向后翻按钮,停止滑动，鼠标离开时隐藏向前、向后翻按钮，开始滑动
            var sliderElements = document.querySelectorAll('.slider-panel, .slider-pre, .slider-next');
            sliderElements.forEach(function (element) {
                element.addEventListener('mouseenter', function () {
                    stop();
                    sliderPage.style.display = 'block';
                });

                // ... 继续添加其他事件监听器
            });

            // 开始轮播
            start();

            // ... 继续添加其他函数和代码
        });

    /**
     * 开始轮播
     */
    function start() {

        console.log('here is start');

        if (!hasStarted) {
            hasStarted = true;
            interval = setInterval(next, t);
        }
    }

    /**
     * 停止轮播
     */
    function stop() {

        console.log('here is stop');

        clearInterval(interval);
        hasStarted = false;
    }

    /**
     * 向后翻页
     */
    function next() {

        console.log('here is next');

        stop(); // 先停止自动轮播
        var preIndex = currentIndex;
        currentIndex = ++currentIndex % length;
        play(preIndex, currentIndex);
        start(); // 手动翻页后重新开始自动轮播
    }

    /**
     * 从preIndex页翻到currentIndex页
     * preIndex 整数，翻页的起始页
     * currentIndex 整数，翻到的那页
     */
    function play(preIndex, currentIndex) {

        console.log('here is play');

        var panels = document.querySelectorAll('.slider-panel');
        panels[preIndex].style.display = 'none';
        panels[currentIndex].style.display = 'block';

        var sliderItems = document.querySelectorAll('.slider-item');
        sliderItems[preIndex].classList.remove('slider-item-selected');
        sliderItems[currentIndex].classList.add('slider-item-selected');
    }
});
