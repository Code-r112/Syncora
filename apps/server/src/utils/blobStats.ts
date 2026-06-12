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
