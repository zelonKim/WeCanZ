"use client";

import SocketInitializer from "@/components/SocketInitializer.tsx";
import { useNavLanguage } from "@/hooks/Languages/useNavLanguage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  People,
  PeopleOutline,
  Chatbubbles,
  ChatbubblesOutline,
  Settings,
  SettingsOutline,
  Location,
  LocationOutline,
  Happy,
  HappyOutline,
  HandRight,
  HandRightOutline,
} from "react-ionicons";

export default function TabLayout({ children }: { children: React.ReactNode }) {
  const { t } = useNavLanguage();

  const pathname = usePathname();

  const isDmChatRoom = /^\/dm\/[^\/]+$/.test(pathname);
  const isGatheringChatRoom = /^\/gathering\/[^\/]+\/chat$/.test(pathname);

  const isChatRoom = isDmChatRoom || isGatheringChatRoom;

  const navItems = [
    {
      name: t.friend,
      href: "/friend",
      activeIcon: People,
      inactiveIcon: PeopleOutline,
    },
    {
      name: t.dm,
      href: "/dm",
      activeIcon: Chatbubbles,
      inactiveIcon: ChatbubblesOutline,
    },
    {
      name: t.spot,
      href: "/spot",
      activeIcon: Location,
      inactiveIcon: LocationOutline,
    },
    {
      name: t.meetup,
      href: "/",
      activeIcon: Happy,
      inactiveIcon: HappyOutline,
    },
    {
      name: t.join,
      href: "/join",
      activeIcon: HandRight,
      inactiveIcon: HandRightOutline,
    },
    {
      name: t.setting,
      href: "/setting",
      activeIcon: Settings,
      inactiveIcon: SettingsOutline,
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-[#121212]">
      <SocketInitializer />
      <div
        className={`relative w-full max-w-5xl bg-[#121212] text-white shadow-xl min-h-screen flex flex-col ${
          isChatRoom ? "pb-0" : "pb-[68px]"
        }`}
      >
        <main className="flex-1">{children}</main>
        {!isChatRoom && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] border-t border-[#2C2C2E]  px-4 py-2 max-w-5xl mx-auto">
            <ul className="flex justify-around items-center ">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const SelectedIcon = isActive
                  ? item.activeIcon
                  : item.inactiveIcon;
                const iconColor = isActive ? "#bef408" : "#8E8E93";

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className=" flex flex-col items-center gap-1 py-1 px-3 transition "
                    >
                      <SelectedIcon
                        color={iconColor}
                        height="24px"
                        width="24px"
                      />
                      <span
                        className={`text-xs font-medium  ${
                          isActive ? "text-[#bef408]" : "text-[#8E8E93]"
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
