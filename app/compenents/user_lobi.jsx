"use client";

import { useState } from 'react'
import Rlist from './Rlist.jsx'
import Image from 'next/image.js';
import ust from '@/public/assets/ust.png';
import "../globals.css";
import Lobi_prodacts from './lobi_prodacts.jsx';
import Footer from './footer.jsx';
import Navbar from './navbar.jsx';
       

export default function UserLobi() {

  return (
    <div className=' overflow-x-hidden '>

        <div className='
        relative 
        min-h-[55vh] md:min-h-[65vh] lg:min-h-[70vh] 
        bg-cover bg-center bg-no-repeat
        md:bg-[url("/assets/kulaklik.png")] 
        bg-[url("/assets/phone_bg.png")]
        overflow-hidden '>

            <div className=' text-white mx-10 mt-20'>
                <div className='md:w-2xl w-auto  backdrop-blur-xs shadow-red-600 shadow-xl flex items-center justify-center mx-auto mt-4 lg:mt-14  rounded-3xl bg-white/30 py-10 lg:py-15 '>
                <h1 className='coming-soon-effect  text-xs lg:text-3xl md:text-lg '> ZR <br /> Gamers . store </h1>
                </div>
                  <div className='  flex justify-center absolute md:bottom-15 bottom-18  inset-x-0   py-2 '>
                <Image src={ust} alt="ust" className=' drop-shadow-2xl drop-shadow-blue-700  xl:max-w-4xl max-w-md zoom2 '  />

                </div>
               
            </div>
        </div>
        <div  >
        <Lobi_prodacts />
          
        </div>
        <Footer />
        
    </div>
       
  )
}

