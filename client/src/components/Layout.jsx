import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />
            <div className="flex-1 ml-64">
                <div className="p-8 max-w-7xl mx-auto">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
