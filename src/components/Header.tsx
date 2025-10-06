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
import { trpc } from "../server/trpc/client";
import { linksNavegation } from "../utils/navegation-links";
import AuthModal from "./auth_components/auth-modal";
import { ModeToggle } from "./ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import MenuMobile from "./MenuMobile";

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
    <header className="w-full h-auto dark:bg-zinc-950 bg-white z-20 sticky top-0">
      <nav className="p-3 w-full h-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-6">
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
            <div className="flex items-center gap-2.5">
              <NavigationMenu className="h-full *:h-full max-md:hidden">
                <NavigationMenuList className="h-full gap-2">
                  {linksNavegation.map((link, index) => (
                    <NavigationMenuItem key={index} className="h-full">
                      <NavigationMenuLink
                        active={pathame === link.href}
                        href={link.href}
                        className="text-muted-foreground hover:text-primary border-b-primary hover:border-b-primary data-[active]:border-b-primary h-full justify-center rounded-none border-y-2 border-transparent py-1.5 font-medium hover:bg-transparent data-[active]:bg-transparent!"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ModeToggle />
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
        <Avatar className={cn("w-11 h-11 ")}>
          <AvatarImage src={userData.image || ""} />
          <AvatarFallback className="bg-blue-800/40 border">
            {userData.name?.charAt(0) || "G"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
