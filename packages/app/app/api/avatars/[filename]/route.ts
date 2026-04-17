import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Basic security: only allow alphanumeric, hyphens, underscores, and a single dot for extension
  if (!/^[\w-]+\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = join(process.cwd(), "public", "avatars", filename);

  try {
    const file = await readFile(filePath);
    const ext = filename.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png" ? "image/png" :
      ext === "gif" ? "image/gif" :
      ext === "webp" ? "image/webp" :
      "image/jpeg";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
