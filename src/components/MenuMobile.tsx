"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { UserProps } from "../types/interfaces";
import { linksNavegation } from "../utils/navegation-links";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

type UserPropsMenu = {
  user: UserProps;
  signOut?: () => void;
};

const MenuMobile = ({ user, signOut }: UserPropsMenu) => {
  const pathame = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Avatar className={cn("w-11 h-11 ")}>
          <AvatarImage src={user.image || ""} />
          <AvatarFallback className="bg-blue-800/40 border">
            {user.name?.charAt(0) || "G"}
          </AvatarFallback>
        </Avatar>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex-row gap-1.5 items-center">
          <div className="">
            <Avatar className={cn("w-11 h-11 ")}>
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="bg-blue-800/40 border">
                {user.name?.charAt(0) || "G"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col gap-1.5">
            <SheetTitle> {user.name || "G"}</SheetTitle>
            <span className="text-sm text-zinc-300"> {user.email || "G"}</span>
          </div>
        </SheetHeader>
        <Separator />
        <div className="w-full h-full flex flex-col gap-1.5 mt-3 p-3">
          {linksNavegation.map((lk) => (
            <Button
              variant={pathame === lk.href ? "default" : "outline"}
              key={lk.href}
              asChild
            >
              <Link href={lk.href} className="flex items-center gap-1.5">
                <lk.icon size={20} />
                <span>{lk.label}</span>
              </Link>
            </Button>
          ))}
        </div>
        <div className="w-full h-auto py-2.5 px-3">
          <Button variant="destructive" className="w-full" onClick={signOut}>
            <LogOutIcon className="text-white" size={20} />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuMobile;
