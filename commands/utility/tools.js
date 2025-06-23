const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data");

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

            // Download file dari Discord
            const response = await axios.get(fileTarget.url, {
                responseType: "stream"
            });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            await new Promise(resolve => writer.on("finish", resolve));

            // Upload ke Catbox
            const form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("fileToUpload", fs.createReadStream(filePath));

            const uploadRes = await axios.post(
                "https://catbox.moe/user/api.php",
                form,
                {
                    headers: form.getHeaders()
                }
            );

            fs.unlinkSync(filePath); // Hapus file lokal setelah upload

            await interaction.reply(`✅ URL: ${uploadRes.data}`);
        } catch (err) {
            console.error(err);
            await interaction.reply(`❌ Error: ${err.message}`);
        }
    }
};
