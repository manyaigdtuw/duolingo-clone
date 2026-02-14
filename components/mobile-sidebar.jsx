import { Menu } from "lucide-react";

import { Sidebar } from "./sidebar";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";


export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="text-white" />
      </SheetTrigger>

      <SheetContent className="z-[100] p-0" side="left">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
