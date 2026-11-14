import {
  PrismaClient,
  GatheringCategory,
  ParticipantStatus,
  User,
  Gathering,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성을 시작합니다...');

  // 기존 데이터 초기화 (외래키 제약조건 순서 고려)
  await prisma.participant.deleteMany();
  await prisma.gathering.deleteMany();
  await prisma.user.deleteMany();

  const password = 'password1234!';

  // 1. 유저 9명 생성 (한국 3명, 미국 3명, 영국 3명)
  const usersData = [
    // 🇰🇷 한국 유저 3명
    {
      email: 'minjun.kim@wecanz.kr',
      password: password,
      nickname: '성수동커피러버',
      bio: '주말마다 성수동, 연남동 카페 투어하고 사이드 프로젝트 이야기 나누는 거 좋아해요 ☕️',
      profileImage:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      yesShowCount: 14,
      noShowCount: 0,
      provider: 'LOCAL',
    },
    {
      email: 'jiwoo.park@wecanz.kr',
      password: password,
      nickname: '한강러닝크루',
      bio: '퇴근 후 반포 한강공원 5km 러닝 뛰실 분! 초보자도 환영합니다 🏃‍♂️',
      profileImage:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      yesShowCount: 21,
      noShowCount: 1,
      provider: 'LOCAL',
    },
    {
      email: 'seoyeon.lee@wecanz.kr',
      password: password,
      nickname: '이태원바이브',
      bio: '금요일 밤 이태원, 을지로 힙한 와인바 & 펍 탐방러 🍷',
      profileImage:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      yesShowCount: 9,
      noShowCount: 0,
      provider: 'LOCAL',
    },

    // 🇺🇸 미국 유저 3명
    {
      email: 'liam.oconnor@wecanz.io',
      password: password,
      nickname: 'Liam_NYC',
      bio: 'Product designer in Brooklyn. Always down for rooftop drinks or pickup basketball 🏀',
      profileImage:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      yesShowCount: 18,
      noShowCount: 0,
      provider: 'LOCAL',
    },
    {
      email: 'chloe.chen@wecanz.io',
      password: password,
      nickname: 'ChloeSF',
      bio: "AI builder in SF. Let's grab matcha in Mission District and talk startups ✨",
      profileImage:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      yesShowCount: 12,
      noShowCount: 0,
      provider: 'LOCAL',
    },
    {
      email: 'marcus.vance@wecanz.io',
      password: password,
      nickname: 'MarcusLA',
      bio: 'Venice Beach sunset runner & taco enthusiast 🌮🏄‍♂️',
      profileImage:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      yesShowCount: 7,
      noShowCount: 1,
      provider: 'LOCAL',
    },

    // 🇬🇧 영국 유저 3명
    {
      email: 'oliver.smith@wecanz.uk',
      password: password,
      nickname: 'Ollie_LDN',
      bio: 'Shoreditch local. Indie music, craft beer, and spontaneous Friday pub nights 🍺',
      profileImage:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      yesShowCount: 16,
      noShowCount: 0,
      provider: 'LOCAL',
    },
    {
      email: 'amelia.clarke@wecanz.uk',
      password: password,
      nickname: 'Amelia_Soho',
      bio: 'Gallery hopping around Soho & Covent Garden. Looking for creative buddies 🎨',
      profileImage:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      yesShowCount: 11,
      noShowCount: 0,
      provider: 'LOCAL',
    },
    {
      email: 'harry.davies@wecanz.uk',
      password: password,
      nickname: 'Harry_MCR',
      bio: 'Football fan & specialty coffee nerd based in London / Manchester ⚽️',
      profileImage:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      yesShowCount: 15,
      noShowCount: 0,
      provider: 'LOCAL',
    },
  ];

  const createdUsers: User[] = [];
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
  }

  console.log(`✅ 유저 ${createdUsers.length}명 생성 완료`);

  const getFutureDate = (daysFromNow: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  // 2. 모임(Gathering) 9개 생성 (한국 3개, 미국 3개, 영국 3개)
  const gatheringsData = [
    // 🇰🇷 한국 모임 (KR)
    {
      title: '성수동 스페셜티 커피 & 1인 개발자 네트워킹',
      description:
        '주말 오후 성수동 로스터리 카페에서 각자 진행 중인 사이드 프로젝트나 앱 런칭 경험 가볍게 공유해요! 노트북 지참 환영합니다.',
      category: GatheringCategory.KR,
      maxPeople: 6,
      location: '서울 성동구 성수이로 7길 (성수역 3번 출구 인근)',
      latitude: 37.5445,
      longitude: 127.0561,
      dateTime: getFutureDate(2, 15),
      roomCode: 'kr-room-001',
      hostId: createdUsers[0].id,
    },
    {
      title: '반포 한강공원 야간 5km 펀런 & 편의점 라면',
      description:
        '600~630 페이스로 가볍게 수다 떨면서 5km 뛰고 세빛섬 앞에서 한강 라면 먹어요. 러닝 초보분들도 부담 없이 오세요!',
      category: GatheringCategory.KR,
      maxPeople: 8,
      location: '서울 서초구 반포한강공원 달빛광장',
      latitude: 37.5105,
      longitude: 126.9961,
      dateTime: getFutureDate(3, 20),
      roomCode: 'kr-room-002',
      hostId: createdUsers[1].id,
    },
    {
      title: '금요일 밤 이태원 루프탑 칵테일 & 글로벌 밋업',
      description:
        '한국인, 외국인 친구들 다 같이 어울리는 캐주얼한 불금 번개입니다. 영어 못하셔도 분위기 편하니까 가볍게 한잔해요!',
      category: GatheringCategory.KR,
      maxPeople: 10,
      location: '서울 용산구 이태원로 27가길 (이태원역 1번 출구)',
      latitude: 37.5349,
      longitude: 126.9942,
      dateTime: getFutureDate(5, 21),
      roomCode: 'kr-room-003',
      hostId: createdUsers[2].id,
    },

    // 🇺🇸 미국 모임 (US)
    {
      title: 'Williamsburg Rooftop Drinks & Tech Hangout',
      description:
        'Unwinding after work with craft cocktails and skyline views in Brooklyn. Open to founders, designers, and anyone new to NYC!',
      category: GatheringCategory.US,
      maxPeople: 8,
      location: 'Wythe Ave, Williamsburg, Brooklyn, NY 11249',
      latitude: 40.7219,
      longitude: -73.9576,
      dateTime: getFutureDate(2, 19),
      roomCode: 'us-room-001',
      hostId: createdUsers[3].id,
    },
    {
      title: 'Mission Dolores Park Matcha & Startup Jam',
      description:
        "Grabbing iced matcha on Valencia St and chilling at Dolores Park. Come share what you're building or just soak up the SF sun.",
      category: GatheringCategory.US,
      maxPeople: 6,
      location: 'Dolores St & 19th St, San Francisco, CA 94114',
      latitude: 37.7596,
      longitude: -122.4269,
      dateTime: getFutureDate(4, 14),
      roomCode: 'us-room-002',
      hostId: createdUsers[4].id,
    },
    {
      title: 'Venice Beach Sunset Run & Street Tacos',
      description:
        'Easy 4-mile coastal jog along the boardwalk followed by the best street tacos in Venice. All paces welcome!',
      category: GatheringCategory.US,
      maxPeople: 10,
      location: '1800 Ocean Front Walk, Venice, CA 90291',
      latitude: 33.985,
      longitude: -118.4695,
      dateTime: getFutureDate(6, 17),
      roomCode: 'us-room-003',
      hostId: createdUsers[5].id,
    },

    // 🇬🇧 영국 모임 (UK)
    {
      title: 'Shoreditch Friday Craft Beer & Indie Night',
      description:
        'Starting with a few pints near Brick Lane and heading to an indie DJ set later. Great vibes for locals and expats alike.',
      category: GatheringCategory.UK,
      maxPeople: 8,
      location: 'Brick Lane, Shoreditch, London E1 6QL',
      latitude: 51.5215,
      longitude: -0.0718,
      dateTime: getFutureDate(3, 19),
      roomCode: 'uk-room-001',
      hostId: createdUsers[6].id,
    },
    {
      title: 'Soho Espresso & Contemporary Art Walk',
      description:
        'Meeting for flat whites in Soho before checking out a couple of independent galleries around Mayfair and Covent Garden.',
      category: GatheringCategory.UK,
      maxPeople: 5,
      location: 'Dean St, Soho, London W1D 3RY',
      latitude: 51.5136,
      longitude: -0.1325,
      dateTime: getFutureDate(5, 13),
      roomCode: 'uk-room-002',
      hostId: createdUsers[7].id,
    },
    {
      title: 'South Bank Thames Evening Walk & Pub Quiz',
      description:
        'Casual riverside stroll from Waterloo to Borough Market, finishing with a classic British pub quiz. Need sharp trivia minds!',
      category: GatheringCategory.UK,
      maxPeople: 6,
      location: 'Belvedere Rd, South Bank, London SE1 8XX',
      latitude: 51.5033,
      longitude: -0.1195,
      dateTime: getFutureDate(7, 18),
      roomCode: 'uk-room-003',
      hostId: createdUsers[8].id,
    },
  ];

  const createdGatherings: Gathering[] = [];
  for (const gData of gatheringsData) {
    const gathering = await prisma.gathering.create({
      data: gData,
    });
    createdGatherings.push(gathering);
  }

  console.log(`✅ 모임 ${createdGatherings.length}개 생성 완료`);

  // 3. 참가자(Participant) 샘플 데이터 생성
  for (let i = 0; i < createdGatherings.length; i++) {
    const gathering = createdGatherings[i];
    const otherUsers = createdUsers.filter((u) => u.id !== gathering.hostId);

    for (let j = 0; j < 2; j++) {
      const participantUser = otherUsers[(i + j) % otherUsers.length];
      await prisma.participant
        .create({
          data: {
            userId: participantUser.id,
            gatheringId: gathering.id,
            status: ParticipantStatus.APPROVED,
            joinedAt: new Date(),
          },
        })
        .catch(() => {});
    }
  }

  console.log('✅ 참가자 샘플 데이터 생성 완료');
  console.log('🎉 모든 시드 데이터 작업이 성공적으로 끝났습니다!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
