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

    // Retry up to 3 times to handle lock conflicts
    let lastError: unknown = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase.storage
        .from("listing-images")
        .upload(fileName, file, { upsert: true })

      if (!error) {
        lastError = null
        break
      }

      lastError = error
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
      }
    }

    if (lastError) {
      throw lastError
    }

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(fileName)

    urls.push(data.publicUrl)
  }

  return urls
}
