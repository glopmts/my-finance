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
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { trpc } from "../server/trpc/context/client";
import { linksNavegation } from "../utils/navegation-links";
import AuthModal from "./auth_components/auth-modal";
import { ModeToggle } from "./ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

import MenuMobile from "./MenuMobile";
import { Separator } from "./ui/separator";

const Header = () => {
  const { data: userData, refetch } = trpc.auth.me.useQuery();
  const [isClient, setIsClient] = useState(false);
  const { signOut } = useAuth();
  const pathame = usePathname();

  useEffect(() => {
    setIsClient(true);
    refetch();
  }, [refetch]);

  const handleSignOut = async () => {
    const confirM = confirm("Desejar realmente deslogar?");
    if (confirM) {
      await signOut();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  return (
    <header className="w-59 h-screen dark:bg-zinc-900 mr-8 bg-white top-0 sticky">
      <nav className="w-full h-full">
        <div className="flex flex-col h-full justify-between items-center w-full">
          <div className="flex flex-col items-center gap-6 p-3">
            <Link href="/" passHref>
              <div className="flex gap-2.5 cursor-pointer">
                <div className="relative w-12 h-12">
                  <Image
                    src="/favicon.ico"
                    alt="logo"
                    fill
                    sizes="100vw"
                    className="object-cover rounded-md"
                    priority
                  />
                </div>
                <div className="">
                  <h2 className="text-xl font-semibold">My Finance</h2>
                  <span className="text-sm text-zinc-300">
                    Domine suas finanças!
                  </span>
                </div>
              </div>
            </Link>
            <div className="flex flex-col gap-2.5 w-full">
              <div className="h-full w-full *:h-full max-md:hidden">
                <div className="h-full w-full flex flex-col gap-2">
                  {linksNavegation.map((link, index) => (
                    <Button
                      variant={pathame === link.href ? "default" : "secondary"}
                      key={index}
                      className="w-full"
                      asChild
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <Separator className="w-full absolute" />
            <div className="flex items-center justify-between w-full gap-1.5 p-3">
              {!isClient ? (
                <div className="w-auto">
                  <Loader size={26} className="animate-spin" />
                </div>
              ) : userData ? (
                <>
                  <div className="w-auto hidden md:block">
                    <MenuUser userData={userData} signOut={handleSignOut} />
                  </div>
                  <div className="block md:hidden">
                    <MenuMobile user={userData} signOut={signOut} />
                  </div>
                </>
              ) : (
                <AuthModal />
              )}
              <ModeToggle />
            </div>
          </div>
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
        <Avatar className={cn("w-9 h-9 ")}>
          <AvatarImage src={userData.image || ""} />
          <AvatarFallback className="bg-blue-800/40 border">
            {userData.name?.charAt(0) || "G"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <div className="flex gap-2 items-center">
          <Avatar className={cn("w-10 h-10")}>
            <AvatarImage src={userData.image || ""} />
            <AvatarFallback className="bg-blue-800/40 border">
              {userData.name?.charAt(0) || "G"}
            </AvatarFallback>
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
