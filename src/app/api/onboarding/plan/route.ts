import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planType, businessName } = await request.json();

  if (!planType) {
    return NextResponse.json({ error: "planType is required" }, { status: 400 });
  }

  try {
    // 個人選択時のみ、自動でコンテキスト（プロジェクト）を生成
    if (planType === "personal" && businessName) {
      await db.insert(projects).values({
        userId: session.user.id,
        name: businessName,
        description: "個人プラン初期コンテキスト",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create initial context:", error);
    return NextResponse.json({ error: "Failed to create context" }, { status: 500 });
  }
}

