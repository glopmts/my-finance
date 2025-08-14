"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@clerk/nextjs";
import { Loader, LogOutIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { trpc } from "../server/trpc/client";
import AuthModal from "./auth_components/auth-modal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const Header = () => {
  const { data: userData, refetch } = trpc.auth.me.useQuery();
  const [isClient, setIsClient] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    setIsClient(true);
    refetch();
  }, [refetch]);

  return (
    <header className="w-full h-auto dark:bg-zinc-900/20 sticky">
      <nav className="p-3 w-full h-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center w-full">
          <Link href="/" passHref>
            <div className="flex gap-2.5 cursor-pointer">
              <Image
                src="https://yt3.ggpht.com/Ymv0qwqF2x7qcDAvrE8bdAKxryVNnWi2fNQn_aCL_hSdK4zsySABbqX6sMvr1WJPX_lI9r2qnw=s600-c-k-c0x00ffffff-no-rj-rp-mo"
                alt="logo"
                width={36}
                height={36}
                sizes="100vw"
                className="object-cover rounded-md"
                priority
              />
              <div className="">
                <h2 className="text-xl font-semibold">My Finance</h2>
              </div>
            </div>
          </Link>

          {!isClient ? (
            <div className="w-auto">
              <Loader size={26} className="animate-spin" />
            </div>
          ) : userData ? (
            <div className="w-auto">
              <MenuUser userData={userData} signOut={signOut} />
            </div>
          ) : (
            <AuthModal />
          )}
        </div>
      </nav>
    </header>
  );
};

type PropsMenu = {
  userData: {
    image: string | null;
    name: string | null;
    email: string;
  };
  signOut: () => void;
};

function MenuUser({ userData, signOut }: PropsMenu) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className={cn("w-9 h-9")}>
          <AvatarImage src={userData.image || ""} />
          <AvatarFallback>{userData.name?.charAt(0) || "G"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex gap-2 items-center">
          <Avatar className={cn("w-9 h-9")}>
            <AvatarImage src={userData.image || ""} />
            <AvatarFallback>{userData.name?.charAt(0) || "G"}</AvatarFallback>
          </Avatar>
          <div className="">
            <span className="truncate line-clamp-1">
              {userData.name || "G"}
            </span>
            <span className="truncate line-clamp-1">{userData.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button variant="destructive" className="w-full" onClick={signOut}>
            <LogOutIcon className="text-white" size={20} />
            Sair
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Header;
