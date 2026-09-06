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

  // ⚡️ DM 채팅방(/dm/123) 또는 벙개 채팅방(/gathering/123/chat) 여부 확인
  const isDmChatRoom = /^\/dm\/[^\/]+$/.test(pathname);
  const isGatheringChatRoom = /^\/gathering\/[^\/]+\/chat$/.test(pathname);

  // 채팅방일 경우 탭바 숨김 조건
  const isChatRoom = isDmChatRoom || isGatheringChatRoom;

  return (
    <div className="flex min-h-screen justify-center bg-[#121212]">
      {/* 모바일 앱 비율과 동일하게 최대 너비를 잡아줍니다 */}
      {/* ⚡️ 채팅방일 때는 pb-[68px] 여백을 제거하여 화면을 full로 채웁니다 */}
      <div
        className={`relative w-full max-w-5xl bg-[#121212] text-white shadow-xl min-h-screen flex flex-col ${
          isChatRoom ? "pb-0" : "pb-[68px]"
        }`}
      >
        {/* 상위 페이지 콘텐츠 영역 */}
        <main className="flex-1">{children}</main>

        {/* 하단 탭 바 (웹용 Bottom Navigation) */}
        {/* ⚡️ 채팅방이닐 때만 하단 탭바를 렌더링합니다 */}
        {!isChatRoom && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] border-t border-[#2C2C2E] px-4 py-2 max-w-5xl mx-auto">
            <ul className="flex justify-around items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
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
        )}
      </div>
    </div>
  );
}
