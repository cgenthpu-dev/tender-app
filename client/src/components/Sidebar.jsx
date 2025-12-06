import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Layers,
    FileText,
    List,
    Database,
    CheckSquare,
} from "lucide-react";

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: "/", label: "Create Tender", icon: FileText },
        { path: "/my-tenders", label: "My Tenders", icon: Layers },
        { path: "/categories", label: "T&C Categories", icon: List },
        { path: "/terms", label: "T&C Creation Master", icon: Database },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-10">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <CheckSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">TenderGen</h1>
                        <p className="text-xs text-slate-400">Pro Suite</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(item.path)
                                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <item.icon
                            className={`w-5 h-5 ${isActive(item.path)
                                    ? "text-white"
                                    : "text-slate-500 group-hover:text-white"
                                }`}
                        />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-2">Storage Used</p>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mb-2">
                        <div className="bg-blue-500 h-1.5 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-xs text-slate-500">75% of 1GB used</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
