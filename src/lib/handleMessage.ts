import { WASocket } from 'baileys';
import { sendMessageWTyping } from '../utils/messageUtils.js';
import {
  isUserInitialized,
  initializeUser,
  getUserRecord,
  setUserRole,
  setCtfdConfig,
  CtfdConfig
} from '../services/firebase.js';
import {
  startCTFdMonitor,
  stopCTFdMonitor,
  getCTFDdata
} from '../services/ctfdmonitor.js';
import {
  helpMessage,
  unitializedMessage,
  initializeExampleMessage,
  successInitializeMessage
} from '../messages/composer.js';

const adminCommands = new Set(['ctfd', 'monitor']);

type CommandHandler = (
  sock: WASocket,
  jid: string,
  username: string,
  args: string[]
) => Promise<void>;

async function requireAdmin(sock: WASocket, jid: string): Promise<boolean> {
  const user = await getUserRecord(jid);
  if (!user || user.role !== 'admin') {
    await sendMessageWTyping(
      sock,
      { text: '⚠️ Only *admin* can execute this command.' },
      jid
    );
    return false;
  }
  return true;
}

async function commandMiddleware(
  sock: WASocket,
  jid: string,
  command: string,
  username: string,
  args: string[],
  handler: CommandHandler
): Promise<void> {
  if (command !== 'init') {
    const initialized = await isUserInitialized(jid);
    if (!initialized) {
      await sendMessageWTyping(
        sock,
        { text: unitializedMessage() },
        jid
      );
      return;
    }
  }

  if (adminCommands.has(command)) {
    const ok = await requireAdmin(sock, jid);
    if (!ok) return;
  }

  await handler(sock, jid, username, args);
}

export async function handleMessage(
  body: string,
  username: string,
  jid: string,
  sock: WASocket
): Promise<void> {
  try {
    if (!body || body.length === 0) return;
    const prefix = body[0];
    if (!['/', '!', '#', '.'].includes(prefix)) return;

    const [cmdRaw, ...args] = body.slice(1).trim().split(/ +/);
    const command = cmdRaw.toLowerCase();

    const commands: Record<string, CommandHandler> = {
      init: async (sock, jid, senderName, args) => {
        const uname = args[0];
        if (!uname) {
          await sendMessageWTyping(
            sock,
            { text: initializeExampleMessage() },
            jid
          );
          return;
        }
        await initializeUser(jid, uname);
        const msg = await successInitializeMessage(senderName, uname);
        await sendMessageWTyping(sock, { text: msg }, jid);
      },

      help: async (sock, jid, uname) => {
        const [context, msg] = await helpMessage(uname);
        await sendMessageWTyping(
          sock,
          { text: msg, contextInfo: context },
          jid
        );
      },
      ctfd: async (sock, jid, _, args) => {
        const subCommand = args[0]?.toLowerCase();
        const value = args[1];

        if (!subCommand || !value) {
          await sendMessageWTyping(
            sock,
            {
              text: '⚠️ Wrong format!\n' +
                'Example:\n' +
                '.ctfd url https://ctfd.example.com\n' +
                '.ctfd token my_secret_token_123'
            },
            jid
          );
          return;
        }

        try {
          let configUpdate: CtfdConfig = {};

          if (subCommand === 'url') {
            configUpdate.url = value;
            await setCtfdConfig(configUpdate);
            await sendMessageWTyping(
              sock,
              { text: `✅ Success update CTFd URL to:\n${value}` },
              jid
            );
          } else if (subCommand === 'token') {
            configUpdate.api_key = value;
            await setCtfdConfig(configUpdate);
            await sendMessageWTyping(
              sock,
              { text: '✅ CTFd API Token successfully updated!' },
              jid
            );
          } else {
            await sendMessageWTyping(
              sock,
              { text: '❌ Subcommand tidak valid! Gunakan *url* atau *token*' },
              jid
            );
          }
        } catch (error) {
          console.error('CTFd config update error:', error);
          await sendMessageWTyping(
            sock,
            { text: '❌ Gagal update config CTFd! Cek log server.' },
            jid
          );
        }
      },
      monitor: async (sock, jid, _, args) => {
        const sub = args[0]?.toLowerCase();
        switch (sub) {
          case 'start':
            const intervalArg = Math.max(15, parseInt(args[1]) || 30);
            startCTFdMonitor(sock, jid, intervalArg);
            break;
          case 'stop':
            stopCTFdMonitor(sock, jid);
            break;
          case 'test':
            try {
              const test = await getCTFDdata('challenges', sock, jid);
              if (test) {
                await sendMessageWTyping(
                  sock,
                  { text: `✅ Koneksi CTFd valid! Jumlah challenge: ${test.length}` },
                  jid
                );
              }
            } catch (error) {
              await sendMessageWTyping(
                sock,
                { text: '❌ Gagal terhubung ke CTFd API' },
                jid
              );
            }
            break;
          default:
            await sendMessageWTyping(
              sock,
              {
                text: '🛠️ Monitor commands:\n' +
                  '.monitor start [interval]\n' +
                  '.monitor stop\n' +
                  '.monitor interval [minutes]'
              },
              jid
            );
        }
      },
      admin: async (sock, jid, _, args) => {
        const sub = args[0]?.toLowerCase();
        if (sub === 'role') {
          const targetJid = args[1] ?? '';
          const roleArg = args[2] as 'admin' | 'user';
          await sendMessageWTyping(
            sock,
            { text: await setUserRole(targetJid, roleArg) },
            jid
          );
        }
      }
    };

    const handler = commands[command];
    if (handler) {
      await commandMiddleware(sock, jid, command, username, args, handler);
    } else {
      await sendMessageWTyping(sock, { text: 'Type */help* untuk melihat daftar perintah.' }, jid);
    }
  } catch (error) {
    console.error('Error handling message:', { body, jid, error });
  }
}