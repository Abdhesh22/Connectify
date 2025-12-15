const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="app-loader">
            <img
                src="/images/logo.svg"
                alt="App logo"
                className="app-loader-logo"
            />
            <span className="app-loader-text">{text}</span>
        </div>
    );
};

export default Loader;
