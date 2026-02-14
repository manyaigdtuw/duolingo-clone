import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query(
    "SELECT * FROM challenge_options WHERE id = $1",
    [params.challengeOptionId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};

export const PUT = async (req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  const { rows } = await db.query(
    "UPDATE challenge_options SET challenge_id = $1, text = $2, correct = $3, image_src = $4, audio_src = $5 WHERE id = $6 RETURNING *",
    [
      body.challengeId,
      body.text,
      body.correct,
      body.imageSrc,
      body.audioSrc,
      params.challengeOptionId,
    ]
  );
  const data = rows[0];

  return NextResponse.json(data);
};

export const DELETE = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query(
    "DELETE FROM challenge_options WHERE id = $1 RETURNING *",
    [params.challengeOptionId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};
