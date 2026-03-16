const transporter = require("../config/mail");

const requiredEnvVars = [
  "BREVO_SMTP_HOST",
  "BREVO_SMTP_PORT",
  "BREVO_SMTP_USER",
  "BREVO_SMTP_PASS",
  "MAIL_TO",
  "MAIL_FROM_NAME",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const MAIL_FROM = `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_TO}>`;

const logMailResult = (label, info) => {
  console.log(`📨 ${label} email result`);
  console.log("messageId:", info.messageId);
  console.log("accepted:", info.accepted);
  console.log("rejected:", info.rejected);
  console.log("response:", info.response);
};

const normalizeText = (value) => String(value ?? "").trim();

const isValidEmailAddress = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeText(value));

const isValidPhoneValue = (value) => {
  const digits = normalizeText(value).replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatMoney = (value) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-GY", {
    style: "currency",
    currency: "GYD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
};

const renderButton = (label, href) => {
  if (!href) return "";
  return `
    <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:12px 18px; border-radius:999px; background:#f2dd67; color:#111111; text-decoration:none; font-family:Segoe UI, Arial, sans-serif; font-size:13px; line-height:16px; font-weight:800; letter-spacing:0.4px;">
      ${escapeHtml(label)}
    </a>
  `;
};

const renderDetailRowsHtml = (rows = []) => {
  const filtered = rows.filter((row) => row && row.value !== null && row.value !== undefined && row.value !== "");

  if (!filtered.length) {
    return `
      <tr>
        <td style="padding:0; font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:22px; color:#c9cbd3;">
          No details available.
        </td>
      </tr>
    `;
  }

  return filtered.map((row) => {
    const label = escapeHtml(row.label);
    const value = escapeHtml(row.value);
    const valueHtml = row.href
      ? `<a href="${escapeHtml(row.href)}" style="color:#f2dd67; text-decoration:none; font-weight:800;">${value}</a>`
      : value;

    return `
      <tr>
        <td style="padding:0 12px 12px 0; width:38%; vertical-align:top; font-family:Segoe UI, Arial, sans-serif; font-size:11px; line-height:18px; color:#8f94a3; letter-spacing:1.2px; text-transform:uppercase; font-weight:700;">
          ${label}
        </td>
        <td style="padding:0 0 12px; vertical-align:top; font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:22px; color:#ffffff; font-weight:700; word-break:break-word;">
          ${valueHtml}
        </td>
      </tr>
    `;
  }).join("");
};

const buildDetailRowsText = (rows = []) => rows
  .filter((row) => row && row.value !== null && row.value !== undefined && row.value !== "")
  .map((row) => `${row.label}: ${row.value}`)
  .join("\n");

const renderSection = ({ title, bodyHtml }) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:18px; background:#1a1d25; border:1px solid rgba(255,255,255,0.07); border-radius:18px; overflow:hidden;">
    <tr>
      <td style="padding:20px;">
        <div style="font-family:Segoe UI, Arial, sans-serif; font-size:11px; line-height:18px; color:#8f94a3; letter-spacing:1.3px; text-transform:uppercase; font-weight:700; margin-bottom:10px;">
          ${escapeHtml(title)}
        </div>
        <div style="height:3px; width:68px; background:#f2dd67; border-radius:999px; margin-bottom:14px;"></div>
        ${bodyHtml}
      </td>
    </tr>
  </table>
