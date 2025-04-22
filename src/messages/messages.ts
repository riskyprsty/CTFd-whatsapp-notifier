export const bloodMessages = {
    first: [
      "🩸 *FIRST BLOOD!* 🩸\n🥇 Team *{team}* was the first to conquer *{challenge}*! 💥",
      "⚔️ *FIRST STRIKE!* ⚔️\n🥇 *{team}* cracked *{challenge}* before anyone else!",
      "🚨 *FIRST SOLVE ALERT!* 🚨\n🥇 Challenge *{challenge}* has been defeated first by *{team}*!"
    ],
    second: [
      "🥈 *SECOND BLOOD!* 🩸\n🥈 Team *{team}* followed closely behind on *{challenge}*!",
      "🩸 *SECOND BLOOD!* 🩸\n🥈 *{team}* grabbed the *second solve* for *{challenge}*! ⚡",
      "🩸 *SECOND BLOOD!* 🩸\n🥈 Team: *{team}* secured second place on *{challenge}*!"
    ],
    third: [
      "🥉 *THIRD BLOOD!* 🩸\n🥉 *{team}* took the third spot for *{challenge}*!",
      "🥉 *THIRD BLOOD!* 🩸\n🥉 *{team}* lands third on *{challenge}* 🧠",
      "🥉 *THIRD BLOOD!* 🩸\n🥉 Team *{team}* claimed the third solve on *{challenge}*!"
    ]
  } as const;

  export type BloodLabel = keyof typeof bloodMessages;

  export interface BloodValues {
    team: string;
    challenge: string;
  }