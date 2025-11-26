import {
    ApplicationCommandOptionType,
    PermissionsBitField,
    AttachmentBuilder,
} from 'discord.js';

// 라이브러리
import path from 'path';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'get-file',
    description: '원하는 요일의 신청곡 리스트를 txt파일로 받을 수 있습니다.',
    options: [
        {
            name: 'day',
            description: '요일',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: `월요일`, value: `월요일` },
                { name: `화요일`, value: `화요일` },
                { name: `수요일`, value: `수요일` },
                { name: `목요일`, value: `목요일` },
                { name: `금요일`, value: `금요일` },
            ]
        },
    ],
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const member = interaction.member;
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: `해당 명령어를 실행하기 위해서는 관리자 권한이 필요합니다.` });

            return;
        }

        const day = interaction.options?.getString('day');
        const userId = interaction.user.id;

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

        // .txt 파일 생성하는 부분
        let fileContent = '';


        if (day && !songData[day]) {
            await interaction.editReply({ content: `해당 요일의 플레이리스트가 없습니다.` });

            return;
        }

        for (const [dayKey, userRequests] of Object.entries(songData)) {
            if (day && dayKey !== day) continue;

            fileContent += `${dayKey}\n`;

            for (const [userId, song] of Object.entries(userRequests)) {
                fileContent += `${song.artist} - ${song.title}\n`;
            }
        }

        const fileBuffer = Buffer.from(fileContent, 'utf8');
        const attachment = new AttachmentBuilder(fileBuffer, { name: 'playlist.txt' });

        await interaction.editReply({ files: [attachment] });
    },
};