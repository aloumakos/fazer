import React, {useState} from 'react';


const style1 = {backgroundColor:'rgba(111, 76, 255,0.15)', border: '2px solid rgba(111, 76, 255,0.25)', color:'rgba(255,255,255, 0.8)'}

function Button1(props: { click: React.MouseEventHandler<HTMLButtonElement> | undefined; }) {
    const [style, setStyle] = useState(style1);

    function toggleHover() {

        setStyle({
            backgroundColor: 'rgba(111, 76, 255,0.35)',
            border: '2px solid rgba(111, 76, 255,0.5)',
            color: 'rgba(255,255,255, 0.9)'
        })
    }

    function toggleOut() {

        setStyle(style1)
    }
    return (
    <button className="rounded-3xl px-10 py-3 font-sans text-lg m-4 transition-colors duration-300" onMouseEnter={toggleHover} onMouseOut={toggleOut} style={style} onClick={props.click}>
            Select Image</button>
    );
}

export default Button1