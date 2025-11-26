import {
    ApplicationCommandOptionType,
    ContainerBuilder,
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
    name: 'show-list',
    description: '노래 신청 목록을 확인할 수 있습니다.',
    options: [
        {
            name: 'day',
            description: '확인할 요일',
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
        {
            name: 'user',
            description: '확인할 유저',
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const day = interaction.options?.getString('day');
        const user = interaction.options?.getUser('user');

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

        let songList = [];

        for (const [dayKey, userRequests] of Object.entries(songData)) {

            if (day && dayKey !== day) continue;

            const requestEntries = Object.entries(userRequests);
            if (requestEntries.length === 0) continue; // 리스트가 없다고 출력하기

            let songsContent = '';

            for (const [currentUserId, song] of requestEntries) {

                // 4. 유저를 지정했다면 해당 유저의 곡만 포함합니다.
                if (user && currentUserId !== user.id) continue;

                songsContent += `${song.artist} - ${song.title}\n`;
            }

            if (songsContent) {
                songList.push({
                    name: `${dayKey} 플레이리스트`,
                    value: songsContent,
                    inline: false
                });
            }
        }

        const title = `노래 신청 목록`;
        let description = ``;

        if (user)
            description += `<@${user.id}>의 `;
        if (day)
            description += `**${day}** `
        if ((user || day) !== null)
            description += "신청 목록입니다.";

        const listEmbed = embedGenerator.createEmbed(
            {
                title: `${title}`,
                description: `${description}`,
                fields: songList,
                timestamp: true
            }
        )

        await interaction.editReply({ embeds: [listEmbed] });
    },
};