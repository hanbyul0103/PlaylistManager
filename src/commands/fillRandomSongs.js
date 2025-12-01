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
                { name: `FLO 차트`, value: `50001` },
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

        // 1. FLO API 요청
        const floResult = await getFloTrackInfo(genre); // 장르 ID 전달

        // 2. 응답 데이터 처리
        if (typeof floResult.data === 'string') {
            // 에러 메시지인 경우
            replyContent = `FLO API 요청 중 오류가 발생했습니다: \`${floResult.data}\``;
        } else if (Array.isArray(floResult.data) && floResult.data.length > 0) {
            // 성공적으로 곡 정보를 가져온 경우
            const songs = floResult.data;

            // --- 🎯 랜덤 곡 선택 및 신청 변수 할당 ---
            const randomIndex = Math.floor(Math.random() * songs.length);
            const randomSong = songs[randomIndex];

            // 신청 로직에 사용할 artist와 title 변수에 할당
            artist = randomSong.representationArtist?.name || '알 수 없는 아티스트';
            title = randomSong.name;
            // ----------------------------------------

            // --- 📚 응답용 곡 목록 포맷팅 (선택된 곡을 강조) ---
            const formattedSongs = songs.slice(0, 10).map((song, index) => { // 상위 10개만 보여주기
                const songTitle = song.name;
                const songArtist = song.representationArtist?.name || '알 수 없는 아티스트';

                // 랜덤으로 선택된 곡이면 강조 표시
                if (song.id === randomSong.id) {
                    return `**✅ ${index + 1}. ${songTitle} - ${songArtist} (선택됨)**`;
                }

                return `${index + 1}. **${songTitle}** - ${songArtist}`;
            }).join('\n');

            replyContent = `🎉 **${day}**에 추천할 **FLO 랜덤 ${genre} 곡 (총 ${songs.length}곡 중 1곡 선택)**\n\n` +
                `**선택된 곡:** \`${artist} - ${title}\`\n\n` +
                `**[차트 상위 10곡 예시]**\n${formattedSongs}`;

            // TODO: 여기서 artist와 title 변수에 할당된 값을 사용하여 
            // 위에 주석처리된 **신청 로직을 활성화**해야 합니다.

            // 예시: 
            // const newSongData = { artist: artist, title: title };
            // songData[day][userId] = newSongData;
            // ... (파일 저장 로직)

        } else {
            // 데이터가 비어있는 경우
            replyContent = `FLO API에서 곡 정보를 가져오는 데 실패했거나, ${genre} 차트 목록이 비어있습니다.`;
        }

        await interaction.editReply({ content: replyContent });

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