import {
    PermissionsBitField,
} from 'discord.js';

// 라이브러리
import path from 'path';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";
import * as getSongListUtils from "../utils/getSongListUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'init-songs-flo',
    description: '노래 등록하기',
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const member = interaction.member;

        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) { // TODO: 관리자 권한 > 지정한 역할이 있는지 확인
            await interaction.editReply({ content: `해당 명령어는 특정 역할이 있는 유저만 실행할 수 있습니다.` });

            return;
        }

        const list = ['3550', '3559', '3571', '3551', '3553', '3552', '3554', '3561', '3560', '3565']

        const dataPath = path.join(__dirname, `../data`);
        const filePath = path.join(dataPath, `songDataFromFLO.json`);

        let data = {};

        if (!jsonHelper.isFileExist(filePath)) {
            console.log(`파일이 존재하지 않습니다. filePath: ${filePath}\n새로 생성합니다..`);

            jsonHelper.writeFile(filePath, {});
        }

        for (const genre of list) {
            const result = await getSongListUtils.getFloTrackInfo(genre);

            data[genre] = [];
            const genreData = data[genre];

            if (typeof result.data === 'string') {
                console.log(`FLO API 요청 중 오류가 발생했습니다: ${result.data}`);
            } else if (Array.isArray(result.data) && result.data.length > 0) {
                const songs = result.data;

                for (const current of songs) {
                    const artist = current.representationArtist?.name;
                    const title = current.name;

                    genreData.push({
                        artist: artist,
                        title: title
                    });
                }
            }
        }

        jsonHelper.writeFile(filePath, data);

        await interaction.editReply({ content: `성공적으로 노래 데이터를 초기화했습니다.` });
    },
};