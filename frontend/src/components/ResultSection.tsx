import ReactiveButton from 'reactive-button';
import Result from "../components/SearchResult";
import React, { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

const image_format = import.meta.env.VITE_IMAGE_FORMAT;

function ResultSection(props: any) {
    const [buttonState, setButtonState] = useState('idle')
    const [showResults, setShowResults] = useState(image_format == "link" ? 'load' : 'show')
    let resultSection = [<div></div>]

    useEffect(() => {
        console.log(image_format, showResults)
        if (props.index != -1 && image_format == "base64") {
            setShowResults("show")
        }
        else if (props.index != -1 && image_format == "link") {
            setShowResults('load')
        }
        else {
            setShowResults(props.display)
        }
    }, [props.results, props.index, props.display])

    if (props.index != -1 && showResults == "load") {

        let ready = props.results[props.index].map((image: any) => 0)

        resultSection = props.results[props.index].map((image: any, key: string | number) =>
            <Result image={image} key={key} readyImage={() => {
                ready[key] = 1;
                if (ready.reduce((a: any, b: any) => a + b, 0) == props.results[props.index].length) {
                    setShowResults('show')
                }
            }}
                data={{ Name: "Denji", Age: 17, Nationality: "Japanese", Traits: "Horny", Record: "Clean", "Skin Color": "White", Crush: "Makima" }} />
        )
    }
    else if (props.index != -1) {
        console.log(props.results[props.index])
        resultSection = props.results[props.index].map((image: any, key: string | number) =>
            <Result image={image} key={key}
                data={{ Name: "Denji", Age: 17, Nationality: "Japanese", Traits: "Horny", Record: "Clean", "Skin Color": "White", Crush: "Makima" }} />
        )
    }

    const onClickHandler = () => {
        setButtonState('loading')
    }


    return (

        props.results[0].length == 0 ?
            <div className=" h-full flex flex-col place-content-center ">
                <span className="text-center text-white">No results yet</span>
            </div>
            : <React.Fragment>
                <div className={`${showResults == 'show' ? 'flex' : 'hidden'} flex-col divide-y`}>
                    {resultSection}
                </div>
                <div className={`h-full ${showResults == 'load' ? 'flex' : 'hidden'} w-full flex flex-col justify-center items-center `}>

                    <PuffLoader color="#36d7b7" />
                    <span className="text-center p-[20px]" style={{ fontFamily: "arial", color: "rgb(241,243,244)", fontSize: "22px" }}>Loading results...</span>

                </div>
                <div className={`h-full ${showResults == 'multi' ? 'flex' : 'hidden'} w-full flex flex-col justify-center items-center `}>

                    <span className="text-center p-[20px]" style={{ fontFamily: "arial", color: "rgb(241,243,244)", fontSize: "22px" }}>Multiple faces were detected. Either re-adjust the lens or continue to search</span>
                    <ReactiveButton
                        buttonState={buttonState}
                        size='medium'
                        idleText="Continue"
                        loadingText="Loading"
                        successText="Done"
                        onClick={onClickHandler}
                    />
                </div>
                <div className={`h-full ${showResults == 'none' ? 'flex' : 'hidden'} w-full flex flex-col justify-center items-center `}>

                    <span className="text-center p-[20px]" style={{ fontFamily: "arial", color: "rgb(241,243,244)", fontSize: "22px" }}>No face was detected. Either re-adjust the lens or continue to search</span>
                    <ReactiveButton
                        shadow
                        color='dark'
                        size='large'
                        buttonState={buttonState}
                        idleText="Continue"
                        loadingText="Loading"
                        successText="Done"
                        onClick={onClickHandler}
                    />
                </div></React.Fragment>

    );
}


export default ResultSection