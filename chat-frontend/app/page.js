'use client'

import Navbar from "@/components/navbar";
import HomePage from "@/components/homepage";
import useSWR from "swr";
import storage from "@/utils/storage";
import checkLogin from "@/utils/checkLogin";
import Spinner from "@/components/Spinner";
import Messages from "@/components/messages";
import Maybe from "@/components/maybe";
import React from "react";

export default function Home() {

    const {data: currentUser, isLoading, isError} = useSWR("user", storage);

    if (isLoading) return <Spinner/>
    const isLoggedIn = checkLogin(currentUser);

    return (
        <div className="min-h-screen">
            <Navbar/>
            <div className="container mx-auto">
                <Maybe test={isLoggedIn}>
                    <Messages/>
                </Maybe>
                <Maybe test={!isLoggedIn}>
                    <HomePage/>
                </Maybe>
            </div>
        </div>
    )
}
