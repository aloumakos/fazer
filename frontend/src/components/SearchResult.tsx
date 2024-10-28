import "../styles/Panel.css"

export default function Result(props: any) {

    const data = Object.keys(props.data).map((label, value) => (
        <div className="flex flex-col "><span className="italic text-sm">{label}</span><span className="text-white">{props.data[label]}</span></div>
    ));

    return (
        <div className="flex w-full xl:flex-[0_0_250px] justify-center items-center px-[30px] resultBox">
            <div className=" flex items-center justify-center resultImage"><img src={"data:image/jpeg;base64," + props.image} onLoad={props.readyImage} /></div>
            <div className=" grid-cols-3 gap-y-2  resultText">
                {data}
            </div>
        </div>
    )


}