# 图片采集程序

采集地址：https://qingbuyaohaixiu.com/

## 程序使用方法

1. 执行 `npm install` 安装依赖
2. 编辑 `src/main.mts`
   ```typescript
   // 总页码
   const totalPage = 262;
   // 图片文件保存路径
   const imageSaveDir = "../dist/images";
   // 数据文件保存路径
   const datasFileDir = "../dist/datas";
   // 数据文件每页数据条数
   const pageSize = 36;
   ```
3. 执行 `npm run script` 开始采集
