import { Outlet, useMatches } from "react-router-dom";
import Header from "./Header";
import SideNav from "./SideNav";
import type React from "react";

const Index: React.FC = () => {
    const matches = useMatches();
    const currentRoute = matches[matches.length - 1];

    const showSideNav = currentRoute?.handle?.showSideNav ?? false;
    const showHeader = currentRoute?.handle?.showHeader ?? false;

    return (
        <div className="app-layout d-flex flex-column min-vh-100">

            {/* HEADER */}
            {showHeader && (
                <header className="app-header">
                    <Header />
                </header>
            )}

            {/* BODY under header */}
            <div className="app-body d-flex flex-grow-1">

                {/* SIDE NAV */}
                {showSideNav && (
                    <aside className="app-sidenav">
                        <SideNav />
                    </aside>
                )}

                {/* MAIN CONTENT */}
                <main className={`${showHeader && showSideNav ? 'app-content' : ''} flex-grow-1`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Index;