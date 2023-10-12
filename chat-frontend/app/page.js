'use client'

import Navbar from "@/components/navbar";
import HomePage from "@/components/homepage";
import useSWR from "swr";
import storage from "@/utils/storage";
import checkLogin from "@/utils/checkLogin";
import Spinner from "@/components/Spinner";
import Messages from "@/components/messages";

export default function Home() {

    const {data: currentUser, isLoading, isError} = useSWR("user", storage);

    if (isLoading) return <Spinner/>
    const isLoggedIn = checkLogin(currentUser);

    return (
        <div>
            <Navbar/>
            <div className="container mx-auto">
                {isLoggedIn ? (<Messages/>) : <HomePage/>}
            </div>
        </div>
    )
}