`;

const renderRowsSection = (title, rows = []) => renderSection({
  title,
  bodyHtml: `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${renderDetailRowsHtml(rows)}
    </table>
  `,
});

const renderTextSection = (title, text) => renderSection({
  title,
  bodyHtml: `
    <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:25px; color:#e8e9ee; white-space:pre-line; word-break:break-word;">
      ${escapeHtml(text)}
    </div>
  `,
});

const renderHtmlSection = (title, html) => renderSection({
  title,
  bodyHtml: html,
});

const renderListSection = (title, items = [], emptyText = "No items provided.") => {
  const filtered = items.filter(Boolean);
  return renderSection({
    title,
    bodyHtml: filtered.length
      ? `
        <ul style="margin:0; padding-left:20px; font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:24px; color:#ffffff;">
          ${filtered.map((item, index) => `<li style="margin:0 0 8px;">${index + 1}. ${escapeHtml(item)}</li>`).join("")}
        </ul>
      `
      : `
        <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:24px; color:#c9cbd3;">
          ${escapeHtml(emptyText)}
        </div>
      `,
  });
};

const buildEmailLayout = ({
  preheader = "",
  badge = "GameFest Update",
  title = "GameFest",
  subtitle = "",
  introHtml = "",
  sectionsHtml = "",
  footerText = "Sent via the GameFest website.",
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#0f1013;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f1013; padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640"
            style="width:640px; max-width:640px; background:#15171c; border:1px solid rgba(255,255,255,0.08); border-radius:24px; overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 24px; background:linear-gradient(180deg, #17191f 0%, #14161b 100%); border-bottom:1px solid rgba(255,255,255,0.08);">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="font-family:Segoe UI, Arial, sans-serif; font-size:26px; line-height:30px; font-weight:900; letter-spacing:0.8px; color:#ffffff;">
                        GameFest
                      </div>
                      <div style="margin-top:8px; font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:20px; color:#c9cbd3;">
                        ${escapeHtml(subtitle)}
                      </div>
                    </td>

                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block; padding:10px 14px; background:rgba(242,221,103,0.10); border:1px solid rgba(242,221,103,0.28); border-radius:999px; color:#f2dd67; font-family:Segoe UI, Arial, sans-serif; font-size:11px; letter-spacing:1.3px; font-weight:700; text-transform:uppercase;">
                        ${escapeHtml(badge)}
                      </span>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:18px; height:3px; width:72px; background:#f2dd67; border-radius:999px;"></div>

                <h1 style="margin:18px 0 0; font-family:Segoe UI, Arial, sans-serif; font-size:28px; line-height:34px; font-weight:800; color:#ffffff;">
                  ${escapeHtml(title)}
                </h1>

                ${introHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 28px;">
                ${sectionsHtml}

                <div style="margin-top:18px; padding-top:18px; border-top:1px solid rgba(255,255,255,0.08);">
                  <p style="margin:0; font-family:Segoe UI, Arial, sans-serif; font-size:12px; line-height:18px; color:#8f94a3; text-align:center;">
                    ${escapeHtml(footerText)}
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const formatDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return formatMoney(value);
  }

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return formatMoney(Number(trimmed));
  }

  return trimmed;
};

const toTitleCase = (value) => String(value ?? "")
  .replace(/_/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .replace(/\b\w/g, (char) => char.toUpperCase());

const getPrizeLabel = (key) => {
  const normalizedKey = String(key ?? "").toLowerCase();

  const knownLabels = {
    first_prize: "1st Place",
    second_prize: "2nd Place",
    third_prize: "3rd Place",
    fourth_prize: "4th Place",
    first_place_prize: "1st Place",
    second_place_prize: "2nd Place",
    third_place_prize: "3rd Place",
    fourth_place_prize: "4th Place",
    prize_1: "1st Place",
    prize_2: "2nd Place",
    prize_3: "3rd Place",
    prize_4: "4th Place",
    place_1_prize: "1st Place",
    place_2_prize: "2nd Place",
    place_3_prize: "3rd Place",
    place_4_prize: "4th Place",
    total_prize_pool: "Prize Pool",
    prize_pool: "Prize Pool",
  };

  if (knownLabels[normalizedKey]) {
    return knownLabels[normalizedKey];
  }

  return toTitleCase(key).replace(/\bPrize\b/i, "Prize");
};

const getPrizeSortWeight = (key) => {
  const normalizedKey = String(key ?? "").toLowerCase();
  const priorities = [
    "first_prize",
    "first_place_prize",
    "prize_1",
    "place_1_prize",
    "second_prize",
    "second_place_prize",
    "prize_2",
    "place_2_prize",
    "third_prize",
    "third_place_prize",
    "prize_3",
    "place_3_prize",
    "fourth_prize",
    "fourth_place_prize",
    "prize_4",
    "place_4_prize",
    "total_prize_pool",
    "prize_pool",
  ];

  const idx = priorities.indexOf(normalizedKey);
  return idx === -1 ? 999 : idx;
};

const getPrizeEntries = (tournamentDetails = {}) => {
  if (!tournamentDetails || typeof tournamentDetails !== "object") {
    return [];
  }

  return Object.entries(tournamentDetails)
    .filter(([key, value]) => /prize/i.test(key) && value !== null && value !== undefined && value !== "")
    .filter(([, value]) => typeof value !== "object")
    .map(([key, value]) => ({
      key,
      label: getPrizeLabel(key),
      value: formatDisplayValue(value),
      weight: getPrizeSortWeight(key),
    }))
    .filter((entry) => entry.value)
    .sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.label.localeCompare(b.label);
    });
};

const contactSection = async (name, email, phone, subject, message) => {
  const text = `
