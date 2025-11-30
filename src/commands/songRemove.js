import {
    ApplicationCommandOptionType,
    PermissionsBitField,
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
    name: 'remove-song',
    description: '원하는 요일의 노래를 제거할 수 있습니다.',
    options: [
        {
            name: 'day',
            description: '제거할 요일',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: `월요일`, value: `월요일` },
                { name: `화요일`, value: `화요일` },
                { name: `수요일`, value: `수요일` },
                { name: `목요일`, value: `목요일` },
                { name: `금요일`, value: `금요일` },
            ]
        },
        {
            name: 'user',
            description: '제거할 유저',
            type: ApplicationCommandOptionType.User,
            require: false,
        }
    ],
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const user = interaction.options?.getUser('user');

        if (user) {
            const member = interaction.member;

            if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) { // TODO: 관리자 권한 > 지정한 역할이 있는지 확인
                await interaction.editReply({ content: `해당 명령어는 특정 역할이 있는 유저만 실행할 수 있습니다.` });

                return;
            }
        }

        const day = interaction.options?.getString('day');

        let userId = user ? user.id : interaction.user.id;

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

        const dayRequests = songData[day];

        let description = '';

        if (dayRequests && dayRequests[userId]) {
            delete songData[day][userId];
            description = `성공적으로 삭제되었습니다.`;
        } else {
            description = `해당 유저의 신청 목록이 없어 제거되지 않았습니다.`;
        }

        jsonHelper.writeFile(filePath, songData);

        let songList = [];
        songData = jsonHelper.readFile(filePath); // 저장 후 다시 가져오는 부분 (최신으로)

        for (const [dayKey, userRequests] of Object.entries(songData)) {
            if (dayKey === "requests" || dayKey === "unionRole") continue;

            if (dayKey === day) {
                let songs = '';

                for (const [userId, song] of Object.entries(userRequests)) {
                    songs += `${song.artist} - ${song.title}\n`;
                }

                songList.push({
                    name: `${dayKey}`,
                    value: songs,
                    inline: false
                });
            }
        }

        const removeEmbed = embedGenerator.createEmbed(
            {
                title: `${day} 노래 신청 목록`,
                description: description,
                fields: songList,
                timestamp: true
            }
        )

        await interaction.editReply({ embeds: [removeEmbed] });
    },
};