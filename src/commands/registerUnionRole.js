import {
    ApplicationCommandOptionType,
    PermissionsBitField,
} from 'discord.js';

// 라이브러리
import path from 'path';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'register-union-role',
    description: '원하는 요일의 신청곡 리스트를 txt파일로 받을 수 있습니다.',
    options: [
        {
            name: 'role',
            description: '역할',
            type: ApplicationCommandOptionType.Role,
            required: true
        },
    ],
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const role = interaction.options?.getRole("role");

        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: `서버를 DB에 등록하기 위해서는 관리자 권한이 필요합니다.` });

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

        let serverData;

        if (jsonHelper.isFileExist(filePath)) {
            serverData = jsonHelper.readFile(filePath);
        }

        const unionRole = "unionRole";

        if (!serverData[unionRole]) {
            serverData[unionRole] = {}
        }
        serverData[unionRole] = role.id;

        await interaction.editReply({ content: `관리자 역할이 설정되었습니다.` });
    },
};