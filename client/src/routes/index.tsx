import { lazy, Suspense, useMemo } from "react";
import UnprotectedRoutes from "./Unprotected.route";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoutes from "./Proctected.route";
import { useStore } from "../components/provider/store.hooks";
import Loader from "../components/common-components/Loader";
const BaseLayout = lazy(() => import("../components/common-components/Layout/Index"));

const Routes = () => {

    const { isAuthenticated } = useStore();
    const routes = useMemo(() => {
        return createBrowserRouter([{
            element: <BaseLayout />,
            children: isAuthenticated ? ProtectedRoutes : UnprotectedRoutes
        }]);
    }, [isAuthenticated]);

    return <Suspense fallback={<Loader />}>
        <RouterProvider router={routes} />
    </Suspense>
}

export default Routes;