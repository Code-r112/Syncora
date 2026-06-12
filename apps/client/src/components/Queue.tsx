import React from "react";
import { cn } from "@/lib/utils";
import { useCanMutate, useGlobalStore } from "@/store/global";
import { AnimatePresence, motion } from "motion/react";
import { ListMusic } from "lucide-react";
import LoadDefaultTracksButton from "./LoadDefaultTracksButton";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { QueueSortableItem } from "./QueueSortableItem";

export const Queue = ({ className, ...rest }: React.ComponentProps<"div">) => {
  const audioSources = useGlobalStore((state) => state.audioSources);
  const isInitingSystem = useGlobalStore((state) => state.isInitingSystem);
  const broadcastReorder = useGlobalStore((state) => state.broadcastReorder);
  const canMutate = useCanMutate();
  // socket handled by child button component when needed

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent): void {
    if (!canMutate) return;
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = audioSources.findIndex((src) => src.source.url === active.id);
      const newIndex = audioSources.findIndex((src) => src.source.url === over.id);
      const newAudioSources = arrayMove(audioSources, oldIndex, newIndex);

      const modified = newAudioSources.map((it) => ({ url: it.source.url }));
      broadcastReorder(modified);
    }
  }

  return (
    <div className={cn("", className)} {...rest}>
      {/* <h2 className="text-xl font-bold mb-2 select-none">Beatsync</h2> */}
      <div className="space-y-1">
        {audioSources.length > 0 ? (
          canMutate ? (
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <SortableContext items={audioSources.map((src) => src.source.url)} strategy={verticalListSortingStrategy}>
                <AnimatePresence initial={true}>
                  {/* Ensure keys are stable and unique even if duplicates attempted */}
                  {audioSources.map((sourceState, index) => {
                    return (
                      <QueueSortableItem
                        key={sourceState.source.url}
                        id={sourceState.source.url}
                        sourceState={sourceState}
                        index={index}
                        canMutate={canMutate}
                      />
                    );
                  })}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          ) : (
            <AnimatePresence initial={true}>
              {/* Read-only view for non-admins */}
              {audioSources.map((sourceState, index) => {
                return (
                  <QueueSortableItem
                    key={sourceState.source.url}
                    id={sourceState.source.url}
                    sourceState={sourceState}
                    index={index}
                    canMutate={canMutate}
                  />
                );
              })}
            </AnimatePresence>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full min-h-[300px] text-center select-none flex flex-col items-center justify-center p-8"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
              <ListMusic className="w-8 h-8 text-neutral-500" strokeWidth={1.5} />
            </div>

            {isInitingSystem ? (
              <div className="text-neutral-400 font-medium">Loading tracks...</div>
            ) : canMutate ? (
              <>
                <h3 className="text-lg font-medium text-white mb-2">Queue is empty</h3>
                <p className="text-sm text-neutral-400 max-w-[250px] mb-6">
                  No song added yet. Add a track to get the party started!
                </p>
                <LoadDefaultTracksButton />
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-white mb-2">Queue is empty</h3>
                <p className="text-sm text-neutral-400 max-w-[250px]">
                  No song added yet. Wait for an admin to add tracks to the session.
                </p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
