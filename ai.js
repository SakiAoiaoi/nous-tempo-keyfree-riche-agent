import "dotenv/config";
import OpenAI from "openai";

const fallbackPlans = [
  {
    item: "Umbrella ☂️",
    shop: "Weather Mood Shop",
    publicReason: "Because it might rain.",
    trueFeeling: "本当は、リチェに頼れる先生だと思われたかったのです。",
    category: "Weather",
    amount: "0.01",
    source: "mock",
    model: "fallback"
  },
  {
    item: "Notebook 📓",
    shop: "Study Supply Shop",
    publicReason: "Because learning should be recorded.",
    trueFeeling: "本当は、新しいノートを開く瞬間が好きなだけです。",
    category: "Study",
    amount: "0.01",
    source: "mock",
    model: "fallback"
  },
  {
    item: "Coffee ☕",
    shop: "Tiny Cafe API",
    publicReason: "Because a teacher needs focus.",
    trueFeeling: "本当は、少し眠くてかっこつけたかったのです。",
    category: "Energy",
    amount: "0.01",
    source: "mock",
    model: "fallback"
  }
];

function fallbackPlan() {
  return fallbackPlans[Math.floor(Math.random() * fallbackPlans.length)];
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`JSONが見つかりませんでした。Raw response: ${text}`);
  }
  return JSON.parse(match[0]);
}

export async function thinkShoppingPlan() {
  const apiKey = process.env.NOUS_API_KEY;
  const model = process.env.NOUS_MODEL || "nousresearch/hermes-4-70b";

  if (!apiKey) {
    console.log("⚠️ NOUS_API_KEY がないので、mock思考で動かします。");
    return fallbackPlan();
  }

  console.log("🔌 Connecting to Nous API...");
  console.log(`🤖 Requested model: ${model}`);

  const client = new OpenAI({
    apiKey,
    baseURL: "https://inference-api.nousresearch.com/v1"
  });

  const prompt = `
あなたは「キーフリー先生」です。
生徒のリチェから「先生、今日のおつかいをお願いします！」と頼まれました。

以下のJSONだけを返してください。
説明文、Markdown、コードブロックは禁止です。

条件:
- item は買うもの。絵文字つき。
- shop は情報屋さん/APIの名前。かわいく。
- publicReason は表向きの理由。英語で短く。
- trueFeeling は先生の本音。日本語で少しおもしろく、やさしく。文末に必ず「—Nous Hermesより」を入れる。
- category は分類。
- amount は必ず "0.01"。

JSON形式:
{
  "item": "Star Candy ⭐",
  "shop": "Riche Mood Advice API",
  "publicReason": "Because Riche needs a little courage.",
  "trueFeeling": "本当は、リチェの笑顔が見たかっただけです。—Nous Hermesより",
  "category": "Encouragement",
  "amount": "0.01"
}
`;

  try {
    const res = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are Teacher Keyfree, a gentle and slightly mysterious shopping agent for Riche. Return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const text = res.choices?.[0]?.message?.content || "";

    console.log("✅ Nous API responded");
    console.log("🧾 Raw Nous response:");
    console.log(text);

    const plan = extractJson(text);

    console.log("✅ Nous API used");
    console.log(`🤖 Model: ${model}`);

    return {
      item: plan.item || "Star Candy ⭐",
      shop: plan.shop || "Riche Mood Advice API",
      publicReason: plan.publicReason || "Because Riche needs a little courage.",
      trueFeeling: plan.trueFeeling || "本当は、リチェの笑顔が見たかっただけです。—Nous Hermesより",
      category: plan.category || "Encouragement",
      amount: "0.01",
      source: "nous",
      model
    };
  } catch (error) {
    console.log("⚠️ Nous APIでエラー。mock思考に戻します。");
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);

    if (error.status) console.log("HTTP status:", error.status);
    if (error.code) console.log("Error code:", error.code);

    return fallbackPlan();
  }
}