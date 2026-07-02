import "dotenv/config";
import OpenAI from "openai";

const fallbackPlans = [
  {
    item: "Umbrella ☂️",
    shop: "Weather Mood Shop",
    publicReason: "Because it might rain.",
    trueFeeling:
      "本当は、リチェに頼れる先生だと思われたかったのです。",
    category: "Weather",
    amount: "1.0",
    amountReason: "A simple umbrella only needs a small budget.",
    source: "mock",
    model: "fallback"
  },
  {
    item: "Notebook 📓",
    shop: "Study Supply Shop",
    publicReason: "Because learning should be recorded.",
    trueFeeling:
      "本当は、新しいノートを開く瞬間が好きなだけです。",
    category: "Study",
    amount: "2.0",
    amountReason: "A good notebook is worth a moderate budget.",
    source: "mock",
    model: "fallback"
  },
  {
    item: "Coffee ☕",
    shop: "Tiny Cafe API",
    publicReason: "Because a teacher needs focus.",
    trueFeeling:
      "本当は、少し眠くてかっこつけたかったのです。",
    category: "Energy",
    amount: "1.5",
    amountReason: "A small coffee does not require a large payment.",
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

function validateAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new Error(`Nousが返した金額が数値ではありません: ${value}`);
  }

  if (amount < 1 || amount > 5) {
    throw new Error(
      `Nousが返した金額が1.0〜5.0の範囲外です: ${amount}`
    );
  }

  // 0.1刻みに丸める
  const rounded = Math.round(amount * 10) / 10;

  return rounded.toFixed(1);
}

export async function thinkShoppingPlan() {
  const apiKey = process.env.NOUS_API_KEY;
  const model =
    process.env.NOUS_MODEL || "nousresearch/hermes-4-70b";

  if (!apiKey) {
    console.log(
      "⚠️ NOUS_API_KEY がないので、mock思考で動かします。"
    );

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
生徒のリチェから、
「先生、今日のおつかいをお願いします！」
と頼まれました。

買う物、店、理由、先生の本音、支払う金額を考えてください。

以下のJSONだけを返してください。
説明文、Markdown、コードブロックは禁止です。

条件:
- item は買うもの。絵文字つき。
- shop はお店または情報屋さんAPIの名前。かわいく。
- publicReason は表向きの理由。英語で短く。
- trueFeeling は先生の本音。日本語で少し面白く、やさしく。
- trueFeeling の文末には必ず「—Nous Hermesより」を入れる。
- category は分類。
- amount は "1.0" から "5.0" の範囲。
- amount は必ず0.1ドル刻み。
- amount は買う物の価値や理由に合わせて、先生が判断する。
- amountReason は、なぜその金額にしたかを英語で短く説明する。

JSON形式:
{
  "item": "Moonlight Candle 🕯️",
  "shop": "Luminous Lore API",
  "publicReason": "For a cozy study atmosphere.",
  "trueFeeling": "星明かりよりも、リチェの輝きを守りたいからです。—Nous Hermesより",
  "category": "Comfort",
  "amount": "2.7",
  "amountReason": "A special candle deserves a slightly higher budget."
}
`;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are Teacher Keyfree, a gentle and slightly mysterious shopping agent for Riche. Return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 400
    });

    const text =
      response.choices?.[0]?.message?.content || "";

    console.log("✅ Nous API responded");
    console.log("🧾 Raw Nous response:");
    console.log(text);

    const plan = extractJson(text);
    const validatedAmount = validateAmount(plan.amount);

    console.log("✅ Nous API used");
    console.log(`🤖 Model: ${model}`);
    console.log(
      `💰 Nous decided payment amount: ${validatedAmount} USDC`
    );

    return {
      item: plan.item || "Star Candy ⭐",
      shop: plan.shop || "Riche Mood Advice API",
      publicReason:
        plan.publicReason ||
        "Because Riche needs a little courage.",
      trueFeeling:
        plan.trueFeeling ||
        "本当は、リチェの笑顔が見たかっただけです。—Nous Hermesより",
      category: plan.category || "Encouragement",
      amount: validatedAmount,
      amountReason:
        plan.amountReason ||
        "Teacher Keyfree selected a suitable budget.",
      source: "nous",
      model
    };
  } catch (error) {
    console.log(
      "⚠️ Nous APIまたは金額検証でエラー。mock思考に戻します。"
    );
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);

    if (error.status) {
      console.log("HTTP status:", error.status);
    }

    if (error.code) {
      console.log("Error code:", error.code);
    }

    return fallbackPlan();
  }
}
