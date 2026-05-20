import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_email(to_email: str, subject: str, body: str, is_html: bool = True):
    """Send email using SMTP"""
    if not settings.smtp_host or not settings.smtp_username or not settings.smtp_password:
        logger.warning("SMTP not configured — skipping email to %s", to_email)
        return False
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"Euro Hotel <{settings.smtp_username}>"
        message["To"] = to_email
        message["Reply-To"] = settings.smtp_username
        message["Message-ID"] = f"<{hash(to_email + subject)}@eurohotel.in>"
        
        # Add body to email
        if is_html:
            part = MIMEText(body, "html")
        else:
            part = MIMEText(body, "plain")
        
        message.attach(part)
        
        # Send email with multiple fallback options
        try:
            if settings.smtp_port == 465:
                # Use SSL for port 465
                await aiosmtplib.send(
                    message,
                    hostname=settings.smtp_host,
                    port=settings.smtp_port,
                    use_tls=True,
                    username=settings.smtp_username,
                    password=settings.smtp_password,
                )
            else:
                # Use STARTTLS for port 587
                await aiosmtplib.send(
                    message,
                    hostname=settings.smtp_host,
                    port=settings.smtp_port,
                    start_tls=True,
                    username=settings.smtp_username,
                    password=settings.smtp_password,
                )
        except Exception as smtp_error:
            logger.error(f"SMTP Error: {smtp_error}")
            # Try alternative method if first fails
            if settings.smtp_port == 587:
                logger.info("Retrying with SSL on port 465...")
                await aiosmtplib.send(
                    message,
                    hostname="smtp.hostinger.com",
                    port=465,
                    use_tls=True,
                    username=settings.smtp_username,
                    password=settings.smtp_password,
                )
            else:
                raise smtp_error
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

