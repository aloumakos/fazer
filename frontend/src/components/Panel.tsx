import React, { useEffect, useRef, useState } from "react";
import Dropzone from "./Dropzone";
import "react-tabs/style/react-tabs.css";
import "../styles/Panel.css"
import Lens from "./Lens";
import { PuffLoader } from "react-spinners";
const url = import.meta.env.VITE_URL;

function Panel(props: any) {
  const [files, setFiles] = useState([])
  const [preview, setPreview] = useState('')
  const [faces, setFaces] = useState([])
  const uploadRef = useRef(null)
  const [faceIndex, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [imageReady, setReady] = useState(false)

  useEffect(() => {

    if (files.length == 0) {
      return
    }

    setLoading(true)
    const data = new FormData()
    data.append('file', files[0])

    fetch(url + '/get_faces', {
      method: "POST",
      body: data,
    }
    )
      .then((res) => res.json())
      .then((res) => {

        setIndex(0)
        setPreview(URL.createObjectURL(files[0]))
        setFaces(res['faces'])
        console.log(res['results'
        ])
        props.setResults(res['results'])
        setLoading(false)
      })
  }, [files])

  const handleChangeLens = (pos: any[], size: any[]) => {
    let count = 0
    let face = -1
    for (let i = 0; i < faces.length; i++) {
      if (count == 2) {
        props.setIndex(-1)
        props.setMessage('multi')
        return
      }
      const center = [(faces[i][2] - faces[i][0]) / 2 + faces[i][0], (faces[i][3] - faces[i][1]) / 2 + faces[i][1]]

      if ((center[0] >= pos[1] && center[0] <= pos[1] + size[0]) && (center[1] >= pos[0] && center[1] <= pos[0] + size[1])) {
        count += 1
        face = i
      }
    }
    if (face == -1) {
      console.log(face)
      props.setIndex(-1)
      props.setMessage('none')
    }
    else {
      props.setIndex(face)
    }
  }

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (


    files.length === 0 || faces.length === 0 ?
      <div className="flex flex-col w-[600px] h-[400px] bg-base-100 rounded-2xl relative top-[10vh] mx-auto px-[20px] pb-[20px]" style={{ background: "#303134" }} >
        <span className="w-full text-center p-[20px]" style={{ fontFamily: "arial", color: "rgb(241,243,244)", fontSize: "16px" }}>Search for faces in database</span>
        <div className="w-full h-full mx-auto rounded-lg " style={{ background: "rgb(0,0,0)" }}>
          {!loading ? <Dropzone setFiles={setFiles} /> :
            <div className="w-full h-full flex flex-col justify-center items-center">
              <PuffLoader color="#36d7b7" />
              <span className="text-center p-[20px]" style={{ fontFamily: "arial", color: "rgb(241,243,244)", fontSize: "18px" }}>Analyzing image...</span>
            </div>}
        </div>
      </div> :
      <div className={`${imageReady ? 'flex' : 'hidden'} flex-col items-center relative h-full`}>
        {!loading ?
          <div className="absolute top-[-5%] rounded-2xl h-[40px] px-[16px] border-2 flex items-center align-center gap-2 cursor-pointer z-[10] font-semibold uploadButton"
            // @ts-ignore
            onClick={() => uploadRef.current.click()}>
            <span style={{ fontFamily: "arial", fontSize: "16px" }}>Upload new image</span>
            <svg width="18" height="18" viewBox="0 0 24 24" focusable="false" style={{ fill: "currentColor" }}><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path></svg>
          </div> :
          <div className="absolute top-[-5%] rounded-2xl h-[40px] px-[16px] border flex items-center align-center z-[10] font-semibold"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgb(241,243,244)" }}>
            <span className="text-center p-[20px]" style={{ fontFamily: "arial", color: "rgb(241,243,244)", fontSize: "18px" }}>Analyzing...</span>
            <PuffLoader color="#36d7b7" size={30} /></div>}
        <input type="file" className="hidden" ref={uploadRef} onChange={(e) => {
          URL.revokeObjectURL(files[0]); // @ts-ignore
          setFiles(e.target.files)
        }} />
        <div className="relative h-auto imageBox">
          <img src={preview} draggable="false" onLoad={(e) => { setReady(true) }} />

          <Lens face={faces[faceIndex]} changeLens={handleChangeLens} />
        </div>
        <div className="absolute top-[100%] h-[48px] px-[8px] flex items-center align-center gap-2 z-[10]" style={{ backgroundColor: "rgb(95,99,104)", color: "rgb(241,243,244)", borderRadius: "48px" }}>
          <div className="cursor-pointer m-[8px] px-[12px] h-[32px] flex items-center font-semibold" style={{ background: "rgb(32,33,36)", borderRadius: "16px", fontSize: "15px" }}
            onClick={(e) => { if (faceIndex == 0) { setIndex(faces.length - 1); props.setIndex(faces.length - 1) } else { setIndex(faceIndex - 1); props.setIndex(faceIndex - 1) } }}><span>Previous</span>
          </div>
          <div className="cursor-pointer m-[8px] px-[12px] h-[32px] flex items-center font-semibold" style={{ background: "rgb(32,33,36)", borderRadius: "16px", fontSize: "15px" }}
            onClick={(e) => { if (faceIndex == faces.length - 1) { setIndex(0); props.setIndex(0) } else { setIndex(faceIndex + 1); props.setIndex(faceIndex + 1) } }}><span>Next</span>
          </div>
        </div>
      </div>


  );
}

export default Panel;
