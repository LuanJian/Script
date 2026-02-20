// ==UserScript==
// @name         自动播放下一集
// @namespace    https://raw.githubusercontent.com/LuanJian/Script/refs/heads/main/Script/gying-auto-next.user.js
// @version      1.0
// @description  观影GYING网站视频播放结束后自动播放下一集
// @author       亦木
// @match        https://www.gying.si/*
// @match        https://www.gying.org/*
// @match        https://www.gying.net/*
// @match        https://www.gying.in/*
// @match        https://www.gying.st/*
// @match        https://www.gyg.la/*
// @match        https://www.gyg.si/*
// @match        https://www.gyg.st/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const SUPPORTED_DOMAINS = [
        'www.gying.si',
        'www.gying.org',
        'www.gying.net',
        'www.gying.in',
        'www.gying.st',
        'www.gyg.la',
        'www.gyg.si',
        'www.gyg.st'
    ];

    function isSupportedDomain() {
        const hostname = window.location.hostname;
        return SUPPORTED_DOMAINS.includes(hostname);
    }

    function findVideoElement() {
        const video = document.querySelector('video');
        if (video) return video;

        const dp = document.querySelector('.dplayer');
        if (dp && dp.dplayer) return dp.dplayer.video;

        const players = document.querySelectorAll('video');
        return players.length > 0 ? players[0] : null;
    }

    function findNextEpisodeButton() {
        const selectors = [
            '.episode-item.active + .episode-item',
            '.episode-list .active',
            '.play-list .active',
            '.episode-item.current',
            '.episode-item.now',
            '[class*="episode"][class*="active"]',
            '.play-url-list .active',
            '.video-list .active',
            'ul.episode-list li.active',
            '.episode ul li.active',
            '.episode-items .active',
            '.episode-item[data-index]',
            '.play-list li.active',
            '.episode a.active',
            '.num-item.active',
            '.vlist .vitem.active',
            '.source-list .active',
            '.playlist .active',
            '.playlist-item.active',
            'div[class*="episode"] li.active',
            'div[class*="play"] li.active'
        ];

        for (const selector of selectors) {
            const activeElement = document.querySelector(selector);
            if (activeElement) {
                const nextElement = activeElement.nextElementSibling;
                if (nextElement && (nextElement.tagName === 'LI' || nextElement.tagName === 'A' || nextElement.tagName === 'DIV')) {
                    return nextElement;
                }
                const allItems = document.querySelectorAll(selector.replace('.active', ''));
                for (let i = 0; i < allItems.length; i++) {
                    if (allItems[i].classList.contains('active') && i < allItems.length - 1) {
                        return allItems[i + 1];
                    }
                }
            }
        }

        const allLinks = document.querySelectorAll('a[href*="episode"], a[href*="play"], a[href*="v/"]');
        for (let i = 0; i < allLinks.length - 1; i++) {
            if (allLinks[i].classList.contains('active') || allLinks[i].classList.contains('current')) {
                return allLinks[i + 1];
            }
        }

        return null;
    }

    function clickNextEpisode() {
        const nextButton = findNextEpisodeButton();
        if (nextButton) {
            console.log('[自动播放下一集] 找到下一集按钮，准备点击');
            nextButton.click();
            setTimeout(() => {
                autoPlayVideo();
            }, 1500);
            return true;
        }
        console.log('[自动播放下一集] 未找到下一集按钮');
        return false;
    }

    function autoPlayVideo() {
        const video = findVideoElement();
        if (video) {
            video.play().catch(e => {
                console.log('[自动播放下一集] 自动播放失败:', e);
                const playBtn = document.querySelector('.dplayer-play-icon, .play-icon, .video-play-btn, [class*="play"]');
                if (playBtn) {
                    playBtn.click();
                }
            });
        }
    }

    function setupVideoEndedListener() {
        const video = findVideoElement();
        if (!video) {
            console.log('[自动播放下一集] 未找到视频元素，1秒后重试');
            setTimeout(setupVideoEndedListener, 1000);
            return;
        }

        video.addEventListener('ended', () => {
            console.log('[自动播放下一集] 视频播放结束，尝试播放下一集');
            setTimeout(clickNextEpisode, 1000);
        });

        console.log('[自动播放下一集] 视频结束监听器已设置');

        if (document.querySelector('.dplayer')) {
            setupDPlayerListener();
        }
    }

    function setupDPlayerListener() {
        const dp = document.querySelector('.dplayer');
        if (dp && dp.dplayer) {
            dp.dplayer.on('ended', () => {
                console.log('[自动播放下一集] DPlayer视频播放结束，尝试播放下一集');
                setTimeout(clickNextEpisode, 1000);
            });
            console.log('[自动播放下一集] DPlayer监听器已设置');
        }
    }

    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    const video = findVideoElement();
                    if (video && !video.hasAttribute('data-ended-listener')) {
                        video.setAttribute('data-ended-listener', 'true');
                        setupVideoEndedListener();
                    }

                    if (document.querySelector('.dplayer')) {
                        setupDPlayerListener();
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        if (!isSupportedDomain()) {
            console.log('[自动播放下一集] 不支持的域名');
            return;
        }

        console.log('[自动播放下一集] 脚本已启动');

        if (document.readyState === 'complete') {
            setupVideoEndedListener();
            setupMutationObserver();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    setupVideoEndedListener();
                    setupMutationObserver();
                }, 2000);
            });
        }
    }

    init();
})();
