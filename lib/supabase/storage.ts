import { createClient } from "./client"

export async function uploadListingImage(
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split(".").pop() || "jpg"
  const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage
    .from("listing-images")
    .upload(fileName, file)

  if (error) throw error

  const { data } = supabase.storage
    .from("listing-images")
    .getPublicUrl(fileName)

  return data.publicUrl
}
