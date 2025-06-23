const { SlashCommandBuilder } = require("discord.js");
const { Catbox } = require("node-catbox");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const cb = new Catbox();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tools")
        .setDescription("Universal tools")
        .addSubcommand(subcommand1 =>
            subcommand1
                .setName("catbox")
                .setDescription("File url hosting")
                .addAttachmentOption(option =>
                    option
                        .setName("file")
                        .setDescription("The file that you want to upload")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        try {
            const fileTarget = interaction.options.getAttachment("file");
            const filePath = path.join(__dirname, "downloads", fileTarget.name);

            const response = await axios.get(fileTarget.url, {
                responseType: "stream"
            });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            await new Promise(resolve => writer.on("finish", resolve));

            const hasil = await cb.uploadFile({
                path: filePath
            });

            await interaction.reply(`url: ${hasil}`);
        } catch (err) {
            console.error(err);
            interaction.reply(`Error: \n${err}`);
        }
    }
};
