// ==UserScript==
// @name         Bilibili Favlist Links Copy
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Copy all video links in current favorite list.
// @author       EmOwen4
// @match        https://space.bilibili.com/*/favlist?fid=*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  const PAGE_LOAD_TIMEOUT = 500;

  window.addEventListener('load', async event => {
    while (document.querySelectorAll('.fav-options').length === 0) {
      await timeout(PAGE_LOAD_TIMEOUT);
    }
    addCopyButton();
  });

  function addCopyButton() {
    let root = document.querySelector('.fav-options');

    let button = document.createElement('div');
    button.classList.add('meta');
    button.addEventListener('click', event => {
      window.setTimeout(async () => {
        await clickFirstPage();
        copyFavlistLinksToClipboard();
      }, PAGE_LOAD_TIMEOUT);
    });
    root.appendChild(button);

    let image = document.createElement('i');
    image.classList.add('iconfont', 'icon-fenxiang');
    button.appendChild(image);

    let span = document.createElement('span');
    span.innerText = '复制所有链接';
    button.appendChild(span);
  }

  function copyFavlistLinksToClipboard() {
    let links = Array.from(getLinksInCurrentPage());

    let remains = getTotalPageCount() - 1;

    copyAndNextPageUntilEnd();

    async function copyAndNextPageUntilEnd() {
      await clickNextPage();

      if (remains > 0) {
        links = links.concat(getLinksInCurrentPage());
      }

      if (--remains <= 0) {
        GM_setClipboard(links.join('\n'));
        alert('复制完成，一共' + links.length + '条链接！');
      } else {
        await timeout(200);
        copyAndNextPageUntilEnd();
      }
    }
  }

  function getTotalPageCount() {
    let label = document.querySelector('.be-pager-next');
    return label.classList.contains('be-pager-disabled') ? 1 : parseInt(label.previousSibling.title.split(':')[1]);
  }

  async function clickFirstPage() {
    let firstPageButton = document.querySelector('li[title="第一页"]');
    if (!firstPageButton.classList.contains('be-pager-item-active')) {
      firstPageButton.click();
      await timeout(PAGE_LOAD_TIMEOUT);
    }
  }

  async function clickNextPage() {
    let button = document.querySelector('.be-pager-next');
    if (!button.classList.contains('be-pager-disabled')) {
      button.click();
      await timeout(PAGE_LOAD_TIMEOUT);
    }
  }

  function getLinksInCurrentPage() {
    return Array.from(document.querySelectorAll('ul.fav-video-list > li'))
      .map(li => 'https://www.bilibili.com/video/' + li.getAttribute('data-aid'));
  }

  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();
