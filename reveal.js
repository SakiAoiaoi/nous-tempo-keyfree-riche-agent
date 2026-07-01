import fs from "fs";

const LOG_FILE = "./secret-log.json";

if (!fs.existsSync(LOG_FILE)) {
  console.log("secret-log.json がありません。先に npm run shop を実行してください。");
  process.exit(0);
}

const logs = JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));

if (logs.length === 0) {
  console.log("まだ秘密の日誌は空です。先に npm run shop を実行してください。");
  process.exit(0);
}

const latest = logs[logs.length - 1];

console.log("\n📕 Riche opens the secret diary...\n");

console.log("👧 Riche:");
console.log("“先生、本当はどうしてそれを買ったんですか？”\n");

console.log("🧑‍🏫 Teacher Keyfree:");
console.log(`“表向きの理由は、${latest.publicReason}”\n`);

console.log("🛍️ Bought:");
console.log(latest.item + "\n");

console.log("🐈 Tempo tx:");
console.log(latest.payment.txHash + "\n");

console.log("📕 True feeling:");
console.log(latest.trueFeeling + "\n");
