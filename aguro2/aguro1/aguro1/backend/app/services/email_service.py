import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger("uvicorn")


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP code to the recipient's email address via SMTP.
    If SMTP credentials (SMTP_USER & SMTP_PASSWORD in .env) are configured,
    delivers a real HTML email over TLS.
    Otherwise, logs simulated email dispatch safely without unicode errors.
    """
    try:
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning(
                f"[EMAIL SERVICE] SMTP credentials not set (SMTP_USER / SMTP_PASSWORD). "
                f"Simulating email delivery for {to_email}. OTP Code is: {otp_code}"
            )
            print(f"\n=======================================================")
            print(f" [SIMULATED EMAIL DISPATCH] To: {to_email}")
            print(f" OTP Code: {otp_code}")
            print(f"=======================================================\n")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"AgroGuide Verification Code: {otp_code}"
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        msg["To"] = to_email

        text_content = f"Your AgroGuide OTP verification code is: {otp_code}. Valid for 10 minutes."
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }}
            .card {{ max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e1e8ed; }}
            .brand {{ color: #16a34a; font-size: 24px; font-weight: bold; margin-bottom: 8px; text-align: center; }}
            .otp-box {{ font-size: 36px; font-weight: 800; color: #16a34a; letter-spacing: 6px; background-color: #f0fdf4; border: 2px dashed #b7eb8f; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0; }}
            .footer {{ font-size: 12px; color: #888888; text-align: center; margin-top: 24px; }}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">AgroGuide</div>
            <h3 style="text-align: center; color: #333333;">Verification Code</h3>
            <p style="color: #555555; text-align: center;">Use the 6-digit One-Time Password (OTP) below to complete your authentication:</p>
            <div class="otp-box">{otp_code}</div>
            <p style="font-size: 13px; color: #666666; text-align: center;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            <div class="footer">AgroGuide Agricultural Platform &bull; Smart Farming Advisory</div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())

        logger.info(f"[EMAIL SERVICE SUCCESS] Real OTP email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL SERVICE ERROR] Failed to send email to {to_email}: {e}")
        return False


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Sends a password reset token to the recipient's email address via SMTP.
    Falls back to console output in dev mode when SMTP is not configured.
    """
    try:
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning(
                f"[EMAIL SERVICE] SMTP not configured. "
                f"Simulating password reset email for {to_email}."
            )
            print(f"\n=======================================================")
            print(f" [SIMULATED PASSWORD RESET EMAIL] To: {to_email}")
            print(f" Reset Token: {reset_token}")
            print(f" (Valid for 30 minutes)")
            print(f"=======================================================\n")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "AgroGuide – Password Reset Request"
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        msg["To"] = to_email

        text_content = (
            f"You requested a password reset for your AgroGuide account.\n\n"
            f"Your reset token is:\n{reset_token}\n\n"
            f"This token is valid for 30 minutes. If you did not request this, ignore this email."
        )
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }}
            .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e1e8ed; }}
            .brand {{ color: #16a34a; font-size: 24px; font-weight: bold; margin-bottom: 8px; text-align: center; }}
            .token-box {{ font-size: 13px; font-family: monospace; word-break: break-all; background-color: #f0fdf4; border: 2px dashed #b7eb8f; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0; color: #166534; }}
            .footer {{ font-size: 12px; color: #888888; text-align: center; margin-top: 24px; }}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">AgroGuide</div>
            <h3 style="text-align: center; color: #333333;">Password Reset Request</h3>
            <p style="color: #555555; text-align: center;">
              We received a request to reset your password. Copy the token below and paste it into the reset form on the login page.
            </p>
            <div class="token-box">{reset_token}</div>
            <p style="font-size: 13px; color: #666666; text-align: center;">
              This token is valid for <strong>30 minutes</strong>. If you did not request this, please ignore this email.
            </p>
            <div class="footer">AgroGuide Agricultural Platform &bull; Smart Farming Advisory</div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())

        logger.info(f"[EMAIL SERVICE SUCCESS] Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL SERVICE ERROR] Failed to send password reset email to {to_email}: {e}")
        return False

