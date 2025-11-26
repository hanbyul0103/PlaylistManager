// 라이브러리
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createNewFile(dataPath) {
    const mondayDate = getThisMonday();

    const year = mondayDate.getFullYear();
    const month = String(mondayDate.getMonth() + 1).padStart(2, '0');
    const day = String(mondayDate.getDate()).padStart(2, '0');

    const YYYYMMDD = `${year}${month}${day}`;

    const oldFilePath = path.join(dataPath, `requests_current.json`);
    const newFilePath = path.join(dataPath, `requests_archive_${YYYYMMDD}.json`);

    if (jsonHelper.isFileExist(oldFilePath))
        fs.copyFileSync(oldFilePath, newFilePath);

    jsonHelper.createNewDataFile(oldFilePath);
}

function getThisMonday() {
    const today = new Date();

    let currentDay = today.getDay();

    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;

    today.setDate(today.getDate() - adjustedDay);
    today.setHours(0, 0, 0, 0);

    return today;
}

function getServerList() {
    let serverList = [];

    const dataPath = path.join(__dirname, `../data`);

    try {
        const items = fs.readdirSync(dataPath);

        for (const item of items) {
            const itemPath = path.join(dataPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                serverList.push(item);
            }
        }
    } catch (error) {
        console.log(error);
    }

    return serverList;
}

export { createNewFile, getServerList }