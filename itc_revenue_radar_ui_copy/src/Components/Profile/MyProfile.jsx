import React from 'react'
import Navbar3 from '../Navbars/Navbar3'
import FooterPages from '../Footer/FooterPages'
import UserService from '../../services/UserService'

function MyProfile() {
  return (
    <>
    <Navbar3/>
    <div className="bgpages">
    <div className=' container py-3'>
          <div className="rr-card rr-card-header">
            <div className="rr-page-header-left">
              <div className="rr-breadcrumb">Dashboard / My Profile</div>
              <h2 className="rr-page-title">My Profile</h2>
            </div>
          </div>
          <div className='rr-card rr-card-section'>
        <div className='my-2'>    Logged In User:{UserService.getUsername()}</div>
        <div className='my-2'>    Full Name: {UserService.getFullName()} </div>
          </div>
          </div></div>
          <div className=""><FooterPages /></div>
          
    </>

  )
}

export default MyProfile
