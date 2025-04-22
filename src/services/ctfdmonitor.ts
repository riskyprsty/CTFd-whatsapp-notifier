import axios from 'axios';
import { WASocket } from 'baileys';
import { sendMessageWTyping } from '../utils/messageUtils.js';
import { 
  getCtfdConfig,
  getGlobalBloods,
  setGlobalBlood,
} from './firebase.js';
import { getRandomBloodMessage } from '../messages/composer.js';
import { BloodLabel } from '../messages/messages.js';

interface Challenge {
  id: number;
  name: string;
}

interface Solve {
  account_id: number;
  name: string;
  date: string;
  team?: string;
}

// async function getCTFDdata(endpoint: string, sock: WASocket, jid: string): Promise<any> {

//   try {
//     const config = await getCtfdConfig();
//     const ctfdUrl = config.url || process.env.CTFD_URL;
//     const ctfdKey = config.api_key || process.env.CTFD_API_KEY;

//     if (!ctfdUrl || !ctfdKey) {
//       console.log("ctfd URL belum diset")
//       // await sendMessageWTyping(
//       //   sock,
//       //   { text: '❌ CTFd config belum di setup! Gunakan .ctfd url dan .ctfd token' },
//       //   jid
//       // );
//       return null;
//     }

//     const response = await axios.get(`${ctfdUrl}/api/v1/${endpoint}`, {
//       headers: {
//         'Authorization': `Token ${ctfdKey}`,
//         'Content-Type': 'application/json'
//       },
//       timeout: 15000, // Naikkan timeout
//     });

//     console.log(`${ctfdUrl}/api/v1/${endpoint}`)
//     return response.data.data;

//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//     // console.log(`${ctfdUrl}/api/v1/${endpoint}`)
//     console.error(`CTFd API Error (${endpoint}):`, errorMessage);
//     // await sendMessageWTyping(
//     //   sock,
//     //   { text: `❌ Gagal akses CTFd API: ${errorMessage}` },
//     //   jid
//     // );
//     return null;
//   }
// }

