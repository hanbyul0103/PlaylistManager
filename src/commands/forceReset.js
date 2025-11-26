// 라이브러리
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";
import { json } from 'stream/consumers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'force-reset',
    description: '강제로 파일을 초기화합니다.',
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, `../data/${guildId}`);

        if (!jsonHelper.isFileExist(dataPath)) {
            await interaction.editReply({ content: `\`/init-server\` 명령어를 실행해 서버 정보를 DB에 등록하세요.` });

            return;
        };

        const mondayDate = getThisMonday();

        const year = mondayDate.getFullYear();
        const month = String(mondayDate.getMonth() + 1).padStart(2, '0');
        const day = String(mondayDate.getDate()).padStart(2, '0');

        const YYYYMMDD = `${year}${month}${day}`;

        const oldFilePath = path.join(dataPath, `requests_current.json`);
        const newFilePath = path.join(dataPath, `requests_archive_${YYYYMMDD}.json`);

        if (jsonHelper.isFileExist(oldFilePath))
            fs.copyFileSync(oldFilePath, newFilePath);

        jsonHelper.createNewDataFile(oldFilePath);

        await interaction.editReply({ content: `현재 리스트가 아카이브로 백업되었으며, 새로운 주차 신청이 시작되었습니다.` });
    },
};

function getThisMonday() {
    const today = new Date();

    let currentDay = today.getDay();

    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;

    today.setDate(today.getDate() - adjustedDay);
    today.setHours(0, 0, 0, 0);

    return today;
}