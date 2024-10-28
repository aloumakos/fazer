import React from "react";
import AppTile from "../components/app_comp";
import Header from "../components/NavBar";
import cat from "../assets/cat.png"
import cat1 from "../assets/cat1.png"
import cat2 from "../assets/cat2.png"
class Dashboard extends React.Component {
  rendertile(image: any, url: any, desc: any) {
    return <AppTile image={image} url={url} desc={desc} />;
  }
  render() {
    return (
      <div>
        <Header />
        <div className="flex flex-wrap h-screen gap-32 justify-center items-center">
          <AppTile
            image={cat}
            url="/dashboard/search"
            desc="Search & Analysis"
          />
          <AppTile
            image={cat1}
            url=""
            desc="Face Verification"
          />
          <AppTile
            image={cat2}
            url=""
            desc="Height Estimation"
          />
        </div>
      </div>
    );
  }
}
export default Dashboard;
