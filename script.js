const CONFIG = {
  // chapter set
  chapters: {
    titles: {
      '涅波絲經.html': '涅波絲經',
      '涅波絲經有聲書.html': '涅波絲經有聲書',
      '涅波絲經英文版.html': '涅波絲經英文版',
      '涅波史記.html': '涅波史記',
      '涅波教聞.html': '涅波教聞'
    },
    defaultTitle: '涅波',
    articlesPath: 'articles/',
    animatedChapters: ['涅波絲經.html', '涅波絲經有聲書.html', '涅波絲經英文版.html']
  },

  // UI 
  ui: {
    loadingText: '載入中...',
    errorText: '找不到檔案',
    activeClass: 'active',
    visibleClass: 'visible',
    animationClass: 'np-fadein',
    threshold: 0.2
  },

  // extra butt :nebo_rrr
  extraButtons: {
    showForChapters: ['涅波絲經.html', '涅波絲經有聲書.html', '涅波絲經英文版.html'],
    buttons: [
      { id: 'np-audio-btn', text: '有聲書', target: '涅波絲經有聲書.html' },
      { id: 'np-en-btn', text: '英文版', target: '涅波絲經英文版.html' }
    ],
    containerId: 'np-extra-action-real'
  },

  // selector 
  selectors: {
    tabs: '.tabs button',
    container: '#article-container',
    nav: '.tabs',
    extraActions: '#extra-actions',
    mainTitle: '#main-title'
  },

  // stuff paths
  resources: {
    errorImage: 'Emoji/NO SOURCE.png',
    cheerImage: '../Cheer-Gift/Cheer 10000.webp',
    pathPrefixes: ['Person', 'Cheer-Gift', 'Emoji']
  }
};

// Main 
class ArticleViewer {
  constructor() {
    this.container = document.querySelector(CONFIG.selectors.container);
    this.nav = document.querySelector(CONFIG.selectors.nav);
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initTitleManager();
  }

