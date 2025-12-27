import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async () => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows: data } = await db.query("SELECT * FROM challenges");

  return NextResponse.json(data);
};

export const POST = async (req) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();

  const { rows: data } = await db.query(
    'INSERT INTO challenges (lesson_id, type, question, "order") VALUES ($1, $2, $3, $4) RETURNING *',
    [body.lessonId, body.type, body.question, body.order]
  );

  return NextResponse.json(data[0]);
};
