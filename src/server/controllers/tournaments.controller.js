const supabase = require("../config/db");

const normalize = (v) => String(v ?? "").trim().replace(/\s+/g, " ");
const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const isValidUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s ?? ""));

const allowedPlatforms = new Set(["Mobile", "PC", "Xbox", "PS5"]);
const allowedCategories = new Set(["FPS", "Sports", "Fighting", "Other"]);

const normalizePlatforms = (p) => {
  let arr = [];

  if (Array.isArray(p)) {
    arr = p;
  } else if (typeof p === "string") {
    try {
      const parsed = JSON.parse(p);
      if (Array.isArray(parsed)) arr = parsed;
      else arr = String(p).split(",").map((x) => x.trim());
    } catch {
      arr = String(p).split(",").map((x) => x.trim());
    }
  }

  return arr.map((x) => normalize(x)).filter((x) => allowedPlatforms.has(x));
};

const platformsKey = (arr) => normalizePlatforms(arr).sort().join("|");

const validateTournamentPayload = (payload, { requireId = false } = {}) => {
  const errors = [];

  if (requireId) {
    if (!payload.id || !Number.isFinite(Number(payload.id))) {
      errors.push("Valid tournament id is required.");
    }
  }

  if (!payload.gameName) errors.push("Game name is required.");
  else if (payload.gameName.length < 2) errors.push("Game name must be at least 2 characters.");
  else if (payload.gameName.length > 60) errors.push("Game name must be 60 characters or less.");

  if (!payload.gameCategory) errors.push("Game category is required.");
  else if (!allowedCategories.has(payload.gameCategory)) errors.push("Game category is invalid.");

  if (!payload.gameIcon) errors.push("Game icon URL is required.");
  else if (!isValidUrl(payload.gameIcon)) errors.push("Game icon URL must be a valid http(s) URL.");

  if (!Number.isInteger(payload.teamSize)) errors.push("Number of players must be a whole number.");
  else if (payload.teamSize < 1 || payload.teamSize > 4) errors.push("Number of players must be between 1 and 4.");

  if (!Array.isArray(payload.platforms) || payload.platforms.length === 0) {
    errors.push("Select at least one platform (Mobile, PC, Xbox, PS5).");
  }

  if (!Number.isFinite(payload.regFee)) errors.push("Registration fee (reg_fee) is required.");
  else if (payload.regFee < 0) errors.push("Registration fee (reg_fee) cannot be negative.");

  [
    ["1st prize", payload.firstPrize],
    ["2nd prize", payload.secondPrize],
    ["3rd prize", payload.thirdPrize],
  ].forEach(([label, val]) => {
    if (!Number.isFinite(val)) errors.push(`${label} is required.`);
    else if (val < 0) errors.push(`${label} cannot be negative.`);
  });

  if (!payload.regCloseDate) errors.push("Registration close date is required.");
  else if (!isISODate(payload.regCloseDate)) errors.push("Registration close date must be a valid date.");

  return errors;
};

const buildTournamentPayload = (req, id = null) => ({
  id,
  gameName: normalize(req.body?.gameName),
  gameCategory: normalize(req.body?.gameCategory),
  gameIcon: normalize(req.body?.gameIcon),
  teamSize: toInt(req.body?.players),
  platforms: normalizePlatforms(req.body?.platforms),
  regFee: toInt(req.body?.regFee),
  firstPrize: toInt(req.body?.prize1),
  secondPrize: toInt(req.body?.prize2),
  thirdPrize: toInt(req.body?.prize3),
  regCloseDate: req.body?.regCloseDate,
});

const getTournaments = async (req, res) => {
  try {
    const { data, error } = await supabase.from("Tournaments").select().order("id", { ascending: false });

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.status(200).json({
      message: "All rows obtained successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const newTournament = async (req, res) => {
  const payload = buildTournamentPayload(req);
  const errors = validateTournamentPayload(payload);

  if (errors.length) {
    return res.status(400).json({ message: "error", errors });
  }

  try {
    const { data: existing, error: dupErr } = await supabase
      .from("Tournaments")
      .select("id, platforms")
      .ilike("game_name", payload.gameName)
      .eq("game_category", payload.gameCategory)
      .eq("reg_end", payload.regCloseDate);

    if (dupErr) {
      return res.status(400).json({ message: "error", error: dupErr });
    }

    const candidatePlatforms = platformsKey(payload.platforms);
    const duplicateMatch = (existing ?? []).some((t) => platformsKey(t.platforms) === candidatePlatforms);

    if (duplicateMatch) {
      return res.status(409).json({
        message: "error",
        errors: ["Duplicate tournament detected (same game, category, close date, and platforms)."],
      });
    }

    const { data, error } = await supabase
      .from("Tournaments")
      .insert({
        game_name: payload.gameName,
        game_category: payload.gameCategory,
        game_icon: payload.gameIcon,
        team_size: payload.teamSize,
        platforms: payload.platforms,
        reg_fee: payload.regFee,
        first_prize: payload.firstPrize,
        second_prize: payload.secondPrize,
        third_prize: payload.thirdPrize,
        reg_end: payload.regCloseDate,
      })
      .select()
      .single();

    if (error) {
      if (error?.code === "23505") {
        return res.status(409).json({
          message: "error",
          errors: ["Duplicate tournament detected. Please change at least one field and try again."],
        });
      }
      return res.status(400).json({ message: "error", error });
    }

    return res.status(201).json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const updateTournament = async (req, res) => {
  const { id } = req.params;
  const payload = buildTournamentPayload(req, id);
  const errors = validateTournamentPayload(payload, { requireId: true });

  if (errors.length) {
    return res.status(400).json({ message: "error", errors });
  }

  try {
    const { data: currentTournament, error: currentError } = await supabase
      .from("Tournaments")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      return res.status(400).json({ message: "error", error: currentError });
    }

    if (!currentTournament) {
      return res.status(404).json({ message: "error", errors: ["Tournament not found."] });
    }

    const { data: existing, error: dupErr } = await supabase
      .from("Tournaments")
      .select("id, platforms")
      .ilike("game_name", payload.gameName)
      .eq("game_category", payload.gameCategory)
      .eq("reg_end", payload.regCloseDate)
      .neq("id", id);

    if (dupErr) {
      return res.status(400).json({ message: "error", error: dupErr });
    }

    const candidatePlatforms = platformsKey(payload.platforms);
    const duplicateMatch = (existing ?? []).some((t) => platformsKey(t.platforms) === candidatePlatforms);

    if (duplicateMatch) {
      return res.status(409).json({
        message: "error",
        errors: ["Duplicate tournament detected (same game, category, close date, and platforms)."],
      });
    }

    const { data, error } = await supabase
      .from("Tournaments")
      .update({
        game_name: payload.gameName,
        game_category: payload.gameCategory,
        game_icon: payload.gameIcon,
        team_size: payload.teamSize,
        platforms: payload.platforms,
        reg_fee: payload.regFee,
        first_prize: payload.firstPrize,
        second_prize: payload.secondPrize,
        third_prize: payload.thirdPrize,
        reg_end: payload.regCloseDate,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.status(200).json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const getTournament = async (req, res) => {
  const { id } = req.query;

  try {
    const { data, error } = await supabase.from("Tournaments").select().eq("id", id);

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({
      message: "success",
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

module.exports = { newTournament, getTournaments, getTournament, updateTournament };
