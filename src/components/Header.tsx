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
import ModalFolder from "./modals/modal-folders";

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
    <header className="hidden md:block w-59 h-screen dark:bg-zinc-900 mr-8 bg-white top-0 sticky">
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
                  {linksNavegation.map((link, index) => {
                    const isActive = pathame === link.href;

                    return (
                      <Button
                        variant="secondaryNav"
                        key={index}
                        className={cn(
                          "w-full justify-start relative overflow-hidden",
                          "transition-all duration-300 ease-out",
                          "border-r-4",
                          isActive
                            ? "border-blue-500"
                            : "border-transparent hover:border-blue-300"
                        )}
                        asChild
                      >
                        <Link href={link.href}>
                          <div
                            className={cn(
                              "absolute right-0 top-0 bottom-0",
                              "bg-linear-to-l from-blue-500/20 via-blue-500/10 to-transparent",
                              "transition-all duration-500 ease-out",
                              isActive ? "w-1/2 opacity-100" : "w-0 opacity-0"
                            )}
                          />

                          <span
                            className={cn(
                              "relative z-10 transition-colors duration-300",
                              isActive &&
                                "text-blue-600 dark:text-blue-400 font-semibold"
                            )}
                          >
                            {link.label}
                          </span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            {/* <Separator className="w-full absolute" /> */}
            <div className="flex items-center justify-between w-full gap-1.5 p-3">
              {!isClient ? (
                <div className="w-auto">
                  <Loader size={26} className="animate-spin" />
                </div>
              ) : userData ? (
                <>
                  <div className="w-full hidden md:block">
                    <MenuUser userData={userData} signOut={handleSignOut} />
                  </div>
                  <div className="block md:hidden">
                    <MenuMobile user={userData} signOut={signOut} />
                  </div>
                </>
              ) : (
                <AuthModal />
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

type PropsMenu = {
  userData: {
    id: string;
    image: string | null;
    name: string | null;
    email: string;
  };
  signOut: () => void;
};

function MenuUser({ userData, signOut }: PropsMenu) {
  return (
    <>
      <div className="w-full pb-6">
        {<ModalFolder type="create" userId={userData?.id as string} />}
      </div>
      <div className="flex w-full justify-between items-center dark:bg-zinc-900 border rounded-2xl p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex-1 flex items-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition rounded-lg p-1">
              <Avatar className={cn("w-9 h-9")}>
                <AvatarImage src={userData.image || ""} />
                <AvatarFallback className="bg-blue-800/40 border">
                  {userData.name?.charAt(0) || "G"}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div className="flex gap-2 items-center p-2">
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
              <Button
                variant="destructive"
                className="w-full"
                onClick={signOut}
              >
                <LogOutIcon className="text-white" size={20} />
                Sair
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-full flex justify-end">
          <ModeToggle />
        </div>
      </div>
    </>
  );
}
export default Header;
