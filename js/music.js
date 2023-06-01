document.addEventListener("DOMContentLoaded", function () {

    // NOTE: 播放背景音乐

    // 添加背景音乐元素
    addBackgroundMusic();

    // 检查音乐状态：若用户已开启播放，则切换页面也继续播放
    // FIXME: 目前无法实现下一个页面接着上一个页面中断处继续播放，只能从头播放
    checkBackgroundMusic();

    var audio = document.getElementById('background-music');
    var toggleButton = document.getElementById('toggle-music-button');

    if (toggleButton !== null) {
        toggleButton.addEventListener('click', function () {
            if (audio.paused) {
                audio.play();
                toggleButton.textContent = 'Turn Off Music';
                localStorage.setItem('isMusicPlaying', 'true');
            } else {
                audio.pause();
                toggleButton.textContent = 'Turn On Music';
                localStorage.setItem('isMusicPlaying', 'false');
            }
        });
    }


});

function addBackgroundMusic() {
    var audio = document.createElement('audio');
    audio.id = 'background-music';
    audio.loop = true;
    audio.innerHTML = `
        <source src="../resource/music/AlwaysWithMe.mp3" type="audio/mp3">
        `;
    document.body.appendChild(audio);

    // audio.play();
    // 浏览器设置：无法默认自动播放，必须通过用户交互
}

function checkBackgroundMusic() {
    var audio = document.getElementById('background-music');
    var isMusicPlaying = localStorage.getItem('isMusicPlaying');

    if (isMusicPlaying !== null && isMusicPlaying === 'true') {
        audio.play();
    } else {
        audio.pause();
    }
}
