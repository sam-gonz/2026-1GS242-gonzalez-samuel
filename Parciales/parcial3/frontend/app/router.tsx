import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import UserSync from "./components/UserSync";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/Toast";

import Home from "./routes/index";
import Login from "./routes/login";
import Lobby from "./routes/lobby.$code";
import Game from "./routes/game.$code";
import Shop from "./routes/shop";
import Profile from "./routes/profile";
import Leaderboard from "./routes/leaderboard";
import Settings from "./routes/settings";
import Rules from "./routes/rules";

const rootRoute = createRootRoute({
  component: () => (
    <ToastProvider>
      <UserSync />
      <Navbar />
      <Outlet />
    </ToastProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const lobbyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lobby/$code",
  component: Lobby,
});

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/game/$code",
  component: Game,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: Shop,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: Leaderboard,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const rulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rules",
  component: Rules,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  lobbyRoute,
  gameRoute,
  shopRoute,
  profileRoute,
  leaderboardRoute,
  settingsRoute,
  rulesRoute,
]);

export const router = createRouter({ routeTree });
