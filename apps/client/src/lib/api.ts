import { DiscoverRoomsType, GetActiveRoomsType, GetDefaultAudioType } from "@beatsync/shared";
import axios from "axios";
import { getApiUrl } from "./urls";

const baseAxios = axios.create({
  get baseURL() {
    return getApiUrl();
  },
});

export const uploadAudioFile = async (data: { file: File; roomId: string }) => {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("roomId", data.roomId);

    // Assuming a new simplified upload endpoint will be built
    const response = await baseAxios.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      publicUrl: response.data?.publicUrl,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to upload audio file");
    }
    throw error;
  }
};

export const fetchAudio = async (url: string) => {
  try {
    // Direct fetch from R2 public URL - zero server bandwidth
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    throw new Error(`Failed to fetch audio: ${error}`);
  }
};

export async function fetchDefaultAudioSources() {
  try {
    const response = await fetch(`${getApiUrl()}/default`);

    if (!response.ok) {
      console.error("Failed to fetch default audio sources:", response.status);
      return [];
    }

    const files: GetDefaultAudioType = await response.json();
    return files;
  } catch (error) {
    console.error("Error fetching default audio sources:", error);
    return [];
  }
}

export async function fetchActiveRooms() {
  const response = await fetch(`${getApiUrl()}/active-rooms`);
  const data: GetActiveRoomsType = await response.json();
  return data;
}

export async function fetchDiscoverRooms() {
  const response = await fetch(`${getApiUrl()}/discover`);
  const data: DiscoverRoomsType = await response.json();
  return data;
}
