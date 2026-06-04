import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

/**
 * Test Telegram notification endpoint
 * GET /api/notifications/test
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const testMessage = `
🧪 <b>ทดสอบการส่งข้อความ</b>

✅ Telegram Bot ทำงานปกติ
📅 เวลา: ${new Date().toLocaleString('th-TH')}

🚑 AMB Check Notification System
`.trim();

  const result = await sendTelegramMessage(testMessage);

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        message: 'Failed to send test notification',
      },
      { status: 500 }
    );
  }
}
