let supabase;

const loadSupabase = () => {
  // Try common locations / export styles.
  // Adjust if your project uses a different path.
  const candidates = ["../db.js", "../db", "./db.js", "./db"];

  for (const p of candidates) {
    try {
      const mod = require(p);
      // supports: module.exports = supabase, module.exports = { supabase }, or ESM default transpiled
      return mod?.default ?? mod?.supabase ?? mod;
    } catch (e) {
      // continue
    }
  }

  throw new Error("Could not load Supabase client. Update controllers/tourneyDelete.js to require your db client.");
};

try {
  supabase = loadSupabase();
} catch (e) {
  // keep undefined; handler will surface the error
}

const deleteTournament = async (req, res) => {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "error", error: "Missing tournament id" });
  }

  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized. Check db import in controllers/tourneyDelete.js");
    }

    const { data, error } = await supabase
      .from("Tournaments")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

module.exports = { deleteTournament };
