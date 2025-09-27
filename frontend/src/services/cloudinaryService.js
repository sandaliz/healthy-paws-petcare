const API_KEY = "536664227351389";
//const SECRET_KEY = "xS4KcExhPYwUPpGu_Rn6zWFmDXA";
const CLOUD_NAME = "dansyarsa";
const PRESET = "fqasgarp";

const cloudinaryService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", PRESET);
    formData.append("api_key", API_KEY);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default cloudinaryService;
