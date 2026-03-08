import supabase from "../config/db.js";

/**
 * Helpers
 */
const normalize = (v) => String(v ?? "").trim();
const normalizeName = (v) => normalize(v).replace(/\s+/g, " "); // collapse internal whitespace

const isValidEmail = (email) => {
  const e = normalize(email);
  if (!e || e.length > 80) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};

const isValidPhone = (phone) => /^\d{3}-\d{4}$/.test(normalize(phone));

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

  const phone = normalize(phoneRaw);
  const email = normalize(emailRaw).toLowerCase();
  const teamName = teamNameRaw === null ? null : normalizeName(teamNameRaw);

  const players = Array.isArray(playersRaw)
    ? playersRaw.map((p) => normalizeName(p)).filter(Boolean)
    : [];

  const errors = [];

  if (!phone) errors.push("Phone number is required.");
  else if (!isValidPhone(phone)) errors.push("Phone number must be in the format 444-5555.");

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
      .select("id, team_size")
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

    return res.json({ message: "success", data });
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

  try {
    const { data, error } = await supabase
      .from("Registrants")
      .update({ reg_confirmed: !!reg_confirmed })
      .eq("registration_id", registrationId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
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

export { submitRegistrants, getRegistrants, updateRegistrantConfirmation, deleteRegistrant };
