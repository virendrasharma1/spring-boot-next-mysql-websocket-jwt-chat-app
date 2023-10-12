"use client"
import React from "react";
import {registerUser} from "@/utils/auth";
import {userAPI} from "@/utils/api";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();

    const [username, setUsername] = React.useState("");
    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { name, username, password }
        const data = await registerUser(payload);
        window.localStorage.setItem("token", data.accessToken);
        window.localStorage.setItem("token", data.accessToken);
        const user = await userAPI.get()
        window.localStorage.setItem("user", JSON.stringify(user));
        router.push("/");
    };

    return (
        <div className='flex justify-center items-center h-screen'>
            <form onSubmit={handleSubmit} className='w-full max-w-sm'>
                <fieldset>
                    <fieldset className="form-group">
                        <input
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 mb-2"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value)
                            }}
                        />
                    </fieldset>

                    <fieldset className="form-group">
                        <input
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 mb-2"
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                            }}
                        />
                    </fieldset>

                    <fieldset className="form-group">
                        <input
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 mb-2"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                            }}
                        />
                    </fieldset>
                    <div className='flex justify-center items-center'>
                        <button
                            className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold mt-4  py-2 px-4 rounded"
                            type="submit"
                        >
                            Sign up
                        </button>
                    </div>
                </fieldset>
            </form>
        </div>
    )
}
