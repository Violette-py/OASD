
// NOTE: 防止用户过快点击

// 必须定义在函数外部
var lastClickTime = 0;
var clickThreshold = 1000; // 设置点击阈值为1秒
/* 由于你在每次点击时都重新定义了lastClickTime变量，并将其设置为0，因此无法实现正确的连续点击检测。
为了使连续点击检测正常工作，你需要将lastClickTime变量定义在函数外部，以便保持其状态。 */

function avoidQuickClick(event) {
	var currentTime = new Date().getTime();
	if (currentTime - lastClickTime < clickThreshold) {
		event.preventDefault(); // 阻止按钮默认行为 -- 即阻止了表单的提交
		alert("请不要连续点击按钮！"); // 给出提示信息
		return false;
	} else {
		lastClickTime = currentTime;
	}
}

// NOTE: 验证非空
function validateNotNull(value, inputElement) {

	var warningElement = inputElement.parentNode.querySelector('.warning.null-error');

	if (value.trim() === '') {  // .trim去除字符串两端的空格
		warningElement.textContent = '*输入不能为空';
		return false;
	} else {
		warningElement.textContent = '√';
		return true;
	}

}

// NOTE: 验证为正数
function validatePositive(value, inputElement) {

	var parsedValue = parseFloat(value);
	var warningElement = inputElement.parentNode.querySelector('.warning.positive-error');

	if (isNaN(parsedValue) || parsedValue <= 0) {
		warningElement.textContent = '*请输入正数';
		return false;
	} else {
		warningElement.textContent = '√';
		return true;
	}
}

// NOTE: 验证为正整数
function validatePositiveInteger(value, inputElement) {

	var parsedValue = parseFloat(value); // 解析为浮点数
	var warningElement = inputElement.parentNode.querySelector('.warning.positiveInter-error');

	if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
		warningElement.textContent = '*请输入正整数';
		return false;
	} else {
		warningElement.textContent = '√';
		return true;
	}
}


// NOTE: 以下为必填项

// NOTE: 验证用户名（查重在后端做）
function validateName(name) {
	var warningElement = document.querySelector('.name-error');

	if (name.trim() === '') {  // .trim去除字符串两端的空格
		warningElement.textContent = '*用户名不能为空';
		return false;
	} else {
		warningElement.textContent = '√';
		return true;
	}
}

// NOTE: 验证密码
function validatePassword(password) {
	var warningElement = document.querySelector('.password-error');
	var strengthElement = document.querySelector('.password-strength');

	if (password.length < 8 || password.length > 30) {
		warningElement.textContent = '*密码长度必须为8至30个字符';
		if (strengthElement !== null) {
			strengthElement.textContent = '';
		}
		return false;
	} else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
		warningElement.textContent = '*密码必须包含至少一个数字和一个字母';
		if (strengthElement !== null) {
			strengthElement.textContent = '';
		}
		return false;
	} else {
		// 判断密码强度
		var strength = calculatePasswordStrength(password);
		displayPasswordStrength(strength);
		warningElement.textContent = '√';
		return true;
	}
}