async def send_booking_confirmed_email(
    to_email: str,
    guest_name: str,
    booking_reference: str,
    check_in: str,
    check_out: str,
    total_amount: str,
    total_guests: int,
    special_requests: str | None = None,
):
    subject = f"Booking Confirmed – {booking_reference} | Euro Hotel"
    special_req_block = (
        f"""<div class="info-box" style="margin-top:12px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#5C5C5C;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Special Requests</p>
                    <p style="margin:0;color:#3C3C3C;font-size:14px;font-style:italic;">{special_requests}</p>
                </div>"""
        if special_requests else ""
    )
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #F8F6F3; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
            .header {{ background-color: #0B1D3A; padding: 32px 30px; text-align: center; }}
            .logo {{ color: #C9A227; font-size: 24px; font-weight: bold; letter-spacing: 3px; }}
            .tagline {{ color: #C9A227; font-size: 11px; letter-spacing: 2px; margin-top: 6px; opacity: 0.8; }}
            .gold-bar {{ height: 4px; background: linear-gradient(90deg, #C9A227, #D4B332, #C9A227); }}
            .content {{ padding: 40px 30px; }}
            .confirm-badge {{ text-align: center; margin-bottom: 28px; }}
            .info-box {{ background-color: #F0EDE8; border-left: 4px solid #C9A227; padding: 16px 20px; border-radius: 4px; margin: 16px 0; }}
            .dates-row {{ display: flex; gap: 0; margin: 20px 0; border: 1px solid #E0DDD8; border-radius: 8px; overflow: hidden; }}
            .date-cell {{ flex: 1; padding: 16px; text-align: center; }}
            .date-cell + .date-cell {{ border-left: 1px solid #E0DDD8; }}
            .amount-box {{ background: linear-gradient(135deg, #0B1D3A, #122342); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0; }}
            .footer {{ background-color: #F0EDE8; padding: 24px 30px; text-align: center; color: #5C5C5C; font-size: 13px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EURO HOTEL</div>
                <div class="tagline">LUXURY REDEFINED</div>
            </div>
            <div class="gold-bar"></div>
            <div class="content">
                <div class="confirm-badge">
                    <p style="font-size:40px;margin:0;">✅</p>
                    <h2 style="color:#0B1D3A;margin:8px 0 4px;font-size:22px;">Booking Confirmed!</h2>
                    <p style="color:#5C5C5C;margin:0;font-size:14px;">We look forward to welcoming you.</p>
                </div>

                <p style="color:#3C3C3C;font-size:15px;line-height:1.7;">Dear <strong>{guest_name}</strong>,</p>
                <p style="color:#3C3C3C;font-size:15px;line-height:1.7;margin-top:0;">
                    Your booking at Euro Hotel has been confirmed and your payment has been received. Here are your stay details:
                </p>

                <div class="info-box">
                    <p style="margin:0 0 4px;font-size:12px;color:#5C5C5C;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Booking Reference</p>
                    <p style="margin:0;color:#0B1D3A;font-weight:700;font-size:20px;letter-spacing:1px;">{booking_reference}</p>
                </div>

                <div class="dates-row">
                    <div class="date-cell">
                        <p style="margin:0 0 4px;font-size:11px;color:#5C5C5C;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Check-In</p>
                        <p style="margin:0;color:#0B1D3A;font-weight:700;font-size:16px;">{check_in}</p>
                        <p style="margin:4px 0 0;color:#5C5C5C;font-size:12px;">From 2:00 PM</p>
                    </div>
                    <div class="date-cell">
                        <p style="margin:0 0 4px;font-size:11px;color:#5C5C5C;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Check-Out</p>
                        <p style="margin:0;color:#0B1D3A;font-weight:700;font-size:16px;">{check_out}</p>
                        <p style="margin:4px 0 0;color:#5C5C5C;font-size:12px;">By 11:00 AM</p>
                    </div>
                    <div class="date-cell">
                        <p style="margin:0 0 4px;font-size:11px;color:#5C5C5C;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Guests</p>
                        <p style="margin:0;color:#0B1D3A;font-weight:700;font-size:16px;">{total_guests}</p>
                        <p style="margin:4px 0 0;color:#5C5C5C;font-size:12px;">Guest{"s" if total_guests != 1 else ""}</p>
                    </div>
                </div>

                {special_req_block}

                <div class="amount-box">
                    <p style="margin:0 0 4px;font-size:12px;color:#C9A227;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Total Paid</p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:white;">₹{total_amount}</p>
                </div>

                <p style="color:#3C3C3C;font-size:14px;line-height:1.7;">
                    Need help or have questions? Reach us at
                    <a href="mailto:support@eurohotel.in" style="color:#C9A227;font-weight:600;text-decoration:none;">support@eurohotel.in</a>
                </p>
            </div>
            <div class="footer">
                <p style="margin:0 0 4px;font-weight:600;color:#0B1D3A;">Euro Hotel &mdash; Luxury Redefined</p>
                <p style="margin:0;font-size:12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(to_email, subject, body, is_html=True)


async def send_cancellation_approved_email(
    to_email: str,
    guest_name: str,
    booking_reference: str,
    check_in: str,
    check_out: str,
):
    subject = f"Cancellation Approved – Booking {booking_reference} | Euro Hotel"
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #F8F6F3; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
            .header {{ background-color: #0B1D3A; padding: 30px; text-align: center; }}
            .logo {{ color: #C9A227; font-size: 24px; font-weight: bold; letter-spacing: 3px; }}
            .gold-bar {{ height: 4px; background: linear-gradient(90deg, #C9A227, #D4B332, #C9A227); }}
            .content {{ padding: 40px 30px; }}
            .info-box {{ background-color: #F0EDE8; border-left: 4px solid #C9A227; padding: 16px 20px; border-radius: 4px; margin: 24px 0; }}
            .refund-box {{ background-color: #ECFDF5; border: 1px solid #6EE7B7; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center; }}
            .footer {{ background-color: #F0EDE8; padding: 24px 30px; text-align: center; color: #5C5C5C; font-size: 13px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EURO HOTEL</div>
            </div>
            <div class="gold-bar"></div>
            <div class="content">
                <h2 style="color: #0B1D3A; margin: 0 0 8px;">Cancellation Approved</h2>
                <p style="color: #5C5C5C; margin: 0 0 24px; font-size: 15px;">Dear {guest_name},</p>
                <p style="color: #3C3C3C; line-height: 1.7; font-size: 15px;">
                    Your cancellation request has been approved. We're sorry to see you go and hope to welcome you to Euro Hotel in the future.
                </p>

                <div class="info-box">
                    <p style="margin: 0 0 6px; font-size: 13px; color: #5C5C5C; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Booking Details</p>
                    <p style="margin: 0; color: #0B1D3A; font-weight: 700; font-size: 16px;">{booking_reference}</p>
                    <p style="margin: 4px 0 0; color: #3C3C3C; font-size: 14px;">{check_in} &rarr; {check_out}</p>
                </div>

                <div class="refund-box">
                    <p style="margin: 0 0 8px; font-size: 22px;">💳</p>
                    <p style="margin: 0 0 6px; font-weight: 700; color: #065F46; font-size: 16px;">Refund in Progress</p>
                    <p style="margin: 0; color: #3C3C3C; font-size: 14px; line-height: 1.6;">
                        You will receive your refund within <strong>48 hours</strong> to your original payment method.
                    </p>
                </div>

                <p style="color: #3C3C3C; line-height: 1.7; font-size: 15px;">
                    If you have any questions or discrepancies regarding your refund, please contact us at:<br/>
                    <a href="mailto:support@eurohotel.in" style="color: #C9A227; font-weight: 600; text-decoration: none;">support@eurohotel.in</a>
                </p>
            </div>
            <div class="footer">
                <p style="margin: 0 0 4px; font-weight: 600; color: #0B1D3A;">Euro Hotel &mdash; Luxury Redefined</p>
                <p style="margin: 0; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(to_email, subject, body, is_html=True)


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