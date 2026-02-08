"use client";
import UserLobi from "./compenents/user_lobi";
import Navbar from "./compenents/navbar";

export default function Home() {
  return (
    <div className="">
      <Navbar/>
      <div>
      <UserLobi />
      </div>
    </div>
  );
}
