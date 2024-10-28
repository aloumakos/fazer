import { SetStateAction, useState} from "react";
import Header from "../components/NavBar";
import '../styles/Panel.css'
import Panel from "../components/Panel";
import ResultSection from "../components/ResultSection";

function Search() {
    const [results, setResults] = useState([[]])
    const [index, setIndex] = useState(0)
    const [showResults, setShowResults] = useState('load')

    return (
        <div>
            <Header/>

            <div className="flex flex-col 2xl:flex-row " style={{height: "calc(100vh - 64px)"}}>
                <div className="basis-8/12 px-[2%] py-[5%] relative select-none  overflow-hidden"
                     style={{background: "rgb(32,33,36)"}}>
                    <Panel setResults={setResults} setIndex={(i: SetStateAction<number>) => { setIndex(i) }} setMessage={setShowResults} />
        </div>
        <div className="basis-4/12 bg-gradient-to-r from-slate-900 to-indigo-500  p-7 overflow-auto">
          <ResultSection index={index} display={showResults} results={results} />
        </div>

      </div>
    </div>
  );
}

export default Search;
