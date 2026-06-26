import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `أنت مساعد متخصص في استخراج بيانات الهوية من صور بطاقات اللجوء والهوية.
مهمتك هي استخراج الحقول التالية من الصورة وإرجاعها بصيغة JSON فقط دون أي نص آخر:
{
  "fullName": "الاسم الكامل",
  "phone": "رقم الهاتف",
  "caseNumber": "رقم القضية",
  "email": "البريد الإلكتروني",
  "nationality": "الجنسية",
  "dateOfBirth": "تاريخ الميلاد بصيغة YYYY-MM-DD",
  "passportNumber": "رقم جواز السفر",
  "caseType": "نوع القضية"
}

إذا لم تجد قيمة لحقل معين، اتركه فارغاً (null).
لا تضف أي نص خارج JSON.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY غير مضبوط في المتغيرات البيئية" },
      { status: 500 }
    );
  }

  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageData = image.split(",")[1] || image;

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData,
        },
      },
    ]);

    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "لم يتمكن Gemini من استخراج البيانات", raw: response });
    }

    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Gemini scan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "فشل الاتصال بـ Gemini" },
      { status: 500 }
    );
  }
}
