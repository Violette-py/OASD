window.addEventListener('DOMContentLoaded', function () {

    // 设置最晚出生日期（当前日期）
    setMaxBirthdate();

    const basicInfoForm = document.getElementById('basicInfo-form');
    const balanceForm = document.getElementById('balance-form');
    const balanceLabel = document.getElementById('balance');
    const passwordForm = document.getElementById('password-form');

    // NOTE: GET 获取用户个人信息

    const url = 'http://localhost:3000/php/info.php';

    // 构建带参数的 URL
    const params = new URLSearchParams({
        requestType: 'getInfo',
        userId: sessionStorage.getItem('userId')
    });

    fetch(`${url}?${params}`)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch data from the server.');
            }
        })
        .then(function (data) {
            console.log(data);
            // 设置返回的数据为表单元素的值
            basicInfoForm.name.value = data.data.name;
            basicInfoForm.gender.value = data.data.gender;
            basicInfoForm.birthdate.value = data.data.birthdate;
            basicInfoForm.email.value = data.data.email;
            basicInfoForm.telephone.value = data.data.telephone;
            basicInfoForm.address.value = data.data.address;

            balanceLabel.textContent = data.data.balance;  // 注意这里是设置textContent
        })
        .catch(function (error) {
            console.error(error);
        });

    // NOTE: PUT 修改余额
    balanceForm.addEventListener('submit', function (event) {
        event.preventDefault(); // 阻止默认提交行为

        // 检查是否仍有错误信息
        const amountInput = document.getElementById('amount');
        const amountError = !validatePositiveInteger(amountInput.value, amountInput);

        if (amountError) {
            alert('请输入正整数充值金额！');
            return false; // 若存在错误信息，则不执行后续操作
        }

        // 弹出确认框
        const confirmed = confirm('您确认要充值吗？');

        if (confirmed) {
            let url = 'http://localhost:3000/php/info.php';
            let requestType = 'updateBalance';
            let userId = sessionStorage.getItem('userId');
            let amount = document.getElementById('amount').value; // 获取充值金额

            const data = {
                requestType: requestType,
                userId: userId,
                amount: amount
            };

            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                        // 重定向以实现更新余额+刷新表单信息
                        window.location.href = "../html/info.html";
                        // balanceLabel.textContent = data.newBalance;
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => {
                    // 处理请求错误
                    console.error('请求发生错误:', error);
                    alert('请求发生错误');
                });
        } else {
            return false;
        }
    });

    // NOTE: PUT 修改基本信息
    basicInfoForm.addEventListener('submit', function (event) {
        event.preventDefault(); // 阻止默认提交行为

        // 获取表单输入值
        const nameInput = document.getElementById('name');
        const genderInput = document.getElementById('gender');
        const birthdateInput = document.getElementById('birthdate');
        const emailInput = document.getElementById('email');
        const telephoneInput = document.getElementById('telephone');
        const addressInput = document.getElementById('address');

        // 检查是否还有错误信息
        const nameError = !validateName(nameInput.value);
        const emailError = !validateEmail(emailInput.value);
        const telephoneError = !validatePhoneNumber(telephoneInput.value);

        if (nameError || emailError || telephoneError) {
            alert('请按照提示正确填写信息！');
            return false; // 若存在错误信息，则不执行后续操作
        }

        // 构建请求数据
        const data = {
            requestType: 'updateBasicInfo',
            userId: sessionStorage.getItem('userId'),
            name: nameInput.value,
            gender: genderInput.value,
            birthdate: birthdateInput.value,
            email: emailInput.value,
            telephone: telephoneInput.value,
            address: addressInput.value
        };

        // 发送请求
        const url = 'http://localhost:3000/php/info.php';
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    window.location.href = "../html/info.html";
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('请求发生错误:', error);
                alert('请求发生错误');
            });
    });

    // NOTE: PUT 修改密码
    passwordForm.addEventListener('submit', function (event) {
        event.preventDefault(); // 阻止默认提交行为

        // 获取表单输入值
        const oldPasswordInput = document.getElementById('old-password');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const birthdateInput = document.getElementById('birthdate');

        // 检查是否还有错误信息
        const passwordError = !validatePassword(passwordInput.value);
        const confirmPasswordError = !validateConfirmPassword(confirmPasswordInput.value, passwordInput.value);

        if (passwordError || confirmPasswordError) {
            alert('请按照提示正确填写信息！');
            return false; // 若存在错误信息，则不执行后续操作
        }

        // 密码中含有生日时应给予提示
        const password = passwordInput.value;
        const birthdate = birthdateInput.value;
        if (birthdate.trim() !== '') {
            console.log('用户设置了生日');
            console.log(birthdate);

            // 将日期字符串转换为日期对象
            const dateObj = new Date(birthdate);

            // 获取年、月、日的数字值
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1并补零
            const day = String(dateObj.getDate()).padStart(2, '0'); // 需要补零

            // 将转换后的日期组合为纯数字形式
            const numericBirthdate = `${year}${month}${day}`;

            if (password.includes(numericBirthdate)) {
                alert('密码中包含了生日信息，建议更换一个更安全的密码！');
                return false;
            }
        } else {
            console.log('用户没有设置生日');
            // 使用正则表达式推断用户的生日
            const birthdayRegex = /((19|20)\d{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/;
            const match = password.match(birthdayRegex);
            if (match) {
                const year = match[1];
                const month = match[3];
                const day = match[4];
                alert(`密码中推断出的生日为：${year}-${month}-${day}。建议更换一个更安全的密码！`);
                return false;
            }
        }

        // 构建请求数据
        const data = {
            requestType: 'changePassword',
            userId: sessionStorage.getItem('userId'),
            oldPassword: oldPasswordInput.value,
            newPassword: passwordInput.value
        };

        // 发送请求
        const url = 'http://localhost:3000/php/info.php';
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    window.location.href = "../html/info.html";
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('请求发生错误:', error);
                alert('请求发生错误');
            });
    });

});


