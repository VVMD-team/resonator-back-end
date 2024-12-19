export const fetchFileFromPublicUrl = async (publicUrl: string) => {
  try {
    const response = await fetch(publicUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error fetching file:", error);
    throw error;
  }
};
