import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_email(to_email: str, subject: str, body: str, is_html: bool = True):
    """Send email using SMTP"""
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.smtp_username
        message["To"] = to_email
        
        # Add body to email
        if is_html:
            part = MIMEText(body, "html")
        else:
            part = MIMEText(body, "plain")
        
        message.attach(part)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            start_tls=True,
            username=settings.smtp_username,
            password=settings.smtp_password,
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

async def send_otp_email(email: str, otp_code: str, purpose: str = "verification"):
    """Send OTP verification email"""
    subject = f"Euro Hotel - Your {purpose.title()} Code"
    
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #F8F6F3; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
            .header {{ background-color: #0B1D3A; padding: 30px; text-align: center; }}
            .logo {{ color: #C9A227; font-size: 24px; font-weight: bold; }}
            .content {{ padding: 40px 30px; }}
            .otp-code {{ background-color: #F0EDE8; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #0B1D3A; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; }}
            .footer {{ background-color: #F0EDE8; padding: 20px; text-align: center; color: #2C2C2C; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EURO HOTEL</div>
            </div>
            <div class="content">
                <h2 style="color: #0B1D3A; margin-bottom: 20px;">Your {purpose.title()} Code</h2>
                <p style="color: #2C2C2C; line-height: 1.6;">
                    Thank you for choosing Euro Hotel. Please use the following code to complete your {purpose}:
                </p>
                <div class="otp-code">{otp_code}</div>
                <p style="color: #2C2C2C; line-height: 1.6;">
                    This code will expire in {settings.otp_expire_minutes} minutes. If you didn't request this code, please ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>Euro Hotel - Luxury Redefined</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(email, subject, body, is_html=True)