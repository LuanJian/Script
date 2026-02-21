// ==UserScript==
// @name         VS Code 软件离线插件下载
// @namespace    https://raw.githubusercontent.com/LuanJian/Script/refs/heads/main/Script/download-vsx.user.js
// @version      1.1
// @description  在 VS Marketplace 插件页添加下载按钮，直接解析下载 .vsix 文件或跳转到 Open-VSX 插件页面下载。
// @author       亦木
// @match        https://marketplace.visualstudio.com/items?*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function getPluginName() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('itemName');
    }

    function getExtensionDetails() {
        const pluginName = getPluginName();
        if (!pluginName) return null;

        const parts = pluginName.split('.');
        if (parts.length < 2) return null;

        return { publisher: parts[0], name: parts.slice(1).join('.') };
    }

    function generateDownloadUrl(publisher, name, version) {
        return `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${publisher}/vsextensions/${name}/${version}/vspackage`;
    }

    function getLatestVersion() {
        let version = null;
        const allElements = document.querySelectorAll('div, td, span, h3, h4');
        
        for (const el of allElements) {
            if (el.textContent.trim() === 'Version' && el.children.length === 0) {
                if (el.tagName === 'TD') {
                    const nextTd = el.nextElementSibling;
                    if (nextTd && /^\d+\.\d+\.\d+/.test(nextTd.textContent.trim())) {
                        version = nextTd.textContent.trim();
                        break;
                    }
                }
                
                const sibling = el.nextElementSibling;
                if (sibling && /^\d+\.\d+\.\d+/.test(sibling.textContent.trim())) {
                    version = sibling.textContent.trim();
                    break;
                }

                if (el.parentElement && el.parentElement.nextElementSibling) {
                    const uncle = el.parentElement.nextElementSibling;
                    const match = uncle.textContent.trim().match(/(\d+\.\d+\.\d+(\.\d+)?)/);
                    if (match) {
                        version = match[0];
                        break;
                    }
                }
            }
        }

        return version;
    }

    function createDownloadButtons() {
        const pluginName = getPluginName();
        if (!pluginName) return;

        const details = getExtensionDetails();

        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        if (details) {
            const parseBtn = document.createElement('button');
            parseBtn.textContent = '直接下载插件';
            parseBtn.style.cssText = `
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 500;
                color: #ffffff;
                background-color: #C0392B;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: background-color 0.2s;
            `;

            parseBtn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#A93226';
            });
            parseBtn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#C0392B';
            });

            parseBtn.addEventListener('click', function() {
                const version = getLatestVersion();
                if (version) {
                    const downloadUrl = generateDownloadUrl(details.publisher, details.name, version);
                    window.open(downloadUrl, '_blank');
                } else {
                    alert('无法获取插件版本信息，请稍后重试');
                }
            });

            container.appendChild(parseBtn);
        }

        const openVsxBtn = document.createElement('button');
        openVsxBtn.textContent = '从 Open-VSX 下载';
        openVsxBtn.style.cssText = `
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            color: #ffffff;
            background-color: #0078d4;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background-color 0.2s;
        `;

        openVsxBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#106ebe';
        });
        openVsxBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#0078d4';
        });

        openVsxBtn.addEventListener('click', function() {
            const extensionPath = pluginName.replace('.', '/');
            const targetUrl = 'https://open-vsx.org/extension/' + extensionPath;
            window.open(targetUrl, '_blank');
        });

        container.appendChild(openVsxBtn);

        document.body.appendChild(container);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDownloadButtons);
    } else {
        createDownloadButtons();
    }
})();
