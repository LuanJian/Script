// ==UserScript==
// @name         👑 Video-Parser 视频解析器
// @namespace    https://raw.githubusercontent.com/LuanJian/Script/refs/heads/main/Script/video-parser.user.js
// @version      0.4
// @description  用于在主流视频网站上添加视频解析功能的油猴脚本，当您访问国内某个视频网站时，页面左上角会显示一个"解析视频"浮动按钮，点击后可选择不同的解析接口来观看视频。
// @author       亦木
// @match        *://v.qq.com/*
// @match        *://*.iqiyi.com/*
// @match        *://*.mgtv.com/*
// @match        *://*.youku.com/*
// @match        *://*.le.com/*
// @match        *://*.bilibili.com/*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
  .video-parser-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, #ff4400, #ff6b35);
    color: white !important;
    border: none;
    border-radius: 50px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(255, 68, 0, 0.4);
    z-index: 999999;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
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
    background: linear-gradient(135deg, #e03c00, #ff4400);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 20px rgba(255, 68, 0, 0.6);
  }
  .video-parser-menu {
    position: fixed;
    top: 80px;
    left: 20px;
    background: #ffffff !important;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    padding: 15px;
    display: none;
    flex-direction: column;
    min-width: 120px;
    border: 1px solid #e0e0e0;
  }
  .video-parser-type {
    cursor: pointer;
    position: relative;
    text-align: center;
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
    font-weight: bold;
    color: #2c3e50 !important;
    font-size: 14px;
    transition: background 0.2s;
    user-select: none;
  }
  .video-parser-type:hover {
    background: #f8f9fa !important;
  }
  .video-parser-type:last-child {
    border-bottom: none;
  }
  .video-parser-type::after {
    content: '▸';
    position: absolute;
    right: 10px;
    transition: transform 0.2s;
    color: #666;
  }
  .video-parser-type.expanded::after {
    content: '▾';
  }
  .video-parser-parsers {
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .video-parser-parsers a {
    color: #0056b3 !important;
    text-decoration: none !important;
    padding: 10px 15px;
    display: block;
    text-align: center;
    transition: all 0.2s;
    border-radius: 4px;
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    user-select: none;
    min-width: 80px;
  }
  .video-parser-parsers a:hover {
    background: #e3f2fd !important;
    color: #1976d2 !important;
    transform: translateY(-1px);
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
    button.style.display = 'none';
    menu.style.display = 'none';
  });
  
  const parsers = [
    {
      name: 'PlayJY',
      url: 'https://jx.playerjy.com/?url=',
      supported: {
        '芒果': ['电影', '综艺', '电视剧'],
        '腾讯': ['电影', '综艺', '电视剧'],
        '优酷': ['电影', '综艺', '电视剧'],
        '乐视': [''],
        '爱奇艺': ['电影', '综艺', '电视剧'],
        '哔哩哔哩': ['电影', '综艺', '电视剧']
      }
    },
    {
      name: '虾米解析',
      url: 'https://jx.xmflv.com/?url=',
      supported: {
        '芒果': ['电影', '综艺', '电视剧'],
        '腾讯': ['电影', '综艺', '电视剧'],
        '优酷': ['电影', '电视剧'],
        '乐视': ['电影'],
        '爱奇艺': ['电影', '综艺', '电视剧'],
        '哔哩哔哩': ['电影']
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
        '爱奇艺': ['电影', '综艺', '电视剧'],
        '哔哩哔哩': ['电视剧']
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
        '爱奇艺': ['电影'],
        '哔哩哔哩': ['电影', '综艺', '电视剧']
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
        '爱奇艺': ['电影', '综艺', '电视剧'],
        '哔哩哔哩': ['']
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
        '爱奇艺': ['综艺', '电视剧'],
        '哔哩哔哩': ['']
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
        '爱奇艺': ['电影', '电视剧'],
        '哔哩哔哩': ['电影']
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
        '爱奇艺': ['综艺'],
        '哔哩哔哩': ['电影', '综艺', '电视剧']
      }
    }
  ];

  const platforms = ['芒果', '腾讯', '优酷', '乐视', '爱奇艺', '哔哩哔哩'];
  const categories = ['电影', '综艺', '电视剧'];
  
  // 创建菜单项
  categories.forEach(type => {
    const item = document.createElement('div');
    item.className = 'video-parser-type';
    item.textContent = type;
    menu.appendChild(item);

    const container = document.createElement('div');
    container.className = 'video-parser-parsers';
    container.style.display = 'none';
    menu.appendChild(container);

    const host = window.location.hostname;
    const platform = ['mgtv.com', 'v.qq.com', 'youku.com', 'le.com', 'iqiyi.com', 'bilibili.com']
      .find(d => host.includes(d));
    const current = platform ? 
      ['芒果', '腾讯', '优酷', '乐视', '爱奇艺', '哔哩哔哩'][['mgtv.com', 'v.qq.com', 'youku.com', 'le.com', 'iqiyi.com', 'bilibili.com'].indexOf(platform)] : null;

    let hasParsers = false;
    const parserMap = new Map();
    
    (current ? [current] : platforms).forEach(p => {
      parsers.forEach(parser => {
        const types = parser.supported[p];
        if (types && types.includes(type) && types[0] !== '') {
          hasParsers = true;
          parserMap.set(parser.name, parser);
        }
      });
    });

    parserMap.forEach(parser => {
      const link = document.createElement('a');
      link.textContent = parser.name;
      link.href = '#';
      link.addEventListener('click', e => {
        e.preventDefault();
        window.open(parser.url + encodeURIComponent(location.href), '_blank');
      });
      container.appendChild(link);
    });

    if (!hasParsers && current) {
      const msg = document.createElement('div');
      msg.textContent = '暂不支持此平台';
      msg.style.cssText = 'font-size:12px;color:#999;text-align:center';
      container.appendChild(msg);
    }

    item.addEventListener('click', () => {
      document.querySelectorAll('.video-parser-type').forEach(el => {
        if (el !== item && el.classList.contains('expanded')) {
          el.classList.remove('expanded');
          el.nextElementSibling.style.display = 'none';
        }
      });
      const expanded = container.style.display === 'flex';
      container.style.display = expanded ? 'none' : 'flex';
      item.classList.toggle('expanded', !expanded);
    });
  });
  
  document.body.appendChild(menu);
  
  button.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
  });
  
  document.addEventListener('click', e => {
    if (!button.contains(e.target) && !menu.contains(e.target)) menu.style.display = 'none';
  });
}

const initParserButton = () => {
  if (document.querySelector('.video-parser-btn')) return;
  createParserButton();
};

['DOMContentLoaded', 'load'].forEach(e => window.addEventListener(e, initParserButton));
setTimeout(initParserButton, 1000);
new MutationObserver(initParserButton).observe(document.body, {childList: true, subtree: true});
