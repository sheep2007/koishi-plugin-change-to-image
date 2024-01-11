import { Context, Schema } from 'koishi';

export declare const name = "change-to-image";

export declare const using: readonly ["puppeteer", "logger"];
export interface Config {
    /** 触发转换的消息文本长度 */
    length: number;
    /** 触发转换的消息行数 */
    line: number;
    /** 生成图片的宽度，单位px */
    width: number;
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