// 计算密码强度
function calculatePasswordStrength(password) {
	// 密码长度
	var lengthStrength = password.length < 8 ? '弱' : '强';

	// 包含的字符类型
	var hasLowercase = /[a-z]/.test(password);
	var hasUppercase = /[A-Z]/.test(password);
	var hasDigit = /\d/.test(password);
	var hasSpecialChar = /[!@#$%^&*]/.test(password);

	var typesStrength = 0;
	if (hasLowercase) typesStrength++;
	if (hasUppercase) typesStrength++;
	if (hasDigit) typesStrength++;
	if (hasSpecialChar) typesStrength++;

	// 字符组合情况
	var combinationsStrength = 0;
	if (hasLowercase && hasUppercase) combinationsStrength++;
	if (hasLowercase && hasDigit) combinationsStrength++;
	if (hasLowercase && hasSpecialChar) combinationsStrength++;
	if (hasUppercase && hasDigit) combinationsStrength++;
	if (hasUppercase && hasSpecialChar) combinationsStrength++;
	if (hasDigit && hasSpecialChar) combinationsStrength++;

	// 根据规则评估密码强度
	if (lengthStrength === '弱' && typesStrength < 3) {
		return '弱';
	} else if (lengthStrength === '强' && combinationsStrength >= 3) {
		return '强';
	} else {
		return '中';
	}
}

// 显示密码强度
function displayPasswordStrength(strength) {
	var strengthElement = document.querySelector('.password-strength');
	if (strengthElement !== null) {
		strengthElement.textContent = '密码强度：' + strength;
	}
}

// NOTE: 再次确认密码
function validateConfirmPassword(confirmPassword) {
	var passwordElement = document.querySelector('input[name="password"]');
	var warningElement = document.querySelector('.password-confirm-error');

	var password = passwordElement.value;

	if (confirmPassword !== password) {
		warningElement.textContent = '*两次密码输入不一致';
		return false;
	} else if (confirmPassword.length === 0) {
		warningElement.textContent = '*确认密码不能为空';
		return false;
	} else {
		warningElement.textContent = '√';
		return true;
	}
}

// NOTE: 验证码
function validateCaptcha(captcha) {

	var warningElement = document.querySelector('.captcha-error');

	console.log(show_num);

	var generatedCaptchaText = show_num.join("").toLowerCase(); // 把数组中的字符串拼接起来

	console.log('origin:' + generatedCaptchaText);
	console.log('input:' + captcha.toLowerCase());

	if (captcha.toLowerCase() === generatedCaptchaText) { // 不区分大小写
		warningElement.textContent = '√';
		return true;
	} else if (captcha.length === 0) {
		warningElement.textContent = '*验证码不能为空';
		return false;
	} else {
		warningElement.textContent = '*验证码输入错误';
		return false;
	}
}


// NOTE: 以下为选填项

// NOTE: 设置最晚出生日期
function setMaxBirthdate() {
	var currentDate = new Date().toISOString().split("T")[0];
	var birthdateInput = document.querySelector('input[name="birthdate"]');
	if (birthdateInput !== null) {
		birthdateInput.max = currentDate;

	}
}

// NOTE：验证邮箱
function validateEmail(email) {

	var warningElement = document.querySelector('.email-error');

	// 邮箱为选填
	if (email.length !== 0) {
		var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (emailPattern.test(email)) {
			warningElement.textContent = '√';
			return true;
		} else {
			warningElement.textContent = '*不合法邮箱，请输入\'xx@xx.xx\''; // 显示警告消息
			return false;
		}
	}
	else {
		warningElement.textContent = '';
		return true;
	}
}

// NOTE: 验证手机号
function validatePhoneNumber(phoneNumber) {
	var warningElement = document.querySelector('.telephone-error');

	// 手机号为选填
	if (phoneNumber.length !== 0) {
		var phonePattern = /^1[3456789]\d{9}$/;

		if (phonePattern.test(phoneNumber)) {
			warningElement.textContent = '√';
			return true;
		} else {
			warningElement.textContent = '*不合法手机号，请输入11位数字';
			return false;
		}
	} else {
		warningElement.textContent = '';
		return true;
	}
}

var show_num = [];//装验证码的数组

// NOTE: 生成随机验证码
function generateCaptcha() {

	//验证码生成
	var canvas = document.getElementById('canvas');//画布对象

	draw(show_num)
	console.log(show_num);

	canvas.onclick = () => {
		draw(show_num)
		console.log(show_num);
	}

	//产生随机颜色
	function randomColor() {
		var r = Math.floor(Math.random() * 256);
		var g = Math.floor(Math.random() * 256);
		var b = Math.floor(Math.random() * 256);
		return "rgb(" + r + "," + g + "," + b + ") "
	}
	//画布
	function draw(show_num) {
		let canvas_clientWidth = document.getElementById('canvas').clientWidth//画布长度
		let canvas_clientHeight = document.getElementById('canvas').clientHeight//画布高度
		let context = canvas.getContext("2d")//画布环境 创建 context 对象：
		canvas.width = canvas_clientWidth
		canvas.height = canvas_clientHeight
		let str = "A,B,C,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,W,X,Y,Z,1,2,3,4,5,6,7,8,9,0,q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,v,b,n,m";
		let astr = str.split(',');//分割字符串形成数组
		let sLength = astr.length;//数组长度
		for (let i = 0; i <= 3; i++) {
			let j = Math.floor(Math.random() * sLength);//随机索引
			let deg = Math.random() * 30 * Math.PI / 180;//0-30随机弧度
			let text = astr[j];//随机字符

			show_num[i] = text//验证码字符数组  // 每次绘画时都会覆盖上次的以重新赋值

			let x = 10 + i * 20//x坐标
			let y = 20 + Math.random() * 8//y坐标
			//位移 旋转角度 颜色 文字 样式开始位置
			context.font = 'bold 23px 微软雅黑'
			context.translate(x, y);
			context.rotate(deg);
			context.fillStyle = randomColor();
			context.fillText(text, 0, 0)
			context.rotate(-deg)
			context.translate(-x, -y)
		}
		//验证码显示小点
		for (let i = 0; i <= 30; i++) {
			context.strokeStyle = randomColor()//设置随机色用小点的颜色
			context.beginPath();//开始一条路径
			let m = Math.random() * canvas_clientWidth;
			let n = Math.random() * canvas_clientHeight;
			context.moveTo(m, n)//移动
			context.lineTo(m + 1, n + 1);//添加一个新点，然后在画布中创建从该点到最后指定点的线条
			context.stroke();//画上面定义好的路径
		}
		//验证码显示线条
		for (let i = 0; i < 8; i++) {
			context.strokeStyle = randomColor()
			context.beginPath()
			context.moveTo(Math.random() * canvas_clientWidth, Math.random() * canvas_clientHeight);
			context.lineTo(Math.random() * canvas_clientWidth, Math.random() * canvas_clientHeight)
			context.stroke()
		}
	}
}