  setupEventListeners() {
    const buttons = document.querySelectorAll(CONFIG.selectors.tabs);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.updateActiveTab(btn);
        this.loadArticle(`${CONFIG.chapters.articlesPath}${btn.dataset.article}`);
      });
    });
  }

  updateActiveTab(activeBtn) {
    const buttons = document.querySelectorAll(CONFIG.selectors.tabs);
    buttons.forEach(btn => btn.classList.remove(CONFIG.ui.activeClass));
    activeBtn.classList.add(CONFIG.ui.activeClass);
  }

  initTitleManager() {
    window.setMainTitleByPath = (path) => {
      const mainTitle = document.querySelector(CONFIG.selectors.mainTitle);
      const file = path.split('/').pop();
      const title = CONFIG.chapters.titles[file] || CONFIG.chapters.defaultTitle;
      if (mainTitle) {
        mainTitle.textContent = title;
      }
    };
  }

  loadArticle(path) {
    this.showLoading();
    this.clearExtraButtons();

    fetch(path)
      .then(res => {
        if (!res.ok) throw new Error('not found');
        return res.text();
      })
      .then(data => {
        this.renderContent(data, path);
        this.setupAnimations();
        this.setupCheerImages();
        this.setupExtraButtons(path);
        
        if (typeof window.setMainTitleByPath === 'function') {
          window.setMainTitleByPath(path);
        }
      })
      .catch(() => {
        this.showError();
        this.clearExtraButtons();
      });
  }

  showLoading() {
    this.container.innerHTML = `<p class="placeholder-text">${CONFIG.ui.loadingText}</p>`;
  }

  showError() {
    this.container.innerHTML = `
      <div class="error-container">
        <img src="${CONFIG.resources.errorImage}" alt="${CONFIG.ui.errorText}">
        <div class="error-text">${CONFIG.ui.errorText}</div>
      </div>
    `;
  }

  renderContent(data, path) {
    if (path.endsWith('涅波絲經有聲書.html')) {
      data = data.replace(/^\s*[\r\n]/gm, '');
      this.container.innerHTML = data;
    } else {
      const fixed = this.fixResourcePaths(data);
      this.container.classList.remove(CONFIG.ui.animationClass);
      this.container.innerHTML = fixed;
      
      if (CONFIG.chapters.animatedChapters.some(chapter => path.endsWith(chapter))) {
        void this.container.offsetWidth;
        this.container.classList.add(CONFIG.ui.animationClass);
      }
    }
  }

  clearExtraButtons() {
    const existingDiv = document.getElementById(CONFIG.extraButtons.containerId);
    if (existingDiv) existingDiv.remove();
  }

  setupExtraButtons(path) {
    const shouldShowButtons = CONFIG.extraButtons.showForChapters.some(chapter => 
      path.endsWith(chapter)
    );
    
    if (!shouldShowButtons || !this.nav) return;

    const div = this.createExtraButtonsContainer(path);
    this.nav.insertAdjacentElement('afterend', div);
    this.bindExtraButtonEvents();
  }

  createExtraButtonsContainer(path) {
    const div = document.createElement('div');
    div.id = CONFIG.extraButtons.containerId;
    div.className = 'extra-actions-container';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'center';
    div.style.margin = '0 0 0.5em 0';

    const isMainChapter = path.endsWith('涅波絲經.html');
    const animationStyle = isMainChapter ? 'animation:fadeInDown 0.7s;' : '';
    
    const buttonsHtml = CONFIG.extraButtons.buttons.map(btn => 
      `<button id="${btn.id}" class="extra-btn">${btn.text}</button>`
    ).join('');

    div.innerHTML = `
      <div style="font-size:2.2em;line-height:1;margin-bottom:0.1em;color:var(--primary-color);${animationStyle}">↓</div>
      <div style="display:flex;gap:1.2em;justify-content:center;${isMainChapter ? 'animation:fadeInDown 0.7s 0.08s both;' : ''}">${buttonsHtml}</div>
    `;
    
    return div;
  }

  bindExtraButtonEvents() {
    CONFIG.extraButtons.buttons.forEach(btn => {
      const element = document.getElementById(btn.id);
      if (element) {
        element.onclick = () => {
          // - active
          CONFIG.extraButtons.buttons.forEach(b2 => {
            const el2 = document.getElementById(b2.id);
            if (el2) el2.classList.remove('active');
          });
          //  + active
          element.classList.add('active');
          this.loadArticle(`${CONFIG.chapters.articlesPath}${btn.target}`);
        };
      }
    });
  
    const current = window.location.pathname.split('/').pop();
    CONFIG.extraButtons.buttons.forEach(btn => {
      const el = document.getElementById(btn.id);
      if (el && current && btn.target === current) {
        el.classList.add('active');
      }
    });
  }

  fixResourcePaths(html) {
    const prefixes = CONFIG.resources.pathPrefixes.join('|');
    const regex = new RegExp(`(src|href)=(['"])(${prefixes})/`, 'g');
    return html
      .replace(regex, '$1=$2../$3/')
      .replace(/(src|href)=(['"])style\.css/g, '$1=$2../style.css');
  }

  setupAnimations() {
    const sections = this.container.querySelectorAll('section');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(CONFIG.ui.visibleClass);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: CONFIG.ui.threshold });
    
    sections.forEach(section => observer.observe(section));
  }

  setupCheerImages() {
    this.container.querySelectorAll('.cheer-animate').forEach(el => {
      this.renderCheer(el);
    });
  }

  renderCheer(container) {
    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = CONFIG.resources.cheerImage;
    img.alt = '小奇點';
    img.style.cssText = `
      height: 1.5em;
      vertical-align: -0.2em;
      opacity: 0;
      transform: scale(0.7);
      transition: opacity 0.3s, transform 0.3s;
    `;
    
    setTimeout(() => {
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    }, 120);
    
    container.appendChild(img);
  }
}

// initialize 
document.addEventListener('DOMContentLoaded', () => {
  new ArticleViewer();
});