window.addEventListener('DOMContentLoaded', function () {

  // 获取轮播图容器和进度条容器
var slider = document.querySelector('.slider');
var progress = document.querySelector('.progress');

// 发送GET请求获取作品信息


const url = 'http://localhost:3000/php/getArtwork.php';

// 构建带参数的 URL
const params = new URLSearchParams({
  requestType: 'getRecommended'
});

fetch(`${url}?${params}`)
  .then(data => {
    // 遍历作品信息，生成轮播图和进度条
    for (var i = 0; i < data.length; i++) {
      var artwork = data[i];
      var slide = document.createElement('div');
      slide.classList.add('slide');
      var imagePath = '../resource/image/artwork/' + data.imageFileName;
      slide.style.backgroundImage = 'url(' + imagePath + ')';
      slider.appendChild(slide);

      var dot = document.createElement('div');
      dot.classList.add('dot');
      dot.dataset.index = i;
      progress.appendChild(dot);
    }

    // 设置自动切换轮播图的时间间隔
    var interval = setInterval(function() {
      var current = document.querySelector('.slide.active');
      // FIXME: 
      var next = current.nextElementSibling || slider.firstElementChild;
      current.classList.remove('active');
      next.classList.add('active');
      var index = parseInt(next.dataset.index);
      var dots = document.querySelectorAll('.dot');
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
      }
      dots[index].classList.add('active');
    }, 3000);

    // 绑定左右按钮和进度条的点击事件
    var prev = document.querySelector('.prev');
    var next = document.querySelector('.next');
    var dots = document.querySelectorAll('.dot');
    prev.addEventListener('click', function() {
      clearInterval(interval);
      var current = document.querySelector('.slide.active');
      var prev = current.previousElementSibling || slider.lastElementChild;
      current.classList.remove('active');
      prev.classList.add('active');
      var index = parseInt(prev.dataset.index);
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
      }
      dots[index].classList.add('active');
      interval = setInterval(function() {
        var current = document.querySelector('.slide.active');
        var next = current.nextElementSibling || slider.firstElementChild;
        current.classList.remove('active');
        next.classList.add('active');
        var index = parseInt(next.dataset.index);
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.remove('active');
        }
        dots[index].classList.add('active');
      }, 3000);
    });
    next.addEventListener('click', function() {
      clearInterval(interval);
      var current = document.querySelector('.slide.active');
      var next = current.nextElementSibling || slider.firstElementChild;
      current.classList.remove('active');
      next.classList.add('active');
      var index = parseInt(next.dataset.index);
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
      }
      dots[index].classList.add('active');
      interval = setInterval(function() {
        var current = document.querySelector('.slide.active');
        var next = current.nextElementSibling || slider.firstElementChild;
        current.classList.remove('active');
        next.classList.add('active');
        var index = parseInt(next.dataset.index);
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.remove('active');
        }
        dots[index].classList.add('active');
      }, 3000);
    });
    for (var i = 0; i < dots.length; i++) {
      dots[i].addEventListener('click', function() {
        clearInterval(interval);
        var index = parseInt(this.dataset.index);
        var current = document.querySelector('.slide.active');
        var next = document.querySelectorAll('.slide')[index];
        current.classList.remove('active');
        next.classList.add('active');
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.remove('active');
        }
        this.classList.add('active');
        interval = setInterval(function() {
          var current = document.querySelector('.slide.active');
          var next = current.nextElementSibling || slider.firstElementChild;
          current.classList.remove('active');
          next.classList.add('active');
          var index = parseInt(next.dataset.index);
          for (var i = 0; i < dots.length; i++) {
            dots[i].classList.remove('active');
          }
          dots[index].classList.add('active');
        }, 3000);
      });
    }

    // 设置第一张轮播图和进度条为激活状态
    var firstSlide = document.querySelector('.slide:first-child');
    var firstDot = document.querySelector('.dot:first-child');
    firstSlide.classList.add('active');
    firstDot.classList.add('active');
  }); 

});


/* document.addEventListener('DOMContentLoaded', function () {

  var slides = document.querySelector('.slides');
  var buttons = document.querySelector('.buttons');
  var progress = document.querySelector('.progress');
  var prevButton = document.querySelector('.prev');
  var nextButton = document.querySelector('.next');
  var slideIndex = 0;
  var timer;

  // 获取轮播图数据
  function getArtworks() {

    const url = 'http://localhost:3000/php/getArtwork.php';

    // 构建带参数的 URL
    const params = new URLSearchParams({
      requestType: 'getRecommended'
    });

    fetch(`${url}?${params}`)
      .then(response => response.json())
      .then(function (data) {

        console.log(data);

        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {

            var slide = document.createElement('div');
            slide.classList.add('slide');

            var image = document.createElement('img');
            image.src = '../resource/image/artwork/' + data[i].imageFileName;
            slide.appendChild(image);

            slides.appendChild(slide);
          }
          showSlide(slideIndex);
          // startTimer();
        }
      })
      .catch(function (error) {
        console.log('Error: ' + error);
      });
  }

  // 显示指定索引的轮播图
  // 显示指定索引的轮播图
  function showSlide(index) {
    var slideItems = document.querySelectorAll('.slide');
    var progressItems = document.querySelectorAll('.progress span');

    if (index < 0) {
      index = slideItems.length - 1;
    } else if (index >= slideItems.length) {
      index = 0;
    }

    for (var i = 0; i < slideItems.length; i++) {
      if (i === index) {
        slideItems[i].style.display = 'block';
        progressItems[i].classList.add('active');
      } else {
        slideItems[i].style.display = 'none';
        progressItems[i].classList.remove('active');
      }
    }

    slideIndex = index;
  }

  // 开始轮播计时器
  function startTimer() {
    timer = setInterval(function () {
      showSlide(slideIndex + 1);
    }, 3000);
  }

  // 停止轮播计时器
  function stopTimer() {
    clearInterval(timer);
  }

  // 切换到上一张轮播图
  function prevSlide() {
    showSlide(slideIndex - 1);
    stopTimer();
    startTimer();
  }

  // 切换到下一张轮播图
  function nextSlide() {
    showSlide(slideIndex + 1);
    stopTimer();
    startTimer();
  }

  // 添加轮播图切换事件监听器
  prevButton.addEventListener('click', prevSlide);
  nextButton.addEventListener('click', nextSlide);

  // 添加鼠标悬停事件监听器
  buttons.addEventListener('mouseover', stopTimer);
  buttons.addEventListener('mouseout', startTimer);

  // 添加进度条点击事件监听器
  progress.addEventListener('click', function (event) {
    if (event.target.tagName === 'SPAN') {
      var index = Array.from(progress.children).indexOf(event.target);
      showSlide(index);
      stopTimer();
      startTimer();
    }
  });

  // 获取轮播图数据并初始化
  getArtworks();
});
 */