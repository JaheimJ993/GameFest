import supabase from "../db.js";

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

const normalizePlatforms = (p) => {
  let arr = [];
  if (Array.isArray(p)) arr = p;
  else if (typeof p === "string") {
    try {
      const parsed = JSON.parse(p);
      if (Array.isArray(parsed)) arr = parsed;
      else arr = String(p).split(",").map((x) => x.trim());
    } catch {
      arr = String(p).split(",").map((x) => x.trim());
    }
  }
  return arr
    .map((x) => normalize(x))
    .filter((x) => allowedPlatforms.has(x));
};

const platformsKey = (arr) => normalizePlatforms(arr).sort().join("|");

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
  const gameName = normalize(req.body?.gameName);
  const gameCategory = normalize(req.body?.gameCategory);
  const gameIcon = normalize(req.body?.gameIcon);
  const teamSize = toInt(req.body?.players);
  const platforms = normalizePlatforms(req.body?.platforms);
  const regFee = toInt(req.body?.regFee);
  const firstPrize = toInt(req.body?.prize1);
  const secondPrize = toInt(req.body?.prize2);
  const thirdPrize = toInt(req.body?.prize3);
  const regCloseDate = req.body?.regCloseDate;

  const errors = [];

  if (!gameName) errors.push("Game name is required.");
  else if (gameName.length < 2) errors.push("Game name must be at least 2 characters.");
  else if (gameName.length > 60) errors.push("Game name must be 60 characters or less.");

  const allowed = new Set(["FPS", "Sports", "Fighting", "Other"]);
  if (!gameCategory) errors.push("Game category is required.");
  else if (!allowed.has(gameCategory)) errors.push("Game category is invalid.");

  if (!gameIcon) errors.push("Game icon URL is required.");
  else if (!isValidUrl(gameIcon)) errors.push("Game icon URL must be a valid http(s) URL.");

  if (!Number.isInteger(teamSize)) errors.push("Number of players must be a whole number.");
  else if (teamSize < 1 || teamSize > 4) errors.push("Number of players must be between 1 and 4.");

  if (!Array.isArray(platforms) || platforms.length === 0) {
    errors.push("Select at least one platform (Mobile, PC, Xbox, PS5).");
  }

  if (!Number.isFinite(regFee)) errors.push("Registration fee (reg_fee) is required.");
  else if (regFee < 0) errors.push("Registration fee (reg_fee) cannot be negative.");

  const prizes = [
    ["1st prize", firstPrize],
    ["2nd prize", secondPrize],
    ["3rd prize", thirdPrize],
  ];
  prizes.forEach(([label, val]) => {
    if (!Number.isFinite(val)) errors.push(`${label} is required.`);
    else if (val < 0) errors.push(`${label} cannot be negative.`);
  });

  if (!regCloseDate) errors.push("Registration close date is required.");
  else if (!isISODate(regCloseDate)) errors.push("Registration close date must be a valid date.");

  if (errors.length) {
    return res.status(400).json({ message: "error", errors });
  }

  try {
    const { data: existing, error: dupErr } = await supabase
      .from("Tournaments")
      .select("id, platforms")
      .ilike("game_name", gameName)
      .eq("game_category", gameCategory)
      .eq("reg_end", regCloseDate);

    if (dupErr) {
      return res.status(400).json({ message: "error", error: dupErr });
    }

    const candKey = platformsKey(platforms);
    const match = (existing ?? []).some((t) => platformsKey(t.platforms) === candKey);

    if (match) {
      return res.status(409).json({
        message: "error",
        errors: ["Duplicate tournament detected (same game, category, close date, and platforms)."],
      });
    }

    const { data, error } = await supabase
      .from("Tournaments")
      .insert({
        game_name: gameName,
        game_category: gameCategory,
        game_icon: gameIcon,
        team_size: teamSize,
        platforms,
        reg_fee: regFee,
        first_prize: firstPrize,
        second_prize: secondPrize,
        third_prize: thirdPrize,
        reg_end: regCloseDate,
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

export { newTournament, getTournaments, getTournament };