New Contact Form Submission - GameFest

Name: ${name}
Phone: ${phone}
Email: ${email}
Subject: ${subject}

Message:
${message}
  `.trim();

  const html = buildEmailLayout({
    preheader: `New contact inquiry from ${name} regarding ${subject}`,
    badge: "Contact Form",
    title: subject,
    subtitle: "Website contact inquiry received",
    introHtml: `
      <p style="margin:12px 0 0; font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:22px; color:#c9cbd3;">
        A new visitor message came in through the GameFest website. The details are below for quick follow-up.
      </p>
    `,
    sectionsHtml: [
      renderRowsSection("Contact Details", [
        { label: "Name", value: name },
        { label: "Phone", value: phone, href: `tel:${phone}` },
        { label: "Email", value: email, href: `mailto:${email}` },
        { label: "Subject", value: subject },
      ]),
      renderTextSection("Message", message),
    ].join(""),
    footerText: "Sent via the GameFest website contact form.",
  });

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    replyTo: email,
    to: process.env.MAIL_TO,
    subject: `Contact Form | ${subject}`,
    text,
    html,
  });

  logMailResult("Contact", info);
};

const contact = async (req, res) => {
  try {
    const name = normalizeText(req.body?.name);
    const email = normalizeText(req.body?.email).toLowerCase();
    const phone = normalizeText(req.body?.number ?? req.body?.phone);
    const subject = normalizeText(req.body?.subject);
    const message = normalizeText(req.body?.message);

    console.log("📩 Contact request body:", req.body);

    const errors = [];

    if (!name) errors.push("Name is required.");
    if (!phone) errors.push("Phone number is required.");
    else if (!isValidPhoneValue(phone)) errors.push("Please enter a valid phone number.");
    if (!email) errors.push("Email is required.");
    else if (!isValidEmailAddress(email)) errors.push("Please enter a valid email address.");
    if (!subject) errors.push("Subject is required.");
    if (!message) errors.push("Message is required.");

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    await contactSection(name, email, phone, subject, message);

    return res.json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("❌ Error in contact controller:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending contact message.",
    });
  }
};

const sponsorSection = async (firstName, lastName, companyName, email, number, about) => {
  const fullName = [normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(" ").trim();

  const text = `
New Vendor Submission - GameFest

Full Name: ${fullName}
Company Name: ${companyName}
Email: ${email}
Phone: ${number}

About / Message:
${about}
  `.trim();

  const html = buildEmailLayout({
    preheader: `New vendor submission from ${fullName} for ${companyName}`,
    badge: "Vendor Form",
    title: "New Vendor Submission",
    subtitle: "Vendor application received",
    introHtml: `
      <p style="margin:12px 0 0; font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:22px; color:#c9cbd3;">
        A visitor submitted the vendor form on the GameFest website.
      </p>
    `,
    sectionsHtml: [
      renderRowsSection("Applicant Details", [
        { label: "Full Name", value: fullName },
        { label: "Company Name", value: companyName },
        { label: "Email", value: email, href: `mailto:${email}` },
        { label: "Phone", value: number, href: `tel:${number}` },
      ]),
      renderTextSection("About / Message", about),
    ].join(""),
    footerText: "Sent via the GameFest vendor form.",
  });

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    replyTo: email,
    to: process.env.MAIL_TO,
    subject: `Vendor Form | ${companyName}`,
    text,
    html,
  });

  logMailResult("Sponsor", info);
};

const sponsor = async (req, res) => {
  try {
    const { fName, lName, cName, email, number, about } = req.body;
    console.log("📩 Sponsor request body:", req.body);

    await sponsorSection(fName, lName, cName, email, number, about);

    return res.json({
      success: true,
      message: "✅ Message sent successfully",
    });
  } catch (error) {
    console.error("❌ Error in sponsor controller:", error);
    return res.status(500).json({
      success: false,
      message: "❌ Error sending message",
    });
  }
};

const cosplaySignup = async (req, res) => {
  try {
    const Name = normalizeText(req.body?.Name);
    const Email = normalizeText(req.body?.Email);
    const Number = normalizeText(req.body?.Number);
    const Character = normalizeText(req.body?.Character);
    const Reference = normalizeText(req.body?.Reference);

    console.log("📩 Cosplay request body:", req.body);

    const isValidHttpUrl = (value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    };

    if (!Name || !Email || !Number || !Character || !Reference) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!isValidEmailAddress(Email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!isValidPhoneValue(Number)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    if (!isValidHttpUrl(Reference)) {
      return res.status(400).json({
        success: false,
        message: "Reference must be a valid image URL",
      });
    }

    const text = `
