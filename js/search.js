document.addEventListener("DOMContentLoaded", function () {

    // NOTE: 刚进入搜索页时展示所有商品
    getAll();

    document.getElementById("searchForm").addEventListener("submit", search);
});

// NOTE: 展示所有商品（刚进入搜索页or搜索结果为空时）
function getAll() {

    const url = 'http://localhost:3000/php/getArtwork.php';

    const params = new URLSearchParams({
        requestType: 'getAll',
    });

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('artworkData', JSON.stringify(data.results));
            displayResultsForPage(1);
            displayPagination(data.length);
        });

}

// NOTE: 搜索请求
function search(event) {
    event.preventDefault();

    const url = 'http://localhost:3000/php/getArtwork.php';

    const params = new URLSearchParams({
        requestType: 'search',
        keyword: document.getElementById("keywordInput").value.trim(),
        searchBy: document.getElementById("searchByTitle").checked ? "title" : "artist",
        sortBy: document.getElementById("sortSelect").value
    });

    console.log(document.getElementById("keywordInput").value.trim());
    console.log(document.getElementById("searchByTitle").checked ? "title" : "artist");
    console.log(document.getElementById("sortSelect").value);

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {

            var searchResultsOutput = document.getElementById("searchResultsOutput");
            searchResultsOutput.innerHTML = "";

            if (data.length > 0) {

                var searchCountText = document.createElement("p");
                searchCountText.textContent = "Search results : " + data.length + " records found.";
                searchResultsOutput.appendChild(searchCountText);
                
                // NOTE: 存储搜索结果到localStorage
                localStorage.setItem('artworkData', JSON.stringify(data.results));
                displayResultsForPage(1);
                displayPagination(data.length);
            } else {

                // NOTE: 没有符合条件的商品时，展示所有结果

                var noResultsText = document.createElement("p");
                noResultsText.textContent = "No matching results found. Here are all artworks in our mall.";
                searchResultsOutput.appendChild(noResultsText);

                getAll();
            }

        })
        .catch(error => {
            console.error("搜索请求出错:", error);
        });
}

// NOTE: 分页展示搜索结果
function displayResultsForPage(page) {

    // 将localStorage中的数据解析为数组
    var artworkData = JSON.parse(localStorage.getItem('artworkData'));
    var resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = "";

    var startIndex = (page - 1) * 6;
    var endIndex = startIndex + 6;
    var pageResults = artworkData.slice(startIndex, endIndex);

    displayResults(pageResults);

}

// NOTE: 展示单页中的搜索结果
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
            localStorage.setItem('selectedArtworkId', result.artworkId);
            window.location.href = '../html/detail.html';
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

// NOTE: 展示底部分页编号
function displayPagination(totalResults) {

    // console.log('here is displayPagination' + ' ' + totalResults);

    var paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";

    var totalPages = Math.ceil(totalResults / 6);
    var currentPage = 1;

    var paginationInfo = document.createElement("div");
    paginationInfo.classList.add("pagination-info");

    var currentPageSpan = document.createElement("span");
    currentPageSpan.id = "currentPage";
    currentPageSpan.textContent = currentPage;

    var totalPagesSpan = document.createElement("span");
    totalPagesSpan.id = "totalPages";
    totalPagesSpan.textContent = totalPages;

    paginationInfo.appendChild(currentPageSpan);
    paginationInfo.appendChild(document.createTextNode(" / "));
    paginationInfo.appendChild(totalPagesSpan);
    paginationContainer.appendChild(paginationInfo);

    var prevPageBtn = createPaginationButton("Prev");
    var nextPageBtn = createPaginationButton("Next");
    var firstPageBtn = createPaginationButton("First");
    var lastPageBtn = createPaginationButton("Last");

    prevPageBtn.addEventListener("click", function (event) {
        event.preventDefault();
        if (currentPage > 1) {
            displayResultsForPage(currentPage - 1);
            currentPage--;
            currentPageSpan.textContent = currentPage;
        }
    });

    nextPageBtn.addEventListener("click", function (event) {
        event.preventDefault();
        if (currentPage < totalPages) {
            displayResultsForPage(currentPage + 1);
            currentPage++;
            currentPageSpan.textContent = currentPage;
        }
    });

    firstPageBtn.addEventListener("click", function (event) {
        event.preventDefault();
        if (currentPage > 1) {
            displayResultsForPage(1);
            currentPage = 1;
            currentPageSpan.textContent = currentPage;
        }
    });

    lastPageBtn.addEventListener("click", function (event) {
        event.preventDefault();
        if (currentPage < totalPages) {
            displayResultsForPage(totalPages);
            currentPage = totalPages;
            currentPageSpan.textContent = currentPage;
        }
    });

    paginationContainer.appendChild(firstPageBtn);
    paginationContainer.appendChild(prevPageBtn);
    paginationContainer.appendChild(nextPageBtn);
    paginationContainer.appendChild(lastPageBtn);

    var goToPageInputLabel = document.createElement("label");
    goToPageInputLabel.setAttribute("for", "goToPageInput");
    goToPageInputLabel.textContent = "Go to Page:";
    paginationContainer.appendChild(goToPageInputLabel);

    var goToPageInput = document.createElement("input");
    goToPageInput.id = "goToPageInput";
    goToPageInput.type = "number";
    goToPageInput.min = 1;
    goToPageInput.max = totalPages;
    goToPageInput.value = currentPage;
    // paginationContainer.appendChild(goToPageInput);


    // var goToPageInput = document.createElement("input");
    // goToPageInput.type = "number";
    // goToPageInput.min = 1;
    // goToPageInput.max = totalPages;


    var goToPageBtn = createPaginationButton("Go");
    goToPageBtn.addEventListener("click", function (event) {
        event.preventDefault();
        var goToPage = parseInt(goToPageInput.value);
        if (goToPage >= 1 && goToPage <= totalPages) {
            displayResultsForPage(goToPage);
            currentPage = goToPage;
            currentPageSpan.textContent = currentPage;
        }
    });

    paginationContainer.appendChild(goToPageInput);
    paginationContainer.appendChild(goToPageBtn);

}

function createPaginationButton(label) {
    var button = document.createElement("button");
    button.textContent = label;
    button.type = "button";
    button.classList.add("pagination-btn");
    return button;
}
