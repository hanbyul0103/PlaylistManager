import { EmbedBuilder } from "discord.js";

function createEmbed({ title, description, fields = [], timestamp = false }) {
    const embed = new EmbedBuilder();

    if (title)
        embed.setTitle(title);

    if(description)
        embed.setDescription(description);

    if (fields.length > 0) {
        embed.addFields(fields.map(f => ({
            name: f.name,
            value: `${f.value}\n`,
            inline: f.inline || false
        })));
    }

    if (timestamp) {
        embed.setTimestamp();
    }

    return embed;
}

export { createEmbed };