// json 관리 담당
import fs from 'fs';

function isFileExist(filePath) {
    return fs.existsSync(filePath);
}

function readFile(filePath) {
    if (!isFileExist(filePath)) {
        console.log(`[JSON_HELPER] 파일이 존재하지 않습니다: ${filePath}`);

        return {};
    }

    try {
        const data = fs.readFileSync(filePath, 'utf8');

        return JSON.parse(data || '{}');
    } catch (error) {
        console.error(`[JSON_HELPER] 파일을 불러오는 중 오류 발생: ${filePath}`, error);

        return {};
    }
}

function writeFile(filePath, data) {
    try {
        const jsonString = JSON.stringify(data, null, 4);

        fs.writeFileSync(filePath, jsonString, 'utf8');

        return true;
    } catch (error) {
        console.error(`[JSON_HELPER] 파일 저장 중 오류 발생: ${filePath}`, error);

        return false;
    }
}

function createNewDataFile(filePath) {
    let originData = {};

    const dayofweek = ['월요일', '화요일', '수요일', '목요일', '금요일'];

    for (let i = 0; i < dayofweek.length; ++i) {
        originData[dayofweek[i]] = {};
    }

    writeFile(filePath, originData);
}

export { isFileExist, readFile, writeFile, createNewDataFile };