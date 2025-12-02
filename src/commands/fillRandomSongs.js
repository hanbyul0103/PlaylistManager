import {
    ApplicationCommandOptionType,
} from 'discord.js';

// 라이브러리
import path from 'path';
import { fileURLToPath } from 'url';
import axios from "axios";

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
        const all = interaction.options?.getBoolean('all');
        // const userId = interaction.user.id;

        // //#region 서버 json 파일 불러오는 파트

        // const guildId = interaction.guild.id;
        // const dataPath = path.join(__dirname, `../data/${guildId}`);

        // if (!jsonHelper.isFileExist(dataPath)) {
        //     await interaction.editReply({ content: `\`/init-server\` 명령어를 실행해 서버 정보를 DB에 등록하세요.` });

        //     return;
        // };

        // const filePath = path.join(dataPath, `requests_current.json`);

        // //#endregion

        // let songData = {};

        // if (jsonHelper.isFileExist(filePath)) {
        //     songData = jsonHelper.readFile(filePath);
        // }

        // // const artist = // TODO: 이쪽 부분에서 가져오기
        // // const title = 

        // const newSongData = {
        //     artist: artist,
        //     title: title
        // };

        // if (!songData[day]) {
        //     songData[day] = {};
        // }

        // const dayRequests = songData[day];
        // const currentSongCount = Object.keys(dayRequests).length;

        // const requestsKey = "requests";
        // const maxSongsForWeek = process.env.MAX_REQUESTS_PER_USER;
        // const maxSongs = process.env.MAX_SONGS;

        // if (getUserCount(songData, requestsKey, userId) >= maxSongsForWeek) {
        //     await interaction.editReply({ content: `한 주에 최대 ${maxSongsForWeek}곡까지 신청할 수 있습니다. 이미 ${maxSongsForWeek}곡을 신청했습니다.` });

        //     return;
        // }

        // if (currentSongCount >= maxSongs) {
        //     await interaction.editReply({ content: `${day} 플레이리스트는 이미 꽉 차서 신청할 수 없습니다.` });

        //     return;
        // }

        // songData[day][userId] = newSongData;

        // setUserCount(songData, requestsKey, userId, getUserCount(songData, requestsKey, userId) + 1);

        // jsonHelper.writeFile(filePath, songData);

        // let songList = [];
        // songData = jsonHelper.readFile(filePath); // TODO: 빼고 다시 해봐. 필요 없을 수도 있음

        // for (const [dayKey, userRequests] of Object.entries(songData)) {
        //     if (dayKey === "requests" || dayKey === "unionRole") continue;

        //     if (dayKey === day) {
        //         let songs = '';

        //         for (const [userId, song] of Object.entries(userRequests)) {
        //             songs += `${song.artist} - ${song.title}\n`;
        //         }

        //         songList.push({
        //             name: `${dayKey}`,
        //             value: songs || `등록된 노래가 없습니다.`,
        //             inline: false
        //         });
        //     }
        // }

        // const requestEmbed = embedGenerator.createEmbed(
        //     {
        //         title: `${day} 노래 신청 목록`,
        //         description: `규칙에 어긋난 신청곡은 예고 없이 삭제될 수 있습니다.`,
        //         fields: songList,
        //         timestamp: true
        //     }
        // )

        // await interaction.editReply({ embeds: [requestEmbed] });

        let artist = '';
        let title = '';
        let replyContent = '';

        const floResult = await getFloTrackInfo(genre);

        if (typeof floResult.data === 'string') {
            console.log(`FLO API 요청 중 오류가 발생했습니다: ${floResult.data}`);
        } else if (Array.isArray(floResult.data) && floResult.data.length > 0) {
            const songs = floResult.data;

            for (let i = 0; i < songs.length; i++) {
                const current = songs[i];
                replyContent += `${current.representationArtist?.name} - ${current.name}\n`;
            }

            // const randomIndex = Math.floor(Math.random() * songs.length);
            // const randomSong = songs[randomIndex];

            // artist = randomSong.representationArtist?.name || '알 수 없는 아티스트';
            // title = randomSong.name;
        }

        await interaction.editReply({ content: replyContent });
    },
};

async function getFloTrackInfo(genre) {
    const url = `https://www.music-flo.com/api/display/v1/browser/chart/${genre}/track/list?size=100`;
    console.log(url);

    try {
        const response = await axios.get(url, {
            params: {
                page: 1,
                size: 10,
            },
        });

        const trackList = response.data?.data?.trackList || [];

        return { data: trackList, chartId: genre };

    } catch (error) {
        return { data: error.message };
    }
}