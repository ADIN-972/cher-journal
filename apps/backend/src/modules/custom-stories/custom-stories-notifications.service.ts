import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

interface NotificationEvent {
  userId: string;
  storyId: string;
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  rejectionReason?: string;
  rejectionNotes?: string;
}

export class CustomStoriesNotificationsService {
  private emailTransporter: any;

  constructor() {
    // Initialize email transporter
    // In production, use real SMTP settings from environment
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  /**
   * Send approval notification
   */
  async notifyApproved(event: NotificationEvent): Promise<void> {
    const story = await prisma.customStoryRequest.findUnique({
      where: { id: event.storyId },
      include: { user: true },
    });

    if (!story || !story.user) {
      console.error('Story or user not found for approval notification');
      return;
    }

    // Send email
    await this.sendApprovedEmail(story.user.email, story.protagonistName);

    // Create in-app notification
    await this.createInAppNotification({
      userId: event.userId,
      type: 'STORY_APPROVED',
      title: 'Demande Approuvée',
      message: `Votre demande pour "${story.protagonistName}" a été approuvée! Un auteur travaille à la création de votre histoire.`,
      relatedStoryId: event.storyId,
      actionUrl: `/account/custom-stories`,
    });

    console.log(`Approval notification sent for story ${event.storyId}`);
  }

  /**
   * Send rejection notification
   */
  async notifyRejected(event: NotificationEvent): Promise<void> {
    const story = await prisma.customStoryRequest.findUnique({
      where: { id: event.storyId },
      include: { user: true },
    });

    if (!story || !story.user) {
      console.error('Story or user not found for rejection notification');
      return;
    }

    // Send email
    await this.sendRejectedEmail(
      story.user.email,
      story.protagonistName,
      event.rejectionReason || 'Unknown',
      event.rejectionNotes,
    );

    // Create in-app notification
    await this.createInAppNotification({
      userId: event.userId,
      type: 'STORY_REJECTED',
      title: 'Demande Rejetée',
      message: `Votre demande pour "${story.protagonistName}" a malheureusement été rejetée. Raison: ${event.rejectionReason}`,
      relatedStoryId: event.storyId,
      actionUrl: `/account/custom-stories`,
    });

    console.log(`Rejection notification sent for story ${event.storyId}`);
  }

  /**
   * Send under review notification
   */
  async notifyUnderReview(event: NotificationEvent): Promise<void> {
    const story = await prisma.customStoryRequest.findUnique({
      where: { id: event.storyId },
      include: { user: true },
    });

    if (!story || !story.user) {
      console.error('Story or user not found for under review notification');
      return;
    }

    // Create in-app notification only (no email for this status change)
    await this.createInAppNotification({
      userId: event.userId,
      type: 'STORY_UNDER_REVIEW',
      title: 'Demande En Examen',
      message: `Votre demande pour "${story.protagonistName}" est actuellement en examen par notre équipe.`,
      relatedStoryId: event.storyId,
      actionUrl: `/account/custom-stories`,
    });

    console.log(`Under review notification created for story ${event.storyId}`);
  }

  /**
   * Send approval email
   */
  private async sendApprovedEmail(toEmail: string, protagonistName: string): Promise<void> {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #dc2626;">Bonne Nouvelle! 🎉</h2>

              <p>Votre demande de création personnalisée pour <strong>"${protagonistName}"</strong> a été approuvée!</p>

              <p>Un de nos auteurs talentueusest en train de travailler à la création de votre histoire unique. Vous verrez bientôt votre personnage prendre vie à travers nos pages.</p>

              <p>Nous vous tiendrons informé de la progression de votre demande via des notifications régulières.</p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p>Merci d'avoir choisi Cher Journal!</p>
              <p style="font-size: 12px; color: #666;">
                © 2026 Cher Journal. Tous droits réservés.
              </p>
            </div>
          </body>
        </html>
      `;

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@cherjournal.com',
        to: toEmail,
        subject: '✨ Votre demande a été approuvée - Cher Journal',
        html: htmlContent,
      });

      console.log(`Approval email sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending approval email:', error);
      // Don't throw - continue with in-app notification
    }
  }

  /**
   * Send rejection email
   */
  private async sendRejectedEmail(
    toEmail: string,
    protagonistName: string,
    reason: string,
    notes?: string,
  ): Promise<void> {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #dc2626;">À propos de votre demande</h2>

              <p>Nous avons examiné votre demande de création personnalisée pour <strong>"${protagonistName}"</strong>.</p>

              <p>Malheureusement, nous ne sommes pas en mesure de procéder avec cette demande pour la raison suivante:</p>

              <p style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                <strong>Raison:</strong> ${reason}
                ${notes ? `<br><br><strong>Détails:</strong> ${notes}` : ''}
              </p>

              <p>Vous êtes toujours bienvenu à soumettre une nouvelle demande avec des paramètres différents.</p>

              <p style="margin-top: 30px;">
                <a href="${process.env.WEB_URL || 'https://cherjournal.com'}/create-story" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Soumettre une nouvelle demande
                </a>
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 12px; color: #666;">
                © 2026 Cher Journal. Tous droits réservés.
              </p>
            </div>
          </body>
        </html>
      `;

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@cherjournal.com',
        to: toEmail,
        subject: 'Concernant votre demande - Cher Journal',
        html: htmlContent,
      });

      console.log(`Rejection email sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending rejection email:', error);
      // Don't throw - continue with in-app notification
    }
  }

  /**
   * Create in-app notification
   */
  private async createInAppNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedStoryId: string;
    actionUrl: string;
  }): Promise<void> {
    try {
      // In production, store this in a Notifications table
      // For now, log it
      console.log('In-app notification created:', {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        createdAt: new Date(),
      });

      // TODO: Implement Notification model in Prisma
      // await prisma.notification.create({
      //   data: {
      //     userId: data.userId,
      //     type: data.type,
      //     title: data.title,
      //     message: data.message,
      //     relatedStoryId: data.relatedStoryId,
      //     actionUrl: data.actionUrl,
      //     isRead: false,
      //     createdAt: new Date(),
      //   },
      // });
    } catch (error) {
      console.error('Error creating in-app notification:', error);
    }
  }

  /**
   * Test email configuration
   */
  async testEmail(toEmail: string): Promise<boolean> {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@cherjournal.com',
        to: toEmail,
        subject: 'Test Email - Cher Journal',
        html: '<p>This is a test email from Cher Journal.</p>',
      });
      return true;
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }
}
