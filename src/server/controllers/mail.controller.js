const transporter = require("../config/mail")

const requiredEnvVars = [
  "BREVO_SMTP_HOST",
  "BREVO_SMTP_PORT",
  "BREVO_SMTP_USER",
  "BREVO_SMTP_PASS",
  "MAIL_TO",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

//This well send the Data from the contact us Section to the email address
const contactSection = async (name, email, subject, message) => {
  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "GameFest"}" <${process.env.BREVO_SMTP_USER}>`,
    replyTo: email,
    to: process.env.MAIL_TO,
    subject: `Contact Form | ${subject}`,
    text: message,
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GameFest Contact Email</title>
  </head>

  <body style="margin:0; padding:0; background:#0b0b0b;">
    <!-- Preheader (hidden in most clients) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      New contact form submission from ${name} — ${subject}
    </div>

    <!-- Wrapper -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0b0b0b; padding:24px 12px;">
      <tr>
        <td align="center">

          <!-- Container -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
            style="
              width:600px; max-width:600px;
              background:#0b0b0b;
              border:1px solid rgba(255,255,91,0.35);
              border-radius:14px;
              overflow:hidden;
            ">

            <!-- Header -->
            <tr>
              <td style="padding:22px 22px 14px 22px;">

                <!-- Title row -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="
                        font-family:Segoe UI, Arial, sans-serif;
                        font-size:22px;
                        line-height:26px;
                        font-weight:900;
                        letter-spacing:1px;
                        color:#ffff5b;
                      ">
                        GameFest
                      </div>
                    </td>

                    <!-- Badge -->
                    <td align="right" style="vertical-align:middle;">
                      <span style="
                        display:inline-block;
                        padding:8px 12px;
                        background:#1a1a1a;
                        border:1px solid rgba(255,255,91,0.35);
                        border-radius:999px;
                        color:#ffff5b;
                        font-family:Segoe UI, Arial, sans-serif;
                        font-size:12px;
                        letter-spacing:1px;
                        font-weight:700;
                        text-transform:uppercase;
                      ">
                        Contact Form
                      </span>
                    </td>
                  </tr>
                </table>

                <div style="
                  margin-top:14px;
                  height:1px;
                  background:rgba(255,255,255,0.10);
                "></div>

                <h2 style="
                  margin:16px 0 0 0;
                  font-family:Segoe UI, Arial, sans-serif;
                  font-size:22px;
                  line-height:28px;
                  color:#ffff5b;
                  font-weight:800;
                  letter-spacing:0.5px;
                ">
                  New Submission Received
                </h2>

                <p style="
                  margin:8px 0 0 0;
                  font-family:Segoe UI, Arial, sans-serif;
                  font-size:14px;
                  line-height:20px;
                  color:#cfcfcf;
                ">
                  A visitor submitted the contact form on the GameFest website.
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:16px 22px 22px 22px;">

                <!-- Info cards (stack on narrow clients) -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>

                    <!-- Left card: Name + Email -->
                    <td style="padding:0 8px 12px 0;" valign="top">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                        style="
                          background:#262626;
                          border-radius:14px;
                          border:1px solid rgba(255,255,255,0.08);
                        ">
                        <tr>
                          <td style="padding:14px 14px 12px 14px;">
                            <div style="
                              font-family:Segoe UI, Arial, sans-serif;
                              font-size:12px;
                              color:#a9a9a9;
                              letter-spacing:1px;
                              text-transform:uppercase;
                              font-weight:700;
                              margin-bottom:6px;
                            ">
                              Name
                            </div>
                            <div style="
                              font-family:Segoe UI, Arial, sans-serif;
                              font-size:15px;
                              color:#ffffff;
                              font-weight:700;
                              margin-bottom:12px;
                            ">
                              ${name}
                            </div>

                            <div style="
                              font-family:Segoe UI, Arial, sans-serif;
                              font-size:12px;
                              color:#a9a9a9;
                              letter-spacing:1px;
                              text-transform:uppercase;
                              font-weight:700;
                              margin-bottom:6px;
                            ">
                              Email
                            </div>
                            <div style="
                              font-family:Segoe UI, Arial, sans-serif;
                              font-size:15px;
                              color:#ffffff;
                              font-weight:700;
                              word-break:break-word;
                            ">
                              <a href="mailto:${email}" style="color:#ffff5b; text-decoration:none; font-weight:800;">
                                ${email}
                              </a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>

                    <!-- Right card: Subject -->
                    <td style="padding:0 0 12px 8px;" valign="top">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                        style="
                          background:#262626;
                          border-radius:14px;
                          border:1px solid rgba(255,255,255,0.08);
                        ">
                        <tr>
                          <td style="padding:14px 14px 12px 14px;">
                            <div style="
                              font-family:Segoe UI, Arial, sans-serif;
                              font-size:12px;
                              color:#a9a9a9;
                              letter-spacing:1px;
                              text-transform:uppercase;
                              font-weight:700;
                              margin-bottom:6px;
                            ">
                              Subject
                            </div>
                            <div style="
                              font-family:Segoe UI, Arial, sans-serif;
                              font-size:15px;
                              line-height:22px;
                              color:#ffffff;
                              font-weight:800;
                              word-break:break-word;
                            ">
                              ${subject}
                            </div>

                            <div style="height:18px;"></div>

                            <div style="
                              font-family:Segoe UI, Arial, sans-serif;
                              font-size:12px;
                              color:#a9a9a9;
                              letter-spacing:1px;
                              text-transform:uppercase;
                              font-weight:700;
                              margin-bottom:6px;
                            ">
                              Reply
                            </div>
                            <div style="
                              font-family:Segoe UI, Arial, sans-serif;
                              font-size:14px;
                              color:#cfcfcf;
                              line-height:20px;
                            ">
                              Use your email client’s reply button or click the address on the left.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>

                  </tr>
                </table>

                <!-- Message card -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                  style="
                    background:#1a1a1a;
                    border-radius:14px;
                    border:1px solid rgba(255,255,255,0.08);
                    overflow:hidden;
                  ">
                  <tr>
                    <td style="padding:14px;">
                      <div style="
                        font-family:Segoe UI, Arial, sans-serif;
                        font-size:12px;
                        color:#a9a9a9;
                        letter-spacing:1px;
                        text-transform:uppercase;
                        font-weight:700;
                        margin-bottom:10px;
                      ">
                        Message
                      </div>

                      <div style="
                        height:3px;
                        width:64px;
                        background:#ffff5b;
                        border-radius:999px;
                        margin-bottom:12px;
                      "></div>

                      <div style="
                        font-family:Segoe UI, Arial, sans-serif;
                        font-size:14px;
                        line-height:22px;
                        color:#dddddd;
                        white-space:pre-line;
                        word-break:break-word;
                      ">
                        ${message}
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:16px; height:1px; background:rgba(255,255,255,0.10);"></div>

                <p style="
                  margin:14px 0 0 0;
                  font-family:Segoe UI, Arial, sans-serif;
                  font-size:12px;
                  line-height:18px;
                  color:#8e8e8e;
                  text-align:center;
                ">
                  Sent via the GameFest website contact form.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
  `
  });

  console.log("✅ Contact email sent:", info.messageId);
};

//Function to send information from the contact page to the email
const contact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log(req.body)

    await contactSection(name, email, subject, message);

    res.json({
      success: true,
      message: "✅ Contact message sent successfully"
    })
  } catch (error) {
    console.error("Error in contact controller:", error);
    res.status(500).json({
      success: false,
      message: "❌ Error sending contact message"
    })
  }
}

//This is the form submission for the sponsor Section
const sponsorSection = async (firstName, lastName, companyName, email, number, about) => {
  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "GameFest"}" <${process.env.BREVO_SMTP_USER}>`,
    replyTo: email,
    to: process.env.MAIL_TO,
    subject: `Sponsor Form | ${companyName}`,
    text: about,
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GameFest Sponsor Submission</title>
  </head>

  <body style="margin:0; padding:0; background:#0b0b0b;">
    <!-- Preheader (hidden in most clients) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      New sponsor submission from ${firstName} ${lastName} — ${companyName}
    </div>

    <!-- Wrapper -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0b0b0b; padding:24px 12px;">
      <tr>
        <td align="center">

          <!-- Container -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
            style="
              width:600px; max-width:600px;
              background:#0b0b0b;
              border:1px solid rgba(255,255,91,0.35);
              border-radius:14px;
              overflow:hidden;
            ">

            <!-- Header -->
            <tr>
              <td style="padding:22px 22px 14px 22px;">

                <!-- Title row -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="
                        font-family:Segoe UI, Arial, sans-serif;
                        font-size:22px;
                        line-height:26px;
                        font-weight:900;
                        letter-spacing:1px;
                        color:#ffff5b;
                      ">
                        GameFest
                      </div>
                    </td>

                    <!-- Badge -->
                    <td align="right" style="vertical-align:middle;">
                      <span style="
                        display:inline-block;
                        padding:8px 12px;
                        background:#1a1a1a;
                        border:1px solid rgba(255,255,91,0.35);
                        border-radius:999px;
                        color:#ffff5b;
                        font-family:Segoe UI, Arial, sans-serif;
                        font-size:12px;
                        letter-spacing:1px;
                        font-weight:700;
                        text-transform:uppercase;
                      ">
                        Sponsor Form
                      </span>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:14px; height:1px; background:rgba(255,255,255,0.10);"></div>

                <h2 style="
                  margin:16px 0 0 0;
                  font-family:Segoe UI, Arial, sans-serif;
                  font-size:22px;
                  line-height:28px;
                  color:#ffff5b;
                  font-weight:800;
                  letter-spacing:0.5px;
                ">
                  New Sponsor Submission Received
                </h2>

                <p style="
                  margin:8px 0 0 0;
                  font-family:Segoe UI, Arial, sans-serif;
                  font-size:14px;
                  line-height:20px;
                  color:#cfcfcf;
                ">
                  A visitor submitted the sponsor form on the GameFest website.
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:16px 22px 22px 22px;">

                <!-- Info cards -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <!-- Left card: Contact -->
                    <td style="padding:0 8px 12px 0;" valign="top">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                        style="background:#262626; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
                        <tr>
                          <td style="padding:14px 14px 12px 14px;">

                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:12px; color:#a9a9a9; letter-spacing:1px; text-transform:uppercase; font-weight:700; margin-bottom:6px;">
                              Full Name
                            </div>
                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; color:#ffffff; font-weight:800; margin-bottom:12px;">
                              ${firstName} ${lastName}
                            </div>

                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:12px; color:#a9a9a9; letter-spacing:1px; text-transform:uppercase; font-weight:700; margin-bottom:6px;">
                              Email
                            </div>
                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; color:#ffffff; font-weight:700; word-break:break-word; margin-bottom:12px;">
                              <a href="mailto:${email}" style="color:#ffff5b; text-decoration:none; font-weight:800;">
                                ${email}
                              </a>
                            </div>

                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:12px; color:#a9a9a9; letter-spacing:1px; text-transform:uppercase; font-weight:700; margin-bottom:6px;">
                              Phone
                            </div>
                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; color:#ffffff; font-weight:800; word-break:break-word;">
                              <a href="tel:${number}" style="color:#ffff5b; text-decoration:none; font-weight:800;">
                                ${number}
                              </a>
                            </div>

                          </td>
                        </tr>
                      </table>
                    </td>

                    <!-- Right card: Company -->
                    <td style="padding:0 0 12px 8px;" valign="top">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                        style="background:#262626; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
                        <tr>
                          <td style="padding:14px 14px 12px 14px;">

                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:12px; color:#a9a9a9; letter-spacing:1px; text-transform:uppercase; font-weight:700; margin-bottom:6px;">
                              Company Name
                            </div>
                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:22px; color:#ffffff; font-weight:800; word-break:break-word; margin-bottom:14px;">
                              ${companyName}
                            </div>

                            <div style="height:6px;"></div>

                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:12px; color:#a9a9a9; letter-spacing:1px; text-transform:uppercase; font-weight:700; margin-bottom:6px;">
                              Follow Up
                            </div>
                            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:14px; color:#cfcfcf; line-height:20px;">
                              Reply to this email or contact them using the details provided.
                            </div>

                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- About / Message card -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                  style="background:#1a1a1a; border-radius:14px; border:1px solid rgba(255,255,255,0.08); overflow:hidden;">
                  <tr>
                    <td style="padding:14px;">
                      <div style="font-family:Segoe UI, Arial, sans-serif; font-size:12px; color:#a9a9a9; letter-spacing:1px; text-transform:uppercase; font-weight:700; margin-bottom:10px;">
                        About / Message
                      </div>

                      <div style="height:3px; width:64px; background:#ffff5b; border-radius:999px; margin-bottom:12px;"></div>

                      <div style="
                        font-family:Segoe UI, Arial, sans-serif;
                        font-size:14px;
                        line-height:22px;
                        color:#dddddd;
                        white-space:pre-line;
                        word-break:break-word;
                      ">
                        ${about}
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:16px; height:1px; background:rgba(255,255,255,0.10);"></div>

                <p style="
                  margin:14px 0 0 0;
                  font-family:Segoe UI, Arial, sans-serif;
                  font-size:12px;
                  line-height:18px;
                  color:#8e8e8e;
                  text-align:center;
                ">
                  Sent via the GameFest sponsor form.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`
,
  });

  console.log("✅ Sponsor email sent:", info.messageId);
};

//Function to send information from the sponsor page to the email
const sponsor = async (req, res) => {
  try {
    const { fName, lName, cName, email, number, about } = req.body
    console.log(req.body)

    await sponsorSection(fName, lName, cName, email, number, about);

    res.json({
      success: true,
      message: "✅ Message sent successfully"
    })
  } catch (error) {
    console.error("Error in sponsor controller:", error);
    res.status(500).json({
      success: false,
      message: "❌ Error sending message"
    })
  }
}

// Function to send information from the cosplay Sign up to the email
const cosplaySignup = async (req, res) => {
  const { Name, Email, Number } = req.body;

  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "GameFest"}" <${process.env.BREVO_SMTP_USER}>`,
    replyTo: Email,
    to: process.env.MAIL_TO,
    subject: `Cosplay Signup | ${Name}`,
    text: `
      New Cosplay Signup - GameFest

      Name: ${Name}
      Email: ${Email}
      Number: ${Number}
      `,
      html: `
        <div style="margin:0; padding:0; background-color:#0b0b0f; font-family:Arial, Helvetica, sans-serif; color:#ffffff;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0b0b0f; margin:0; padding:30px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:650px; background:#11131a; border:1px solid #232734; border-radius:16px; overflow:hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg, #ffff5b 0%, #ffb800 100%); padding:28px 32px; text-align:center;">
                      <h1 style="margin:0; font-size:30px; line-height:1.2; color:#111111; font-weight:900; letter-spacing:2px;">
                        GAMEFEST
                      </h1>
                      <p style="margin:8px 0 0; font-size:14px; color:#1b1b1b; font-weight:700; letter-spacing:3px;">
                        COSPLAY SIGNUP
                      </p>
                    </td>
                  </tr>

                  <!-- Intro -->
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#d8dbe5;">
                        A new participant has submitted a <span style="color:#ffff5b; font-weight:700;">GameFest Cosplay Signup</span>.
                      </p>

                      <!-- Info Card -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#171a22; border:1px solid #2a3040; border-radius:12px;">
                        <tr>
                          <td style="padding:24px;">
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="padding:0 0 14px; font-size:13px; color:#8f97ab; text-transform:uppercase; letter-spacing:1px;">
                                  Full Name
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0 0 20px; font-size:18px; color:#ffffff; font-weight:700; border-bottom:1px solid #2a3040;">
                                  ${Name}
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:20px 0 14px; font-size:13px; color:#8f97ab; text-transform:uppercase; letter-spacing:1px;">
                                  Email Address
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0 0 20px; font-size:18px; color:#ffffff; font-weight:700; border-bottom:1px solid #2a3040;">
                                  <a href="mailto:${Email}" style="color:#ffffff; text-decoration:none;">${Email}</a>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:20px 0 14px; font-size:13px; color:#8f97ab; text-transform:uppercase; letter-spacing:1px;">
                                  Contact Number
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0; font-size:18px; color:#ffffff; font-weight:700;">
                                  <a href="tel:${Number}" style="color:#ffffff; text-decoration:none;">${Number}</a>
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>

                      <!-- Footer Note -->
                      <p style="margin:24px 0 0; font-size:14px; line-height:1.7; color:#aab1c3;">
                        Review this signup and follow up with the participant for next steps regarding their cosplay entry.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 32px; background:#0f1117; border-top:1px solid #232734; text-align:center;">
                      <p style="margin:0; font-size:12px; line-height:1.6; color:#7f8798; letter-spacing:1px;">
                        GAMEFEST GUYANA • ESPORTS • COMMUNITY • COMPETITION
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
    `
  });

  return res.status(200).json({
    success: true,
    message: "Cosplay signup submitted successfully",
    info
  });
};

module.exports = { contact, sponsor,cosplaySignup };