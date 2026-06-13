interface FileInfo {
  key: string;
  size: string;
  sizeBytes: number;
  publicUrl: string;
}

interface RoomDetail {
  fileCount: number;
  totalSize: string;
  totalSizeBytes: number;
  files: FileInfo[];
}

interface BlobStats {
  error?: string;
  totalObjects: number;
  totalRooms: number;
  totalSize: string;
  totalSizeBytes: number;
  activeRooms: Record<string, RoomDetail>;
  orphanedRooms: Record<string, RoomDetail>;
  orphanedCount: number;
}

export async function getBlobStats(): Promise<BlobStats> {
  return {
    totalObjects: 0,
    totalRooms: 0,
    totalSize: "0 B",
    totalSizeBytes: 0,
    activeRooms: {},
    orphanedRooms: {},
    orphanedCount: 0,
  };
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
