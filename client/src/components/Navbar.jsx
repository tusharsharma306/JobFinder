import React, { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { HiMenuAlt3 } from "react-icons/hi";
import { AiOutlineClose, AiOutlineLogout } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Logout } from "../redux/userSlice";
import CustomButton from "./CustomButton";
import { NoProfile } from "../assets";

const MenuList = ({ user, onClick, onLogout }) => {
  return (
    <div>
      <Menu as='div' className='relative inline-block text-left'>
        <div className='flex'>
          <Menu.Button className='inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100 transition'>
            <div className='flex flex-col items-start'>
              <p className='text-sm font-semibold'>{user?.firstName ?? user?.name}</p>
              <span className='text-xs text-blue-600'>{user?.jobTitle ?? user?.email}</span>
            </div>
            <img
              src={user?.profileUrl || NoProfile}
              alt='user profile'
              className='w-10 h-10 rounded-full object-cover'
            />
            <BiChevronDown className='h-6 w-6 text-slate-600' />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items className='absolute right-0 mt-2 w-56 z-50 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
            <div className='p-1'>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to={user?.accountType === "seeker" ? "/user-profile" : "/company-profile"}
                    className={`${
                      active ? "bg-blue-500 text-white" : "text-gray-900"
                    } group flex items-center w-full rounded-md px-2 py-2 text-sm`}
                    onClick={onClick}
                  >
                    <CgProfile className='mr-2 h-5 w-5' />
                    {user?.accountType === "seeker" ? "User Profile" : "Company Profile"}
                  </Link>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onLogout}
                    className={`${
                      active ? "bg-blue-500 text-white" : "text-gray-900"
                    } group flex items-center w-full rounded-md px-2 py-2 text-sm`}
                  >
                    <AiOutlineLogout className='mr-2 h-5 w-5' />
                    Log Out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

const Navbar = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseNavbar = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    dispatch(Logout());
    localStorage.removeItem("userInfo");
    window.location.replace("/");
  };

  return (
    <div className='bg-white shadow-sm sticky top-0 z-50'>
      <nav className='container mx-auto flex items-center justify-between py-4 px-6'>
        <div>
          <Link to='/' className='text-blue-600 font-extrabold text-2xl tracking-tight'>
            Job<span className='text-[#1677cccb]'>Finder</span>
          </Link>
        </div>

        <ul className='hidden lg:flex gap-8 items-center text-base font-medium text-slate-700'>
          {user?.accountType === "seeker" ? (
            <>
              <li><Link to='/find-jobs' className='hover:text-blue-600 transition'>Find Jobs</Link></li>
              <li><Link to='/companies' className='hover:text-blue-600 transition'>Companies</Link></li>
              <li><Link to='/applied-jobs' className='hover:text-blue-600 transition'>Applied Jobs</Link></li>
            </>
          ) : user?.token ? (
            <>
              <li><Link to='/upload-job' className='hover:text-blue-600 transition'>Post Job</Link></li>
              <li><Link to='/companies' className='hover:text-blue-600 transition'>Companies</Link></li>
              <li><Link to='/company-profile' className='hover:text-blue-600 transition'>Company Profile</Link></li>
            </>
          ) : null}
        </ul>

        <div className='hidden lg:block'>
          {!user?.token ? (
            <Link to='/user-auth'>
              <CustomButton
                title='Sign In'
                containerStyles='text-blue-600 py-2 px-6 rounded-full border border-blue-600 hover:bg-blue-600 hover:text-white transition'
              />
            </Link>
          ) : (
            <MenuList user={user} onLogout={handleLogout} />
          )}
        </div>
        <button className='block lg:hidden text-slate-800' onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? <AiOutlineClose size={26} /> : <HiMenuAlt3 size={26} />}
        </button>
      </nav>

      <div className={`${isOpen ? "block" : "hidden"} bg-white shadow-md lg:hidden py-5 px-6 space-y-4`}>
        <div className='flex flex-col gap-4 text-base font-medium text-slate-700'>
          {user?.accountType === "seeker" ? (
            <>
              <Link to='/find-jobs' onClick={handleCloseNavbar} className='hover:text-blue-600'>Find Jobs</Link>
              <Link to='/applied-jobs' onClick={handleCloseNavbar} className='hover:text-blue-600'>Applied Jobs</Link>
            </>
          ) : user?.token ? (
            <>
              <Link to='/upload-job' onClick={handleCloseNavbar} className='hover:text-blue-600'>Post Job</Link>
              <Link to='/company-profile' onClick={handleCloseNavbar} className='hover:text-blue-600'>Company Profile</Link>
            </>
          ) : null}
          <Link to='/companies' onClick={handleCloseNavbar} className='hover:text-blue-600'>Companies</Link>
        </div>

        <div className='pt-6'>
          {!user?.token ? (
            <Link to='/user-auth'>
              <CustomButton
                title='Sign In'
                containerStyles='text-blue-600 py-2 px-5 rounded-full border border-blue-600 hover:bg-blue-600 hover:text-white transition'
              />
            </Link>
          ) : (
            <MenuList user={user} onClick={handleCloseNavbar} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
