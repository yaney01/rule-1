// ==UserScript==
// @name         GitHub Raw Link Opener / Script-Hub edit
// @namespace    GitHub / Script-Hub
// @version      3.1.0
// @description  增强 GitHub 的原始链接按钮。一键编辑 Script-Hub 生成的链接
// @author       baby,小一,Key
// @match        https://github.com/*
// @match        https://script.hub/file/*
// @match        http://script.hub/file/*
// @match        https://script.hub/convert/*
// @match        http://script.hub/convert/*
// ==/UserScript==

(function () {
    "use strict";
    setTimeout(function () {
      const isBlobPage = window.location.pathname.includes("/blob/");
      const isSH = /\/(file|convert)\//.test(window.location.pathname);
      if (
        document.readyState === "complete" ||
        document.readyState !== "loading"
      ) {
        isBlobPage && init();
        isSH && inits();
      }
  
      function init() {
        const rawButton = createButton("打开 Raw", openRawLink);
        document.body.appendChild(rawButton);
        const scriptHubButton = createButton("打开 ScriptHub", openScriptHubLink);
        document.body.appendChild(scriptHubButton);
      }
  
      function inits() {
        const scriptHubEdit = createButton("打开 Script-Hub 编辑", reEditLink);
        document.body.appendChild(scriptHubEdit);
      }
  
      function createButton(text, clickHandler) {
        const button = document.createElement("button");
        button.innerHTML = text;
        button.style.position = "fixed";
        button.style.backgroundColor = "#303033ab";
        button.style.color = "#eeeeee";
        button.style.border = "none";
        button.style.padding = "8px 16px";
        button.style.borderRadius = "16px";
        button.style.cursor = "pointer";
  
        // 将 Raw 按钮放在右侧
        if (text === "打开 Raw") {
          button.style.right = "20px";
          button.style.bottom = "50px";
        }
  
        // 将 ScriptHub 按钮放在左侧
        if (text === "打开 ScriptHub") {
          button.style.left = "20px";
          button.style.bottom = "50px";
        }
  
        if (text === "打开 Script-Hub 编辑") {
          button.style.right = "20px";
          button.style.bottom = "50px";
        }
  
        button.addEventListener("click", clickHandler);
        return button;
      }
  
      function openRawLink() {
        // 提取 raw
        const rawUrl = window.location.href
          .replace("/blob", "")
          .replace("github.com", "raw.githubusercontent.com");
        window.open(rawUrl, "_blank");
      }
  
      function reEditLink() {
        // 转换 edit
        const Url = window.location.href.replace(/\/(convert|file)\//, "/edit/");
        window.open(Url, "_blank");
      }
  
      function openScriptHubLink() {
        const rawUrl = window.location.href
          .replace("/blob", "")
          .replace("github.com", "raw.githubusercontent.com");
        // 生成 ScriptHub 链接
        const scriptHubUrl = `http://script.hub/convert/_start_/${rawUrl}/_end_/plain.txt?type=plain-text&target=plain-text`;
        window.open(scriptHubUrl, "_blank");
      }
    }, 600);
  })();
  