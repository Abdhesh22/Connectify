import { lazy } from "react";
import { Navigate, type NonIndexRouteObject } from "react-router-dom";

const Room = lazy(() => import("../components/protected/Room/Index"));
const Landing = lazy(() => import("../components/protected/Landing/Index"));

interface AppRouteObject extends NonIndexRouteObject {
    showSideNav?: boolean;
    showHeader?: boolean;
}

const ProtectedRoutes: AppRouteObject[] = [
    { path: "/room/:token", element: <Room />, handle: { showSideNav: false, showHeader: false } },
    { path: "/landing", element: <Landing />, handle: { showSideNav: true, showHeader: true } },
    { path: "*", element: <Navigate to="/landing" replace />, },
];

export default ProtectedRoutes;
