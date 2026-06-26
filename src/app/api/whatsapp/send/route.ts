import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const WHATSAPP_API = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "WHATSAPP_ACCESS_TOKEN غير مضبوط" }, { status: 500 });
  }

  try {
    const { clientId, message } = await req.json();
    if (!clientId || !message?.trim()) {
      return NextResponse.json({ error: "العميل والرسالة مطلوبان" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, fullName: true, phone: true },
    });

    if (!client) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    let phone = client.phone.replace(/[^0-9]/g, "");
    if (!phone.startsWith("966") && !phone.startsWith("+966")) {
      if (phone.startsWith("05")) phone = "966" + phone.slice(1);
      else if (phone.startsWith("5")) phone = "966" + phone;
    }

    const whatsappRes = await fetch(WHATSAPP_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    const whatsappData = await whatsappRes.json();

    if (!whatsappRes.ok) {
      console.error("WhatsApp API error:", whatsappData);
      return NextResponse.json(
        { error: whatsappData.error?.message || "فشل إرسال الرسالة" },
        { status: 500 }
      );
    }

    await prisma.clientInteraction.create({
      data: {
        clientId: client.id,
        type: "WHATSAPP",
        note: `مرسل إلى ${client.fullName}:\n${message}`,
        createdById: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, messageId: whatsappData.messages?.[0]?.id });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "فشل إرسال الرسالة" },
      { status: 500 }
    );
  }
}
