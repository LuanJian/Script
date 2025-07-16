// ==UserScript==
// @name         自动识别网址并转换为超链接
// @namespace    https://raw.githubusercontent.com/LuanJian/Script/refs/heads/main/Script/url-auto-link.user.js
// @version      0.1
// @description  自动识别页面中的 URL 并将其转换为可点击的超链接
// @author       亦木
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const urlRegex = /(https?:\/\/[^\s]{2,200})/g;

    function processTextNode(node) {
        const text = node.textContent;
        if (!text.includes('http://') && !text.includes('https://')) return;

        let match, lastIndex = 0, hasChanges = false;
        const fragment = document.createDocumentFragment();

        while ((match = urlRegex.exec(text)) !== null) {
            hasChanges = true;
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }

            const link = document.createElement('a');
            link.href = match[0];
            link.textContent = match[0];
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            fragment.appendChild(link);

            lastIndex = urlRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }

        if (hasChanges && fragment.childNodes.length > 0) {
            node.parentNode.replaceChild(fragment, node);
        }
    }

    function processDOM(rootNode) {
        const stack = [rootNode];
        while (stack.length > 0) {
            const node = stack.pop();
            if (node.dataset && node.dataset.urlProcessed) continue;
            if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) continue;

            if (node.nodeType === Node.TEXT_NODE && node.parentNode.tagName !== 'A') {
                processTextNode(node);
                continue;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                if (['A', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'BUTTON'].includes(node.tagName)) continue;
                if (node.dataset) node.dataset.urlProcessed = 'true';
                Array.from(node.childNodes).reverse().forEach(child => stack.push(child));
            }
        }
    }

    function init() {
        const processInChunks = (rootNode, chunkSize = 20) => {
            const stack = [rootNode];
            const processChunk = () => {
                let i = 0;
                while (stack.length > 0 && i < chunkSize) {
                    processDOM(stack.pop());
                    i++;
                }
                if (stack.length > 0) requestIdleCallback(processChunk, { timeout: 100 });
            };
            requestIdleCallback(processChunk, { timeout: 100 });
        };

        processInChunks(document.body);

        const observer = new MutationObserver((mutations) => {
            if (observer.debounceTimer) clearTimeout(observer.debounceTimer);
            observer.debounceTimer = setTimeout(() => {
                requestIdleCallback(() => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                                processDOM(node);
                            }
                        });
                    });
                }, { timeout: 500 });
            }, 100);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: false,
            attributes: false
        });
    }

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();