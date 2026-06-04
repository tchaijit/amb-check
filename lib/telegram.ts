/**
 * Telegram Bot API Integration
 * Send notifications to Telegram users or groups
 */

interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

/**
 * Send a text message via Telegram Bot API
 */
export async function sendTelegramMessage(
  text: string,
  options: {
    chatId?: string | number;
    parseMode?: 'Markdown' | 'HTML';
    silent?: boolean;
  } = {}
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const defaultChatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    return { success: false, error: 'Bot token not configured' };
  }

  const chatId = options.chatId || defaultChatId;
  if (!chatId) {
    console.error('TELEGRAM_CHAT_ID is not set and no chatId provided');
    return { success: false, error: 'Chat ID not configured' };
  }

  const message: TelegramMessage = {
    chat_id: chatId,
    text,
    parse_mode: options.parseMode || 'HTML',
    disable_notification: options.silent || false,
  };

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    const data: TelegramResponse = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data.description);
      return { success: false, error: data.description };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send Telegram message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format inspection notification message
 */
export function formatInspectionComplete(data: {
  vehicleNumber: string;
  licensePlate: string;
  inspectorName: string;
  inspectorRole: string;
  date: string;
}): string {
  const roleNames: Record<string, string> = {
    driver: '🚗 เจ้าหน้าที่ยานพาหนะ',
    equipment_officer: '🔧 เจ้าหน้าที่เคลื่อนย้ายผู้ป่วย',
    nurse: '💉 พยาบาล',
  };

  const roleName = roleNames[data.inspectorRole] || data.inspectorRole;

  return `
🔔 <b>การตรวจสอบเสร็จสิ้น</b>

🚑 รถ: <b>${data.vehicleNumber}</b>
🚗 ทะเบียน: ${data.licensePlate}
👤 ผู้ตรวจ: ${data.inspectorName}
📋 ฝ่าย: ${roleName}
📅 วันที่: ${data.date}

⏳ <i>รอการอนุมัติจาก HOD</i>
`.trim();
}

/**
 * Format HOD approval notification
 */
export function formatHodApproval(data: {
  vehicleNumber: string;
  licensePlate: string;
  status: 'ready' | 'monitor' | 'not_ready';
  hodName: string;
  date: string;
  remarks?: string;
}): string {
  const statusEmoji: Record<string, string> = {
    ready: '✅',
    monitor: '⚠️',
    not_ready: '⛔',
  };

  const statusText: Record<string, string> = {
    ready: 'พร้อมใช้งาน',
    monitor: 'เฝ้าระวัง',
    not_ready: 'ไม่พร้อมใช้',
  };

  const emoji = statusEmoji[data.status] || '📋';
  const status = statusText[data.status] || data.status;

  let message = `
${emoji} <b>HOD อนุมัติแล้ว</b>

🚑 รถ: <b>${data.vehicleNumber}</b>
🚗 ทะเบียน: ${data.licensePlate}
📊 สถานะ: <b>${status}</b>
👨‍💼 อนุมัติโดย: ${data.hodName}
📅 วันที่: ${data.date}
`.trim();

  if (data.remarks) {
    message += `\n💬 หมายเหตุ: ${data.remarks}`;
  }

  return message;
}

/**
 * Format daily summary notification
 */
export function formatDailySummary(data: {
  date: string;
  ready: number;
  monitor: number;
  notReady: number;
  pending: number;
  notInspected: number;
  total: number;
}): string {
  return `
📊 <b>สรุปสถานะรถพยาบาล</b>
📅 วันที่: ${data.date}

✅ พร้อมใช้: <b>${data.ready}</b>
⚠️ เฝ้าระวัง: <b>${data.monitor}</b>
⛔ ไม่พร้อมใช้: <b>${data.notReady}</b>
⏳ รออนุมัติ: <b>${data.pending}</b>
⚪ ยังไม่ตรวจ: <b>${data.notInspected}</b>

🚑 รวมทั้งหมด: ${data.total} คัน
`.trim();
}

/**
 * Format critical alert (not ready vehicle)
 */
export function formatCriticalAlert(data: {
  vehicleNumber: string;
  licensePlate: string;
  issues: string[];
  date: string;
}): string {
  const issueList = data.issues.map((issue) => `  • ${issue}`).join('\n');

  return `
🚨 <b>แจ้งเตือนด่วน: รถไม่พร้อมใช้</b>

🚑 รถ: <b>${data.vehicleNumber}</b>
🚗 ทะเบียน: ${data.licensePlate}
📅 วันที่: ${data.date}

⚠️ <b>ปัญหาที่พบ:</b>
${issueList}

👉 กรุณาดำเนินการแก้ไขด่วน
`.trim();
}
