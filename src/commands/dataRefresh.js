import {
    PermissionsBitField
} from 'discord.js';

// 라이브러리
import path from 'path';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";
import * as embedGenerator from "../utils/embedGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'show-status',
    description: '데이터를 검사합니다.',
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const member = interaction.member;

        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) { // TODO: 관리자 권한 > 지정한 역할이 있는지 확인
            await interaction.editReply({ content: `해당 명령어는 특정 역할이 있는 유저만 실행할 수 있습니다.` });

            return;
        }

        //#region 서버 json 파일 불러오는 파트

        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, `../data/${guildId}`);

        if (!jsonHelper.isFileExist(dataPath)) {
            await interaction.editReply({ content: `\`/init-server\` 명령어를 실행해 서버 정보를 DB에 등록하세요.` });

            return;
        };

        const filePath = path.join(dataPath, `requests_current.json`);

        //#endregion

        let songData = {};

        if (jsonHelper.isFileExist(filePath)) {
            songData = jsonHelper.readFile(filePath);
        }

        let userSongCount = {};
        let dayCount = {};

        let weekFields = [];

        for (const [dayKey, userRequests] of Object.entries(songData)) {
            if (dayKey === "requests" || dayKey === "unionRole") continue;

            const userIds = Object.keys(userRequests);
            const songsInDay = userIds.length;

            dayCount[dayKey] = songsInDay;

            weekFields.push({
                name: `${dayKey}`,
                value: `${dayCount[dayKey]}곡`,
                inline: true
            })

            for (const userId of userIds) {
                userSongCount[userId] = (userSongCount[userId] || 0) + 1;
            }
        }

        songData.requests = userSongCount;

        jsonHelper.writeFile(filePath, songData);

        const weeklyData = embedGenerator.createEmbed({
            title: `데이터 검사가 완료되었습니다.`,
            fields: weekFields,
            timestamp: true
        });

        await interaction.editReply({ content: `데이터 검사가 완료되었습니다.\n결과 보고서`, embeds: [weeklyData] });
    },
};