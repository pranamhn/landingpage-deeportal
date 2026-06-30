import { handleApiError } from "@/lib/api/handleApiError";

// Add new function for file upload
export const uploadFileBlob = async (file: File, path: string) => {
  try {
    // Convert file to base64
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Get the base64 string without the data URL prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Send as JSON
    const authUrl =
      process.env.NEXT_PUBLIC_AUTH_API_URL || "https://auth.rentfms.com/api";
    const response = await fetch(authUrl + "/users/file_blob_uploader", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64String,
        folder: path,
      }),
    });

    const data = await response.json();
    return data.file;
  } catch (error: any) {
    return handleApiError(error);
  }
};

// Delete file from the server and update lead data
export const deleteFile = async (path: string) => {
  try {
    const authUrl =
      process.env.NEXT_PUBLIC_AUTH_API_URL || "https://auth.rentfms.com/api";
    const response = await fetch(authUrl + "/users/file_delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: path,
      }),
    });

    const data = await response.json();
    return data.file;
  } catch (error: any) {
    return handleApiError(error);
  }
};
