import { adminRest, requireToken } from "@/lib/auth";
import { ApiError, rest } from "@/lib/api";
import { Buffer } from "node:buffer";

export async function uploadMedia(input: {
  mime: string;
  dataBase64: string;
  width: number | null;
  height: number | null;
  altText?: string | null;
}) {
  await requireToken();
  const row = await adminRest<{ id: string }[]>("/rest/v1/rpc/upload_media", {
    method: "POST",
    body: JSON.stringify({
      p_mime: input.mime,
      p_data_base64: input.dataBase64,
      p_width: input.width,
      p_height: input.height,
      p_alt_text: input.altText || null
    })
  });
  return Array.isArray(row) ? row[0] : row;
}

export async function getMedia(id: string) {
  const rows = await rest<{ mime: string; data_base64: string }[]>(
    "/rest/v1/rpc/get_media",
    {
      method: "POST",
      body: JSON.stringify({ p_id: id })
    }
  );

  const media = Array.isArray(rows) ? rows[0] : rows;
  if (!media?.data_base64) throw new ApiError("Media not found", 404);

  return {
    mime: media.mime,
    data: Buffer.from(media.data_base64, "base64")
  };
}
