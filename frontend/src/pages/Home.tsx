import React from "react";
import Register from "../components/Register";
import Login from "../components/Login";
import SampleConponent from "../components/SampleConponent";

const Home = () => {
  return (
    <div className="flex flex-row h-screen justify-center items-center space-x-28">
      {/*<div>
        <h1 className='font-poppins font-large text-[18px] col-span-3'>App</h1>
        <SampleConponent />  
      </div>
  */}
      <Register />

      <Login />
    </div>
  );
};

export default Home;
