// ==UserScript==
// @name         👑 Video-Parser 视频解析器
// @namespace    https://raw.githubusercontent.com/LuanJian/Script/refs/heads/main/Script/video-parser.users.js
// @version      0.3
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
    min-width: 100px;
  }
  .video-parser-platforms {
    display: none;
  }
  .video-parser-type {
    cursor: pointer;
    position: relative;
    text-align: center;
  }
  .video-parser-type::after {
    content: '▸';
    position: absolute;
    right: 0;
    transition: transform 0.2s;
  }
  .video-parser-type.expanded::after {
    content: '▾';
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
    {
      name: '虾米解析',
      url: 'https://jx.xmflv.com/?url=',
      supported: {
        '芒果': ['电影', '综艺', '电视剧'],
        '腾讯': ['电影', '综艺', '电视剧'],
        '优酷': ['电影', '电视剧'],
        '乐视': ['电影'],
        '爱奇艺': ['电影', '综艺', '电视剧']
      }
    },
    {
      name: 'PlayJY',
      url: 'https://jx.playerjy.com/?url=',
      supported: {
        '芒果': ['电影', '综艺', '电视剧'],
        '腾讯': ['电影', '综艺', '电视剧'],
        '优酷': ['电影', '综艺', '电视剧'],
        '乐视': [''],
        '爱奇艺': ['电影', '综艺', '电视剧']
      }
    },
    {
      name: '七哥解析',
      url: 'https://jx.nnxv.cn/tv.php?url=',
      supported: {
        '芒果': ['电影', '综艺', '电视剧'],
        '腾讯': ['电影', '综艺', '电视剧'],
        '优酷': ['电影', '综艺', '电视剧'],
        '乐视': ['电影', '电视剧'],
        '爱奇艺': ['电影', '综艺', '电视剧']
      }
    },
    {
      name: '七哥解析 2',
      url: 'https://jx.mmkv.cn/tv.php?url=',
      supported: {
        '芒果': ['电影', '电视剧'],
        '腾讯': ['电影', '电视剧'],
        '优酷': ['电影', '电视剧'],
        '乐视': [''],
        '爱奇艺': ['电影']
      }
    },
    {
      name: '冰豆解析',
      url: 'https://bd.jx.cn/?url=',
      supported: {
        '芒果': ['电影', '综艺', '电视剧'],
        '腾讯': ['电影', '综艺', '电视剧'],
        '优酷': ['电影', '电视剧'],
        '乐视': [''],
        '爱奇艺': ['电影', '综艺', '电视剧']
      }
    },
    {
      name: '咸鱼解析',
      url: 'https://jx.xymp4.cc/?url=',
      supported: {
        '芒果': ['电影', '综艺', '电视剧'],
        '腾讯': ['电视剧'],
        '优酷': ['电视剧'],
        '乐视': [''],
        '爱奇艺': ['综艺', '电视剧']
      }
    },
    {
      name: '8090g',
      url: 'https://www.8090g.cn/?url=',
      supported: {
        '芒果': ['电影', '综艺', '电视剧'],
        '腾讯': [''],
        '优酷': ['电影', '电视剧'],
        '乐视': ['电影', '电视剧'],
        '爱奇艺': ['电影', '电视剧']
      }
    },
    {
      name: '极速解析',
      url: 'https://jx.2s0.cn/player/?url=',
      supported: {
        '芒果': ['电视剧'],
        '腾讯': ['电视剧'],
        '优酷': [''],
        '乐视': [''],
        '爱奇艺': ['综艺']
      }
    }
  ];

  const platforms = [
    { name: '芒果', domain: 'mgtv.com' },
    { name: '腾讯', domain: 'v.qq.com' },
    { name: '优酷', domain: 'youku.com' },
    { name: '乐视', domain: 'le.com' },
    { name: '爱奇艺', domain: 'iqiyi.com' }
  ];
  
  const categories = {
    '电影': platforms,
    '综艺': platforms,
    '电视剧': platforms
  };
  
  Object.keys(categories).forEach(contentType => {
    const typeItem = document.createElement('div');
    typeItem.className = 'video-parser-type';
    typeItem.textContent = contentType;
    typeItem.style.fontWeight = 'bold';
    typeItem.style.padding = '5px 0';
    typeItem.style.borderBottom = '1px solid #eee';
    typeItem.addEventListener('click', () => {
      document.querySelectorAll('.video-parser-type').forEach(item => {
        if (item !== typeItem && item.classList.contains('expanded')) {
          const otherPlatforms = item.nextElementSibling;
          if (otherPlatforms && otherPlatforms.classList.contains('video-parser-platforms')) {
            otherPlatforms.style.display = 'none';
            item.classList.remove('expanded');
          }
        }
      });
      
      const isExpanded = platformsContainer.style.display === 'flex';
      platformsContainer.style.display = isExpanded ? 'none' : 'flex';
      typeItem.classList.toggle('expanded', !isExpanded);
    });
    menu.appendChild(typeItem);

    const platformsContainer = document.createElement('div');
    platformsContainer.className = 'video-parser-platforms';
    platformsContainer.style.paddingLeft = '15px';
    platformsContainer.style.flexDirection = 'column';
    platformsContainer.style.gap = '5px';
    menu.appendChild(platformsContainer);

    const getCurrentPlatformDomain = () => {
      const host = window.location.hostname;
      const platformDomains = [
        { name: '芒果', domain: 'mgtv.com' },
        { name: '腾讯', domain: 'v.qq.com' },
        { name: '优酷', domain: 'youku.com' },
        { name: '乐视', domain: 'le.com' },
        { name: '爱奇艺', domain: 'iqiyi.com' }
      ];
      
      for (const platform of platformDomains) {
        if (host.includes(platform.domain)) {
          return platform.domain;
        }
      }
      return null;
    };

    const currentDomain = getCurrentPlatformDomain();

    categories[contentType].forEach(platform => {
      
      if (currentDomain && platform.domain !== currentDomain) {
        return;
      }
      
      const parsersContainer = document.createElement('div');
      parsersContainer.className = 'video-parser-parsers';
      parsersContainer.style.paddingLeft = '0';
      parsersContainer.style.display = 'flex';
      parsersContainer.style.flexDirection = 'column';
      parsersContainer.style.justifyContent = 'center';
      parsersContainer.style.alignItems = 'center';
      parsersContainer.style.gap = '3px';
      platformsContainer.appendChild(parsersContainer);

      const supportedParsers = parsers.filter(parser => 
        parser.supported[platform.name] && parser.supported[platform.name].includes(contentType)
      );

      supportedParsers.forEach(parser => {
        const a = document.createElement('a');
        a.textContent = `${parser.name}`;
        a.href = '#';
        a.style.fontSize = '13px';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const targetUrl = parser.url + encodeURIComponent(window.location.href);
          window.open(targetUrl, '_blank');
        });
        parsersContainer.appendChild(a);
      });
    });
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

window.addEventListener('DOMContentLoaded', initParserButton);

window.addEventListener('load', initParserButton);

setTimeout(initParserButton, 1000);

const observer = new MutationObserver(initParserButton);
observer.observe(document.body, { childList: true, subtree: true });

window.createVideoParserButton = initParserButton;