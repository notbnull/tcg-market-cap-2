"use client";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/app/ui/components/dropdown-menu";
import { Button } from "@/app/ui/components/button";
import { SignOutButton, UserProfile, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Bell, BellDot, BellDotIcon, BellRing, Menu, X } from "lucide-react";
import { BellAlertIcon } from "@heroicons/react/24/outline";

export default function DashboardNav() {
  const { isLoaded, user } = useUser();
  const userImage = user?.imageUrl;
  const userName = user?.username;

  const [isProfileOpen, setIsProfileOpen] = useState(false); // Add this state

  return (
    <nav className="dark:bg-black border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8"
                src="/placeholder.svg?height=32&width=32"
                alt="Logo"
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#"
                  className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Market
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Portfolio
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Analytics
                </a>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                onClick={() => {
                  alert("Notifications coming soon!");
                }}
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <BellDot className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-2">
                    <Avatar>
                      <AvatarImage src={userImage} alt="@johndoe" />
                      <AvatarFallback>{userName}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setIsProfileOpen(true)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      alert("Coming Soon");
                    }}
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SignOutButton>Logout</SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {/* Replace Dialog with custom modal */}
        {isProfileOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsProfileOpen(false);
              }
            }}
          >
            <div className="relative rounded-lg">
              <UserProfile routing="hash" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
