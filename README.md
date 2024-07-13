# 不要害羞 @ 图片网

<img src="https://github.com/user-attachments/assets/eff40492-fe92-486f-a979-cafa5852fd88" width="450px">
<img src="https://github.com/user-attachments/assets/e849919d-9248-4c11-9d0f-5b2c57afc06f" width="450px">

## 怎么使用

- 方式一：直接访问：https://iuroc.github.io/haixiu/
- 方式二：Fork 本项目，然后使用 Github Pages 部署 `/docs` 目录 

## 项目特点

1. 纯静态网站，可直接用 Github Pages 部署
2. 支持数据分页和按标签显示，支持滚动到底部自动增加下一页内容
3. 基于 [PhotoSwipe](https://github.com/dimsemenov/photoswipe) 实现高质量的图片查看器
4. 图片查看器切换图片时，缩略图列表跟随滚动，看到哪跟到哪
5. 图片查看器到最后一张时，自动增加下一页数据，不中断浏览
6. 基于 Location Hash 实现支持 history.back() 关闭图片查看器，兼容移动端返回键
7. 基于 Location Hash 实现支持 history.forward() 打开图片查看器，并自动恢复上一次位置
8. 通过 Hash 关闭图片查看器时，支持打断动画，体验很不错
9. 自动记录滚动条位置，消除 HashChange 事件对滚动条的影响

## 相关技术

1. 使用 Node.js Fetch API 爬虫
2. 将数据爬取后，分页存储到多个 JSON 文件中，文件名中标记了页码和标签信息
3. 前端使用 Van.js 框架构建响应式 UI
4. 前端通过 Fetch 直接请求静态 JSON 文件实现分页请求
5. 使用 PhotoSwipe 库实现图片查看器

## 资源更新

请查阅这篇文档：[图片采集程序 README](./script/README.md)
