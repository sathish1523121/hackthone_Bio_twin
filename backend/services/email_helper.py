import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from backend.config import settings

def send_email(to_email: str, subject: str, text_body: str, html_body: str = None) -> bool:
    """
    Sends an email using the SMTP settings if configured.
    Falls back to writing to backend/sent_emails.txt and console log.
    """
    # 1. Determine if SMTP is configured
    use_smtp = bool(settings.SMTP_HOST and settings.SMTP_USER)
    
    # 2. Log fallback details locally for development
    log_content = (
        f"\n========================================\n"
        f"EMAIL SENT TO: {to_email}\n"
        f"SUBJECT: {subject}\n"
        f"BODY:\n{text_body}\n"
        f"========================================\n"
    )
    
    # Write to terminal
    print(log_content)
    
    # Write to local file sent_emails.txt
    try:
        workspace_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        file_path = os.path.join(workspace_dir, "backend", "sent_emails.txt")
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(log_content)
    except Exception as e:
        print(f"Failed to log email to sent_emails.txt: {e}")

    # 3. Send using SMTP if configured
    if use_smtp:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_SENDER
            msg["To"] = to_email
            
            # Attach parts
            part1 = MIMEText(text_body, "plain")
            msg.attach(part1)
            
            if html_body:
                part2 = MIMEText(html_body, "html")
                msg.attach(part2)
                
            # Connect and send
            if settings.SMTP_PORT == 465:
                server_ctx = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
            else:
                server_ctx = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
                if settings.SMTP_PORT == 587:
                    server_ctx.starttls()
            
            with server_ctx as server:
                if settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_SENDER, to_email, msg.as_string())
            print(f"Successfully sent real email to {to_email} via SMTP.")
            return True
        except Exception as e:
            print(f"SMTP sending failed: {e}. Fallback to terminal/log was successful.")
            return False
            
    return True

def send_otp_email(username: str, email: str, otp: str) -> bool:
    subject = "Verify Your BioTwin AI Account"
    body = (
        f"Hello {username},\n\n"
        f"Welcome to BioTwin AI.\n\n"
        f"Your verification code:\n"
        f"{otp}\n\n"
        f"This code expires in 5 minutes.\n\n"
        f"If you did not request this, ignore this email."
    )
    return send_email(email, subject, body)

def send_reset_email(email: str, reset_link: str) -> bool:
    subject = "Reset Your BioTwin AI Password"
    body = (
        f"Hello,\n\n"
        f"We received a request to reset your BioTwin AI password.\n\n"
        f"Click below to create a new password:\n"
        f"{reset_link}\n\n"
        f"This link expires in 15 minutes.\n\n"
        f"If this was not you, ignore this email."
    )
    return send_email(email, subject, body)
