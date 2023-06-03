window.onload = function () {

	// 设置最晚出生日期（当前日期）
	setMaxBirthdate();

	// 生成验证码
	generateCaptcha();

	// NOTE: 防止用户过快点击按钮
	var registerButton = document.getElementById("register-button");
	registerButton.addEventListener("click", avoidQuickClick);

	// NOTE: 注册表单验证

	// var registerForm = document.getElementById('register-form');
	var registerForm = document.querySelector('form');

	registerForm.addEventListener('submit', function (event) {
		event.preventDefault();

		// FIXME: 把以下代码省略掉

		// 获取必填项
		var nameInput = document.getElementsByName('name')[0];
		var passwordInput = document.getElementsByName('password')[0];
		var confirmPasswordInput = document.getElementsByName('confirm_password')[0];
		var captchaInput = document.getElementsByName('captcha')[0];

		// 获取选填项
		var emailInput = document.getElementsByName('email')[0];
		var telephoneInput = document.getElementsByName('telephone')[0];

		// NOTE: 以下三项选填不用验证
		// var genderInput = document.getElementsByName('gender')[0];
		// var birthdateInput = document.getElementsByName('birthdate')[0];
		// var addressInput = document.getElementsByName('address')[0];

		// birthdateInput.required = false;
		// emailInput.required = false;
		// telephoneInput.required = false;
		// addressInput.required = false;

		// 若页面上仍有错误提示信息时，阻止表单提交
		var nameError = !validateName(nameInput.value);
		var passwordError = !validatePassword(passwordInput.value);
		var confirmPasswordError = !validateConfirmPassword(confirmPasswordInput.value);
		var captchaError = !validateCaptcha(captchaInput.value);

		var emailError = !validateEmail(emailInput.value);
		var telephoneError = !validatePhoneNumber(telephoneInput.value);

		if (nameError || passwordError || confirmPasswordError || captchaError || emailError || telephoneError) {
			console.log('enter into error');
			// event.preventDefault(); // 阻止表单默认提交行为
			var warningElement = document.querySelector('.submit-error');
			warningElement.textContent = '注册信息仍有误，请按提示修正！';
			return false;  // NOTE: 真正阻止提交
		}

		/* 通过以上验证后，则提交表单，发送给服务器端进行验证和处理 */
		// this.submit();

		const formData = new FormData(registerForm);
		// formData.append('requestType', 'login');

		// 发送POST请求
		fetch('http://localhost:3000/php/register.php', {
			method: 'POST',
			body: formData
		})
			.then(response => response.json())
			.then(data => {

				if (data.success) {
					// sessionStorage.setItem('name', data.name);
					// sessionStorage.setItem('userId', data.userId);
					alert(data.message);
					window.location.href = '../html/login.html';
				} else {
					alert(data.message);
					window.location.href = '../html/register.html';
				}

			})
			.catch(error => {
				console.error('Error:', error);
			});


	});
}



// FIXME: 以下暂时弃用

function validateSubmit(event) {

	// 有问题 —— 空串？
	// // 页面上仍有错误提示信息时，阻止表单提交
	// var errorElements = document.querySelectorAll('.warning:not(:empty)');
	// if (errorElements.length > 0) {
	// 	event.preventDefault(); // 阻止表单默认提交行为
	// 	var warningElement = document.querySelector('.submit-error');
	// 	warningElement.textContent = '以上注册信息仍有误，请按提示修正！';
	// }

	event.preventDefault();

	// 获取表单数据
	var nameInput = document.getElementsByName('name')[0];
	var passwordInput = document.getElementsByName('password')[0];
	var confirmPasswordInput = document.getElementsByName('confirm_password')[0];

	var genderInput = document.getElementsByName('gender')[0];
	var birthdateInput = document.getElementsByName('birthdate')[0];
	var emailInput = document.getElementsByName('email')[0];
	var telephoneInput = document.getElementsByName('telephone')[0];
	var addressInput = document.getElementsByName('address')[0];

	birthdateInput.required = false;
	emailInput.required = false;
	telephoneInput.required = false;
	addressInput.required = false;

	// 若页面上仍有错误提示信息时，阻止表单提交
	var nameError = !validateName(nameInput.value);
	var passwordError = !validatePassword(passwordInput.value);
	var confirmPasswordError = !validateConfirmPassword(confirmPasswordInput.value);
	var emailError = !validateEmail(emailInput.value);
	var telephoneError = !validatePhoneNumber(telephoneInput.value);

	if (nameError || passwordError || confirmPasswordError || emailError || telephoneError) {
		console.log('enter into error');
		event.preventDefault(); // 阻止表单默认提交行为
		var warningElement = document.querySelector('.submit-error');
		warningElement.textContent = '以上注册信息仍有误，请按提示修正！';
	}

	// NOTE: 把哈希加盐操作放在服务器端会更安全！

	/* 通过以上验证后，则提交表单，发送给服务器端进行验证和处理 */

	// NOTE: 使用了XMLHttpRequest对象（简称XHR）来发送异步请求，并将表单数据作为URL参数字符串发送到服务器端的register.php文件

	// registerForm.onsubmit();
	console.log('before xhr');

	// 创建一个XHR对象
	var xhr = new XMLHttpRequest();
	var url = 'http://localhost:3000/login/register.php'; // 替换为服务器端处理脚本的URL

	// 设置POST请求
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  // 表单数据编码类型

	// xhr.responseType = "json";

	// 定义请求完成时的回调函数
	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				console.log('注册成功');

				// // var response = JSON.parse(xhr.responseText);
				// var response = xhr.response;
				// if (response.success) {
				// 	// 注册成功，重定向到登录页面
				// 	// alert('注册成功');
				// 	window.location.href = response.redirect;
				// } else {
				// 	console.log('Error:', response.error);
				// }

			} else {
				console.log('Error:', xhr.status);
			}
		}
	};

	// 将表单数据编码为URL参数字符串
	var data = 'name=' + encodeURIComponent(nameInput.value) +
		'&password=' + encodeURIComponent(passwordInput.value) +
		'&gender=' + encodeURIComponent(genderInput.value) +
		'&birthdate=' + encodeURIComponent(birthdateInput.value) +
		'&email=' + encodeURIComponent(emailInput.value) +
		'&telephone=' + encodeURIComponent(telephoneInput.value) +
		'&address=' + encodeURIComponent(addressInput.value);

	// 发送请求
	xhr.send(data);
}
