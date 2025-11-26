// 라이브러리
import path from "path";
import cron from "node-cron";
import { fileURLToPath } from 'url';

// 외부 함수
import * as resetUtils from "../utils/resetUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: "ready",
    once: true,
    async execute(client) {
        cron.schedule('59 23 * * 0', () => { // 매주 일요일 23시 59분에 동작
            const dataList = resetUtils.getServerList();

            for (let i = 0; i < dataList.length; ++i) {
                const guildId = dataList[i];
                const dataPath = path.join(__dirname, `../data/${guildId}`);

                resetUtils.createNewFile(dataPath);
            }
        });
    },
};