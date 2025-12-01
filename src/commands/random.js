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
    name: 'random',
    description: '리스트를 섞을 수 있습니다.',
    options: [
        {
            name: 'day',
            description: '섞을 요일',
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

        const day = interaction.options?.getString('day');

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
        let requestsSong = [];
        let songs = "";

        for (const [dayKey, userRequests] of Object.entries(songData)) {
            if (dayKey === "requests" || dayKey === "unionRole") continue;

            if (dayKey === day) {
                for (const [userId, song] of Object.entries(userRequests)) {
                    requestsSong.push(`${song.artist} - ${song.title}`);
                }

                // 셔플
                shuffle(requestsSong);

                // songs에 넣기
                songs = requestsSong.join("\n");

                songList.push({
                    name: `${dayKey}`,
                    value: songs || `등록된 노래가 없습니다.`,
                    inline: false
                });
            }
        }

        const title = `노래 신청 목록`;
        let description = ``;

        if (day)
            description += "신청 목록입니다.";
        else if (songList.length === 0)
            description = "현재 등록된 노래 신청 목록이 없습니다.";

        const listEmbed = embedGenerator.createEmbed(
            {
                title: `${title}`,
                description: `${description}`,
                fields: songList.length > 0 ? songList : [{ name: "정보 없음", value: "조회된 신청 목록이 없습니다." }],
                timestamp: true
            }
        )

        await interaction.editReply({ embeds: [listEmbed] });
    },
};

function shuffle(array) {
    if (array.length === 0) console.log("길이가 0이에요.");

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
}