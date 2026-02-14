import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async () => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows: data } = await db.query("SELECT * FROM challenge_options");

  return NextResponse.json(data);
};

export const POST = async (req) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();

  const { rows: data } = await db.query(
    "INSERT INTO challenge_options (challenge_id, text, correct, image_src, audio_src) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [body.challengeId, body.text, body.correct, body.imageSrc, body.audioSrc]
  );

  return NextResponse.json(data[0]);
};
