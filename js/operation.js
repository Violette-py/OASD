function recordUserOperation(artworkId, operationType) {

    const url = 'http://localhost:3000/php/operation.php';

    const data = {
        userId: sessionStorage.getItem('userId'),
        artworkId: artworkId,
        operationType: operationType
    };

    // 发送请求
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {
            console.error('记录用户行为发生错误:', error);
        });
}
