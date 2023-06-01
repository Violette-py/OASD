

document.addEventListener("DOMContentLoaded", function () {

    // FIXME: 图片局部放大
    // var previewContainer = document.querySelector('.preview');
    // var magnifier = document.querySelector('.magnifier');
    // var previewImage = document.getElementById('preview-image');

    // previewContainer.addEventListener('mousemove', function (event) {
    //     var containerRect = previewContainer.getBoundingClientRect();
    //     var mouseX = event.clientX - containerRect.left;
    //     var mouseY = event.clientY - containerRect.top;

    //     var magnifierSize = 100; // 小圆镜子的尺寸
    //     var magnifierX = mouseX - magnifierSize / 2;
    //     var magnifierY = mouseY - magnifierSize / 2;

    //     magnifier.style.left = magnifierX + 'px';
    //     magnifier.style.top = magnifierY + 'px';
    //     magnifier.style.backgroundImage = 'url(' + previewImage.src + ')';
    //     magnifier.style.backgroundPosition = -magnifierX * 4 + 'px ' + -magnifierY * 4 + 'px';
    // });

    // 

    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);

    // 检查URL参数中是否包含artworkId
    if (urlParams.has('artworkId')) {

        localStorage.setItem('requestType', 'changeInfo');
        localStorage.setItem('artworkId', urlParams.get('artworkId'));

        const url = 'http://localhost:3000/php/detail.php';

        const params = new URLSearchParams({
            requestType: 'getDetail',
            artworkId: urlParams.get('artworkId')
        });

        fetch(`${url}?${params}`)
            .then(response => response.json())
            .then(data => {

                // 将商品信息填充到表单输入框中
                document.getElementById('preview-image').src = '../resource/image/artwork/' + data.imageFileName;
                document.getElementById('title').value = data.title;
                document.getElementById('artist').value = data.artist;
                document.getElementById('genre').value = data.genre;
                document.getElementById('year').value = data.year;
                document.getElementById('price').value = data.price;
                document.getElementById('width').value = data.width;
                document.getElementById('height').value = data.height;
                document.getElementById('introduction').value = data.introduction;

                document.getElementById('submit-btn').textContent = 'Change Info';
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        localStorage.setItem('requestType', 'issue');
        localStorage.setItem('artworkId', -1);
    }

    console.log(localStorage.getItem('requestType'));
    console.log('artworkId is ' + localStorage.getItem('artworkId'));

    // NOTE: 提交issue表单

    // 获取表单元素
    const form = document.querySelector('form'); //#issue-form

    // 监听表单提交事件
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // 阻止表单默认提交行为

        // 检查当前页面上是否仍有错误信息
        if (!validateIssueForm()) {
            return false;
        }

        // 创建FormData对象，将表单数据添加到其中
        const formData = new FormData(form);  //document.getElementById('issue-form')

        formData.append('ownerId', sessionStorage.getItem('userId'));
        formData.append('requestType', localStorage.getItem('requestType'));
        formData.append('artworkId', localStorage.getItem('artworkId'));

        // 发送POST请求
        fetch('http://localhost:3000/php/issue.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                // 若为发布界面则重定向，以清空当前表单，继续发布
                if (localStorage.getItem('requestType') === 'issue') {
                    window.location.href = '../html/issue.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
})

// NOTE: 预览图片
function previewImage(event) {
    var input = event.target;
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var previewImage = document.getElementById('preview-image');
            previewImage.src = e.target.result;
        };  // 回调函数
        reader.readAsDataURL(input.files[0]); // 读取文件
    }
}

function validateIssueForm() {

    var titleInput = document.getElementById('title');
    var artistInput = document.getElementById('artist');
    var genreInput = document.getElementById('genre');
    var yearInput = document.getElementById('year');
    var priceInput = document.getElementById('price');
    var widthInput = document.getElementById('width');
    var heightInput = document.getElementById('height');
    var introductionInput = document.getElementById('introduction');
    var uploadInput = document.getElementById('upload');

    var titleError = !validateNotNull(titleInput.value, titleInput);
    var artistError = !validateNotNull(artistInput.value, artistInput);
    var genreError = !validateNotNull(genreInput.value, genreInput);
    var yearError = !validatePositiveInteger(yearInput.value, yearInput);
    var priceError = !validatePositiveInteger(priceInput.value, priceInput);
    var widthError = !validatePositive(widthInput.value, widthInput);
    var heightError = !validatePositive(heightInput.value, heightInput);
    var introductionError = !validateNotNull(introductionInput.value, introductionInput);

    if (localStorage.getItem('requestType') === 'issue') {
        var uploadError = !validateNotNull(uploadInput.value, uploadInput);
    } else {
        // NOTE: 修改信息时，图片不是必选项
        var uploadError = false;
    }

    var formErrors = [
        titleError,
        artistError,
        genreError,
        yearError,
        priceError,
        widthError,
        heightError,
        introductionError,
        uploadError
    ];

    var hasErrors = formErrors.some(error => error);

    var warningElement = document.querySelector('.submit-error');

    if (hasErrors) {
        warningElement.textContent = '以上填写信息仍有误，请按提示修正！';
        return false;
    } else {
        warningElement.textContent = '';
        return true;
    }
}

