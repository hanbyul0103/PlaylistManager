import {
    PermissionsBitField,
} from 'discord.js';

// 라이브러리
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 외부 함수
import * as jsonHelper from "../utils/jsonHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'init-server',
    description: '현재 서버를 DB에 등록합니다.',
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const member = interaction.member;
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: `관리자 권한이 필요합니다.` });

            return;
        }

        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, `../data/${guildId}`);

        if (!jsonHelper.isFileExist(dataPath)) {
            fs.mkdirSync(dataPath);

            await interaction.editReply({ content: `서버를 DB 등록했습니다.` });

            return;
        }
        else {
            await interaction.editReply({ content: `서버가 이미 DB에 등록되어 있습니다.` })

            return;
        }
    },
};