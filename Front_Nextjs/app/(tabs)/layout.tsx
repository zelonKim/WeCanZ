"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  HomeOutline,
  Flash,
  FlashOutline,
  People,
  PeopleOutline,
  Chatbubbles,
  ChatbubblesOutline,
  Settings,
  SettingsOutline,
  Location,
  LocationOutline,
  CheckmarkCircle,
  CheckmarkCircleOutline,
} from "react-ionicons";

const navItems = [
  {
    name: "친구",
    href: "/friend",
    activeIcon: People,
    inactiveIcon: PeopleOutline,
  },
  {
    name: "DM",
    href: "/dm",
    activeIcon: Chatbubbles,
    inactiveIcon: ChatbubblesOutline,
  },
  {
    name: "스팟",
    href: "/spot",
    activeIcon: Location,
    inactiveIcon: LocationOutline,
  },
  {
    name: "벙개",
    href: "/",
    activeIcon: Flash,
    inactiveIcon: FlashOutline,
  },
  {
    name: "참여",
    href: "/join",
    activeIcon: CheckmarkCircle,
    inactiveIcon: CheckmarkCircleOutline,
  },
  {
    name: "설정",
    href: "/setting",
    activeIcon: Settings,
    inactiveIcon: SettingsOutline,
  },
];

export default function TabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen justify-center bg-[#121212]">
      {/* 모바일 앱 비율과 동일하게 최대 너비를 잡아줍니다 */}
      <div className="relative w-full max-w-5xl pb-24 bg-[#121212] text-white shadow-xl min-h-screen flex flex-col">
        {/* 상위 페이지 콘텐츠 영역 */}
        <main className="flex-1">{children}</main>

        {/* 하단 탭 바 (웹용 Bottom Navigation) */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] border-t border-[#2C2C2E] px-4 py-2 max-w-5xl mx-auto">
          <ul className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              // 활성화 상태에 따라 채워진 아이콘(Solid)과 아웃라인 아이콘을 교체합니다
              const SelectedIcon = isActive
                ? item.activeIcon
                : item.inactiveIcon;
              const iconColor = isActive ? "#FFE600" : "#8E8E93";

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex flex-col items-center gap-1 py-1 px-3 transition"
                  >
                    <SelectedIcon
                      color={iconColor}
                      height="24px"
                      width="24px"
                    />
                    <span
                      className={`text-xs font-medium ${
                        isActive ? "text-[#FFE600]" : "text-[#8E8E93]"
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
      </div>
    </div>
  );
}
