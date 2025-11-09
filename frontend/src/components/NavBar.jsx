import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, MessageSquare, Settings, User, PhoneCall, MessagesSquare } from 'lucide-react'
import { useAuthStore } from '@stores/useAuthStore'
import { useThemeStore } from '@stores/useThemeStore'

const NavBar = () => {
  const { logout, authUser } = useAuthStore()
  const { navBoutton, setNavBoutton } = useThemeStore()
  const navigate = useNavigate()

  const toggleChat = () => {
    setNavBoutton(1)
    navigate('/chat')
  }

  const toggleCall = () => {
    setNavBoutton(2)
    navigate('/call')
  }

  const NAV_ITEMS = {
    CHAT: {
      id: 1,
      name: 'chat',
      icon: MessagesSquare,
      fonction: () => { toggleChat() }
    },
    CALL: {
      id: 2,
      name: 'call',
      icon: PhoneCall,
      fonction: () => { toggleCall()}
    }
  }

  const navButtons = Object.values(NAV_ITEMS).map(item => ({
    ...item,
    icon: <item.icon className="size-5" />
  }))

  return (
    <header
      className='bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100-100/80'
    >
      <div className='container mx-auto px-4 h-12 md:h-16'>
        <div className='flex items-center justify-between h-full'>
          <Link to="/" className='flex items-center gap-2.5 hover:opacity-80 transition-all'>
            <div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center'>
              <MessageSquare className='w-5 h-5 text-primary' />
            </div>
            <h1 className='text-lg font-bold'>Talk<span className='text-primary/100'>'</span>s</h1>
          </Link>

          {authUser &&
            <ul className='hidden h-full gap-5'>
              {navButtons.map((button) => (
                <li
                  key={button.id}
                  onClick={() => {
                    button.fonction()
                  }}
                  className={`p-5 cursor-pointer ${navBoutton === button.id ? "border-b-2 bg-base-200 transition-all" : ""}`}
                >
                  {button.icon}
                  <span className='text-xs hidden sm:inline'>
                    {button.name}
                  </span>
                </li>))}
            </ul>
          }
          {authUser && 
          <div className="sm:hidden">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
              </div>
              <ul
                tabIndex="-1"
                className="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-35 p-2 shadow gap-2">
                <li>
                  <Link
                    to="/profile"
                    className={`gap-2`}
                    onClick={() => setNavBoutton(0)}
                  >
                    <User className="size-5.5" />
                    <span className='text-[1.3em]'>Profile</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/settings"}
                    className={`gap-2`}
                    onClick={() => setNavBoutton(0)}
                  >
                    <Settings className="size-5.5" />
                    <span className='text-[1.3em]'>Settings</span>
                  </Link>
                </li>
                <li>
                  <button className='gap-2' onClick={() => logout(authUser._id)} >
                    <LogOut className='size-5.5' />
                    <span className='text-[1.3em]'>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>}

          <div className={`${authUser && "hidden"} sm:flex items-center gap-2`}>
            <Link
              to={"/settings"}
              className={`btn btn-sm gap-2 transition-colors`}
              onClick={() => setNavBoutton(0)}
            >
              <Settings className="size-5" />
              <span className='hidden md:inline'>Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to="/profile"
                  className={`btn btn-sm gap-2`}
                  onClick={() => setNavBoutton(0)}
                >
                  <User className="size-5" />
                  <span className='hidden md:inline'>Profile</span>
                </Link>

                <button className='flex gap-2 items-center' onClick={() => logout(authUser._id)} >
                  <LogOut className='size-5' />
                  <span className='hidden md:inline'>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavBar
