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
    name: 'request-random',
    description: '노래를 랜덤 신청합니다. (FLO 기반)',
    options: [
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
        {
            name: 'genre',
            description: '장르',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: `국내 발라드`, value: `3550` },
                { name: `해외 팝`, value: `3559` },
                { name: `J-POP`, value: `3571` },
                { name: `국내 댄스/일렉`, value: `3551` },
                { name: `국내 알앤비`, value: `3553` },
                { name: `국내 힙합`, value: `3552` },
                { name: `트로트`, value: `3554` },
                { name: `해외 알앤비`, value: `3561` },
                { name: `해외 힙합`, value: `3560` },
                { name: `OST/BGM`, value: `3565` },
            ]
        },
        {
            name: 'all',
            description: '남은 수를 모두 랜덤으로 채울 것인지',
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }
    ],
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const day = interaction.options?.getString('day');
        const genre = interaction.options?.getString('genre');
        const all = interaction.options?.getBoolean('all') || false;
        let userId = interaction.user.id;

        if (all) {
            const member = interaction.member;

            if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) { // TODO: 관리자 권한 > 지정한 역할이 있는지 확인
                await interaction.editReply({ content: `해당 명령어는 특정 역할이 있는 유저만 실행할 수 있습니다.` });

                return;
            }

            userId = client.user.id;
        }

        //#region 서버 json 파일 불러오는 파트

        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, `../data`);

        if (!jsonHelper.isFileExist(dataPath)) {
            await interaction.editReply({ content: `\`/init-server\` 명령어를 실행해 서버 정보를 DB에 등록하세요.` });

            return;
        };

        const filePath = path.join(dataPath, `${guildId}/requests_current.json`);
        const songDataPath = path.join(dataPath, `songDataFromFLO.json`);

        //#endregion

        let songData = {};

        if (jsonHelper.isFileExist(filePath)) {
            songData = jsonHelper.readFile(filePath);
        }

        if (!songData[day]) {
            songData[day] = {};
        }

        const floData = jsonHelper.readFile(songDataPath);
        const currentGenre = floData[genre];

        const requestsKey = "requests";
        const maxSongsForWeek = parseInt(process.env.MAX_REQUESTS_PER_USER);
        const maxSongs = parseInt(process.env.MAX_SONGS);
        const dayRequests = songData[day];
        let currentSongCount = Object.keys(dayRequests).length;

        if (!all) {
            if (getUserCount(songData, requestsKey, userId) >= maxSongsForWeek) {
                await interaction.editReply({ content: `한 주에 최대 ${maxSongsForWeek}곡까지 신청할 수 있습니다. 이미 ${maxSongsForWeek}곡을 신청했습니다.` });
                return;
            }

            if (currentSongCount >= maxSongs) {
                await interaction.editReply({ content: `${day} 플레이리스트는 이미 꽉 차서 신청할 수 없습니다.` });
                return;
            }

            const randomIndex = Math.floor(Math.random() * currentGenre.length);
            const randomSong = currentGenre[randomIndex];

            const newSongData = {
                artist: randomSong.artist,
                title: randomSong.title
            };

            songData[day][userId] = newSongData;

            setUserCount(songData, requestsKey, userId, getUserCount(songData, requestsKey, userId) + 1);

            currentSongCount++;
        } else {
            const songsToFill = maxSongs - currentSongCount;
            let songsAdded = 0;

            if (songsToFill <= 0) {
                await interaction.editReply({ content: `${day} 플레이리스트는 이미 꽉 차 있습니다. (최대 ${maxSongs}곡)` });
                return;
            }

            for (let i = 0; i < songsToFill; i++) {
                // 랜덤 노래 선택
                const randomIndex = Math.floor(Math.random() * currentGenre.length);
                const randomSong = currentGenre[randomIndex];

                const newSongData = {
                    artist: randomSong.artist,
                    title: randomSong.title
                };

                let botSongKey = `${userId}_${currentSongCount + i}`;

                songData[day][botSongKey] = newSongData;
                songsAdded++;
            }

            currentSongCount += songsAdded; // 노래 수 증가

            await interaction.followUp({ content: `${day} 플레이리스트에 ${songsAdded}곡을 랜덤으로 채웠습니다.` });
        }

        jsonHelper.writeFile(filePath, songData);

        let songList = [];

        const updatedSongData = jsonHelper.readFile(filePath);

        for (const [dayKey, userRequests] of Object.entries(updatedSongData)) {
            if (dayKey === "requests" || dayKey === "unionRole") continue;

            if (dayKey === day) {
                let songs = '';

                for (const [userId, song] of Object.entries(userRequests)) {
                    songs += `${song.artist} - ${song.title}\n`;
                }

                songList.push({
                    name: `${dayKey}`,
                    value: songs || `등록된 노래가 없습니다.`,
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

        // all=false일 때는 deferReply에 대한 editReply로, all=true일 때는 followUp 이후 editReply로 임베드 전송
        await interaction.editReply({ embeds: [requestEmbed] });
    },
};

function getUserCount(songData, requestsKey, userId) {
    if (!songData[requestsKey]) {
        return 0;
    }

    if (!songData[requestsKey][userId]) { // 없으면 넣고
        songData[requestsKey][userId] = 0;
    };

    const count = songData[requestsKey][userId];
    return count || 0;
}

function setUserCount(songData, requestsKey, userId, count) {
    if (!songData[requestsKey]) {
        songData[requestsKey] = {};
    }

    songData[requestsKey][userId] = count;
}