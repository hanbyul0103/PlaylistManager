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
    name: 'feedback',
    description: '자유롭게 의견을 남겨주세요.',
    options: [
        {
            name: 'heart-rating',
            description: '하트점',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: `💚💚💚💚💚`, value: `5` },
                { name: `💚💚💚💚🤍`, value: `4` },
                { name: `💚💚💚🤍🤍`, value: `3` },
                { name: `💚💚🤍🤍🤍`, value: `2` },
                { name: `💚🤍🤍🤍🤍`, value: `1` },
            ]
        },
        {
            name: 'message',
            description: '의견',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const rating = interaction.options?.getString("heart-rating");
        const message = interaction.options?.getString("message");

        const me = process.env.HB;
        const user = await client.users.fetch(me);

        await user.send(`----------------------------------\n<@${interaction.user.id}>님의 의견입니다.\n\n평점: ${rating}점\n의견: ${message}\n----------------------------------`);

        await interaction.editReply({ content: `소중한 의견 감사합니다.` });
    },
};