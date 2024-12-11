"use client";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/ui/components/avatar";
import { Button } from "@/app/ui/components/button";
import { SignOutButton, UserProfile, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Bell, BellDot, BellDotIcon, BellRing, Menu, X } from "lucide-react";
import Logo from "@/app/ui/components/logo";
import NavLinks from "./nav-links";

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
              <Logo />
            </div>
            <NavLinks />
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant="ghost"
                className="ml-2"
                onClick={() => setIsProfileOpen(true)}
              >
                <Avatar>
                  <AvatarImage src={userImage} />
                  <AvatarFallback>{userName}</AvatarFallback>
                </Avatar>
              </Button>
              <SignOutButton>Logout</SignOutButton>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
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
