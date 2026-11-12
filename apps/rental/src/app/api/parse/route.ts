import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import type { ParsedField, ParseResult } from '../../../lib/types';
import { verifyUser } from '../../../lib/verify-user';

export const maxDuration = 60;

const MAX_IMAGES = 6;
const MAX_BASE64_CHARS = 3_000_000; // 單張約 2.2MB；前端已縮圖，這裡只是防呆

const FIELDS: ParsedField[] = [
  'title',
  'address',
  'rent',
  'layout',
  'size',
  'floor',
  'fees',
  'pets',
  'contactName',
  'phones',
  'lineIds',
  'igIds',
  'listingNo',
];

const schema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: '簡短標題，例如「西屯區 近逢甲獨立套房」' },
    address: { type: SchemaType.STRING, description: '盡量完整的地址；只有大概位置就寫大概位置；沒有就空字串' },
    rent: { type: SchemaType.INTEGER, nullable: true, description: '月租金（新台幣整數），沒有就 null' },
    layout: { type: SchemaType.STRING, description: '房型，例如 獨立套房、2房1廳' },
    size: { type: SchemaType.STRING, description: '坪數，例如「8 坪」' },
    floor: { type: SchemaType.STRING, description: '樓層，例如「4F/7F」' },
    fees: { type: SchemaType.STRING, description: '費用與條件：水電、管理費、網路、押金、租期等，用「·」分隔' },
    pets: { type: SchemaType.STRING, description: '寵物規定，例如「可養貓」「不可養寵物」，沒寫就空字串' },
    listingNo: { type: SchemaType.STRING, description: '物件編號（591 等平台的編號），沒有就空字串' },
    contactName: { type: SchemaType.STRING, description: '聯絡人稱呼，例如「王小姐」' },
    contactRole: { type: SchemaType.STRING, description: '身分：房東、代管、仲介，不確定就空字串' },
    phones: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: '所有電話號碼' },
    lineIds: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'LINE ID（不含「LINE:」前綴；官方帳號保留 @）。寫「LINE 同電話」就放那支電話號碼',
    },
    igIds: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Instagram 帳號（只留帳號名稱，不含 @ 和網址），沒有就空陣列',
    },
    uncertain: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING, format: 'enum', enum: FIELDS },
      description: '讀不清楚、只有大概、或推測出來的欄位名稱',
    },
  },
  required: [
    'title',
    'address',
    'rent',
    'layout',
    'size',
    'floor',
    'fees',
    'pets',
    'listingNo',
    'contactName',
    'contactRole',
    'phones',
    'lineIds',
    'igIds',
    'uncertain',
  ],
};

const PROMPT = `你是台灣租屋資訊整理助手。以下是同一間出租物件的截圖（可能來自 591、FB 社團或其他網站），請讀出物件資訊並依 JSON schema 回傳。

規則：
- 只寫截圖裡看得到的資訊，不要編造。看不到的字串欄位填空字串，租金填 null。
- 地址：盡量組成完整地址（含縣市、區、路名）；如果只寫「近逢甲」這種大概位置，就寫成「台中市西屯區 逢甲附近」之類，並把 address 放進 uncertain。
- 電話統一成「0912-345-678」或「04-2345-6789」格式。
- 截圖裡常見「加賴」「賴：」「ID：」都是 LINE ID；「IG」「Instagram」後面的帳號放進 igIds。
- 字太小、被裁掉、或你是推測的欄位，都放進 uncertain。
- 一律使用繁體中文。`;

export async function POST(request: NextRequest) {
  // 只有允許名單裡的 Google 帳號能呼叫 AI，避免網址外流後被別人消耗額度
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) {
    return NextResponse.json({ error: user.error }, { status: user.status });
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: '伺服器還沒設定 GOOGLE_AI_API_KEY' }, { status: 500 });
  }

  let images: { mimeType: string; data: string }[];
  try {
    const body = (await request.json()) as { images?: { mimeType: string; data: string }[] };
    images = body.images ?? [];
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  if (images.length === 0 || images.length > MAX_IMAGES) {
    return NextResponse.json({ error: `請上傳 1 到 ${MAX_IMAGES} 張截圖` }, { status: 400 });
  }
  if (
    images.some(
      (img) =>
        !/^image\/(jpeg|png|webp)$/.test(img.mimeType) ||
        typeof img.data !== 'string' ||
        img.data.length > MAX_BASE64_CHARS,
    )
  ) {
    return NextResponse.json({ error: '圖片格式或大小不符' }, { status: 400 });
  }

  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0 },
    });

    const result = await model.generateContent([
      { text: PROMPT },
      ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
    ]);

    const parsed = JSON.parse(result.response.text()) as ParseResult;
    parsed.uncertain = (parsed.uncertain ?? []).filter((f) => FIELDS.includes(f));
    parsed.phones = parsed.phones ?? [];
    parsed.lineIds = parsed.lineIds ?? [];
    parsed.igIds = parsed.igIds ?? [];
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Parse listing error:', error);
    return NextResponse.json({ error: 'AI 解析失敗，請再試一次' }, { status: 502 });
  }
}
