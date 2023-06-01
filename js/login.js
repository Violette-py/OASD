window.onload = function () {

	// NOTE: 生成验证码
	generateCaptcha();

	// NOTE: 防止用户过快点击按钮
	var registerButton = document.getElementById("login-button");
	registerButton.addEventListener("click", avoidQuickClick);

	// NOTE: 登录表单验证

	var loginForm = document.querySelector('form');

	loginForm.addEventListener('submit', function (event) {
		event.preventDefault();

		// 检查当前页面上是否仍有错误信息
		if (!validateLoginForm()) {
			return false;
		}

		const formData = new FormData(loginForm);
		// formData.append('requestType', 'login');

		// 发送POST请求
		fetch('http://localhost:3000/php/login.php', {
			method: 'POST',
			body: formData
		})
			.then(response => response.json())
			.then(data => {
				
				if (data.success) {
					sessionStorage.setItem('name', data.name);
					sessionStorage.setItem('userId', data.userId);
					alert(data.message);
					window.location.href = '../html/home.html';
				} else {
					alert(data.message);
					window.location.href = '../html/login.html';
				}

			})
			.catch(error => {
				console.error('Error:', error);
			});


		/* 通过以上验证后，则提交表单，发送给服务器端进行验证和处理 */
		// this.submit();
		// return false;
	});
}

function validateLoginForm() {

	// 获取表单数据
	var nameInput = document.getElementsByName('name')[0];
	var passwordInput = document.getElementsByName('password')[0];
	var captchaInput = document.getElementsByName('captcha')[0];

	// 若页面上仍有错误提示信息时，阻止表单提交
	var nameError = !validateName(nameInput.value);
	var passwordError = !validatePassword(passwordInput.value);
	var captchaError = !validateCaptcha(captchaInput.value);

	if (nameError || passwordError || captchaError) {
		console.log('enter into error');
		var warningElement = document.querySelector('.submit-error');
		warningElement.textContent = '登录信息仍有误，请按提示修正！';
		return false;
	} else {
		return true;
	}
}