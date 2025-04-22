import {
    getUserSettings,
 } from '../services/firebase.js';
 
 export const helpMessage = async (
    senderName: string,
 ): Promise<[object, string]> => {
    const thumbnailUrl =
       'https://cdn.jsdelivr.net/gh/riskyprsty/SmartMotorMicroservices@refs/heads/master/WhatsappBotService/src/docs/media/thumbnail.png';
    const sourceUrl = 'https://tribone.my.id';
    const message = `🔖 Hello, ${senderName}!
 I'm a *TCC-CTF-BOT* 🔥
 What can I do for you?
 
 ┌      *ᴍᴏɴɪᴛᴏʀɪɴɢ*
 │ ◦   .sᴛᴀᴛᴜs
 │ ◦   .ʟᴏᴄᴀᴛɪᴏɴ
 │ ◦   .ᴍᴏᴅᴇᴍ
 │ ◦   .ᴛᴇᴍᴘᴇʀᴀᴛᴜʀᴇ
 ╰──  –
 ┌      *ᴄᴏɴᴛʀᴏʟ*
 │ ◦   .<ᴏɴ/ᴏꜰꜰ>
 │ ◦   .ɪɴꜰᴏ
 │ ◦   .sᴇᴛʀᴀᴅɪᴜs <ᴋᴍ>
 ╰──  –
 ┌      *ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ*
 │ ◦   .ɴᴏᴛɪꜰʏ <ᴏɴ/ᴏꜰꜰ>
 │ ◦   .sᴇᴄᴜʀɪᴛʏ <ʜɪɢʜ/ɴᴏʀᴍᴀʟ>
 │ ◦   .sᴇᴛɪɴᴛᴇʀᴠᴀʟ <ᴍɪɴ> 
 ╰──  –
       `;
    const context = {
       externalAdReply: {
          title: new Date().toLocaleString(),
          body: '© SmartMotorcycleMonitoring',
          mediaType: 1,
          thumbnailUrl: thumbnailUrl,
          sourceUrl: sourceUrl,
          containsAutoReply: false,
          renderLargerThumbnail: true,
          showAdAttribution: false,
       },
    };
 
    return [context, message];
 };
 
 export const initializeExampleMessage = () => {
    const message =
       '🔖 Enter your TCC-PENS CTF *username*. Format */init <username>*\n\nExample: /init de4dbeef';
    return message;
 };

 
 export const unitializedMessage = () => {
    const message =
       '🔖 Hello, please enter your TCC-PENS CTF *username*. Format */init <username>*\n\nExample: /init de4dbeef';
    return message;
 };
 
 export const successInitializeMessage = async (
    senderName: string,
    vehicleId: string,
 ): Promise<string> => {
    const message = `Halo, ${senderName} 🔥\nSuccess bind your account *${vehicleId}* to your number 🎉. \n\n🛵 Type /help for see available commands`;
    return message;
 };
