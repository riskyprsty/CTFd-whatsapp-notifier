export const bloodMessages = {
    first: [
      "🩸 *FIRST BLOOD!* 🩸\n🥇 *{user}* from team *{team}* was the first to conquer *{challenge}*! 💥",
      "⚔️ *FIRST STRIKE!* ⚔️\n🥇 *{user}* of *{team}* cracked *{challenge}* before anyone else!",
      "🚨 *FIRST SOLVE ALERT!* 🚨\n🥇 Challenge *{challenge}* has been defeated first by *{user}* of *{team}*!"
    ],
    second: [
      "🩸 *SECOND BLOOD!* 🩸\n🥈 *{user}* from team *{team}* followed closely behind on *{challenge}*!",
      "🩸 *SECOND BLOOD!* 🩸\n🥈 *{user}* of *{team}* grabbed the *second solve* for *{challenge}*! ⚡",
      "🩸 *SECOND BLOOD!* 🩸\n🥈 *{user}* (Team: *{team}*) secured second place on *{challenge}*!"
    ],
    third: [
      "🩸 *THIRD BLOOD!* 🩸\n🥉 *{user}* from *{team}* took the third spot for *{challenge}*!",
      "🩸 *THIRD BLOOD!* 🩸\n🥉 *{user}* of *{team}* lands third on *{challenge}* 🧠",
      "🩸 *THIRD BLOOD!* 🩸\n🥉 *{user}* (Team: *{team}*) claimed the third solve on *{challenge}*!"
    ]
  } as const;

  export type BloodLabel = keyof typeof bloodMessages;

  export interface BloodValues {
    user: string;
    team: string;
    challenge: string;
  }