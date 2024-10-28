import React from 'react'
import { Link } from 'react-router-dom'

const Error = () => {
    return (
        <div className='flex flex-col h-screen justify-center items-center space-x-28'>
            <div className='content-center'>
                <h1 className='text-4xl'>Error</h1>
                <h1 className='text-4xl'>Page not found</h1>
                <h1 className='text-4xl'>Fucking <span className='animate-pulse text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 tracking-wide'>CUCK</span></h1>
            </div>
            <div className='mt-60'>
                <Link to='/' >
                    <h1 className='underline decoration-pink-500 animate-pulse text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200'>
                        Go to Home page you incel
                    </h1>
                </Link>
            </div>
        </div>
    )
}

export default Error