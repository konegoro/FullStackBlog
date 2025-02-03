const axios = require('axios');

const url = "https://raw.githubusercontent.com/fullstack-hy2020/misc/refs/heads/master/blogs_for_test.md";

function fetchData() {
    try {
        const request = axios.get(url)
        return request.then(response => response.data)
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

module.exports = { fetchData }; // CommonJS export
