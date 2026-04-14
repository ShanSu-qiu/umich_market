import { createClient } from "./client"

export async function uploadListingImages(
  files: (File | null)[],
  userId: string
): Promise<string[]> {
  const supabase = createClient()
  const urls: string[] = []

  for (const file of files) {
    if (!file) continue

    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(fileName, file, { upsert: true })

    if (error) {
      console.error("Upload failed for file:", file.name, error)
      throw error
    }

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(fileName)

    urls.push(data.publicUrl)
  }

  return urls
}