export async function getCTFDdata(endpoint: string, sock: WASocket, jid: string): Promise<any> {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000;
  let retries = 0;

  const config = await getCtfdConfig();
  const ctfdUrl = config.url || process.env.CTFD_URL;
  const ctfdKey = config.api_key || process.env.CTFD_API_KEY;

  if (!ctfdUrl || !ctfdKey) {
    console.log("CTFd config belum di-set");
    return null;
  }

  while (retries < MAX_RETRIES) {
    // tanpa retrires kadang return 400
    // server mu gak kuat
    try {
      const response = await axios.get(`${ctfdUrl}/api/v1/${endpoint}`, {
        headers: {
          'Authorization': `Token ${ctfdKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000,
      });

      console.log(`[CTFd] Success: ${endpoint}`);
      return response.data.data;
    } catch (error) {
      retries++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log error detail
      if (axios.isAxiosError(error)) {
        console.error(`[CTFd] Error (${endpoint}):`, {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
      } else {
        console.error(`[CTFd] Error (${endpoint}):`, errorMessage);
      }

      if (retries >= MAX_RETRIES) {
        console.error(`[CTFd] Gagal setelah ${MAX_RETRIES} percobaan`);
        return null;
      }

      // exponential backoff
      const delay = BASE_DELAY * Math.pow(2, retries) + Math.random() * 1000;
      console.log(`[CTFd] Retry ${retries} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
}

async function getUserDetails(userId: number, sock: WASocket, jid: string): Promise<string> {
  try {
    const userData = await getCTFDdata(`users/${userId}`, sock, jid);
    return userData?.name || 'Unknown User';
  } catch (error) {
    console.error(`Error fetching user details for ID ${userId}:`, error);
    return 'Unknown User';
  }
}

async function checkBloodsOnly(sock: WASocket, jid: string): Promise<void> {
  try {
    const challenges = await getCTFDdata('challenges', sock, jid);
    if (!challenges) return;

    const globalBloods = await getGlobalBloods(); // { [cid]: [uids] }

    for (const ch of challenges) {
      const solves = (await getCTFDdata(`challenges/${ch.id}/solves`, sock, jid)) as Solve[];
      if (!solves?.length) continue;

      solves.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const notified = globalBloods[ch.id] || [];
      if (notified.length >= 3) continue;

      const labels: BloodLabel[] = ['first', 'second', 'third'];

      for (const solve of solves) {
        if (notified.includes(solve.account_id)) continue;
        if (notified.length >= 3) break;

        const userName = await getUserDetails(solve.account_id, sock, jid);
        const label = labels[notified.length];

        const msg = getRandomBloodMessage(label, {
          user: userName,
          team: solve.team || 'No Team',
          challenge: ch.name,
        });
        
        const timeString = `🕒 ${new Date(solve.date).toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
        })}`;

        await sendMessageWTyping(sock, { text: `${msg}\n\n${timeString}` }, jid);
        await setGlobalBlood(ch.id, solve.account_id);
        notified.push(solve.account_id);
      }
    }
  } catch (error) {
    console.error('[Monitoring] Error:', error);
    await sendMessageWTyping(
      sock,
      { text: '❌ Error occured when monitoring bloods!' },
      jid
    );
  }
}

// async function checkFirstBloodsAndSolves(sock: WASocket, jid: string): Promise<void> {
//   try {
//     const challenges = await getCTFDdata('challenges', sock, jid);
//     if (!challenges) return;

//     const globalFirstBloods = await getGlobalFirstBloods();
//     const globalSolves = await getGlobalSolvedChallenges();

//     for (const challenge of challenges) {
//       const challengeId = challenge.id;
//       const solves = await getCTFDdata(`challenges/${challengeId}/solves`, sock, jid);
//       if (!solves || solves.length === 0) continue;

//       if (!globalFirstBloods[challengeId]) {
//         const firstSolve = solves[0];
//         const adjustedUserId = firstSolve.account_id;
//         const userName = await getUserDetails(adjustedUserId, sock, jid);
        
//         const msg = [
//           '🩸 *FIRST BLOOD!* 🩸',
//           `*Challenge*: ${challenge.name}`,
//           `*User*: ${userName}`,
//           `*Team*: ${firstSolve.team || 'No Team'}`,
//           `*Time*: ${new Date(firstSolve.date).toLocaleString('id-ID', {
//             timeZone: 'Asia/Jakarta'
//           })}`
//         ].join('\n');

//         await sendMessageWTyping(sock, { text: msg }, jid);
//         await setGlobalFirstBlood(challengeId);
//       }

//       for (const solve of solves) {
//         const solveKey = `${challengeId}_${solve.account_id}`;
//         if (globalSolves[solveKey]) continue;

//         const adjustedUserId = solve.account_id;
//         const userName = await getUserDetails(adjustedUserId, sock, jid);
        
//         const msg = [
//           '✅ *SOLVE!* ✅',
//           `*Challenge*: ${challenge.name}`,
//           `*User*: ${userName}`,
//           `*Team*: ${solve.team || 'No Team'}`,
//           `*Time*: ${new Date(solve.date).toLocaleString('id-ID', {
//             timeZone: 'Asia/Jakarta'
//           })}`
//         ].join('\n');

//         await sendMessageWTyping(sock, { text: msg }, jid);
//         await setGlobalSolvedChallenge(challengeId, solve.account_id);
//       }
//     }
//   } catch (error) {
//     console.error('Monitoring error:', error);
//     await sendMessageWTyping(
//       sock,
//       { text: '❌ Terjadi error saat monitoring first blood/solves!' },
//       jid
//     );
//   }
// }


let isMonitoring = false;
let currentLoop: Promise<void> | null = null;

async function monitoringLoop(sock: WASocket, jid: string, interval: number) {
  while (isMonitoring) {
    const startTime = Date.now();
    
    try {
     // await checkFirstBloodsAndSolves(sock, jid);
     await checkBloodsOnly(sock, jid);
    } catch (error) {
      console.error('[Monitoring] Error:', error);
    }
    
    const elapsed = Date.now() - startTime;
    const delay = Math.max(interval * 1000 - elapsed, 0);
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

export function startCTFdMonitor(sock: WASocket, jid: string, interval: number = 30): void {
  if (isMonitoring) {
    sendMessageWTyping(sock, { text: '⚠️ Monitor started!' }, jid);
    return;
  }

  isMonitoring = true;
  currentLoop = monitoringLoop(sock, jid, interval);
  sendMessageWTyping(sock, { 
    text: `✅ CTFd monitor started! Interval: ${interval} detik` 
  }, jid);
}

export async function stopCTFdMonitor(sock: WASocket, jid: string): Promise<void> {
  if (!isMonitoring) {
    sendMessageWTyping(sock, { text: '⚠️ Monitor still not run yet!' }, jid);
    return;
  }

  isMonitoring = false;
  if (currentLoop) {
    await currentLoop;
    currentLoop = null;
  }
  sendMessageWTyping(sock, { text: '🛑 CTFd monitor stopped!' }, jid);
}