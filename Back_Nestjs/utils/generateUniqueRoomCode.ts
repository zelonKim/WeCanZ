import { InternalServerErrorException } from '@nestjs/common';
import { generateRandomCode } from './generateRandomCode';

export async function generateUniqueRoomCode(tx: any): Promise<string> {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const code = generateRandomCode(4);

    const existing = await tx.gathering.findUnique({
      where: { roomCode: code },
    });

    if (!existing) {
      return code;
    }

    attempts++;
  }

  throw new InternalServerErrorException(
    '고유한 룸 코드를 생성하는 데 실패했습니다. 잠시 후 다시 시도해 주세요.',
  );
}
