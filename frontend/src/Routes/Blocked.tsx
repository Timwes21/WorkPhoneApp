import NavBar from '../components/navbar.tsx';
import BlockedList from '../components/blocked.tsx'
import { useEffect, useState } from 'react';
import { userSettingsBase } from '../routes.ts';
import { useAuth } from "@clerk/clerk-react";
import BlockedMessage from '../components/blocked-message.tsx';





export default function Blocked() {
    



  return (
    
      <div className='page'>
        <NavBar page={"blocked"}/>
        <div className='content'>
        <h2 className='page-title'>Blocked Numbers</h2>
        <div className="page-content">

        
        <BlockedMessage/>
        <BlockedList/>
        </div>
        </div>
      </div>
  )
}

