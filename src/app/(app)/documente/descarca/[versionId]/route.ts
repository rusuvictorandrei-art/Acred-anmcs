import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";

// Generează un link temporar (5 minute) pentru descărcarea unei versiuni.
export async function GET(_: Request, { params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params;
  const ctx = await getContext();
  const { data: v } = await ctx.supabase
    .from("document_versions")
    .select("file_path, file_name")
    .eq("id", versionId)
    .eq("hospital_id", ctx.hospitalId)
    .maybeSingle();
  if (!v) return new NextResponse("Fișierul nu există.", { status: 404 });
  const { data, error } = await ctx.supabase.storage
    .from("documents")
    .createSignedUrl(v.file_path, 300, { download: v.file_name });
  if (error || !data) return new NextResponse("Fișierul nu poate fi descărcat.", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
