"use client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SOCIAL_LINKS } from "@/constants";
import { fetchActiveRooms } from "@/lib/api";
import { generateName } from "@/lib/randomNames";
import { validateFullRoomId, validatePartialRoomId } from "@/lib/room";
import { useRoomStore } from "@/store/room";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Crown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { toast } from "sonner";
import { ActiveRooms } from "./ActiveRooms";
// import { AnnouncementBanner } from "./AnnouncementBanner";

interface JoinFormData {
  roomId: string;
}

export const Join = () => {
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const setUsername = useRoomStore((state) => state.setUsername);
  const username = useRoomStore((state) => state.username);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<JoinFormData>({
    defaultValues: {
      roomId: "",
    },
  });

  useEffect(() => {
    // Set a random username when component mounts
    const generatedName = generateName();
    setUsername(generatedName);
  }, [setValue, setUsername]);

  const { data: numActiveUsers } = useQuery({
    queryKey: ["active-rooms"],
    queryFn: fetchActiveRooms,
    refetchInterval: 300, // Poll every
  });

  const router = useRouter();

  const onSubmit = (data: JoinFormData) => {
    setIsJoining(true);
    // Validate roomId
    if (!validateFullRoomId(data.roomId)) {
      toast.error("Invalid room code. Please enter 6 digits.");
      setIsJoining(false);
      return;
    }

    console.log("Joining room with data:", {
      roomId: data.roomId,
      username,
    });
    router.push(`/room/${data.roomId}`);
  };

  const handleCreateRoom = () => {
    setIsCreating(true);

    // Generate a random 6-digit room ID
    const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();

    router.push(`/room/${newRoomId}`);
  };

  const handleRegenerateName = () => {
    const newName = generateName();
    setUsername(newName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center py-8"
    >
      {/* Top-left app name */}
      <div className="fixed top-0 left-0 right-0 px-6 py-4 flex items-center z-10 gap-2">
        <Crown className="w-5 h-5 text-[#b026ff]" fill="currentColor" />
        <span className="text-white font-bold text-xl tracking-tight">Syncora</span>
      </div>
      {/* <AnnouncementBanner /> */}
      <div className="w-full px-6 md:px-4 lg:px-1 max-w-[28rem] mx-auto">
        <motion.div
          className="flex flex-col items-center justify-center p-6 md:p-8 bg-[#121212] rounded-2xl mx-auto shadow-2xl"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {numActiveUsers && numActiveUsers > 0 ? (
            <motion.div
              className="flex items-center gap-1.5 mb-3"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <motion.div className="relative flex items-center justify-center">
                <motion.div className="size-2 bg-[#b026ff] rounded-full" />
                <motion.div className="absolute size-2.5 bg-[#b026ff]/30 rounded-full animate-ping" />
              </motion.div>
              <span className="text-xs text-neutral-500 ml-0.5">
                {numActiveUsers} {numActiveUsers === 1 ? "person" : "people"} listening now
              </span>
            </motion.div>
          ) : null}
          <motion.h2
            className="text-xl md:text-2xl font-bold tracking-tight mb-1 md:mb-2 text-white"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.13 }}
          >
            Join a Syncora Room
          </motion.h2>

          <motion.p
            className="text-[#b3b3b3] mb-5 md:mb-8 text-center text-xs md:text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Enter a room code to join or create a new room
          </motion.p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Controller
                control={control}
                name="roomId"
                rules={{ required: "Room code is required" }}
                render={({ field }) => (
                  <InputOTP
                    autoFocus
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    data-lpignore="true"
                    data-1p-ignore
                    data-form-type="other"
                    value={field.value}
                    onChange={(value) => {
                      // Only set the value if it contains only digits
                      if (validatePartialRoomId(value)) {
                        field.onChange(value);

                        // Auto-submit when 6 digits are entered
                        if (value.length === 6) {
                          // handleSubmit(onSubmit)();
                          // Small delay to ensure UI updates before submission
                          setTimeout(() => {
                            handleSubmit(onSubmit)();
                          }, 100);
                        }
                      }
                    }}
                    className="gap-2"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-9 h-11 md:w-10 md:h-12 text-base md:text-lg font-bold bg-[#1a1a1a] border-0 rounded-md transition-all duration-200 
                          focus-within:bg-[#282828] focus-within:ring-2 focus-within:ring-[#b026ff]"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
            </motion.div>
            {errors.roomId && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-red-500 text-center mt-1"
              >
                {errors.roomId.message}
              </motion.p>
            )}

            <motion.div
              className="flex items-center justify-center mt-5"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <div className="text-sm font-medium text-[#b3b3b3]">
                You&apos;ll join as{" "}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={username}
                    className="text-[#b026ff] font-bold inline-block"
                    initial={{
                      opacity: 0,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      filter: "blur(8px)",
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    {username}
                  </motion.span>
                </AnimatePresence>
              </div>
              <Button
                type="button"
                onClick={handleRegenerateName}
                variant="ghost"
                className="text-xs text-neutral-500 hover:text-neutral-300 ml-2 h-6 px-2"
                disabled={isJoining || isCreating}
              >
                Regenerate
              </Button>
            </motion.div>

            <div className="flex flex-col gap-3 mt-6">
              <motion.button
                type="button"
                className="px-6 py-3.5 bg-[#b026ff] text-white rounded-full font-bold text-sm tracking-wide cursor-pointer w-full hover:bg-[#a21ee0] transition-colors flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={handleCreateRoom}
                disabled={isJoining || isCreating}
              >
                {isCreating ? (
                  <motion.div
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <PlusCircle size={16} className="mr-2" />
                  </motion.div>
                ) : (
                  <PlusCircle size={16} className="mr-2" />
                )}
                <span>{isCreating ? "Creating..." : "Create new room"}</span>
              </motion.button>

              {/* <motion.button
                  className="px-5 py-2 rounded-full font-medium text-sm tracking-wide cursor-pointer w-full hover:shadow-md hover:shadow-zinc-600/40 transition-shadow duration-500 flex items-center justify-center bg-neutral-800 text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{
                    scale: 1.015,
                  }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.3 }}
                  onClick={handleCreateRoom}
                  disabled={isJoining || isCreating}
                >
                  {isCreating ? (
                    <motion.div
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <PlusCircle size={16} className="mr-2" />
                    </motion.div>
                  ) : (
                    <PlusCircle size={16} className="mr-2" />
                  )}
                  <span>{isCreating ? "Creating..." : "Create new room"}</span>
                </motion.button> */}
            </div>
          </form>

          <motion.p
            className="text-[#b3b3b3] mt-6 md:mt-8 text-center text-[11px] md:text-xs font-medium leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Sync music seamlessly with long-distance friends.
          </motion.p>
        </motion.div>

        {/* Creator branding */}
        <motion.div
          className="flex flex-col items-center mt-4 md:mt-6 gap-0.5 md:gap-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <span className="text-neutral-400 text-sm font-medium tracking-wide">
            Created by{" "}
            <a
              href="https://github.com/kpran"
              target="_blank"
              rel="noreferrer"
              className="text-[#b026ff] hover:underline font-bold transition-all"
            >
              Pranav Kokate
            </a>
          </span>
          <span className="text-white text-2xl font-bold tracking-tight">Syncora</span>
        </motion.div>

        {/* Active Rooms Section */}
        <ActiveRooms />
      </div>
    </motion.div>
  );
};
