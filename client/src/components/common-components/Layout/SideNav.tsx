import { NavLink } from "react-router-dom";

const SideNav = () => {
    return (
        <nav className="sidenav h-100 p-3">
            <ul className="nav flex-column">
                <li className="nav-item">
                    <NavLink
                        to="/landing"
                        className={"nav-link"}
                    >
                        Rooms
                    </NavLink>

                </li>
            </ul>
        </nav>
    );
};

export default SideNav;