New Cosplay Signup - GameFest

Name: ${Name}
Email: ${Email}
Number: ${Number}
Character: ${Character}
Reference Image: ${Reference}
    `.trim();

    const html = buildEmailLayout({
      preheader: `New cosplay signup from ${Name} as ${Character}`,
      badge: "Cosplay Signup",
      title: "New Cosplay Signup",
      subtitle: "Cosplay entry received",
      introHtml: `
        <p style="margin:12px 0 0; font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:22px; color:#c9cbd3;">
          A new participant has submitted a cosplay entry through the GameFest website.
        </p>
      `,
      sectionsHtml: [
        renderRowsSection("Participant Details", [
          { label: "Full Name", value: Name },
          { label: "Email", value: Email, href: `mailto:${Email}` },
          { label: "Contact Number", value: Number, href: `tel:${Number}` },
          { label: "Character", value: Character },
        ]),
        renderHtmlSection("Reference Image", `
          <div style="font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:22px; color:#c9cbd3; margin-bottom:14px;">
            Review the attached reference image using the preview below or open the original file.
          </div>
          <div style="margin-bottom:16px;">
            ${renderButton("Open Full Reference", Reference)}
          </div>
          <img src="${escapeHtml(Reference)}" alt="${escapeHtml(Character)} reference" style="display:block; width:100%; max-width:520px; height:auto; border-radius:14px; border:1px solid rgba(255,255,255,0.08);" />
        `),
      ].join(""),
      footerText: "Sent via the GameFest cosplay signup form.",
    });

    const info = await transporter.sendMail({
      from: MAIL_FROM,
      replyTo: Email,
      to: process.env.MAIL_TO,
      subject: `Cosplay Signup | ${Name}`,
      text,
      html,
    });

    logMailResult("Cosplay", info);

    return res.status(200).json({
      success: true,
      message: "Cosplay signup submitted successfully",
      info,
    });
  } catch (error) {
    console.error("❌ Cosplay signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit cosplay signup",
    });
  }
};

const sendTournamentRegistrationReceipt = async ({
  email,
  phone,
  teamName,
  players,
  tournamentName,
  regFee,
}) => {
  const safePlayers = Array.isArray(players) ? players.filter(Boolean) : [];
  const receiptRows = [
    { label: "Game", value: tournamentName },
    { label: "Registration Fee", value: formatMoney(regFee) },
    ...(teamName ? [{ label: "Team Name", value: teamName }] : []),
    { label: "Phone", value: phone },
    { label: "Email", value: email },
  ];

  const playersText = safePlayers.length
    ? safePlayers.map((player, index) => `${index + 1}. ${player}`).join("\n")
    : "No player names were attached.";

  const text = `
GameFest Tournament Registration Received

We have received your registration submission for ${tournamentName}.

Registration Details
${buildDetailRowsText(receiptRows)}

Players
${playersText}

Payment Instructions
You can make payment via any of Zoon's locations or MMG.

You are halfway to being officially signed up.
Once payment is completed and your registration is verified, your sign-up can be confirmed.

