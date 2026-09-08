import { query } from '@/lib/db';

export interface NotificationPayload {
  title: string;
  message: string;
  link: string;
  type: 'exam_alert' | 'deadline' | 'admit_card' | 'result' | 'system' | 'opportunity';
  targetExamId?: string;
  targetCategory?: string;
}

export class NotificationDispatcher {
  /**
   * Broadcast notification to all students who saved or targeted this exam/opportunity
   */
  public static async dispatchToRelevantStudents(payload: NotificationPayload) {
    try {
      let recipientUserIds: string[] = [];

      if (payload.targetExamId) {
        // 1. Students who explicitly saved the exam
        const savedRes = await query(
          'SELECT DISTINCT user_id FROM saved_exams WHERE exam_id = $1',
          [payload.targetExamId]
        );
        recipientUserIds.push(...savedRes.rows.map((r) => r.user_id));

        // 2. Students who added it to application tracker
        const trackerRes = await query(
          "SELECT DISTINCT user_id FROM application_tracker WHERE target_type = 'exam' AND target_id = $1",
          [payload.targetExamId]
        );
        recipientUserIds.push(...trackerRes.rows.map((r) => r.user_id));
      }

      // If no specific users, fallback to broadcasting to active demo students
      if (recipientUserIds.length === 0) {
        const allStudents = await query(
          "SELECT id FROM users WHERE role = 'student' LIMIT 20"
        );
        recipientUserIds = allStudents.rows.map((r) => r.id);
      }

      // Deduplicate
      const uniqueRecipients = Array.from(new Set(recipientUserIds));

      for (const userId of uniqueRecipients) {
        await query(
          `INSERT INTO notifications (user_id, title, message, link, type)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, payload.title, payload.message, payload.link, payload.type]
        );
      }

      return { dispatchedCount: uniqueRecipients.length };
    } catch (err: any) {
      console.error('Notification dispatch error:', err);
      return { dispatchedCount: 0, error: err.message };
    }
  }
}
