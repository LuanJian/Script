// ==UserScript==
// @name         NoCode.cn 签到
// @namespace    https://raw.githubusercontent.com/LuanJian/Script/refs/heads/main/Script/nocode-daily-open.user.js
// @version      0.1
// @description  每天自动打开 NoCode 网站一次，领取每日 10 次对话次数，未增加账户登录状态检测。
// @author       亦木
// @crontab      1-59 * once * *
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';
    // 定时打开 NoCode 网站
    GM_openInTab('https://nocode.cn/');
})();
