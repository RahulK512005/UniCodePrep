interface OTPData {
  email: string;
  otp: string;
  expires: Date;
  attempts: number;
}

class EmailService {
  private static instance: EmailService;
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly senderEmail = 'unicodeprep@gmail.com';
  private readonly maxAttempts = 3;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendPasswordResetOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email format' };
      }

      // Check if there's already an active OTP for this email
      const existingOTP = this.otpStorage.get(email);
      if (existingOTP && new Date() < existingOTP.expires && existingOTP.attempts >= this.maxAttempts) {
        const timeLeft = Math.ceil((existingOTP.expires.getTime() - Date.now()) / 60000);
        return { 
          success: false, 
          message: `Too many attempts. Please wait ${timeLeft} minutes before requesting a new OTP.` 
        };
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Store OTP data
      this.otpStorage.set(email, {
        email,
        otp,
        expires,
        attempts: 0
      });

      // Send email
      await this.sendOTPEmail(email, otp);

      return { 
        success: true, 
        message: `Password reset code sent to ${email} from ${this.senderEmail}. Please check your inbox.` 
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { 
        success: false, 
        message: 'Failed to send password reset code. Please try again.' 
      };
    }
  }

  private async sendOTPEmail(email: string, otp: string): Promise<void> {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create comprehensive email template
    const emailContent = this.createEmailTemplate(email, otp);

    // Log email for demo purposes (in real app, this would use actual email service)
    console.log('=== PASSWORD RESET EMAIL SENT ===');
    console.log(`From: ${this.senderEmail}`);
    console.log(`To: ${email}`);
    console.log(`Subject: UniCodePrep - Password Reset Verification Code`);
    console.log(emailContent);
    console.log('===============================');

    // Show browser notification for demo
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('UniCodePrep Password Reset', {
          body: `Your verification code is: ${otp}`,
          icon: '/favicon.ico',
          tag: 'password-reset'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('UniCodePrep Password Reset', {
              body: `Your verification code is: ${otp}`,
              icon: '/favicon.ico',
              tag: 'password-reset'
            });
          }
        });
      }
    }

    // For demo purposes, also store in localStorage for easy access
    if (typeof window !== 'undefined') {
      const demoOTPs = JSON.parse(localStorage.getItem('demoOTPs') || '{}');
      demoOTPs[email] = {
        otp,
        timestamp: new Date().toISOString(),
        expires: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      };
      localStorage.setItem('demoOTPs', JSON.stringify(demoOTPs));
    }
  }

  private createEmailTemplate(email: string, otp: string): string {
    const currentTime = new Date().toLocaleString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000).toLocaleString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniCodePrep Password Reset</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #007bff; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 4px; margin: 20px 0; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 UniCodePrep</div>
            <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
            <h2>Hello!</h2>
            <p>We received a request to reset the password for your UniCodePrep account associated with <strong>${email}</strong>.</p>
            
            <p>Your password reset verification code is:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="info-box">
                <strong>🔒 Security Information:</strong>
                <ul>
                    <li>This code will expire in <strong>10 minutes</strong> (at ${expiryTime})</li>
                    <li>You can only use this code once</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                </ul>
            </div>
            
            <div class="warning-box">
                <strong>⚠️ Important:</strong>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>UniCodePrep staff will never ask for your verification code</li>
                    <li>Make sure you're on the official UniCodePrep website</li>
                </ul>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Go back to the UniCodePrep password reset page</li>
                <li>Enter the verification code above</li>
                <li>Create a strong new password</li>
                <li>Remember to check "Remember my password" for easier future logins</li>
            </ol>
            
            <p>If you're having trouble, you can reply to this email or contact our support team.</p>
            
            <div class="footer">
                <p>This email was sent from <strong>${this.senderEmail}</strong></p>
                <p>UniCodePrep - Your Coding Career Preparation Platform</p>
                <p>Sent on: ${currentTime}</p>
                <hr>
                <p><small>If you didn't request this password reset, please ignore this email. Your account remains secure.</small></p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  verifyOTP(email: string, userOTP: string): { success: boolean; message: string } {
    const storedData = this.otpStorage.get(email);

    if (!storedData) {
      return { success: false, message: 'No verification code found for this email. Please request a new one.' };
    }

    // Check if OTP has expired
    if (new Date() > storedData.expires) {
      this.otpStorage.delete(email);
      return { success: false, message: 'Verification code has expired. Please request a new one.' };
    }

    // Increment attempt count
    storedData.attempts++;

    // Check max attempts
    if (storedData.attempts > this.maxAttempts) {
      return { 
        success: false, 
        message: 'Too many incorrect attempts. Please request a new verification code.' 
      };
    }

    // Verify OTP
    if (storedData.otp !== userOTP) {
      return { 
        success: false, 
        message: `Incorrect verification code. ${this.maxAttempts - storedData.attempts} attempts remaining.` 
      };
    }

    // OTP is valid
    return { success: true, message: 'Verification code confirmed successfully.' };
  }

  clearOTP(email: string): void {
    this.otpStorage.delete(email);
    
    // Also clear from demo storage
    if (typeof window !== 'undefined') {
      const demoOTPs = JSON.parse(localStorage.getItem('demoOTPs') || '{}');
      delete demoOTPs[email];
      localStorage.setItem('demoOTPs', JSON.stringify(demoOTPs));
    }
  }

  // Check if OTP is still valid for password reset
  isOTPValidForReset(email: string, otp: string): boolean {
    const storedData = this.otpStorage.get(email);
    return storedData !== undefined && 
           storedData.otp === otp && 
           new Date() <= storedData.expires &&
           storedData.attempts <= this.maxAttempts;
  }

  // Get remaining time for OTP
  getOTPTimeRemaining(email: string): number {
    const storedData = this.otpStorage.get(email);
    if (!storedData) return 0;
    
    const remaining = storedData.expires.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds remaining
  }

  // Get demo OTP for testing (only in development)
  getDemoOTP(email: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const demoOTPs = JSON.parse(localStorage.getItem('demoOTPs') || '{}');
    const demoData = demoOTPs[email];
    
    if (demoData && new Date(demoData.expires) > new Date()) {
      return demoData.otp;
    }
    
    return null;
  }
}

export const emailService = EmailService.getInstance();