import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Error from "./pages/Error";
import Apps from "./pages/Dashboard";
import Search from "./pages/Search";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/dashboard" element={<Apps/>}/>
                <Route path="/dashboard/search" element={<Search/>}/>
                <Route path="*" element={<Error/>}/>
            </Routes>
        </Router>
    );
};

export default App;
