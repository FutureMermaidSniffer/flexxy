/**
 * Email Service for Password Reset
 * Handles sending password reset emails
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    // Initialize email transporter based on environment
    if (process.env.SMTP_HOST) {
      // Production SMTP configuration
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development: Create test account
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Test email account created:', testAccount.user);
    } catch (error) {
      console.error('❌ Failed to create test email account:', error.message);
    }
  }

  async sendPasswordResetEmail(email, firstName, resetToken) {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3003'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flexjobs.com',
      to: email,
      subject: 'Reset Your FlexJobs Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>We received a request to reset your password for your FlexJobs account. If you made this request, click the button below to reset your password:</p>
              
              <center>
                <a href="${resetUrl}" class="button">Reset Your Password</a>
              </center>
              
              <div class="warning">
                <strong>⏰ Important:</strong> This link will expire in 1 hour for your security.
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 3px;">${resetUrl}</p>
              
              <p><strong>If you didn't request this password reset:</strong></p>
              <ul>
                <li>You can safely ignore this email</li>
                <li>Your password will remain unchanged</li>
                <li>Consider changing your password if you're concerned about security</li>
              </ul>
              
              <p>For security reasons, we don't store your password in plain text, so we can't send you your current password.</p>
            </div>
            <div class="footer">
              <p>This email was sent from FlexJobs. If you have questions, contact our support team.</p>
              <p>© ${new Date().getFullYear()} FlexJobs. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${firstName},

        We received a request to reset your password for your FlexJobs account.

        To reset your password, visit this link:
        ${resetUrl}

        This link will expire in 1 hour for your security.

        If you didn't request this password reset, you can safely ignore this email.

        Thanks,
        The FlexJobs Team
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      // Log email info
      console.log('📤 Password reset email sent:', info.messageId);
      
      // In development, show preview URL
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      throw error;
    }
  }

  async verifyConnection() {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
