import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, SlidersHorizontal } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Chat } from "./right/Chat";
import { Equalizer } from "./right/Equalizer";

export const Right = () => {
  return (
    <div className="w-full bg-transparent flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <div className="p-2 pb-0 flex-shrink-0">
          <TabsList className="bg-neutral-900 w-full">
            <TabsTrigger
              value="chat"
              className="flex-1 data-[state=active]:!bg-[#b026ff] data-[state=active]:!text-black"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="equalizer"
              className="flex-1 data-[state=active]:!bg-[#b026ff] data-[state=active]:!text-black"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              EQ
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="relative">
          <Separator className="bg-neutral-800/50" />
          {/* <div
            className="
              pointer-events-none
              absolute left-0 right-0 top-full h-3
              bg-gradient-to-b from-neutral-900/80 to-transparent
              transition-opacity duration-300
            "
          /> */}
        </div>
        <TabsContent value="chat" className="flex-1 overflow-hidden h-full">
          <Chat />
        </TabsContent>
        <TabsContent value="equalizer" className="flex-1 overflow-auto h-full">
          <Equalizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};
