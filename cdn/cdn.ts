const CDN_API_URL = "https://upload.imagekit.io/api/v1";

export async function uploadFile(
  filename: string,
  file: File,
  owner_id: string
): Promise<string | false> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", filename);
  formData.append("customMetadata", JSON.stringify({ owner_id }));
  formData.append("useUniqueFileName", "false");

  const response = await fetch(`${CDN_API_URL}/files/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Deno.env.get("CDN_KEY")}`,
      "Content-Type": "multipart/form-data",
    },
    body: formData,
  });

  if (response.ok) {
    const data = await response.json();
    return data.name;
  } else {
    throw false;
  }
}
