import {
    ApplicationCommandOptionType,
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
    name: 'request-song',
    description: '원하는 요일에 노래를 신청할 수 있습니다.',
    options: [
        {
            name: 'artist',
            description: '신청할 곡의 가수',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'title',
            description: '신청할 곡의 제목',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'day',
            description: '신청할 요일',
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
    ],
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const artist = interaction.options?.getString('artist');
        const title = interaction.options?.getString('title');
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

        const newSongData = {
            artist: artist,
            title: title
        };


        if (!songData[day]) {
            songData[day] = {};
        }

        const dayRequests = songData[day];
        const currentSongCount = Object.keys(dayRequests).length;

        if (currentSongCount >= process.env.MAX_SONGS) {
            await interaction.editReply({ content: `${day} 플레이리스트는 이미 꽉 차서 신청할 수 없습니다.` });

            return;
        }

        songData[day][userId] = newSongData;

        jsonHelper.writeFile(filePath, songData);

        let songList = [];
        songData = jsonHelper.readFile(filePath); // 저장 후 다시 가져오는 부분 (최신으로)

        for (const [dayKey, userRequests] of Object.entries(songData)) {
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

        const requestEmbed = embedGenerator.createEmbed(
            {
                title: `${day} 노래 신청 목록`,
                description: `규칙에 어긋난 신청곡은 예고 없이 삭제될 수 있습니다.`,
                fields: songList,
                timestamp: true
            }
        )

        await interaction.editReply({ embeds: [requestEmbed] });
    },
};