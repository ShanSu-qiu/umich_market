import { createClient } from "./client"

export async function uploadListingImages(
  files: (File | null)[],
  userId: string
): Promise<string[]> {
  const supabase = createClient()

  // Verify we have an authenticated user before uploading
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated. Please sign in and try again.")
  }

  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const urls: string[] = []

  for (const file of files) {
    if (!file) continue

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`)
    }
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`File "${file.name}" has an invalid type. Only JPEG, PNG, WebP, GIF, and HEIC are allowed.`)
    }

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
