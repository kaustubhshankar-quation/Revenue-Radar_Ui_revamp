import React from 'react'
import Navbar3 from '../Navbars/Navbar3'
import FooterPages from '../Footer/FooterPages'

function Updates() {
  return (
<>
<Navbar3/>
<div className="bgpages">
        <div className=' container py-3'>
          <div className="rr-card rr-card-header">
            <div className="rr-page-header-left">
              <div className="rr-breadcrumb">Dashboard / Updates</div>
              <h2 className="rr-page-title">Updates</h2>
            </div>
          </div>
          <div className='rr-card rr-card-section'>
        <div className='my-2'> There are currently no updates!!</div>
      
          </div>
          </div>
          </div>
          <div className=""><FooterPages /></div>
</>
  )
}

export default Updates
