import {
    ApplicationCommandOptionType,
    PermissionsBitField,
} from 'discord.js';

// 라이브러리
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";
import * as embedGenerator from "../utils/embedGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'request-song',
    description: '노래 신청',
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
        await interaction.deferReply({ ephemeral: true });

        const artist = interaction.options?.getString('artist');
        const title = interaction.options?.getString('title');
        const day = interaction.options?.getString('day');
        const userId = interaction.user.id;

        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, `../data/${guildId}`);

        if (!jsonHelper.isFileExist(dataPath)) {
            await interaction.editReply({ content: `\`/init-server\` 명령어를 실행해 서버 정보를 DB에 등록하세요.` });

            return;
        };

        const today = new Date();
        const month = today.getMonth() + 1;
        const date = today.getDate();

        const filePath = path.join(dataPath, `${month}-${date}.json`);

        let songData = {};

        if (jsonHelper.isFileExist(filePath)) {
            songData = jsonHelper.readFile(filePath);

            console.log(songData);
        }

        const newSongData = {
            artist: artist,
            title: title,
            day: [
                day
            ]
        };

        songData[userId] = newSongData;

        jsonHelper.writeFile(filePath, songData);

        let songList = [];
        songData = jsonHelper.readFile(filePath);

        for (const song of Object.entries(songData)) {
            if (song.day === day) {
                songList.push({
                    name: `${day} 신청 목록`,
                    value: `${song.artist} - ${song.title}`,
                    inline: false
                });
            }
        }

        const requestEmbed = embedGenerator.createEmbed(
            {
                title: `${day} 노래 신청`,
                description: `규칙에 어긋난 신청곡은 예고 없이 삭제될 수 있습니다.`,
                fields: songList,
                timestamp: true
            }
        )

        await interaction.editReply({ embeds: [requestEmbed] });
    },
};