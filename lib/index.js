"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.Config = exports.using = exports.name = void 0;
const koishi_1 = require("koishi");
exports.name = 'change-to-image';
exports.using = ['puppeteer', 'logger'];
exports.Config = koishi_1.Schema.object({
    length: koishi_1.Schema.number().default(200).description('触发转换的消息文本长度，0则会将所有机器人发出的文本消息都转成图片'),
    line: koishi_1.Schema.number().default(8).description('触发转换的消息行数'),
    width: koishi_1.Schema.number().default(350).description('生成图片的宽度，单位px（像素）。')
});
function apply(ctx, config) {
    ctx.before('send', async (session) => {
        try {
            traverseElement(session.elements, ele => {
                if (!['text', 'template', 'p', 'random'].includes(ele.type)) {
                    throw new Error(`Found inconvertible element type: ${ele.type}, send message as origin.`);
                }
                if (ele.type === 'random') {
                    ele.type = 'template';
                    ele.children = [koishi_1.Random.pick(ele.children)];
                }
                return ele;
            });
        }
        catch (error) {
            ctx.logger('change-to-image').debug(error);
            return;
        }
        if (session.content.length > config.length || session.content.split('\n').length >= config.line) {
            session.content = await render(ctx, session.content, config.width);
        }
    }, true);
}
exports.apply = apply;
function traverseElement(array, callback) {
    for (const element of array) {
        callback(element);
        if (element.children && element.children.length > 0) {
            traverseElement(element.children, callback);
        }
    }
    return array;
}
async function render(ctx, content, picWidth) {
    return await ctx.puppeteer.render(`<html>
    <head>
      <style>
        @font-face {
          font-family: AlibabaPuHuiTi-2-55-Regular;
          src:url(https://puhuiti.oss-cn-hangzhou.aliyuncs.com/AlibabaPuHuiTi-2/AlibabaPuHuiTi-2-55-Regular/AlibabaPuHuiTi-2-55-Regular.woff2) format('woff2');
        }
        html {
          font-family: 'AlibabaPuHuiTi-2-55-Regular', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
          width: ${picWidth}px;
          height: 0;
          background: white;
        }
        p {
          padding: 10px;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <p>${content.replaceAll(/<\/*template>/g, '')}</p>
    </body>
    </html>`);
}
