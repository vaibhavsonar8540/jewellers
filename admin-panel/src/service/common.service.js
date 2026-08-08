import { supabase } from "@/app/lib/db";

// Helper function to convert collection name into a URL-friendly slug
const createSlug = (text) => {
    if (!text) return "";
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

export const collectionService = async ({ name, imageFile }) => {
    let imageUrl = null;

    // 1. If an image file is provided, upload it to Supabase Storage bucket 'luxora' inside folder 'collection'
    if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `collection/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("luxora")
            .upload(filePath, imageFile, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase Storage Upload Error:", uploadError);
            throw uploadError;
        }

        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase
            .storage
            .from("luxora")
            .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
    }

    // 2. Insert new row into 'collections' table
    const slug = createSlug(name);
    const { data, error } = await supabase
        .from("collections")
        .insert([
            {
                name,
                slug,
                image_url: imageUrl,
            },
        ])
        .select();

    if (error) {
        console.error("Supabase Collection Insert Error:", error);
        throw error;
    }

    return { data, error };
};

