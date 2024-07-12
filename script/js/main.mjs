import PQueue from 'p-queue';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const getImageList = async (page = 0) => {
    const url = `https://qingbuyaohaixiu.com/?page=${page + 1}`;
    const html = await fetch(url).then(res => res.text());
    const regex = /<div class="rcm4">.*?\/post\/(\d+).*?src="([^"]+).*?alt="([^"]+)/gs;
    const data = [];
    while (true) {
        const result = regex.exec(html);
        if (!result)
            break;
        const id = parseInt(result[1]);
        const image = result[2];
        const title = result[3].trim();
        const imageFilename = image.match(/[a-z0-9.]+$/)[0];
        data.push({ id, image, title, imageFilename });
    }
    if (data.length == 0)
        throw new Error('未获取到图片列表');
    return data;
};
const getImageInfo = async (id) => {
    const url = `https://qingbuyaohaixiu.com/post/${id}/`;
    const html = await fetch(url).then(res => res.text());
    const match = html.match(/<h3 >(.*?)<\/h3>.*?<h5>(.*?)<\/h5>.*?<amp-img.*?src="([^"]+)/s);
    if (!match)
        throw new Error('正则匹配失败');
    const title = match[1].trim();
    const date = parseDate(match[2]).toLocaleString();
    const bigImage = match[3];
    const tagsRegex = /<a href="\/tag\/.*?> #(.*?)<\/a>/g;
    const tags = [];
    while (true) {
        const match = tagsRegex.exec(html);
        if (!match)
            break;
        tags.push(match[1].trim());
    }
    const bigImageFilename = bigImage.match(/[a-z0-9.]+$/)[0];
    return { id, title, date, bigImage, tags, bigImageFilename };
};
const parseDate = (text) => {
    const months = {
        Jan: 0, Feb: 1, March: 2, April: 3, May: 4, June: 5,
        July: 6, Aug: 7, Sept: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const regex = /([A-Za-z]+)\.? (\d+), (\d+), (\d+)(?::(\d+))? ([ap]\.m\.)/;
    const match = text.match(regex);
    if (!match) {
        throw new Error("Invalid date format");
    }
    const month = months[match[1]];
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    let hour = parseInt(match[4], 10);
    const minute = parseInt(match[5] ?? '0', 10);
    const period = match[6];
    if (period === 'p.m.' && hour < 12) {
        hour += 12;
    }
    else if (period === 'a.m.' && hour === 12) {
        hour = 0;
    }
    return new Date(year, month, day, hour, minute);
};
/** 获取全部图片目录 */
const getAllCatalogs = (totalPage) => new Promise(resolve => {
    const queue = new PQueue({ concurrency: 20 });
    let finish = 0;
    const results = [];
    for (let page = 0; page < totalPage; page++) {
        const func = async () => {
            try {
                return await getImageList(page);
            }
            catch {
                console.log('正在重试');
                return func();
            }
        };
        queue.add(func);
    }
    queue.on('completed', (result) => {
        results.push(...result);
        console.log(`正在获取图片目录，已完成 ${(++finish / totalPage * 100).toFixed(2)}%`);
    });
    queue.on('idle', () => {
        resolve(results);
    });
});
/** 获取全部图片完整信息 */
const getAllDatas = (catalogs) => new Promise(resolve => {
    const queue = new PQueue({ concurrency: 20 });
    let finish = 0;
    const datas = [];
    catalogs.forEach(catalog => {
        const func = async () => {
            try {
                const info = await getImageInfo(catalog.id);
                return { ...catalog, ...info };
            }
            catch {
                console.log('正在重试');
                return func();
            }
        };
        queue.add(func);
    });
    queue.on('completed', (result) => {
        datas.push(result);
        console.log(`正在获取图片完整信息，已完成 ${(++finish / catalogs.length * 100).toFixed(2)}%`);
    });
    queue.on('idle', () => {
        resolve(datas);
    });
});
/** 下载全部图片 */
const downloadAllImages = (datas, dirPath) => new Promise(resolve => {
    if (!existsSync(dirPath))
        mkdirSync(dirPath);
    const queue = new PQueue({ concurrency: 20 });
    let finish = 0;
    const download = async (url, path) => {
        try {
            const data = await fetch(url).then(res => res.arrayBuffer());
            writeFileSync(path, Buffer.from(data));
        }
        catch {
            await download(url, path);
        }
    };
    datas.forEach(data => {
        queue.add(() => download(data.image, join(dirPath, data.imageFilename)));
        queue.add(() => download(data.bigImage, join(dirPath, data.bigImageFilename)));
    });
    queue.on('completed', () => {
        console.log(`正在下载图片，已完成 ${(++finish / datas.length / 2 * 100).toFixed(2)}%`);
    });
    queue.on('idle', resolve);
});
const saveDatas = (allDatas, dirPath, pageSize) => {
    if (!existsSync(dirPath))
        mkdirSync(dirPath);
    const total = allDatas.length;
    const totalPage = Math.floor((total - 1) / pageSize) + 1;
    for (let page = 0; page < totalPage; page++) {
        const start = page * pageSize;
        const part = allDatas.slice(start, start + pageSize).map(item => {
            return {
                title: item.title,
                id: item.id,
                date: item.date,
                imageFilename: item.imageFilename,
                bigImageFilename: item.bigImageFilename,
                tags: item.tags,
            };
        });
        const filename = `data_${page}.json`;
        writeFileSync(join(dirPath, filename), JSON.stringify({ totalPage, total, page, pageSize, list: part }));
    }
};
// 总页码
const totalPage = 14;
// 图片文件保存路径
const imageSaveDir = '../dist/image';
// 数据文件保存路径
const datasFileDir = '../dist/datas';
// 数据文件每页数据条数
const pageSize = 36;
const allCatalogs = await getAllCatalogs(totalPage);
const allDatas = await getAllDatas(allCatalogs);
await downloadAllImages(allDatas, imageSaveDir);
// const allDatas = JSON.parse(readFileSync('datas.json').toString())
saveDatas(allDatas, datasFileDir, pageSize);
console.log(`👉 图片文件保存路径：${imageSaveDir}`);
console.log(`👉 数据文件保存路径：${datasFileDir}`);
