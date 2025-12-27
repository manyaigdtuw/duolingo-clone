import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async () => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows: data } = await db.query("SELECT * FROM courses");

  return NextResponse.json(data);
};

export const POST = async (req) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();

  const { rows: data } = await db.query(
    "INSERT INTO courses (title, image_src) VALUES ($1, $2) RETURNING *",
    [body.title, body.imageSrc]
  );

  return NextResponse.json(data[0]);
};
