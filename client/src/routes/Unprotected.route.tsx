import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

const Signup = lazy(() => import("../components/unprotected/Signup"));
const Login = lazy(() => import("../components/unprotected/Login.tsx"))

const UnprotectedRoutes: RouteObject[] = [
    { path: '/', element: <Signup />, handle: { showSideNav: false, showHeader: false } },
    { path: '/login', element: <Login />, handle: { showSideNav: false, showHeader: false } },
    { path: "*", element: <Navigate to="/" replace />, }
]

export default UnprotectedRoutes;