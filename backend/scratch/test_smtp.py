import sys
import os
from pathlib import Path

# Add the project root to sys.path so 'backend' can be imported
root_dir = str(Path(__file__).resolve().parent.parent.parent)
if root_dir not in sys.path:
    sys.path.append(root_dir)

from backend.config import settings
from backend.services.email_helper import send_email

def test_smtp():
    print("Testing SMTP Configuration...")
    print(f"SMTP_HOST: {settings.SMTP_HOST}")
    print(f"SMTP_PORT: {settings.SMTP_PORT}")
    print(f"SMTP_USER: {settings.SMTP_USER}")
    print(f"SMTP_SENDER: {settings.SMTP_SENDER}")
    
    if not settings.SMTP_HOST or not settings.SMTP_USER or settings.SMTP_USER == 'your_gmail_address@gmail.com':
        print("\n[WARNING] Please configure your SMTP credentials in backend/.env to test actual email sending.")
        print("Fallback to local 'sent_emails.txt' will be tested instead.\n")
        
    success = send_email(
        to_email="test@example.com",
        subject="Test Email from BioTwin AI",
        text_body="This is a test email to verify SMTP configuration.",
        html_body="<p>This is a <b>test email</b> to verify SMTP configuration.</p>"
    )
    
    if success:
        print("\nTest completed: Email sending logic executed successfully!")
    else:
        print("\nTest completed: Email sending logic failed (see errors above).")

if __name__ == "__main__":
    test_smtp()
