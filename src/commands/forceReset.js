// 라이브러리
import path from 'path';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";
import * as resetUtils from "../utils/resetUtils.js";

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

        resetUtils.createNewFile(dataPath);

        await interaction.editReply({ content: `현재 리스트가 아카이브로 백업되었으며, 새로운 주차 신청이 시작되었습니다.` });
    },
};