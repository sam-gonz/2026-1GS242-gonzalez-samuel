import { test, expect, chromium } from "@playwright/test";

const BACKEND = "http://localhost:3000";

async function api(method: string, path: string, body?: any) {
  const opts: any = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BACKEND}${path}`, opts);
  return res.json();
}

test("Home page loads with correct elements", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=DAMAS")).toBeVisible();
  await expect(page.locator("text=1 vs Máquina")).toBeVisible();
  await expect(page.locator("text=Multijugador")).toBeVisible();
});

test("1 vs Máquina - full game flow", async ({ page }) => {
  await page.goto("/");
  await page.fill("input[placeholder='Ej: Alice']", "TestBot");
  await page.click("button:has-text('Jugar contra la Máquina')");
  await page.waitForTimeout(2000);
  expect(page.url()).toContain("/game/");
  await expect(page.locator("text=Tu turno")).toBeVisible();

  const code = page.url().split("/").pop()!;
  const playerId = await page.evaluate((c) => localStorage.getItem(`player_${c}`), code);

  const move1 = await api("POST", `/api/game/${code}/move`, { playerId, from: [2, 2], to: [3, 3] });
  expect(move1.game).toBeDefined();
  await page.waitForTimeout(2500);

  const state = await api("GET", `/api/game/${code}`);
  expect(state.moveHistory.length).toBeGreaterThanOrEqual(1);
});

test("PvP - create room, join, play", async ({ page }) => {
  await page.goto("/");
  await page.click("button:has-text('Multijugador')");
  await page.fill("input[placeholder='Ej: Alice']", "Player1");
  await page.click("button:has-text('Crear sala')");
  await page.waitForTimeout(1000);
  expect(page.url()).toContain("/lobby/");

  const code = page.url().split("/").pop()!;
  const joinRes = await api("POST", `/api/rooms/${code}/join`, { name: "Player2" });
  expect(joinRes.code).toBe(code);
  await page.waitForTimeout(2000);
  expect(page.url()).toContain("/game/");
});

test("Backward capture rule works via API", async () => {
  const room = await api("POST", "/api/rooms", { name: "CapA" });
  const join = await api("POST", `/api/rooms/${room.code}/join`, { name: "CapB" });
  const p1 = room.playerId;
  const p2 = join.playerId;

  // Set up: red (2,2)->(3,3), black (5,1)->(4,2)
  let g = await api("POST", `/api/game/${room.code}/move`, { playerId: p1, from: [2, 2], to: [3, 3] });
  expect(g.game.turn).toBe("black");

  g = await api("POST", `/api/game/${room.code}/move`, { playerId: p2, from: [5, 1], to: [4, 2] });
  expect(g.game.turn).toBe("red");

  // Red MUST capture (3,3)->(5,1) over (4,2)
  const actions = await api("GET", `/api/game/${room.code}/actions?row=3&col=3`);
  expect(actions.actions.length).toBeGreaterThan(0);

  g = await api("POST", `/api/game/${room.code}/move`, { playerId: p1, from: [3, 3], to: [5, 1] });
  const lastMove = g.game.moveHistory[g.game.moveHistory.length - 1];
  expect(lastMove.captured).toBeDefined();
  expect(lastMove.captured![0]).toBe(4);
  expect(lastMove.captured![1]).toBe(2);
});

test("AI service responds with valid move", async () => {
  const res = await fetch("http://localhost:3001/move", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      board: [
        ["r",null,"r",null,"r",null,"r",null],
        [null,"r",null,"r",null,"r",null,"r"],
        ["r",null,"r",null,"r",null,"r",null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,"b",null,"b",null,"b",null,"b"],
        ["b",null,"b",null,"b",null,"b",null],
        [null,"b",null,"b",null,"b",null,"b"],
      ],
      turn: "black", status: "active",
    }),
  });
  expect(res.ok).toBe(true);
  const data = await res.json();
  expect(data.from).toBeDefined();
  expect(data.to).toBeDefined();
});

test("Ranking recorded after PvP game", async () => {
  const room = await api("POST", "/api/rooms", { name: "RankA", clerkId: "rank_a" });
  const join = await api("POST", `/api/rooms/${room.code}/join`, { name: "RankB", clerkId: "rank_b" });
  await api("POST", `/api/game/${room.code}/move`, { playerId: room.playerId, from: [2, 2], to: [3, 3] });
  await api("POST", `/api/game/${room.code}/resign`, { playerId: join.playerId });

  const rankA = await api("GET", "/api/ranking/me?clerkId=rank_a");
  expect(rankA.wins).toBe(1);
  const rankB = await api("GET", "/api/ranking/me?clerkId=rank_b");
  expect(rankB.losses).toBe(1);
});
