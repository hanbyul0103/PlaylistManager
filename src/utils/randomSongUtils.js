// TODO: api 사용 생각하기

// 라이브러리
import path from 'path';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "./jsonHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getRandomSong(serverDataPath) {
    let result = false;
    let artist = "";
    let title = "";

    if (!jsonHelper.isFileExist(serverDataPath)) {
        result = false;
    } else {
        result = true;

        const dataPath = path.join(__dirname, `../data/${guildId}`);
        const serverDataPath = path.join(dataPath, `serverData.json`);

        const serverData = jsonHelper.readFile(serverDataPath);

        artist = "이한별";
        title = "노래";
    }

    return {
        result: result,
        data: {
            artist: artist,
            title: title
        }
    };
}

export { getRandomSong }