// ==UserScript==
// @name         👑 Video-Parser 视频解析器
// @namespace    
// @version      0.2
// @description  用于在主流视频网站上添加视频解析功能的油猴脚本，当您访问国内某个视频网站时，页面左上角会显示一个"解析视频"浮动按钮，点击后可选择不同的解析接口来观看视频。
// @author       亦木
// @match        *://v.qq.com/*
// @match        *://*.iqiyi.com/*
// @match        *://*.mgtv.com/*
// @match        *://*.youku.com/*
// @match        *://*.le.com/*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
  .video-parser-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    background: #ff4400;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 20px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 999999;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .video-parser-close {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .video-parser-close:hover {
    background: rgba(255,255,255,0.5);
  }
  .video-parser-btn:hover {
    background: #e03c00;
    transform: scale(1.05);
  }
  .video-parser-menu {
    position: fixed;
    top: 80px;
    left: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.2);
    z-index: 9998;
    padding: 15px;
    display: none;
    flex-direction: column;
    gap: 10px;
    min-width: 200px;
  }
  .video-parser-menu a {
    color: #333;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background 0.2s;
  }
  .video-parser-menu a:hover {
    background: #f0f0f0;
  }
`);


function createParserButton() {

  const button = document.createElement('button');
  button.className = 'video-parser-btn';
  
  const buttonText = document.createElement('span');
  buttonText.textContent = '解析视频';
  button.appendChild(buttonText);
  
  const closeBtn = document.createElement('span');
  closeBtn.className = 'video-parser-close';
  closeBtn.textContent = '×';
  closeBtn.title = '关闭解析按钮';
  button.appendChild(closeBtn);
  
  document.body.appendChild(button);
  
  const menu = document.createElement('div');
  menu.className = 'video-parser-menu';
  
  closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('关闭按钮被点击');
      if (button && menu) {
        button.style.display = 'none';
        menu.style.display = 'none';
        console.log('解析按钮和菜单已隐藏');
      } else {
        console.error('无法找到按钮或菜单元素');
      }
    });
  
  const parsers = [
    { name: '虾米解析', url: 'https://jx.xmflv.com/?url=' },
    { name: '咸鱼解析', url: 'https://jx.xymp4.cc/?url=' },
    { name: '极速解析', url: 'https://jx.2s0.cn/player/?url=' },
    { name: 'M1907', url: 'https://im1907.top/?jx=' },
    { name: 'PlayJY', url: 'https://jx.playerjy.com/?url=' }
  ];
  
  parsers.forEach(parser => {
    const a = document.createElement('a');
    a.textContent = parser.name;
    a.href = '#';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = parser.url + encodeURIComponent(window.location.href);
      window.open(targetUrl, '_blank');
    });
    menu.appendChild(a);
  });
  
  document.body.appendChild(menu);
  
  button.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
  });
  
  document.addEventListener('click', (e) => {
    if (!button.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });
}

function initParserButton() {
  if (document.querySelector('.video-parser-btn')) return;
  createParserButton();
  console.log('视频解析按钮已创建');
}

// 1. DOM加载完成时尝试创建
window.addEventListener('DOMContentLoaded', initParserButton);

// 2. 页面完全加载时再次尝试
window.addEventListener('load', initParserButton);

// 3. 延迟1秒再尝试一次，应对动态加载的页面
setTimeout(initParserButton, 1000);

// 4. 监听DOM变化，应对单页应用路由切换
const observer = new MutationObserver(initParserButton);
observer.observe(document.body, { childList: true, subtree: true });

// 5. 提供手动创建按钮的方法，用于调试
window.createVideoParserButton = initParserButton;