GameFest Guyana
  `.trim();

  const html = buildEmailLayout({
    preheader: `Registration received for ${tournamentName}`,
    badge: "Registration Received",
    title: "Registration Received",
    subtitle: "Tournament registration submitted",
    introHtml: `
      <p style="margin:12px 0 0; font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:22px; color:#c9cbd3;">
        We have received your registration for <span style="color:#f2dd67; font-weight:800;">${escapeHtml(tournamentName)}</span>. You are halfway to being officially signed up.
      </p>
    `,
    sectionsHtml: [
      renderRowsSection("Registration Details", receiptRows),
      renderListSection("Players", safePlayers, "No player names were attached."),
      renderHtmlSection("Payment Instructions", `
        <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:25px; color:#e8e9ee;">
          You can make payment via <span style="color:#f2dd67; font-weight:800;">any of Zoon's locations</span> or <span style="color:#f2dd67; font-weight:800;">MMG</span>.
        </div>
      `),
      renderHtmlSection("Next Step", `
        <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:25px; color:#e8e9ee;">
          Once payment is completed and your registration is verified, your sign-up can be confirmed.
        </div>
      `),
    ].join(""),
    footerText: "Sent automatically after your GameFest tournament registration was received.",
  });

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: `Registration Received | ${tournamentName}`,
    text,
    html,
  });

  logMailResult("Tournament registration receipt", info);
  return info;
};

const sendTournamentConfirmedEmail = async ({
  recipientName,
  email,
  tournamentName,
  registrationDetails = {},
  tournamentDetails = {},
}) => {
  const resolvedName = recipientName || "Player";
  const resolvedTournament = tournamentName || tournamentDetails?.game_name || "Tournament";
  const players = Array.isArray(registrationDetails.players)
    ? registrationDetails.players.filter(Boolean)
    : [];

  const prizeEntries = getPrizeEntries(tournamentDetails);

  const registrationRows = [
    { label: "Status", value: registrationDetails.regConfirmed ? "Confirmed" : null },
    { label: "Team Name", value: registrationDetails.teamName || null },
    { label: "Phone", value: registrationDetails.phone || null },
    { label: "Email", value: registrationDetails.email || email || null },
  ].filter((row) => row.value);

  const gameRows = [
    { label: "Game", value: tournamentDetails.game_name || tournamentName || null },
    { label: "Team Size", value: tournamentDetails.team_size ? String(tournamentDetails.team_size) : null },
    {
      label: "Registration Fee",
      value: tournamentDetails.reg_fee !== null && tournamentDetails.reg_fee !== undefined && tournamentDetails.reg_fee !== ""
        ? formatMoney(tournamentDetails.reg_fee)
        : null,
    },
  ].filter((row) => row.value);

  const prizeRows = prizeEntries.map((entry) => ({
    label: entry.label,
    value: entry.value,
  }));

  const playersText = players.length
    ? players.map((player, index) => `${index + 1}. ${player}`).join("\n")
    : "No player names were attached.";

  const registrationText = buildDetailRowsText(registrationRows);
  const gameDetailsText = buildDetailRowsText(gameRows);
  const prizeText = prizeRows.length ? buildDetailRowsText(prizeRows) : "Prize details will be shared separately.";

  const text = `
Registration Confirmed!

Hi ${resolvedName},

Your registration for ${resolvedTournament} has been confirmed for GameFest 2026.

Registration Details
${registrationText}

Players
${playersText}

Game Details
${gameDetailsText}

Prize Money
${prizeText}

We look forward to seeing you at the event. Keep an eye on your email and GameFest's official channels for tournament updates, schedules, and any additional instructions.

GameFest Guyana
  `.trim();

  console.log("📩 Sending tournament confirmation email to:", email);
  console.log("📩 Tournament details passed to email:", tournamentDetails);
  console.log("📩 Registration details passed to email:", registrationDetails);

  const html = buildEmailLayout({
    preheader: `Registration confirmed for ${resolvedName} in ${resolvedTournament}`,
    badge: "Registration Confirmed",
    title: "Registration Confirmed!",
    subtitle: `${escapeHtml(resolvedTournament)} is now locked in`,
    introHtml: `
      <p style="margin:12px 0 0; font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:22px; color:#c9cbd3;">
        Hi <span style="color:#f2dd67; font-weight:800;">${escapeHtml(resolvedName)}</span>, your registration for
        <span style="color:#f2dd67; font-weight:800;">${escapeHtml(resolvedTournament)}</span> has been officially confirmed for GameFest 2026.
      </p>
    `,
    sectionsHtml: [
      renderRowsSection("Registration Details", registrationRows),
      renderListSection("Players", players, "No player names were attached."),
      renderRowsSection("Game Details", gameRows),
      prizeRows.length
        ? renderRowsSection("Prize Money", prizeRows)
        : renderHtmlSection("Prize Money", `
            <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:25px; color:#e8e9ee;">
              Prize details will be shared separately.
            </div>
          `),
      renderHtmlSection("Event Note", `
        <div style="font-family:Segoe UI, Arial, sans-serif; font-size:15px; line-height:25px; color:#e8e9ee;">
          We look forward to seeing you at the event. Keep an eye on your email and GameFest's official channels for tournament updates, schedules, and any additional instructions.
        </div>
      `),
    ].join(""),
    footerText: "Sent automatically after your GameFest tournament registration was confirmed.",
  });

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: `Registration Confirmed! | ${resolvedTournament}`,
    text,
    html,
  });

  logMailResult("Tournament confirmation", info);
  return info;
};

module.exports = {
  contact,
  sponsor,
  cosplaySignup,
  sendTournamentRegistrationReceipt,
  sendTournamentConfirmedEmail,
};
