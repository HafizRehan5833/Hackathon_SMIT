# ------------ EMAIL HELPERS (Gmail App Password; same pattern as email.py) ------------
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

WELCOME_FROM_NAME = "Admissions Office"
WELCOME_SITE_URL = "https://gcuf.edu.pk/"
WELCOME_PHONE = "+92 301 9201234"
Company = "GCUF"

def _build_welcome_html(name: str, department: str | None):
    safe_name = name or "Student"
    dept_line = (
        f"You have been <b>successfully added</b> to the <b>{department}</b> department."
        if department else "Your enrollment has been <b>created</b> successfully."
    )
    return f"""
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>GCUF — Admission Confirmation</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#222;">
    <!-- Container -->
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <table role="presentation" width="100%" style="border-collapse:collapse;background:#0d6efd;">
        <tr>
          <td style="padding:18px 22px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:0.3px;">GCUF Admissions</h1>
            <p style="margin:6px 0 0;color:#dbe8ff;font-size:13px;">Congratulations — Your Admission Is Confirmed 🎉</p>
          </td>
        </tr>
      </table>

      <!-- Intro / Congrats -->
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="padding:24px 22px;">
            <p style="margin:0 0 10px;font-size:15px;">Hi {name},</p>
            <p style="margin:0 0 10px;font-size:15px;">
              We’re excited to inform you that your <b>admission is confirmed</b> at <b>GCUF</b>. 
              You’ve been placed in the <b>{department}</b> department. Welcome aboard!
            </p>
          </td>
        </tr>
      </table>

      <!-- What this means / Quick facts -->
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="padding:0 22px 8px;">
            <h3 style="margin:0 0 6px;font-size:18px;">What’s next for you:</h3>
          </td>
        </tr>
      </table>

      <!-- Grid (helpful blocks) -->
      <table role="presentation" width="100%" style="border-collapse:collapse;padding:0 18px 6px;">
        <tr>
          <td style="width:50%;padding:10px;">
            <div style="background:#f8fafc;border:1px solid #e8eef5;border-radius:8px;padding:12px;">
              <div style="font-size:22px;line-height:1;">📅</div>
              <div style="font-weight:bold;margin-top:6px;">Orientation & Schedule</div>
              <div style="font-size:13px;color:#444;margin-top:4px;">Check the portal for your timetable and the orientation date.</div>
            </div>
          </td>
          <td style="width:50%;padding:10px;">
            <div style="background:#f8fafc;border:1px solid #e8eef5;border-radius:8px;padding:12px;">
              <div style="font-size:22px;line-height:1;">🧾</div>
              <div style="font-weight:bold;margin-top:6px;">Documents & ID</div>
              <div style="font-size:13px;color:#444;margin-top:4px;">Bring required documents and get your student ID issued.</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="width:50%;padding:10px;">
            <div style="background:#f8fafc;border:1px solid #e8eef5;border-radius:8px;padding:12px;">
              <div style="font-size:22px;line-height:1;">💻</div>
              <div style="font-weight:bold;margin-top:6px;">Student Portal</div>
              <div style="font-size:13px;color:#444;margin-top:4px;">Access courses, announcements, and resources online.</div>
            </div>
          </td>
          <td style="width:50%;padding:10px;">
            <div style="background:#f8fafc;border:1px solid #e8eef5;border-radius:8px;padding:12px;">
              <div style="font-size:22px;line-height:1;">📣</div>
              <div style="font-weight:bold;margin-top:6px;">Department Updates</div>
              <div style="font-size:13px;color:#444;margin-top:4px;">Watch for emails from {department} about labs and sections.</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Detailed steps -->
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="padding:8px 22px 6px;">
            <div style="background:#f8fafc;border:1px solid #e8eef5;border-radius:8px;padding:12px;">
              <div style="font-weight:bold;margin-bottom:6px;">Next Steps</div>
              <ol style="margin:6px 0 0 18px;padding:0;font-size:14px;line-height:1.6;color:#333;">
                <li>Log in to the student portal to view your schedule and course materials.</li>
                <li>Attend the <b>{department}</b> orientation session (date/time will be shared on the portal).</li>
                <li>Complete any pending verifications or fee submissions, if applicable.</li>
                <li>Reach out to the department advisor for academic planning.</li>
              </ol>
            </div>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="padding:8px 22px 16px;">
            <p style="margin:0 0 16px;font-size:15px;">
              If you have any questions, simply reply to this email — we’re here to help.
            </p>
            <div style="text-align:center;margin:16px 0 8px;">
              <a href="{WELCOME_SITE_URL}"
                 style="display:inline-block;background:#0d6efd;color:#ffffff;text-decoration:none;
                        padding:14px 22px;border-radius:8px;font-weight:bold;">
                 🔐 Open Student Portal
              </a>
            </div>
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <table role="presentation" width="100%" style="border-collapse:collapse;background:#f6f7f9;">
        <tr>
          <td style="padding:16px 22px;font-size:12px;color:#555;">
            <div style="margin-bottom:6px;"><b>GCUF Admissions</b></div>
            <div>Website: <a href="{WELCOME_SITE_URL}" style="color:#0d6efd;text-decoration:none;">{WELCOME_SITE_URL}</a></div>
            <div>Phone: {WELCOME_PHONE}</div>
            <div style="margin-top:8px;color:#888;">You received this email because your admission at GCUF has been confirmed.</div>
          </td>
        </tr>
      </table>

    </div>
    <!-- /Container -->
  </body>
</html>
"""
def _build_welcome_text(name: str, department: str | None):
    name = name or "Student"
    dept_line = f"You are added in the {department} department.\n" if department else "Your enrollment has been created.\n"
    return (
        f"Hi {name},\n\n"
        f"{dept_line}"
        f"Next steps:\n"
        f"• Check your student portal for schedule and materials\n"
        f"• Attend orientation (you will receive details)\n"
        f"• Reply to this email if you have questions\n\n"
        f"Regards,\n{WELCOME_FROM_NAME}\n{WELCOME_PHONE}\n{WELCOME_SITE_URL}\n"
    )

def _send_welcome_email(to_email: str, student_name: str, department: str | None):
    print(f"Sending welcome email to {to_email}...")
    """Send Gmail (TLS 587) welcome/department email; raises on failure."""
    subject = f"Welcome! You are added in {department}" if department else "Welcome to Admissions"
    html_body = _build_welcome_html(student_name, department)
    text_body = _build_welcome_text(student_name, department)

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{WELCOME_FROM_NAME} <{GMAIL_USER}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())
# ------------ END EMAIL HELPERS ------------------------------------------------------

