const standingsContainer =
    document.getElementById("standingsContainer");

const standingsLeague =
    document.getElementById("standingsLeague");const matchModal = document.getElementById("matchModal");
const matchDetails = document.getElementById("matchDetails");
const closeModal = document.getElementById("closeModal");const liveContainer = document.getElementById("liveContainer");
const todayContainer = document.getElementById("todayContainer");
const tomorrowContainer = document.getElementById("tomorrowContainer");

const refreshBtn = document.getElementById("refreshBtn");
const updateMessage = document.getElementById("updateMessage");

const searchInput = document.getElementById("searchInput");
const leagueFilter = document.getElementById("leagueFilter");

let liveMatches = [];
let todayMatches = [];
let tomorrowMatches = [];


// ================= DATE =================

function getDate(offset = 0) {

    const date = new Date();

    date.setDate(date.getDate() + offset);

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ================= LOAD LIVE =================

async function loadLiveMatches() {

    liveContainer.innerHTML =
        `<p class="loading">⚽ Loading live matches...</p>`;

    try {

        const response =
            await fetch("/api/live");

        const data =
            await response.json();

        liveMatches =
            data.response || [];

        displayLiveMatches();

    } catch (error) {

        console.log(error);

        liveContainer.innerHTML =
            `<p class="error-message">
                Unable to load live matches.
            </p>`;

    }

}

// ================= LOAD FIXTURES =================

async function loadFixtures() {

    todayContainer.innerHTML =
        `<p class="loading">📅 Loading today's matches...</p>`;

    tomorrowContainer.innerHTML =
        `<p class="loading">📅 Loading tomorrow's matches...</p>`;

    try {

        const today = getDate(0);
        const tomorrow = getDate(1);

        const todayResponse =
            await fetch(`/api/fixtures?date=${today}`);

        const todayData =
            await todayResponse.json();

        const tomorrowResponse =
            await fetch(`/api/fixtures?date=${tomorrow}`);

        const tomorrowData =
            await tomorrowResponse.json();

        todayMatches =
            todayData.response || [];

        tomorrowMatches =
            tomorrowData.response || [];

        displayFixtures(
            todayMatches,
            todayContainer
        );

        displayFixtures(
            tomorrowMatches,
            tomorrowContainer
        );

        updateMessage.textContent =
            `Today: ${todayMatches.length} matches • Tomorrow: ${tomorrowMatches.length} matches`;

    } catch (error) {

        console.log(error);

        todayContainer.innerHTML =
            `<p class="error-message">
                Unable to load today's matches.
            </p>`;

        tomorrowContainer.innerHTML =
            `<p class="error-message">
                Unable to load tomorrow's matches.
            </p>`;

    }

}
// ================= FILTER =================

function getFilteredMatches(matches) {

    const searchText =
        searchInput.value
        .toLowerCase()
        .trim();

    const selectedLeague =
        leagueFilter.value;


    return matches.filter(function(match) {

        const home =
            match.teams.home.name
            .toLowerCase();

        const away =
            match.teams.away.name
            .toLowerCase();

        const leagueId =
            String(match.league.id);


        const teamMatch =
            home.includes(searchText) ||
            away.includes(searchText);


        const leagueMatch =
            selectedLeague === "all" ||
            leagueId === selectedLeague;


        return teamMatch && leagueMatch;

    });

}


// ================= LIVE DISPLAY =================

function displayLiveMatches() {

    const matches =
        getFilteredMatches(liveMatches);


    liveContainer.innerHTML = "";


    if (matches.length === 0) {

       liveContainer.innerHTML =
    "<p class='empty-message'>🔴 No live matches right now.</p>";
        return;

    }


    matches.forEach(function(match) {

        const card =
            createMatchCard(
                match,
                true
            );

        liveContainer.appendChild(card);

    });

}


// ================= FIXTURE DISPLAY =================

function displayFixtures(
    matches,
    container
) {

    const filtered =
        getFilteredMatches(matches);


    container.innerHTML = "";


    if (filtered.length === 0) {

        container.innerHTML =
    "<p class='empty-message'>📅 No matches scheduled.</p>";

        return;

    }


    filtered.forEach(function(match) {

        const card =
            createMatchCard(
                match,
                false
            );

        container.appendChild(card);

    });

}


// ================= CREATE CARD =================

function createMatchCard(
    match,
    isLive
) {

    const card =
        document.createElement("div");

    card.className =
        "match-card";
        card.style.cursor = "pointer";

card.addEventListener("click", function() {

    showMatchDetails(match);

});


    const home =
        match.teams.home;

    const away =
        match.teams.away;


    const homeScore =
        match.goals.home ?? 0;

    const awayScore =
        match.goals.away ?? 0;


    const league =
        match.league.name;


    const status =
        match.fixture.status;


    let timeText = "";


    if (isLive) {

        if (status.elapsed) {

            timeText =
                `${status.elapsed}' LIVE`;

        } else {

            timeText =
                status.long;

        }

    } else {

        const matchDate =
            new Date(
                match.fixture.date
            );

        timeText =
            matchDate.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    }


    card.innerHTML = `

        <div class="league-name">
            🏆 ${league}
        </div>


        <div class="teams">


            <div class="team">

                <img
                    src="${home.logo}"
                    alt="${home.name}"
                >

                <h3>
                    ${home.name}
                </h3>

            </div>


            <div class="score">

                <h2>
                    ${isLive
                        ? `${homeScore} - ${awayScore}`
                        : "VS"
                    }
                </h2>

                <p class="${isLive
                    ? "match-status"
                    : ""
                }">

                    ${timeText}

                </p>

            </div>


            <div class="team">

                <img
                    src="${away.logo}"
                    alt="${away.name}"
                >

                <h3>
                    ${away.name}
                </h3>

            </div>


        </div>

    `;


    return card;

}


// ================= EVENTS =================

searchInput.addEventListener(
    "input",
    function() {

        displayLiveMatches();

        displayFixtures(
            todayMatches,
            todayContainer
        );

        displayFixtures(
            tomorrowMatches,
            tomorrowContainer
        );

    }
);


leagueFilter.addEventListener(
    "change",
    function() {

        displayLiveMatches();

        displayFixtures(
            todayMatches,
            todayContainer
        );

        displayFixtures(
            tomorrowMatches,
            tomorrowContainer
        );

    }
);


// ================= REFRESH =================

refreshBtn.addEventListener(
    "click",
    async function() {

        await loadLiveMatches();

        await loadFixtures();

    }
);


// ================= INITIAL LOAD =================

async function initializeApp() {

    await loadLiveMatches();

    await loadFixtures();

}


initializeApp();


// ================= AUTO REFRESH =================

setInterval(
    loadLiveMatches,
    30000
);
function showMatchDetails(match) {

    const home = match.teams.home;
    const away = match.teams.away;

    const homeScore = match.goals.home ?? 0;
    const awayScore = match.goals.away ?? 0;

    const status = match.fixture.status;

    const league = match.league.name;

    matchDetails.innerHTML = `

        <div class="details-header">

            <h2>${league}</h2>

            <p>
                ${status.long}
            </p>

        </div>


        <div class="details-teams">

            <div class="details-team">

                <img
                    src="${home.logo}"
                    alt="${home.name}"
                >

                <h3>
                    ${home.name}
                </h3>

            </div>


            <div class="details-score">

                <h1>
                    ${homeScore} - ${awayScore}
                </h1>

                <p class="details-status">

                    ${
                        status.elapsed
                        ? `${status.elapsed}' LIVE`
                        : status.long
                    }

                </p>

            </div>


            <div class="details-team">

                <img
                    src="${away.logo}"
                    alt="${away.name}"
                >

                <h3>
                    ${away.name}
                </h3>

            </div>

        </div>


        <div>

            <h3 class="events-title">
                📋 Match Events
            </h3>

            ${
                createEvents(match.events)
            }

        </div>

    `;


    matchModal.style.display = "flex";

}


function createEvents(events) {

    if (!events || events.length === 0) {

        return `
            <p>
                No match events available.
            </p>
        `;

    }


    return events.map(function(event) {

        let icon = "📌";

        if (event.type === "Goal") {
            icon = "⚽";
        }

        if (event.type === "Card") {
            icon = "🟨";
        }

        if (event.type === "subst") {
            icon = "🔄";
        }


        return `

            <div class="event">

                ${icon}

                <strong>
                    ${event.time.elapsed}'
                </strong>

                ${event.type}

                -

                ${event.player?.name || "Unknown"}

            </div>

        `;

    }).join("");

}


closeModal.addEventListener(
    "click",
    function() {

        matchModal.style.display = "none";

    }
);


matchModal.addEventListener(
    "click",
    function(event) {

        if (event.target === matchModal) {

            matchModal.style.display = "none";

        }

    }
);
async function loadStandings() {

    try {

        const league =
            standingsLeague.value;

        const response =
            await fetch(
                `/api/standings?league=${league}`
            );

        const data =
            await response.json();


        const standings =
            data.response[0]
                .league.standings[0];


        displayStandings(standings);

    } catch (error) {

        console.log(error);

        standingsContainer.innerHTML =
            "<p>Unable to load standings.</p>";

    }

}


function displayStandings(standings) {

    standingsContainer.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>POS</th>
                    <th>TEAM</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>PTS</th>

                </tr>

            </thead>


            <tbody>

                ${standings.map(function(team) {

                    return `

                        <tr>

                            <td>
                                ${team.rank}
                            </td>

                            <td>

                                <img
                                    src="${team.team.logo}"
                                    width="25"
                                    height="25"
                                    style="vertical-align: middle; margin-right: 8px;"
                                >

                                ${team.team.name}

                            </td>

                            <td>
                                ${team.all.played}
                            </td>

                            <td>
                                ${team.all.win}
                            </td>

                            <td>
                                ${team.all.draw}
                            </td>

                            <td>
                                ${team.all.lose}
                            </td>

                            <td>
                                <strong>
                                    ${team.points}
                                </strong>
                            </td>

                        </tr>

                    `;

                }).join("")}

            </tbody>

        </table>

    `;

}


standingsLeague.addEventListener(
    "change",
    loadStandings
);


loadStandings();
// ================= DARK MODE =================

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeBtn.textContent = "☀️";

    } else {

        themeBtn.textContent = "🌙";

    }

});