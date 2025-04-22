import {
    getUserSettings,
 } from '../services/firebase.js';
 import { BloodLabel, BloodValues, bloodMessages  } from '../messages/messages.js';
 
 export const helpMessage = async (
    senderName: string,
 ): Promise<[object, string]> => {
    const thumbnailUrl =
       'https://cdn.jsdelivr.net/gh/riskyprsty/SmartMotorMicroservices@refs/heads/master/WhatsappBotService/src/docs/media/thumbnail.png';
    const sourceUrl = 'https://tribone.my.id';
    const message = `🔖 Hello, ${senderName}!
 I'm a *CTFd Notifier Bot* 🔥
 What can I do for you?

┌      *ᴍᴏɴɪᴛᴏʀ*
│ ◦   .ꜱᴛᴀʀᴛ <ɪɴᴛᴇʀᴠᴀʟ>
│ ◦   .ꜱᴛᴏᴘ
│ ◦   .ᴛᴇꜱᴛ
╰──  –
┌      *ᴄᴛꜰᴅ*
│ ◦   .ᴜʀʟ <ᴜʀʟ>
│ ◦   .ᴛᴏᴋᴇɴ <ᴛᴏᴋᴇɴ>
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

 export function getRandomBloodMessage(
   label: BloodLabel,
   values: BloodValues
 ): string {
   const templates = bloodMessages[label];
   const idx = Math.floor(Math.random() * templates.length);
   return templates[idx]
     .replace('{team}', values.team || 'No Team')
     .replace('{challenge}', values.challenge);
 }