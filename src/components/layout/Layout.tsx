import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import DataModeBanner from "../DataModeBanner";

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <DataModeBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
