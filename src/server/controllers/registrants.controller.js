const supabase = require("../config/db");
const { sendTournamentRegistrationReceipt, sendTournamentConfirmedEmail } = require("./mail.controller.js");

/**
 * Helpers
 */
const normalize = (v) => String(v ?? "").trim();
const normalizeName = (v) => normalize(v).replace(/\s+/g, " ");

const isValidEmail = (email) => {
  const e = normalize(email);
  if (!e || e.length > 80) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};

const normalizePhone = (phone) => {
  const digits = String(phone ?? "").replace(/\D/g, "");

  if (digits.length !== 7) return null;

  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
};

const isValidPhone = (phone) => Boolean(normalizePhone(phone));

const uniqueCaseInsensitive = (arr) => {
  const seen = new Set();
  for (const s of arr) {
    const key = String(s).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
};

const submitRegistrants = async (req, res) => {
  const tournamentIdRaw = req.body?.tournamentId;
  const tournamentId = Number(tournamentIdRaw);

  const teamNameRaw = req.body?.teamName ?? req.body?.team_name ?? null;
  const phoneRaw = req.body?.phone ?? req.body?.number ?? null;
  const emailRaw = req.body?.email ?? null;

  let playersRaw = req.body?.players ?? [];

  if (typeof playersRaw === "string") {
    try {
      playersRaw = JSON.parse(playersRaw);
    } catch {
      playersRaw = [playersRaw];
    }
  }

  if (!Number.isFinite(tournamentId) || tournamentId <= 0) {
    return res.status(400).json({ message: "error", errors: ["Invalid tournamentId."] });
  }

  const phone = normalizePhone(phoneRaw);
  const email = normalize(emailRaw).toLowerCase();
  const teamName = teamNameRaw === null ? null : normalizeName(teamNameRaw);

  const players = Array.isArray(playersRaw)
    ? playersRaw.map((p) => normalizeName(p)).filter(Boolean)
    : [];

  const errors = [];

  if (!normalize(phoneRaw)) {
    errors.push("Phone number is required.");
  } else if (!isValidPhone(phoneRaw)) {
    errors.push("Phone number must be 7 digits, for example 4445555 or 444-5555.");
  }

  if (!email) errors.push("Email address is required.");
  else if (!isValidEmail(email)) errors.push("Please enter a valid email address.");

  if (!players.length) errors.push("Players list is required.");

  players.forEach((p, idx) => {
    if (!p) errors.push(`Player ${idx + 1} name is required.`);
    else {
      if (p.length < 2) errors.push(`Player ${idx + 1} name must be at least 2 characters.`);
      if (p.length > 32) errors.push(`Player ${idx + 1} name must be 32 characters or less.`);
    }
  });

  if (players.length && !uniqueCaseInsensitive(players)) {
    errors.push("Player names must be unique (no duplicates).");
  }

  if (errors.length) {
    return res.status(400).json({ message: "error", errors });
  }

  try {
    const { data: tournament, error: tourneyErr } = await supabase
      .from("Tournaments")
      .select("id, team_size, game_name, reg_fee")
      .eq("id", tournamentId)
      .single();

    if (tourneyErr || !tournament) {
      return res.status(404).json({ message: "error", errors: ["Tournament not found."] });
    }

    const teamSize = Number(tournament.team_size ?? 1);

    if (Number.isFinite(teamSize) && teamSize > 1) {
      if (!teamName) {
        return res.status(400).json({ message: "error", errors: ["Team name is required for this tournament."] });
      }
      if (teamName.length < 2) {
        return res.status(400).json({ message: "error", errors: ["Team name must be at least 2 characters."] });
      }
      if (teamName.length > 40) {
        return res.status(400).json({ message: "error", errors: ["Team name must be 40 characters or less."] });
      }
    }

    if (Number.isFinite(teamSize) && players.length !== teamSize) {
      return res.status(400).json({
        message: "error",
        errors: [`Please enter exactly ${teamSize} player name(s).`],
      });
    }

    const { data: existingByEmail, error: emailCheckErr } = await supabase
      .from("Registrants")
      .select("registration_id")
      .eq("tournament_id", tournamentId)
      .ilike("email", email)
      .limit(1);

    if (emailCheckErr) {
      return res.status(400).json({ message: "error", error: emailCheckErr });
    }

    if (existingByEmail?.length) {
      return res.status(409).json({
        message: "error",
        errors: ["A registration with this email already exists for this tournament."],
      });
    }

    const { data: existingByPhone, error: phoneCheckErr } = await supabase
      .from("Registrants")
      .select("registration_id")
      .eq("tournament_id", tournamentId)
      .eq("number", phone)
      .limit(1);

    if (phoneCheckErr) {
      return res.status(400).json({ message: "error", error: phoneCheckErr });
    }

    if (existingByPhone?.length) {
      return res.status(409).json({
        message: "error",
        errors: ["A registration with this phone number already exists for this tournament."],
      });
    }

    const { data: existingPlayersRows, error: playersCheckErr } = await supabase
      .from("Registrants")
      .select("players")
      .eq("tournament_id", tournamentId);

    if (playersCheckErr) {
      return res.status(400).json({ message: "error", error: playersCheckErr });
    }

    const existingPlayers = new Set(
      (existingPlayersRows ?? [])
        .flatMap((r) => Array.isArray(r.players) ? r.players : [])
        .map((p) => normalizeName(p).toLowerCase())
        .filter(Boolean)
    );

    const duplicatePlayers = players
      .map((p) => p.toLowerCase())
      .filter((p) => existingPlayers.has(p));

    if (duplicatePlayers.length) {
      return res.status(409).json({
        message: "error",
        errors: ["One or more player names are already registered for this tournament."],
      });
    }

    const { data, error } = await supabase
      .from("Registrants")
      .insert({
        tournament_id: tournamentId,
        team_name: teamSize > 1 ? teamName : null,
        number: phone,
        email,
        players,
        reg_confirmed: false,
      })
      .select()
      .single();

    if (error) {
      if (error?.code === "23505") {
        return res.status(409).json({
          message: "error",
          errors: ["Duplicate registration detected. Please verify your email/phone and try again."],
        });
      }
      return res.status(400).json({ message: "error", error });
    }

    try {
      console.log("📩 Sending tournament registration receipt to:", email);

      await sendTournamentRegistrationReceipt({
        email,
        phone,
        teamName: teamSize > 1 ? teamName : null,
        players,
        tournamentName: tournament.game_name,
        regFee: tournament.reg_fee,
      });

      console.log("✅ Tournament registration receipt sent to:", email);
    } catch (mailErr) {
      console.error("❌ Failed to send tournament registration receipt:", mailErr);
    }

    return res.json({
      message: "success",
      data,
      emailSentTo: email,
    });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const getRegistrants = async (req, res) => {
  const tournamentId = Number(req.query?.id);
  const { confirmed } = req.query;

  if (!Number.isFinite(tournamentId) || tournamentId <= 0) {
    return res.status(400).json({ message: "error", error: "Missing or invalid tournament id" });
  }

  try {
    let query = supabase
      .from("Registrants")
      .select()
      .eq("tournament_id", tournamentId)
      .order("registration_id", { ascending: false });

    if (confirmed !== undefined) {
      const confirmedBool = confirmed === "true" || confirmed === true;
      query = query.eq("reg_confirmed", confirmedBool);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const updateRegistrantConfirmation = async (req, res) => {
  const { registrationId, reg_confirmed } = req.body;

  if (!registrationId) {
    return res.status(400).json({ message: "error", error: "Missing registrationId" });
  }

  const nextConfirmed = !!reg_confirmed;

  try {
    const { data: existingRegistrant, error: existingError } = await supabase
      .from("Registrants")
      .select("registration_id, tournament_id, email, number, team_name, players, reg_confirmed")
      .eq("registration_id", registrationId)
      .single();

    if (existingError) {
      return res.status(400).json({ message: "error", error: existingError });
    }

    if (!existingRegistrant) {
      return res.status(404).json({ message: "error", error: "Registrant not found" });
    }

    const wasConfirmed = !!existingRegistrant.reg_confirmed;

    const { data, error } = await supabase
      .from("Registrants")
      .update({ reg_confirmed: nextConfirmed })
      .eq("registration_id", registrationId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    let emailSent = false;

    if (nextConfirmed && !wasConfirmed && existingRegistrant.email) {
      try {
        const { data: tournament, error: tournamentError } = await supabase
          .from("Tournaments")
          .select("*")
          .eq("id", existingRegistrant.tournament_id)
          .single();

        if (tournamentError) {
          console.error("❌ Failed to load tournament while sending confirmation email:", tournamentError);
        } else {
          const fallbackName = Array.isArray(existingRegistrant.players)
            ? existingRegistrant.players.find(Boolean)
            : null;

          const recipientName = normalizeName(
            existingRegistrant.team_name || fallbackName || "Player"
          );

          console.log("📩 Sending confirmed registration email to:", existingRegistrant.email);
          console.log("📩 Loaded tournament for email:", tournament);

          await sendTournamentConfirmedEmail({
            recipientName,
            email: existingRegistrant.email,
            tournamentName: tournament?.game_name,
            registrationDetails: {
              registrationId: existingRegistrant.registration_id,
              regConfirmed: true,
              teamName: existingRegistrant.team_name,
              phone: existingRegistrant.number,
              email: existingRegistrant.email,
              players: Array.isArray(existingRegistrant.players) ? existingRegistrant.players : [],
            },
            tournamentDetails: tournament || {},
          });

          emailSent = true;
          console.log("✅ Confirmed registration email sent to:", existingRegistrant.email);
        }
      } catch (mailErr) {
        console.error("❌ Failed to send confirmed registration email:", mailErr);
      }
    }

    return res.json({ message: "success", data, emailSent });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const deleteRegistrant = async (req, res) => {
  const registrationId = Number(req.params.registrationId);

  if (!registrationId) {
    return res.status(400).json({ message: "error", error: "Missing registrationId" });
  }

  try {
    const { data, error } = await supabase
      .from("Registrants")
      .delete()
      .eq("registration_id", registrationId)
      .select();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

module.exports = { submitRegistrants, getRegistrants, updateRegistrantConfirmation, deleteRegistrant };