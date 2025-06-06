import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from './';

const Layout = () => {
  return (
    <div className="bg-[#f7fdfd]">
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;