"use client";

import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store/global";
import { sendWSRequest } from "@/utils/ws";
import { ClientActionEnum, PlaybackControlsPermissionsEnum } from "@beatsync/shared";
import { Crown, Play, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const PlaybackPermissions = () => {
  const currentUser = useGlobalStore((state) => state.currentUser);
  const socket = useGlobalStore((state) => state.socket);
  const playbackControlsPermissions = useGlobalStore((state) => state.playbackControlsPermissions);

  // Only show if socket is connected
  if (!socket) {
    return null;
  }

  const isAdmin = currentUser?.isAdmin || false;

  const isAdminOnly = playbackControlsPermissions === PlaybackControlsPermissionsEnum.enum.ADMIN_ONLY;

  const handleToggle = () => {
    const newPermission = isAdminOnly
      ? PlaybackControlsPermissionsEnum.enum.EVERYONE
      : PlaybackControlsPermissionsEnum.enum.ADMIN_ONLY;

    sendWSRequest({
      ws: socket,
      request: {
        type: ClientActionEnum.enum.SET_PLAYBACK_CONTROLS,
        permissions: newPermission,
      },
    });
  };

  return (
    <div className="px-4 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#b026ff]" />
              Admin Only Controls
            </h2>
            <p className="text-xs text-neutral-500 max-w-[200px]">Only room admins can pause, play, or skip tracks.</p>
          </div>
          <Switch
            checked={isAdminOnly}
            onCheckedChange={handleToggle}
            disabled={!isAdmin}
            className="data-[state=checked]:!bg-[#b026ff]"
          />
        </div>
      </div>
    </div>
  );
};
