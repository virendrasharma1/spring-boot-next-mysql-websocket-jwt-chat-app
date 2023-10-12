"use client"
import React from "react";
import {usePathname} from 'next/navigation';
import Maybe from "./maybe";
import useSWR from "swr";
import storage from "@/utils/storage";
import checkLogin from "@/utils/checkLogin";


const Navbar = () => {
    const {data: currentUser} = useSWR("user", storage);
    const isLoggedIn = checkLogin(currentUser);

    const handleClick = () => {

    }
    const pathname = usePathname();

    return (
        <nav className=" p-4 mb-4">
            <div className="container mx-auto flex items-center justify-end">
                <ul className="flex space-x-4">
                    <li className="nav-item">
                        <a href="/">
                            <span
                                className={`${pathname === "/" ? "text-black" : "text-white"} hover:underline`}>Home</span>
                        </a>
                    </li>
                    <Maybe test={isLoggedIn}>
                        <li className="nav-item">
                            <a
                                href={`/profile/${currentUser?.name}`}
                            >
                                <span onClick={handleClick}>{currentUser?.name}</span>
                            </a>
                        </li>
                    </Maybe>
                    <Maybe test={!isLoggedIn}>
                        <li className="nav-item">
                            <a href="/login"
                               className={`${pathname === "/login" ? "text-black" : "text-white"} hover:underline`}>
                                Sign in
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="/register"
                               className={`${pathname === "/register" ? "text-black" : "text-white"} hover:underline`}>
                                Sign up
                            </a>
                        </li>
                    </Maybe>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
