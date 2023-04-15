const CDN_API_URL = "https://upload.imagekit.io/api/v1";

export async function uploadFile(
  filename: string,
  file: Blob,
  owner_id: string,
): Promise<{ url: string; id: string } | false> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", filename);
  formData.append("customMetadata", JSON.stringify({ owner_id }));
  formData.append("useUniqueFileName", "true");

  const response = await fetch(`${CDN_API_URL}/files/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Deno.env.get("CDN_KEY")}`,
    },
    body: formData,
  });

  if (response.ok) {
    const data = await response.json();
    return {
      url: data.url,
      id: data.fileId,
    };
  } else {
    return false;
  }
}
