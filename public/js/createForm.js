const form = document.getElementById("signup-form")
const teamSize = Number(document.getElementById("team-size").value)




function createForm(){

    form.innerHTML=
    `
    <section class="w-full bg-gradient2 py-12 text-white">
        <div class="mx-auto w-[92%] max-w-3xl">
            <header class="mb-8">
            <p class="mt-2 text-white/70">
                ${teamSize < 2 ? "Enter your name and contact details" : "Enter your team name, player names, and contact details."} 
            </p>
            </header>

            <form class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-8">
            <!-- Team -->
            <div class="mb-6 ${teamSize === 1 ? "hidden" : ""}">
                <label for="teamName" class="mb-2 block text-sm font-semibold text-white/90">Team Name</label>
                <input
                id="teamName"
                name="teamName"
                type="text"
                placeholder="e.g., WAVE Warriors"
                autocomplete="organization"
                class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
            </div>

            <!-- Players -->
            <div class="mb-8">
                <div class="flex items-end justify-between gap-4">
                <div>
                    <h3 class="text-lg font-bold">Player Names</h3>
                    <p class="mt-1 text-sm text-white/70">
                    These inputs auto-size and wrap based on how many players you show.
                    </p>
                </div>
                </div>

                <!-- Auto-fit grid (responsive + depends on number of fields rendered) -->
                <div class="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))]">
                <!-- Render this block dynamically for each player -->
                <div>
                    <label for="player-1" class="mb-2 block text-sm font-semibold text-white/90">Player 1</label>
                    <input
                    id="player-1"
                    name="players[]"
                    type="text"
                    placeholder="e.g., John Doe"
                    class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                    />
                </div>

                <div class=${teamSize < 2 ? "hidden" : ""}>
                    <label for="player-2" class="mb-2 block text-sm font-semibold text-white/90">Player 2</label>
                    <input
                    id="player-2"
                    name="players[]"
                    type="text"
                    placeholder="e.g., Jane Doe"
                    class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                    />
                </div>

                <div class=${teamSize < 3 ? "hidden" : ""}>
                    <label for="player-3" class="mb-2 block text-sm font-semibold text-white/90">Player 3</label>
                    <input
                    id="player-3"
                    name="players[]"
                    type="text"
                    placeholder="Optional"
                    class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                    />
                </div>

                <div class=${teamSize < 4 ? "hidden" : ""}>
                    <label for="player-4" class="mb-2 block text-sm font-semibold text-white/90">Player 4</label>
                    <input
                    id="player-4"
                    name="players[]"
                    type="text"
                    placeholder="Optional"
                    class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                    />
                </div>
                <!-- End dynamic player inputs -->
                </div>
            </div>

            <!-- Contact -->
            <div class="grid gap-5 md:grid-cols-2">
                <div>
                <label for="phone" class="mb-2 block text-sm font-semibold text-white/90">Phone Number</label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputmode="tel"
                    placeholder="e.g., 444-5555"
                    autocomplete="tel"
                    required
                    class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
                </div>

                <div>
                <label for="email" class="mb-2 block text-sm font-semibold text-white/90">Email Address</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g., team@email.com"
                    autocomplete="email"
                    required
                    class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
                </div>
            </div>

            <!-- Actions -->
            <div class="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                type="reset"
                class="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                Clear
                </button>

                <button
                type="submit"
                class="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-zinc-950 transition hover:opacity-90"
                >
                Submit Registration
                </button>
            </div>
            </form>

            <p class="mt-6 text-xs text-white/60">
            Tip: change the min width in the players grid (16rem) if you want more/less columns before wrapping.
            </p>
        </div>
    </section>
    `


}

createForm()