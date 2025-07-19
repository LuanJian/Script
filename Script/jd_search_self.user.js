// ==UserScript==
// @name         京东搜索自营商品
// @namespace    https://raw.githubusercontent.com/LuanJian/Script/refs/heads/main/Script/jd_search_self.user.js
// @version      0.1
// @description  将京东搜索按钮改为"搜索自营"，并在搜索时自动添加"京东自营"关键词实现只搜索自营产品。
// @author       亦木
// @match        *://*.jd.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function changeSearchButtonText() {
        const button = document.evaluate('//*[@id="search-2014"]/div/button | //*[@id="search"]/div[2]/div[2]/button', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (button && button.textContent.trim() === "搜索") {
            button.textContent = "搜索自营";
            button.style.width = "120px";
        }
    }

    function handleSearch() {
        const input = document.evaluate('//*[@id="key"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const button = document.evaluate('//*[@id="search-2014"]/div/button | //*[@id="search"]/div[2]/div[2]/button', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        function handleEnterKey(event) {
            if (event.key === 'Enter') {
                add自营Keyword();
            }
        }

        if (input && button) {
            button.removeEventListener('click', add自营Keyword);
            input.removeEventListener('keydown', handleEnterKey);
            button.addEventListener('click', add自营Keyword, true);
            input.addEventListener('keydown', handleEnterKey, true);
        }
    }

    function add自营Keyword() {
        const input = document.evaluate('//*[@id="key"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (input) {
            const originalValue = input.value.trim();
            if (originalValue && !originalValue.includes("京东自营")) {
                input.value = originalValue + " 京东自营";
            }
        }
    }

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                changeSearchButtonText();
                handleSearch();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    changeSearchButtonText();
    handleSearch();

})();
