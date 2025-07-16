// ==UserScript==
// @name         自动跳转目标网站
// @namespace    https://raw.githubusercontent.com/LuanJian/Script/refs/heads/main/Script/auto-jump.user.js
// @version      0.1
// @description  自动跳转到 URL 中 target 参数指定的网站，绕过二次确认页面
// @author       亦木
// @match        *://*/*?*target=*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    document.open();
    document.write('');
    document.close();

    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('target');

    if (targetUrl) {
        try {
            const decodedUrl = decodeURIComponent(targetUrl);
            new URL(decodedUrl);
            window.stop();
            window.location.replace(decodedUrl);
        } catch (e) {
            console.error('无效的目标URL:', e);
        }
    }
})();