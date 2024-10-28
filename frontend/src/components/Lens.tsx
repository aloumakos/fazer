import React, { useState, useRef, useEffect } from 'react'
import "../styles/Lens.css"

export default function Lens(props: any) {
    const [sizeLens, setSizeLensPerc] = useState([0.2, 0.2])
    const [animation, setAnimation] = useState(false)
    const [posLens, setPosLensPerc] = useState([0.2, 0.2])
    const imgRef = useRef(null)

    const setPosLens = (e: any[]) => {
        // @ts-ignore
        const imgPos = imgRef.current.getBoundingClientRect()
        setPosLensPerc([e[0] / imgPos.height, e[1] / imgPos.width])
    }
    const setSizeLens = (e: any[]) => {
        // @ts-ignore
        const imgPos = imgRef.current.getBoundingClientRect()
        setSizeLensPerc([e[0] / imgPos.width, e[1] / imgPos.height])
    }

    useEffect(() => {

        const box = [props.face[0], props.face[1], props.face[2], props.face[3]]
        setPosLensPerc([box[1], box[0]])
        setSizeLensPerc([box[2] - box[0], box[3] - box[1]])
    }, [props.face])

    const handleClick = (e: { clientX: number; clientY: number }) => {


        // @ts-ignore
        const imgPos = imgRef.current.getBoundingClientRect()
        const startSize = [sizeLens[0] * imgPos.width, sizeLens[1] * imgPos.height];


        if (startSize[0] >= 80 && startSize[1] >= 80) {
            setAnimation(true)
        }

        if (e.clientX - startSize[0] / 2 <= imgPos.x) {

            setPosLens([e.clientY - imgPos.y - startSize[1] / 2, 0])
            if (e.clientY - startSize[1] / 2 <= imgPos.y) {
                setPosLens([0, 0])
            } else if (e.clientY + startSize[1] / 2 >= imgPos.bottom) {
                setPosLens([imgPos.height - startSize[1], 0])
            }
            return
        }
        else if (e.clientX + startSize[0] / 2 >= imgPos.right) {

            setPosLens([e.clientY - imgPos.y - startSize[1] / 2, imgPos.width - startSize[0]])
            if (e.clientY - startSize[1] / 2 <= imgPos.y) {
                setPosLens([0, imgPos.width - startSize[0]])
            } else if (e.clientY + startSize[1] / 2 >= imgPos.bottom) {
                setPosLens([imgPos.height - startSize[1], imgPos.width - startSize[0]])
            }
            return
        }

        if (e.clientY - startSize[1] / 2 <= imgPos.y) {
            setPosLens([0, e.clientX - imgPos.x - startSize[0] / 2])
            return
        }
        else if (e.clientY + startSize[1] / 2 >= imgPos.bottom) {
            setPosLens([imgPos.height - startSize[1], e.clientX - imgPos.x - startSize[0] / 2])
            return
        }
        setPosLens([e.clientY - imgPos.y - startSize[1] / 2, e.clientX - imgPos.x - startSize[0] / 2])
        setTimeout(() => setAnimation(false), 400)
    }

    const handleMoveLens = (mouseDownEvent: { pageX: any; pageY: any }) => {
        // @ts-ignore
        const imgPos = imgRef.current.getBoundingClientRect()
        const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };
        const startSize = [sizeLens[0] * imgPos.width, sizeLens[1] * imgPos.height];
        const startPos = { top: posLens[0] * imgPos.height, left: posLens[1] * imgPos.width }

        let currentPos = posLens;
        let currentSize = sizeLens;

        function onMouseMove(mouseMoveEvent: { pageY: number; pageX: number }) {
            const top = startPos.top - startPosition.y + mouseMoveEvent.pageY
            const left = startPos.left - startPosition.x + mouseMoveEvent.pageX
            if (top <= 0) {
                setPosLens([0, left])
                if (left <= 0) {
                    setPosLens([0, 0])
                    currentPos = [0, 0]
                    return
                } else if (left >= imgPos.width - startSize[0]) {
                    setPosLens([0, imgPos.width - startSize[0]])
                    currentPos = [0, imgPos.width - startSize[0]]
                    return

                }

                return
            }
            else if (top >= imgPos.height - startSize[1]) {
                setPosLens([imgPos.height - startSize[1], left])
                if (left <= 0) {
                    setPosLens([imgPos.height - startSize[1], 0])
                    currentPos = [imgPos.height - startSize[1], 0]
                    return
                } else if (left >= imgPos.width - startSize[0]) {
                    setPosLens([imgPos.height - startSize[1], imgPos.width - startSize[0]])
                    currentPos = [imgPos.height - startSize[1], imgPos.width - startSize[0]]
                    return

                }
                return
            }
            if (left <= 0) {
                setPosLens([top, 0])
                currentPos = [top, 0]
                return
            }
            else if (left >= imgPos.width - startSize[0]) {
                setPosLens([top, imgPos.width - startSize[0]])
                currentPos = [top, imgPos.width - startSize[0]]
                return

            }
            setPosLens([top, left]);
            currentPos = [top, left]
        }
        function onMouseUp() {
            document.body.removeEventListener("mousemove", onMouseMove);
            props.changeLens([currentPos[0] / imgPos.height, currentPos[1] / imgPos.width], currentSize)
        }

        document.body.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp, { once: true });
    };

    const handleResizeBot = (mouseDownEvent: { clientX: any; clientY: any }) => {
        // @ts-ignore
        const imgPos = imgRef.current.getBoundingClientRect()
        const startSize = [sizeLens[0] * imgPos.width, sizeLens[1] * imgPos.height];
        const startPosition = { x: mouseDownEvent.clientX, y: mouseDownEvent.clientY };
        const startPos = { top: posLens[0] * imgPos.height, left: posLens[1] * imgPos.width }

        let currentPos = posLens;
        let currentSize = sizeLens;

        function onMouseMove(mouseMoveEvent: { pageX: number; pageY: number }) {

            if (mouseMoveEvent.pageX >= imgPos.right) {
                setSizeLens([imgPos.right - imgPos.x - startPos.left, startSize[1] - startPosition.y + mouseMoveEvent.pageY])
                currentSize = [imgPos.right - imgPos.x - startPos.left, startSize[1] - startPosition.y + mouseMoveEvent.pageY]
                if (mouseMoveEvent.pageY >= imgPos.bottom) {
                    setSizeLens([imgPos.right - imgPos.x - startPos.left, imgPos.bottom - imgPos.y - startPos.top])
                    currentSize = [imgPos.right - imgPos.x - startPos.left, imgPos.bottom - imgPos.y - startPos.top]
                }
                return
            }
            else if (mouseMoveEvent.pageY >= imgPos.bottom) {
                setSizeLens([startSize[0] - startPosition.x + mouseMoveEvent.pageX,
                imgPos.bottom - imgPos.y - startPos.top]);
                currentSize = [startSize[0] - startPosition.x + mouseMoveEvent.pageX,
                imgPos.bottom - imgPos.y - startPos.top]
                return
            }

            if (startSize[0] - startPosition.x + mouseMoveEvent.pageX <= 40 && startSize[1] - startPosition.y + mouseMoveEvent.pageY <= 40) {
                setSizeLens([40, 40])
                currentSize = [40, 40]
                return
            }
            if (startSize[0] - startPosition.x + mouseMoveEvent.pageX <= 40) {
                setSizeLens([40, startSize[1] - startPosition.y + mouseMoveEvent.pageY])
                currentSize = [40, startSize[1] - startPosition.y + mouseMoveEvent.pageY]
                return
            }
            if (startSize[1] - startPosition.y + mouseMoveEvent.pageY <= 40) {
                setSizeLens([startSize[0] - startPosition.x + mouseMoveEvent.pageX, 40])
                currentSize = [startSize[0] - startPosition.x + mouseMoveEvent.pageX, 40]
                return
            }

            setSizeLens([startSize[0] - startPosition.x + mouseMoveEvent.pageX,
            startSize[1] - startPosition.y + mouseMoveEvent.pageY

            ]);
            currentSize = [startSize[0] - startPosition.x + mouseMoveEvent.pageX,
            startSize[1] - startPosition.y + mouseMoveEvent.pageY]
        }
        function onMouseUp() {
            document.body.removeEventListener("mousemove", onMouseMove);
            props.changeLens(currentPos, [currentSize[0] / imgPos.width, currentSize[1] / imgPos.height])

        }

        document.body.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp, { once: true });
    };

    const handleResizeTop = (mouseDownEvent: { clientX: any; clientY: any }) => {
        // @ts-ignore
        const imgPos = imgRef.current.getBoundingClientRect()
        const startSize = [sizeLens[0] * imgPos.width, sizeLens[1] * imgPos.height];
        const startPosition = { x: mouseDownEvent.clientX, y: mouseDownEvent.clientY };
        const startPos = { top: posLens[0] * imgPos.height, left: posLens[1] * imgPos.width }

        let currentPos = posLens;
        let currentSize = sizeLens;

        function onMouseMove(mouseMoveEvent: { pageX: number; clientY: number; pageY: number; clientX: number }) {

            if (mouseMoveEvent.pageX <= imgPos.x) {
                setPosLens([mouseMoveEvent.clientY + startPos.top - startPosition.y, 0])
                setSizeLens([startSize[0] + startPos.left, startSize[1] + startPosition.y - mouseMoveEvent.pageY])
                currentPos = [mouseMoveEvent.clientY + startPos.top - startPosition.y, 0]
                currentSize = [startSize[0] + startPos.left, startSize[1] + startPosition.y - mouseMoveEvent.pageY]
                if (mouseMoveEvent.pageY <= imgPos.y) {
                    setPosLens([0, 0])
                    setSizeLens([startSize[0] + startPos.left, startSize[1] + startPos.top])
                    currentPos = [0, 0]
                    currentSize = [startSize[0] + startPos.left, startSize[1] + startPos.top]
                }
                else if (startSize[1] + startPosition.y - mouseMoveEvent.pageY <= 40) {
                    setPosLens([startPos.top + startSize[1] - 40, 0])
                    setSizeLens([startSize[0] + startPos.left, 40])
                    currentPos = [startPos.top + startSize[1] - 40, 0]
                    currentSize = [startSize[0] + startPos.left, 40]
                }
                return
            }
            else if (mouseMoveEvent.pageY <= imgPos.y) {
                setPosLens([0, mouseMoveEvent.clientX + startPos.left - startPosition.x])
                setSizeLens([startSize[0] + startPosition.x - mouseMoveEvent.clientX, startSize[1] + startPos.top])
                currentPos = [0, mouseMoveEvent.clientX + startPos.left - startPosition.x]
                currentSize = [startSize[0] + startPosition.x - mouseMoveEvent.clientX, startSize[1] + startPos.top]
                if (startSize[0] + startPosition.x - mouseMoveEvent.pageX <= 40) {
                    setPosLens([0, startPos.left + startSize[0] - 40])
                    setSizeLens([40, startSize[1] + startPos.top])
                    currentPos = [0, startPos.left + startSize[0] - 40]
                    currentSize = [40, startSize[1] + startPos.top]
                }
                return
            }

            if (startSize[0] + startPosition.x - mouseMoveEvent.pageX <= 40 && startSize[1] + startPosition.y - mouseMoveEvent.pageY <= 40) {
                setPosLens([startPos.top + startSize[1] - 40, startPos.left + startSize[0] - 40])
                setSizeLens([40, 40])
                currentPos = [startPos.top + startSize[1] - 40, startPos.left + startSize[0] - 40]
                currentSize = [40, 40]
                return
            }
            if (startSize[0] + startPosition.x - mouseMoveEvent.pageX <= 40) {
                setPosLens([mouseMoveEvent.clientY + startPos.top - startPosition.y, startPos.left + startSize[0] - 40])
                setSizeLens([40, startSize[1] + startPosition.y - mouseMoveEvent.pageY])
                currentPos = [mouseMoveEvent.clientY + startPos.top - startPosition.y, startPos.left + startSize[0] - 40]
                currentSize = [40, startSize[1] + startPosition.y - mouseMoveEvent.pageY]
                return
            }
            if (startSize[1] + startPosition.y - mouseMoveEvent.pageY <= 40) {
                setPosLens([startPos.top + startSize[1] - 40, mouseMoveEvent.clientX + startPos.left - startPosition.x])
                setSizeLens([startSize[0] + startPosition.x - mouseMoveEvent.pageX, 40])
                currentPos = [startPos.top + startSize[1] - 40, mouseMoveEvent.clientX + startPos.left - startPosition.x]
                currentSize = [startSize[0] + startPosition.x - mouseMoveEvent.pageX, 40]
                return
            }
            setPosLens([mouseMoveEvent.clientY + startPos.top - startPosition.y, mouseMoveEvent.clientX + startPos.left - startPosition.x])
            setSizeLens([startSize[0] + startPosition.x - mouseMoveEvent.clientX,
            startSize[1] + startPosition.y - mouseMoveEvent.clientY
            ]);
            currentPos = [mouseMoveEvent.clientY + startPos.top - startPosition.y, mouseMoveEvent.clientX + startPos.left - startPosition.x]
            currentSize = [startSize[0] + startPosition.x - mouseMoveEvent.clientX,
            startSize[1] + startPosition.y - mouseMoveEvent.clientY
            ]
        }
        function onMouseUp() {
            document.body.removeEventListener("mousemove", onMouseMove);
            props.changeLens([currentPos[0] / imgPos.height, currentPos[1] / imgPos.width], [currentSize[0] / imgPos.width, currentSize[1] / imgPos.height])
        }
        document.body.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp, { once: true });
    };

    const handleResizeTopR = (mouseDownEvent: { clientX: any; clientY: any }) => {
        // @ts-ignore
        const imgPos = imgRef.current.getBoundingClientRect()
        const startSize = [sizeLens[0] * imgPos.width, sizeLens[1] * imgPos.height];
        const startPosition = { x: mouseDownEvent.clientX, y: mouseDownEvent.clientY };
        const startPos = { top: posLens[0] * imgPos.height, left: posLens[1] * imgPos.width }

        let currentPos = posLens;
        let currentSize = sizeLens;

        function onMouseMove(mouseMoveEvent: { pageX: number; clientY: number; pageY: number; clientX: number }) {

            if (mouseMoveEvent.pageX >= imgPos.right) {
                setPosLens([mouseMoveEvent.clientY + startPos.top - startPosition.y, startPos.left])
                setSizeLens([imgPos.right - startPos.left - imgPos.x, startSize[1] + startPosition.y - mouseMoveEvent.pageY])
                currentPos = [mouseMoveEvent.clientY + startPos.top - startPosition.y, startPos.left]
                currentSize = [imgPos.right - startPos.left - imgPos.x, startSize[1] + startPosition.y - mouseMoveEvent.pageY]
                if (mouseMoveEvent.pageY <= imgPos.y) {
                    setPosLens([0, startPos.left])
                    setSizeLens([imgPos.right - startPos.left - imgPos.x, startSize[1] + startPos.top])
                    currentPos = [0, startPos.left]
                    currentSize = [imgPos.right - startPos.left - imgPos.x, startSize[1] + startPos.top]
                }
                else if (startSize[1] + startPosition.y - mouseMoveEvent.pageY <= 40) {
                    setPosLens([startPos.top + startSize[1] - 40, startPos.left])
                    setSizeLens([imgPos.right - startPos.left - imgPos.x, 40])
                    currentPos = [startPos.top + startSize[1] - 40, startPos.left]
                    currentSize = [imgPos.right - startPos.left - imgPos.x, 40]
                }
                return
            }
            else if (mouseMoveEvent.pageY <= imgPos.y) {
                setPosLens([0, startPos.left])
                setSizeLens([startSize[0] - startPosition.x + mouseMoveEvent.clientX, startSize[1] + startPos.top])
                currentPos = [0, startPos.left]
                currentSize = [startSize[0] - startPosition.x + mouseMoveEvent.clientX, startSize[1] + startPos.top]
                if (startSize[0] - startPosition.x + mouseMoveEvent.pageX <= 40) {
                    setPosLens([0, startPos.left])
                    setSizeLens([40, startSize[1] + startPos.top])
                    currentPos = [0, startPos.left]
                    currentSize = [40, startSize[1] + startPos.top]
                }
                return
            }

            if (startSize[0] - startPosition.x + mouseMoveEvent.pageX <= 40 && startSize[1] + startPosition.y - mouseMoveEvent.pageY <= 40) {
                setPosLens([startPos.top + startSize[1] - 40, startPos.left])
                setSizeLens([40, 40])
                currentPos = [startPos.top + startSize[1] - 40, startPos.left]
                currentSize = [40, 40]
                return
            }
            if (startSize[0] - startPosition.x + mouseMoveEvent.pageX <= 40) {
                setPosLens([mouseMoveEvent.clientY + startPos.top - startPosition.y, startPos.left])
                setSizeLens([40, startSize[1] + startPosition.y - mouseMoveEvent.pageY])
                currentPos = [mouseMoveEvent.clientY + startPos.top - startPosition.y, startPos.left]
                currentSize = [40, startSize[1] + startPosition.y - mouseMoveEvent.pageY]
                return
            }
            if (startSize[1] + startPosition.y - mouseMoveEvent.pageY <= 40) {
                setPosLens([startPos.top + startSize[1] - 40, startPos.left])
                setSizeLens([startSize[0] - startPosition.x + mouseMoveEvent.pageX, 40])
                currentPos = [startPos.top + startSize[1] - 40, startPos.left]
                currentSize = [startSize[0] - startPosition.x + mouseMoveEvent.pageX, 40]
                return
            }

            setPosLens([mouseMoveEvent.clientY + startPos.top - startPosition.y, startPos.left])
            setSizeLens([startSize[0] - startPosition.x + mouseMoveEvent.pageX,
            startSize[1] + startPosition.y - mouseMoveEvent.pageY
            ]);
            currentPos = [mouseMoveEvent.clientY + startPos.top - startPosition.y, startPos.left]
            currentSize = [startSize[0] - startPosition.x + mouseMoveEvent.pageX,
            startSize[1] + startPosition.y - mouseMoveEvent.pageY
            ]
        }
        function onMouseUp() {
            document.body.removeEventListener("mousemove", onMouseMove);
            props.changeLens([currentPos[0] / imgPos.height, currentPos[1] / imgPos.width], [currentSize[0] / imgPos.width, currentSize[1] / imgPos.height])

        }
        document.body.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp, { once: true });
    };

    const handleResizeBotL = (mouseDownEvent: { clientX: any; clientY: any }) => {
        // @ts-ignore
        const imgPos = imgRef.current.getBoundingClientRect()
        const startSize = [sizeLens[0] * imgPos.width, sizeLens[1] * imgPos.height];
        const startPosition = { x: mouseDownEvent.clientX, y: mouseDownEvent.clientY };
        const startPos = { top: posLens[0] * imgPos.height, left: posLens[1] * imgPos.width }

        let currentPos = posLens;
        let currentSize = sizeLens;

        function onMouseMove(mouseMoveEvent: { pageX: number; pageY: number; clientX: number }) {

            if (mouseMoveEvent.pageX <= imgPos.left) {
                setPosLens([startPos.top, 0])
                setSizeLens([startPos.left + startSize[0], startSize[1] - startPosition.y + mouseMoveEvent.pageY])
                currentPos = [startPos.top, 0]
                currentSize = [startPos.left + startSize[0], startSize[1] - startPosition.y + mouseMoveEvent.pageY]
                if (mouseMoveEvent.pageY >= imgPos.bottom) {
                    setPosLens([startPos.top, 0])
                    setSizeLens([startPos.left + startSize[0], imgPos.height - startPos.top])
                    currentPos = [startPos.top, 0]
                    currentSize = [startPos.left + startSize[0], imgPos.height - startPos.top]
                }
                else if (startSize[1] - startPosition.y + mouseMoveEvent.pageY <= 40) {
                    setPosLens([startPos.top, 0])
                    setSizeLens([startPos.left + startSize[0], 40])
                    currentPos = [startPos.top, 0]
                    currentSize = [startPos.left + startSize[0], 40]
                }
                return
            }
            else if (mouseMoveEvent.pageY >= imgPos.bottom) {
                setPosLens([startPos.top, mouseMoveEvent.clientX + startPos.left - startPosition.x])
                setSizeLens([startSize[0] + startPosition.x - mouseMoveEvent.pageX, imgPos.height - startPos.top])
                currentPos = [startPos.top, mouseMoveEvent.clientX + startPos.left - startPosition.x]
                currentSize = [startSize[0] + startPosition.x - mouseMoveEvent.pageX, imgPos.height - startPos.top]
                if (startSize[0] + startPosition.x - mouseMoveEvent.pageX <= 40) {
                    setPosLens([startPos.top, startPos.left + startSize[0] - 40])
                    setSizeLens([40, imgPos.height - startPos.top])
                    currentPos = [startPos.top, startPos.left + startSize[0] - 40]
                    currentSize = [40, imgPos.height - startPos.top]
                }
                return
            }


            if (startSize[0] + startPosition.x - mouseMoveEvent.pageX <= 40 && startSize[1] - startPosition.y + mouseMoveEvent.pageY <= 40) {
                setPosLens([startPos.top, startPos.left + startSize[0] - 40])
                setSizeLens([40, 40])
                currentPos = [startPos.top, startPos.left + startSize[0] - 40]
                currentSize = [40, 40]
                return
            }
            if (startSize[0] + startPosition.x - mouseMoveEvent.pageX <= 40) {
                setPosLens([startPos.top, startPos.left + startSize[0] - 40])
                setSizeLens([40, startSize[1] - startPosition.y + mouseMoveEvent.pageY])
                currentPos = [startPos.top, startPos.left + startSize[0] - 40]
                currentSize = [40, startSize[1] - startPosition.y + mouseMoveEvent.pageY]
                return
            }
            if (startSize[1] - startPosition.y + mouseMoveEvent.pageY <= 40) {
                setPosLens([startPos.top, mouseMoveEvent.clientX + startPos.left - startPosition.x])
                setSizeLens([startSize[0] + startPosition.x - mouseMoveEvent.pageX, 40])
                currentPos = [startPos.top, mouseMoveEvent.clientX + startPos.left - startPosition.x]
                currentSize = [startSize[0] + startPosition.x - mouseMoveEvent.pageX, 40]
                return
            }
            setPosLens([startPos.top, mouseMoveEvent.clientX + startPos.left - startPosition.x])
            setSizeLens([startSize[0] + startPosition.x - mouseMoveEvent.pageX,
            startSize[1] - startPosition.y + mouseMoveEvent.pageY
            ]);
            currentPos = [startPos.top, mouseMoveEvent.clientX + startPos.left - startPosition.x]
            currentSize = [startSize[0] + startPosition.x - mouseMoveEvent.pageX,
            startSize[1] - startPosition.y + mouseMoveEvent.pageY
            ]
        }
        function onMouseUp() {
            document.body.removeEventListener("mousemove", onMouseMove);
            props.changeLens([currentPos[0] / imgPos.height, currentPos[1] / imgPos.width], [currentSize[0] / imgPos.width, currentSize[1] / imgPos.height])
        }
        document.body.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp, { once: true });
    };

    return (<React.Fragment>
        <div className='absolute top-0 ' style={{ height: "100%", width: "100%" }} onClick={handleClick} ref={imgRef}></div>
        <div onAnimationEnd={() => setAnimation(false)}

            className={animation ? "animated box pointer-events-none" : "box pointer-events-none"} style={{ top: posLens[0] * 100 + "%", left: posLens[1] * 100 + "%", width: sizeLens[0] * 100 + "%", height: sizeLens[1] * 100 + "%" }}>
            <div className="absolute top-[5%] left-[5%] w-[90%] h-[90%] pointer-events-auto cursor-move" onMouseDown={handleMoveLens}></div>
            <div className="w-[24px] h-[24px] absolute overflow-hidden pointer-events-auto cursor-se-resize" style={{ bottom: "-8px", right: "-8px" }} onMouseDown={handleResizeBot}>
                <div className="w-[50px] h-[50px] rounded-3xl border-emerald-400 border-8 absolute" style={{ bottom: 0, right: 0 }}></div>
            </div>
            <div className="w-[24px] h-[24px] absolute overflow-hidden pointer-events-auto cursor-nw-resize" style={{ top: "-8px", left: "-8px" }} onMouseDown={handleResizeTop}>
                <div className="w-[50px] h-[50px] rounded-3xl border-rose-800 border-8 "></div>
            </div>
            <div className="w-[24px] h-[24px] absolute overflow-hidden pointer-events-auto cursor-ne-resize" style={{ top: "-8px", right: "-8px" }} onMouseDown={handleResizeTopR}>
                <div className="w-[50px] h-[50px] rounded-3xl border-violet-400 border-8 absolute" style={{ top: "0px", right: "0px" }}></div>
            </div>
            <div className="w-[24px] h-[24px] absolute overflow-hidden pointer-events-auto cursor-sw-resize" style={{ bottom: "-8px", left: "-8px" }} onMouseDown={handleResizeBotL}>
                <div className="w-[50px] h-[50px] rounded-3xl border-blue-400 border-8 absolute" style={{ bottom: "0px", left: "0px" }}></div>
            </div>
        </div >

    </React.Fragment>
    )
} 