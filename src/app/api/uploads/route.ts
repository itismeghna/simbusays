import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createUploadTargets } from "@/lib/media";

const MAX_FILES = 20;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { files } = await request.json();
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Upload between 1 and ${MAX_FILES} files at a time.` },
      { status: 400 }
    );
  }

  try {
    const targets = await createUploadTargets(
      files.map((f: { name?: unknown }) => ({ name: String(f?.name ?? "") }))
    );
    return NextResponse.json({ targets });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
